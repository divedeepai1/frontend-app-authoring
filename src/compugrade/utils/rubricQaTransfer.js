import { base_url } from '../../compugrade-constants';

export function getAppNameFromSession() {
  const courseType = sessionStorage.getItem('courseType');
  if (courseType === 'ms-word') return 'word';
  if (courseType === 'powerpoint') return 'powerpoint';
  return 'excel';
}

export function ensureInstructionItemNums(rubricData) {
  if (!rubricData?.lessons?.length) {
    return rubricData;
  }

  return {
    ...rubricData,
    lessons: rubricData.lessons.map((lesson) => ({
      ...lesson,
      items: (lesson.items || []).map((item) => {
        if (item.block_type !== 'instruction') {
          return item;
        }
        const hasItemNum = typeof item.item_num === 'string' && item.item_num.trim() !== '';
        if (hasItemNum) {
          return item;
        }
        return {
          ...item,
          item_num: `${Date.now()}-${item.id || 'instruction'}`,
        };
      }),
    })),
  };
}

export async function exportQaStates(rubricOpenedxId, appName) {
  if (!rubricOpenedxId) {
    return null;
  }

  try {
    const encodedUnitId = encodeURIComponent(rubricOpenedxId);
    const encodedAppName = encodeURIComponent(appName || getAppNameFromSession());
    const response = await fetch(
      `${base_url}/api/openedx/qa/rubrics/${encodedUnitId}/qa-states/export?app_name=${encodedAppName}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    );

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `QA states export failed for rubric ${rubricOpenedxId}:`,
        await response.text(),
      );
      return null;
    }

    const result = await response.json();
    if (Array.isArray(result?.lessons)) {
      return { lessons: result.lessons };
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`QA states export error for rubric ${rubricOpenedxId}:`, error);
    return null;
  }
}

export async function importQaStates(rubricOpenedxId, qaStates) {
  if (!rubricOpenedxId || !qaStates?.lessons?.length) {
    return;
  }

  try {
    const encodedUnitId = encodeURIComponent(rubricOpenedxId);
    const response = await fetch(
      `${base_url}/api/openedx/qa/rubrics/${encodedUnitId}/qa-states/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: qaStates.lessons }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      if (result?.restored != null) {
        // eslint-disable-next-line no-console
        console.log(`QA states restored for rubric ${rubricOpenedxId}: ${result.restored}`);
      }
      if (result?.skipped?.length) {
        // eslint-disable-next-line no-console
        console.warn(`QA states import skipped for rubric ${rubricOpenedxId}:`, result.skipped);
      }
      return;
    }

    // eslint-disable-next-line no-console
    console.warn(
      `QA states import failed for rubric ${rubricOpenedxId}:`,
      await response.text(),
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`QA states import error for rubric ${rubricOpenedxId}:`, error);
  }
}
