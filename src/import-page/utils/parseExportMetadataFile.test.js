import { TextDecoder } from 'util';
import { valueToJsonBlob } from '../../export-page/utils/chunkedJsonBlob';
import { parseExportMetadataFile } from './parseExportMetadataFile';

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
    reader.readAsText(blob);
  });
}

class FakeFile extends Blob {
  constructor(parts, name, options) {
    super(parts, options);
    this.name = name;
  }
}

describe('parseExportMetadataFile', () => {
  const sample = {
    courseId: 'course-v1:org+course+run',
    lessonDataMapping: {
      Unit: {
        rubricData: { content_type: 'quiz', lessons: [] },
        qaStates: { lessons: [{ id: 1, states: [] }] },
      },
    },
    emptyArr: [],
  };

  it('parses metadata via fast path', async () => {
    const blob = await valueToJsonBlob(sample);
    const file = new FakeFile([await blobToText(blob)], 'meta.json', { type: 'application/json' });
    await expect(parseExportMetadataFile(file)).resolves.toEqual(sample);
  });

  it('parses metadata via streaming path with tiny chunks', async () => {
    const blob = await valueToJsonBlob(sample);
    const text = await blobToText(blob);
    const parts = [];
    for (let i = 0; i < text.length; i += 5) {
      parts.push(text.slice(i, i + 5));
    }
    const file = new FakeFile(parts, 'meta.json', { type: 'application/json' });
    await expect(parseExportMetadataFile(file, { fastPathMaxBytes: 1 })).resolves.toEqual(sample);
  });

  it('rejects metadata without courseId', async () => {
    const file = new FakeFile(['{"lessonDataMapping":{}}'], 'meta.json', { type: 'application/json' });
    await expect(parseExportMetadataFile(file)).rejects.toThrow(/courseId/i);
  });
});
