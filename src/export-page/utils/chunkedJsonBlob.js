/**
 * Build a JSON Blob without ever materializing one giant JS string.
 * Values are serialized recursively into many small parts, then combined
 * by the Blob API (which supports payloads larger than JSON.stringify limits).
 *
 * Output is standard compact JSON — same data, import-compatible.
 */

const DEFAULT_STRING_CHUNK = 256 * 1024; // 256 KiB per string slice
const YIELD_EVERY_PARTS = 40;

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function escapeJsonStringChunk(chunk) {
  return chunk
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\u0008/g, '\\b')
    .replace(/\u000c/g, '\\f')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/[\u0000-\u001f]/g, (ch) => {
      const hex = ch.charCodeAt(0).toString(16).padStart(4, '0');
      return `\\u${hex}`;
    });
}

async function maybeYield(partCount, onProgress) {
  if (partCount > 0 && partCount % YIELD_EVERY_PARTS === 0) {
    if (typeof onProgress === 'function') {
      onProgress(partCount);
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}

/**
 * Append JSON serialization of `value` into `parts` without one mega-string.
 * @param {*} value
 * @param {Array<string>} parts
 * @param {{ partCount: number, stringChunkSize: number, onProgress?: Function, seen: WeakSet<object> }} ctx
 */
async function appendJsonParts(value, parts, ctx) {
  if (value === null) {
    parts.push('null');
    ctx.partCount += 1;
    await maybeYield(ctx.partCount, ctx.onProgress);
    return;
  }

  const valueType = typeof value;

  if (valueType === 'number') {
    parts.push(Number.isFinite(value) ? String(value) : 'null');
    ctx.partCount += 1;
    return;
  }

  if (valueType === 'boolean') {
    parts.push(value ? 'true' : 'false');
    ctx.partCount += 1;
    return;
  }

  if (valueType === 'string') {
    parts.push('"');
    const size = ctx.stringChunkSize;
    if (value.length <= size) {
      parts.push(escapeJsonStringChunk(value));
      ctx.partCount += 1;
    } else {
      for (let i = 0; i < value.length; i += size) {
        parts.push(escapeJsonStringChunk(value.slice(i, i + size)));
        ctx.partCount += 1;
        await maybeYield(ctx.partCount, ctx.onProgress);
      }
    }
    parts.push('"');
    ctx.partCount += 1;
    return;
  }

  if (valueType !== 'object') {
    // undefined, function, symbol — match JSON.stringify behavior
    parts.push('null');
    ctx.partCount += 1;
    return;
  }

  if (ctx.seen.has(value)) {
    throw new Error('Circular reference in export data');
  }
  ctx.seen.add(value);

  try {
    if (Array.isArray(value)) {
      parts.push('[');
      ctx.partCount += 1;
      for (let i = 0; i < value.length; i += 1) {
        if (i > 0) {
          parts.push(',');
          ctx.partCount += 1;
        }
        // JSON.stringify drops undefined array holes as null
        const item = value[i];
        if (item === undefined) {
          parts.push('null');
          ctx.partCount += 1;
        } else {
          await appendJsonParts(item, parts, ctx);
        }
      }
      parts.push(']');
      ctx.partCount += 1;
      return;
    }

    if (value instanceof Date) {
      parts.push(JSON.stringify(value.toISOString()));
      ctx.partCount += 1;
      return;
    }

    if (!isPlainObject(value) && typeof value.toJSON === 'function') {
      await appendJsonParts(value.toJSON(), parts, ctx);
      return;
    }

    // Plain object (and other objects treated as key maps, like JSON.stringify)
    parts.push('{');
    ctx.partCount += 1;
    let wroteField = false;
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const fieldValue = value[key];
      if (fieldValue === undefined || typeof fieldValue === 'function') {
        continue;
      }
      if (wroteField) {
        parts.push(',');
        ctx.partCount += 1;
      }
      parts.push(JSON.stringify(key));
      parts.push(':');
      ctx.partCount += 2;
      await appendJsonParts(fieldValue, parts, ctx);
      wroteField = true;
    }
    parts.push('}');
    ctx.partCount += 1;
  } finally {
    ctx.seen.delete(value);
  }

  await maybeYield(ctx.partCount, ctx.onProgress);
}

/**
 * Serialize any JSON-compatible value to a Blob without one giant stringify.
 * @param {*} value
 * @param {{ mimeType?: string, stringChunkSize?: number, onProgress?: (parts: number) => void }} [options]
 * @returns {Promise<Blob>}
 */
export async function valueToJsonBlob(value, options = {}) {
  const parts = [];
  const ctx = {
    partCount: 0,
    stringChunkSize: options.stringChunkSize || DEFAULT_STRING_CHUNK,
    onProgress: options.onProgress,
    seen: new WeakSet(),
  };

  await appendJsonParts(value, parts, ctx);

  const blob = new Blob(parts, { type: options.mimeType || 'application/json' });
  if (!blob.size) {
    throw new Error('Failed to create JSON blob (empty output)');
  }
  return blob;
}

/**
 * Trigger a browser download for a Blob.
 * @param {Blob} blob
 * @param {string} fileName
 */
export function triggerBlobDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // non-critical cleanup
    }
  }, 500);
}

/**
 * Build + download course export metadata JSON (exact data, chunked Blob).
 * @param {object} exportMeta
 * @param {string} courseId
 * @returns {Promise<{ blob: Blob, fileName: string }>}
 */
export async function downloadExportMetadataJson(exportMeta, courseId) {
  const safeCourseId = String(courseId || 'course').replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `course-export-metadata-${safeCourseId}.json`;
  const blob = await valueToJsonBlob(exportMeta, { mimeType: 'application/json' });
  triggerBlobDownload(blob, fileName);
  return { blob, fileName };
}
