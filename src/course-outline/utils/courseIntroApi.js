import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from '../../cms-csrftoken';

function studioCourseUrl(courseId, suffix) {
  return `${getConfig().STUDIO_BASE_URL}/myplugin/courses/${encodeURIComponent(courseId)}/${suffix}`;
}

async function studioFetch(courseId, suffix, { method = 'GET', body } = {}) {
  const token = await fetchCsrfToken();
  const response = await fetch(studioCourseUrl(courseId, suffix), {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return response;
}

/**
 * GET dashboard / intro text for a course.
 * @param {string} courseId
 * @returns {Promise<string>}
 */
export async function fetchCourseDashboardText(courseId) {
  if (!courseId) {
    return '';
  }
  try {
    const response = await studioFetch(courseId, 'intro-text/');
    if (!response.ok) {
      return '';
    }
    const data = await response.json();
    return (
      data?.course_intro_text
      || data?.intro_text
      || data?.courseIntroText
      || ''
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch course dashboard text:', error);
    return '';
  }
}

/**
 * GET course description.
 * @param {string} courseId
 * @returns {Promise<string>}
 */
export async function fetchCourseDescription(courseId) {
  if (!courseId) {
    return '';
  }
  try {
    const response = await studioFetch(courseId, 'description/');
    if (!response.ok) {
      return '';
    }
    const data = await response.json();
    return (
      data?.description
      || data?.course_description
      || data?.courseDescription
      || ''
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch course description:', error);
    return '';
  }
}

/**
 * PUT dashboard / intro text.
 * @param {string} courseId
 * @param {string} content
 * @returns {Promise<boolean>}
 */
export async function saveCourseDashboardText(courseId, content) {
  if (!courseId) {
    return false;
  }
  try {
    const response = await studioFetch(courseId, 'update-intro-text/', {
      method: 'PUT',
      body: { course_intro_text: content ?? '' },
    });
    return response.ok;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save course dashboard text:', error);
    return false;
  }
}

/**
 * PUT course description.
 * @param {string} courseId
 * @param {string} content
 * @returns {Promise<boolean>}
 */
export async function saveCourseDescription(courseId, content) {
  if (!courseId) {
    return false;
  }
  try {
    const response = await studioFetch(courseId, 'update-description/', {
      method: 'PUT',
      body: { course_description: content ?? '' },
    });
    return response.ok;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save course description:', error);
    return false;
  }
}

/**
 * Fetch both course-level text fields for export metadata.
 * @param {string} courseId
 * @returns {Promise<{ dashboardText: string, description: string }>}
 */
export async function fetchCourseLevelTextsForExport(courseId) {
  const [dashboardText, description] = await Promise.all([
    fetchCourseDashboardText(courseId),
    fetchCourseDescription(courseId),
  ]);
  return { dashboardText, description };
}

/**
 * Restore course-level texts from export metadata onto the target course.
 * Accepts either `courseLevel` object or legacy top-level keys.
 * @param {string} courseId
 * @param {object|null|undefined} exportedMetadata
 * @returns {Promise<{ dashboardSaved: boolean, descriptionSaved: boolean }>}
 */
export async function restoreCourseLevelTextsFromExport(courseId, exportedMetadata) {
  if (!courseId || !exportedMetadata || typeof exportedMetadata !== 'object') {
    return { dashboardSaved: false, descriptionSaved: false };
  }

  const courseLevel = exportedMetadata.courseLevel && typeof exportedMetadata.courseLevel === 'object'
    ? exportedMetadata.courseLevel
    : null;

  const dashboardText = courseLevel
    ? (courseLevel.dashboardText ?? courseLevel.course_intro_text ?? '')
    : (exportedMetadata.courseDashboardText ?? exportedMetadata.course_intro_text ?? null);

  const description = courseLevel
    ? (courseLevel.description ?? courseLevel.course_description ?? '')
    : (exportedMetadata.courseDescription ?? exportedMetadata.course_description ?? null);

  const hasDashboard = dashboardText !== null && dashboardText !== undefined;
  const hasDescription = description !== null && description !== undefined;

  const [dashboardSaved, descriptionSaved] = await Promise.all([
    hasDashboard ? saveCourseDashboardText(courseId, String(dashboardText)) : Promise.resolve(false),
    hasDescription ? saveCourseDescription(courseId, String(description)) : Promise.resolve(false),
  ]);

  return { dashboardSaved, descriptionSaved };
}
