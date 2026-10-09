import { base_url } from '../../compugrade-constants';
import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from '../../cms-csrftoken';

export function getAppNameFromSession() {
  const courseType = sessionStorage.getItem('courseType');
  if (courseType === 'ms-word') return 'word';
  if (courseType === 'powerpoint') return 'powerpoint';
  if (courseType === 'excel') return 'excel';
  return 'excel';
}

/**
 * Resolve app_name without relying on sessionStorage.
 * Prefer rubric.app_name; optionally use an explicit override; then session; default excel.
 */
export function resolveAppName(rubricAppName, overrideAppName) {
  if (rubricAppName) {
    return rubricAppName;
  }
  if (overrideAppName) {
    return overrideAppName;
  }
  return getAppNameFromSession();
}

/**
 * Best-effort: load course type from myplugin into session so QA export has a valid app_name
 * even on a cold visit to the export page.
 */
export async function ensureCourseTypeInSession(courseId) {
  if (sessionStorage.getItem('courseType') || !courseId) {
    return sessionStorage.getItem('courseType');
  }
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(
      `${getConfig().STUDIO_BASE_URL}/myplugin/courses/`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': token,
        },
      },
    );
    if (!response.ok) {
      return null;
    }
    const courses = await response.json();
    const currentCourse = (Array.isArray(courses) ? courses : []).find(
      (course) => course.id === courseId,
    );
    if (!currentCourse?.course_type) {
      return null;
    }
    let courseType = currentCourse.course_type;
    if (courseType === 'ms_powerpoint' || courseType === 'google_slides') {
      courseType = 'powerpoint';
    } else if (courseType === 'ms_excel' || courseType === 'google_sheets') {
      courseType = 'excel';
    } else if (courseType === 'ms_word' || courseType === 'google_docs') {
      courseType = 'ms-word';
    }
    sessionStorage.setItem('courseType', courseType);
    if (currentCourse.display_name) {
      sessionStorage.setItem('courseTitle', currentCourse.display_name);
    }
    return courseType;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Could not preload course type for export:', error);
    return null;
  }
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
