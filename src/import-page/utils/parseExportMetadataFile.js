/**
 * Parse course-export-metadata JSON files safely for large payloads.
 *
 * Fast path: JSON.parse(file.text()) for typical sizes.
 * Large-file path: stream bytes through a SAX-style JSON parser that never
 * builds one giant string — only the resulting object graph (many smaller strings).
 *
 * For very large files, use prepareExportMetadataForImport() which offloads each
 * lessonDataMapping unit to IndexedDB (exact data) so React never holds the full map.
 */

import {
  IMPORT_STORE_MARKER,
  clearMetadataImportStore,
  createMetadataImportStore,
  putImportUnit,
} from './exportMetadataUnitStore';

const FAST_PATH_MAX_BYTES = 48 * 1024 * 1024; // 48 MiB
/** Above this size, ingest units into IndexedDB instead of keeping the full mapping in memory. */
const INCREMENTAL_IMPORT_BYTES = 24 * 1024 * 1024; // 24 MiB
const STREAM_READ_YIELD_BYTES = 2 * 1024 * 1024;

function isInvalidStringLengthError(error) {
  const message = String(error?.message || error || '');
  return /invalid string length|string too long|out of memory/i.test(message);
}

async function readBlobAsArrayBuffer(blob) {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsArrayBuffer(blob);
  });
}

async function readBlobAsText(blob) {
  if (typeof blob.text === 'function') {
    return blob.text();
  }
  try {
    return new TextDecoder('utf-8').decode(await readBlobAsArrayBuffer(blob));
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsText(blob);
    });
  }
}

async function* iterateBlobChunks(blob) {
  if (typeof blob.stream === 'function') {
    const reader = blob.stream().getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  }

  const buffer = await readBlobAsArrayBuffer(blob);
  const bytes = new Uint8Array(buffer);
  const chunkSize = 64 * 1024;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    yield bytes.subarray(offset, offset + chunkSize);
  }
}

/**
 * Minimal streaming JSON parser over UTF-16 code units fed incrementally.
 * Builds the same value JSON.parse would for valid JSON.
 */
class StreamingJsonParser {
  constructor(options = {}) {
    this.root = undefined;
    this.stack = []; // frames: { type: 'object'|'array', value, key? }
    this.expectingKey = false;
    this.expectingColon = false;
    this.expectingCommaOrEnd = false;
    this.expectingValue = true;
    this.done = false;
    /** @type {null|((key: string, value: any) => (void|Promise<void>))} */
    this.onLessonUnit = options.onLessonUnit || null;
    this.unitWork = [];
  }

  get result() {
    return this.root;
  }

  enqueueUnitWork(work) {
    this.unitWork.push(Promise.resolve(work));
  }

  async drainUnitWork() {
    if (!this.unitWork.length) {
      return;
    }
    const pending = this.unitWork;
    this.unitWork = [];
    await Promise.all(pending);
  }

  pushValue(value) {
    if (this.stack.length === 0) {
      this.root = value;
      this.expectingValue = false;
      this.expectingCommaOrEnd = true;
      return;
    }

    const frame = this.stack[this.stack.length - 1];
    if (frame.type === 'array') {
      frame.value.push(value);
      this.expectingValue = false;
      this.expectingCommaOrEnd = true;
      return;
    }

    if (frame.type === 'object') {
      if (frame.pendingKey === undefined) {
        throw new Error('Invalid JSON: value without key in object');
      }
      // Offload completed non-object lessonDataMapping entries (null / primitives)
      if (frame.isLessonMapping && this.onLessonUnit) {
        const unitKey = frame.pendingKey;
        frame.pendingKey = undefined;
        this.expectingValue = false;
        this.expectingCommaOrEnd = true;
        this.enqueueUnitWork(this.onLessonUnit(unitKey, value));
        return;
      }
      frame.value[frame.pendingKey] = value;
      frame.pendingKey = undefined;
      this.expectingValue = false;
      this.expectingCommaOrEnd = true;
    }
  }

