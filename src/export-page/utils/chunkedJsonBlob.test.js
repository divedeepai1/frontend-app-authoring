import { valueToJsonBlob } from './chunkedJsonBlob';

function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
    reader.readAsText(blob);
  });
}

describe('valueToJsonBlob', () => {
  it('serializes nested export-like payloads identically to JSON.stringify', async () => {
    const sample = {
      courseId: 'course-v1:org+course+run',
      exportedUnits: 1,
      lessonDataMapping: {
        'Unit 1': {
          rubricData: {
            content_type: 'lesson',
            lessons: [{ title: 'Part', weightage: 100, items: [] }],
            video: `${'A'.repeat(10000)}`,
          },
          qaStates: { lessons: [{ id: 1, states: [{ ok: true }] }] },
        },
      },
      emptyArr: [],
      emptyObj: {},
      nullable: null,
    };

    const blob = await valueToJsonBlob(sample);
    const parsed = JSON.parse(await blobToText(blob));
    expect(parsed).toEqual(sample);
  });

  it('escapes special characters in long strings', async () => {
    const sample = {
      courseId: 'c',
      text: 'line1\nline2\t"quote"\\slash',
    };
    const blob = await valueToJsonBlob(sample);
    expect(JSON.parse(await blobToText(blob))).toEqual(sample);
  });
});