  /**
   * Feed a complete logical token stream from a string slice that ends on a token boundary.
   * Returns number of characters consumed from `input`.
   */
  feed(input, startIndex = 0) {
    let i = startIndex;
    const { length } = input;

    const skipWs = () => {
      while (i < length) {
        const c = input.charCodeAt(i);
        if (c === 32 || c === 9 || c === 10 || c === 13) {
          i += 1;
        } else {
          break;
        }
      }
    };

    while (i < length) {
      if (this.done) {
        skipWs();
        if (i < length) {
          throw new Error('Invalid JSON: trailing content after root value');
        }
        break;
      }

      skipWs();
      if (i >= length) {
        break;
      }

      const ch = input[i];

      if (this.expectingColon) {
        if (ch !== ':') {
          throw new Error('Invalid JSON: expected ":"');
        }
        i += 1;
        this.expectingColon = false;
        this.expectingValue = true;
        continue;
      }

      if (this.expectingCommaOrEnd) {
        if (ch === ',') {
          i += 1;
          this.expectingCommaOrEnd = false;
          const frame = this.stack[this.stack.length - 1];
          if (!frame) {
            throw new Error('Invalid JSON: unexpected comma');
          }
          if (frame.type === 'object') {
            this.expectingKey = true;
            this.expectingValue = false;
          } else {
            this.expectingValue = true;
          }
          continue;
        }
        if (ch === '}' || ch === ']') {
          // fall through to structure closers below
        } else {
          throw new Error(`Invalid JSON: expected "," or end of structure, got ${ch}`);
        }
      }

      if (this.expectingKey) {
        if (ch === '}') {
          // empty object already handled when opened; closing with no more keys
          i += 1;
          const closed = this.stack.pop();
          if (closed?.offloadUnitKey && this.onLessonUnit) {
            this.enqueueUnitWork(this.onLessonUnit(closed.offloadUnitKey, closed.value));
          }
          this.expectingKey = false;
          this.expectingCommaOrEnd = this.stack.length > 0 || this.root !== undefined;
          this.expectingValue = false;
          if (this.stack.length === 0) {
            this.done = true;
          }
          continue;
        }
        if (ch !== '"') {
          throw new Error('Invalid JSON: expected object key string');
        }
        const parsedKey = this.parseString(input, i);
        if (parsedKey.incomplete) {
          return i; // need more data
        }
        i = parsedKey.nextIndex;
        const frame = this.stack[this.stack.length - 1];
        frame.pendingKey = parsedKey.value;
        this.expectingKey = false;
        this.expectingColon = true;
        continue;
      }

      if (!this.expectingValue && (ch === '}' || ch === ']')) {
        if (ch === '}') {
          if (!this.stack.length || this.stack[this.stack.length - 1].type !== 'object') {
            throw new Error('Invalid JSON: unexpected }');
          }
          i += 1;
          const closed = this.stack.pop();
          if (closed?.offloadUnitKey && this.onLessonUnit) {
            this.enqueueUnitWork(this.onLessonUnit(closed.offloadUnitKey, closed.value));
          }
        } else {
          if (!this.stack.length || this.stack[this.stack.length - 1].type !== 'array') {
            throw new Error('Invalid JSON: unexpected ]');
          }
          i += 1;
          this.stack.pop();
        }
        this.expectingCommaOrEnd = this.stack.length > 0;
        this.expectingValue = false;
        if (this.stack.length === 0) {
          this.done = true;
        }
        continue;
      }

      if (!this.expectingValue) {
        throw new Error(`Invalid JSON: unexpected token ${ch}`);
      }

      // Empty array close can arrive in a later chunk after "["
      if (ch === ']') {
        if (!this.stack.length || this.stack[this.stack.length - 1].type !== 'array') {
          throw new Error('Invalid JSON: unexpected ]');
        }
        i += 1;
        this.stack.pop();
        this.expectingValue = false;
        this.expectingCommaOrEnd = this.stack.length > 0;
        if (this.stack.length === 0) {
          this.done = true;
        }
        continue;
      }

      if (ch === '{') {
        const parentFrame = this.stack.length ? this.stack[this.stack.length - 1] : null;
        // Offload each lessonDataMapping unit object — do not attach it to the root map
        if (
          parentFrame?.isLessonMapping
          && parentFrame.pendingKey !== undefined
          && this.onLessonUnit
        ) {
          const unitKey = parentFrame.pendingKey;
          parentFrame.pendingKey = undefined;
          const obj = {};
          this.stack.push({
            type: 'object',
            value: obj,
            pendingKey: undefined,
            offloadUnitKey: unitKey,
          });
          this.expectingCommaOrEnd = false;
          this.expectingKey = true;
          this.expectingValue = false;
          i += 1;
          continue;
        }

        const parentKey = parentFrame?.type === 'object' ? parentFrame.pendingKey : undefined;
        const obj = {};
        this.pushValue(obj);
        this.stack.push({
          type: 'object',
          value: obj,
          pendingKey: undefined,
          isLessonMapping: parentKey === 'lessonDataMapping',
        });
        // pushValue set expectingCommaOrEnd; for empty object we need key or }
        this.expectingCommaOrEnd = false;
        this.expectingKey = true;
        this.expectingValue = false;
        i += 1;
        continue;
      }

      if (ch === '[') {
        const arr = [];
        this.pushValue(arr);
        this.stack.push({ type: 'array', value: arr });
        this.expectingCommaOrEnd = false;
        this.expectingValue = true;
        i += 1;
        continue;
      }

      if (ch === '"') {
        const parsed = this.parseString(input, i);
        if (parsed.incomplete) {
          return i;
        }
        i = parsed.nextIndex;
        this.pushValue(parsed.value);
        if (this.stack.length === 0) {
          this.done = true;
        }
        continue;
      }

      if (ch === 't' || ch === 'f' || ch === 'n' || ch === '-' || (ch >= '0' && ch <= '9')) {
        const parsed = this.parseLiteral(input, i);
        if (parsed.incomplete) {
          return i;
        }
        i = parsed.nextIndex;
        this.pushValue(parsed.value);
        if (this.stack.length === 0) {
          this.done = true;
        }
        continue;
      }

      throw new Error(`Invalid JSON: unexpected character ${ch}`);
    }

    return i;
  }

  parseString(input, start) {
    // start points at opening quote
    let i = start + 1;
    let out = '';
    while (i < input.length) {
      const ch = input[i];
      if (ch === '"') {
        return { value: out, nextIndex: i + 1, incomplete: false };
      }
      if (ch === '\\') {
        if (i + 1 >= input.length) {
          return { incomplete: true };
        }
        const esc = input[i + 1];
        const map = {
          '"': '"',
          '\\': '\\',
          '/': '/',
          b: '\b',
          f: '\f',
          n: '\n',
          r: '\r',
          t: '\t',
        };
        if (esc === 'u') {
          if (i + 5 >= input.length) {
            return { incomplete: true };
          }
          const hex = input.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            throw new Error('Invalid JSON: bad unicode escape');
          }
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        if (map[esc] === undefined) {
          throw new Error(`Invalid JSON: bad escape \\${esc}`);
        }
        out += map[esc];
        i += 2;
        continue;
      }
      if (ch.charCodeAt(0) < 0x20) {
        throw new Error('Invalid JSON: unescaped control character in string');
      }
      out += ch;
      i += 1;
    }
    return { incomplete: true };
  }

  parseLiteral(input, start) {
    const rest = input.slice(start);

    const tryKeyword = (keyword, value) => {
      if (rest.length < keyword.length) {
        if (keyword.startsWith(rest)) {
          return { incomplete: true };
        }
        return null;
      }
      if (rest.startsWith(keyword) && isValueBoundary(rest[keyword.length])) {
        return { value, nextIndex: start + keyword.length, incomplete: false };
      }
      return null;
    };

    const asTrue = tryKeyword('true', true);
    if (asTrue) {
      return asTrue;
    }
    const asFalse = tryKeyword('false', false);
    if (asFalse) {
      return asFalse;
    }
    const asNull = tryKeyword('null', null);
    if (asNull) {
      return asNull;
    }

    // number — may be incomplete at chunk end
    let i = start;
    if (input[i] === '-') {
      i += 1;
    }
    if (i >= input.length) {
      return { incomplete: true };
    }
    if (input[i] === '0') {
      i += 1;
    } else if (input[i] >= '1' && input[i] <= '9') {
      i += 1;
      while (i < input.length && input[i] >= '0' && input[i] <= '9') {
        i += 1;
      }
    } else {
      throw new Error('Invalid JSON: bad number');
    }

    if (i < input.length && input[i] === '.') {
      i += 1;
      if (i >= input.length) {
        return { incomplete: true };
      }
      if (!(input[i] >= '0' && input[i] <= '9')) {
        throw new Error('Invalid JSON: bad number fraction');
      }
      while (i < input.length && input[i] >= '0' && input[i] <= '9') {
        i += 1;
      }
    }

    if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
      i += 1;
      if (i >= input.length) {
        return { incomplete: true };
      }
      if (input[i] === '+' || input[i] === '-') {
        i += 1;
      }
      if (i >= input.length) {
        return { incomplete: true };
      }
      if (!(input[i] >= '0' && input[i] <= '9')) {
        throw new Error('Invalid JSON: bad number exponent');
      }
      while (i < input.length && input[i] >= '0' && input[i] <= '9') {
        i += 1;
      }
    }

    // If we ended mid-number at end of buffer, ask for more data
    if (i >= input.length) {
      return { incomplete: true };
    }

    const raw = input.slice(start, i);
    return { value: Number(raw), nextIndex: i, incomplete: false };
  }
}

function isValueBoundary(ch) {
  return (
    ch === undefined
    || ch === ','
    || ch === '}'
    || ch === ']'
    || ch === ' '
    || ch === '\n'
    || ch === '\r'
    || ch === '\t'
  );
}

/**
 * Stream-parse a Blob/File into a JS value without one giant string.
 * @param {Blob} file
 * @param {{ onLessonUnit?: (key: string, value: any) => (void|Promise<void>) }} [options]
 * @returns {Promise<*>}
 */
async function parseJsonFileStreaming(file, options = {}) {
  const parser = new StreamingJsonParser(options);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let pending = '';
  let bytesSinceYield = 0;

  const processBuffer = async (isFinal) => {
    let offset = 0;
    while (offset < pending.length) {
      const before = offset;
      const consumed = parser.feed(pending, offset);
      if (consumed === before) {
        // Need more data to finish current token
        break;
      }
      offset = consumed;
      if (parser.done) {
        break;
      }
    }
    pending = pending.slice(offset);
    if (isFinal && pending.trim().length && !parser.done) {
      // try one last feed
      parser.feed(pending, 0);
      pending = '';
    }
    await parser.drainUnitWork();
    if (isFinal && !parser.done) {
      throw new Error('Invalid JSON: unexpected end of file');
    }
  };

  for await (const value of iterateBlobChunks(file)) {
    bytesSinceYield += value.byteLength;
    pending += decoder.decode(value, { stream: true });
    await processBuffer(false);

    if (bytesSinceYield >= STREAM_READ_YIELD_BYTES) {
      bytesSinceYield = 0;
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    }
  }

  pending += decoder.decode();
  await processBuffer(true);

  if (parser.result === undefined) {
    throw new Error('Invalid JSON: empty document');
  }
  return parser.result;
}

/**
 * Parse export metadata JSON from a File/Blob.
 * Preserves full data (lessonDataMapping, qaStates, etc.).
 * @param {File|Blob} file
 * @param {{ fastPathMaxBytes?: number }} [options]
 * @returns {Promise<object>}
 */
export async function parseExportMetadataFile(file, options = {}) {
  if (!file) {
    throw new Error('No metadata file provided');
  }

  let data;
  const fastPathMaxBytes = options.fastPathMaxBytes ?? FAST_PATH_MAX_BYTES;

  const tryFastPath = file.size > 0 && file.size <= fastPathMaxBytes;
  if (tryFastPath) {
    try {
      const text = await readBlobAsText(file);
      data = JSON.parse(text);
    } catch (error) {
      if (!isInvalidStringLengthError(error)) {
        // Not a size issue — try streaming only if parse failed for size-like reasons
        // For normal syntax errors, rethrow unless file is large enough to warrant stream retry
        if (file.size > 8 * 1024 * 1024) {
          data = await parseJsonFileStreaming(file);
        } else {
          throw error;
        }
      } else {
        data = await parseJsonFileStreaming(file);
      }
    }
  } else {
    data = await parseJsonFileStreaming(file);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Metadata JSON must be an object');
  }
  if (!data.courseId) {
    throw new Error('Missing courseId in metadata file');
  }

  return data;
}

function buildUnitSortMeta(mappingKey, unitData, recordId) {
  return {
    recordId,
    mappingKey,
    sectionIndex: typeof unitData?.sectionIndex === 'number' ? unitData.sectionIndex : 0,
    subsectionIndex: typeof unitData?.subsectionIndex === 'number' ? unitData.subsectionIndex : 0,
    unitIndex: typeof unitData?.unitIndex === 'number' ? unitData.unitIndex : 0,
    path: unitData?.path || '',
    hasRubricData: Boolean(unitData?.rubricData),
  };
}

function sortUnitMeta(a, b) {
  if (a.sectionIndex !== b.sectionIndex) {
    return a.sectionIndex - b.sectionIndex;
  }
  if (a.subsectionIndex !== b.subsectionIndex) {
    return a.subsectionIndex - b.subsectionIndex;
  }
  if (a.unitIndex !== b.unitIndex) {
    return a.unitIndex - b.unitIndex;
  }
  return String(a.path).localeCompare(String(b.path));
}

/**
 * Ingest a large export metadata file unit-by-unit into IndexedDB.
 * Root fields (courseId, courseLevel, …) stay in memory; each mapping unit is stored exactly once then dropped.
 * @param {File|Blob} file
 * @param {{ onProgress?: (done: number) => void }} [options]
 */
async function ingestLargeExportMetadataFile(file, options = {}) {
  const storeId = await createMetadataImportStore({
    fileName: file.name || 'metadata.json',
    fileSize: file.size,
  });
  const unitMetaList = [];
  let unitSeq = 0;

  try {
    const root = await parseJsonFileStreaming(file, {
      onLessonUnit: async (mappingKey, unitData) => {
        unitSeq += 1;
        const recordId = `${storeId}::unit::${unitSeq}`;
        // Exact unit object (rubricData + qaStates + indexes) via structured clone into IDB
        await putImportUnit(storeId, recordId, unitData);
        unitMetaList.push(buildUnitSortMeta(mappingKey, unitData, recordId));
        if (typeof options.onProgress === 'function') {
          options.onProgress(unitMetaList.length);
        }
      },
    });

    if (!root || typeof root !== 'object' || Array.isArray(root)) {
      throw new Error('Metadata JSON must be an object');
    }
    if (!root.courseId) {
      throw new Error('Missing courseId in metadata file');
    }

    // lessonDataMapping stays empty {} when units were offloaded — replace with marker handle
    unitMetaList.sort(sortUnitMeta);

    return {
      [IMPORT_STORE_MARKER]: true,
      mode: 'unit-store',
      storeId,
      courseId: root.courseId,
      courseBlockId: root.courseBlockId,
      courseDisplayName: root.courseDisplayName,
      exportedAt: root.exportedAt,
      exportedUnits: root.exportedUnits ?? unitMetaList.length,
      courseLevel: root.courseLevel || {
        dashboardText: root.courseDashboardText || '',
        description: root.courseDescription || '',
      },
      // Lightweight index only — full unit payloads live in IndexedDB
      unitRecords: unitMetaList,
      // Keep empty mapping for any code that checks the key exists
      lessonDataMapping: {},
    };
  } catch (error) {
    await clearMetadataImportStore(storeId);
    throw error;
  }
}

/**
 * Prepare export metadata for import without holding a 700MB object in React state.
 * Small files → inline full object (same as before).
 * Large files → unit-store handle (exact per-unit data in IndexedDB).
 *
 * @param {File|Blob} file
 * @param {{ onProgress?: (done: number) => void, forceIncremental?: boolean }} [options]
 * @returns {Promise<object>}
 */
export async function prepareExportMetadataForImport(file, options = {}) {
  if (!file) {
    throw new Error('No metadata file provided');
  }

  const useIncremental = options.forceIncremental
    || file.size > INCREMENTAL_IMPORT_BYTES;

  if (!useIncremental) {
    try {
      const data = await parseExportMetadataFile(file);
      return {
        mode: 'inline',
        courseId: data.courseId,
        data,
      };
    } catch (error) {
      if (!isInvalidStringLengthError(error) && file.size <= INCREMENTAL_IMPORT_BYTES) {
        throw error;
      }
      // Fall through to incremental ingest
    }
  }

  const storeHandle = await ingestLargeExportMetadataFile(file, options);
  return {
    mode: 'unit-store',
    courseId: storeHandle.courseId,
    data: storeHandle,
  };
}

export { IMPORT_STORE_MARKER, INCREMENTAL_IMPORT_BYTES };
