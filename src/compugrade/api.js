import { base_url } from '../compugrade-constants';

const jsonHeaders = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
};

async function postJson(path, body) {
  const response = await fetch(`${base_url}${path}`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Compugrade API ${path} failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

async function patchJson(path, body) {
  const response = await fetch(`${base_url}${path}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Compugrade API ${path} failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

async function deleteJson(path) {
  const response = await fetch(`${base_url}${path}`, {
    method: 'DELETE',
    headers: jsonHeaders,
  });
  if (!response.ok) {
    throw new Error(`Compugrade API ${path} failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

export async function getRubric(openedxBasedId) {
  return postJson(
    `/api/openedx/get_rubric?openedx_based_id=${encodeURIComponent(openedxBasedId)}`,
    { name: 'Hello' },
  );
}

export async function createRubric({ locator, courseId, subsectionId }) {
  return postJson('/api/openedx/create_rubric', {
    openedx_based_id: locator,
    course_id: courseId,
    user_id: 1,
    subsection_id: subsectionId,
  });
}

export async function createSection({ title, locator, courseId }) {
  return postJson('/api/openedx/create_section', {
    title,
    openedx_based_id: locator,
    course_id: courseId,
  });
}

export async function createSubsection({ title, locator, courseId, sectionId }) {
  return postJson('/api/openedx/create_subsection', {
    title,
    openedx_based_id: locator,
    course_id: courseId,
    section_id: sectionId,
  });
}

export async function updateRubricTitle(itemId, title) {
  return patchJson('/api/openedx/update_rubric', {
    openedx_based_id: itemId,
    title,
  });
}

export async function updateSubsectionTitle(itemId, title) {
  return patchJson('/api/openedx/update_subsection', {
    openedx_based_id: itemId,
    title,
  });
}

export async function updateSectionTitle(itemId, title) {
  return patchJson('/api/openedx/update_section', {
    openedx_based_id: itemId,
    title,
  });
}

export async function deleteRubric(itemId) {
  return deleteJson(
    `/api/openedx/delete_rubric?openedx_based_id=${encodeURIComponent(itemId)}`,
  );
}

export async function deleteSection(itemId) {
  return deleteJson(
    `/api/openedx/delete_section?openedx_based_id=${encodeURIComponent(itemId)}`,
  );
}

export async function deleteSubsection(itemId) {
  return deleteJson(
    `/api/openedx/delete_subsection?subsection_openedx_id=${encodeURIComponent(itemId)}`,
  );
}

export async function createExternalCourse(courseData, courseType, courseKey) {
  return postJson('/api/course/create_course', {
    ...courseData,
    course_type: courseType,
    openedx_based_id: courseKey,
  });
}

export async function getAllRubricItems(openedxBasedId) {
  return postJson(
    `/api/openedx/get_all_edx_rubric_items?openedx_based_id=${encodeURIComponent(openedxBasedId)}`,
    { body: 'Hello' },
  );
}

export async function createRubricItem({ unitId, naturalText }) {
  return postJson('/api/openedx/create_rubric_item', {
    rubric_openedx_based_id: unitId,
    natural_text: naturalText,
  });
}

export async function getSkillsForAllCourseRubrics(courseId) {
  const encodedCourseId = encodeURIComponent(courseId);
  const response = await fetch(
    `${base_url}/api/openedx/get_skills_for_all_course_rubrics?course_id=${encodedCourseId}`,
    {
      method: 'GET',
      headers: jsonHeaders,
    },
  );
  if (!response.ok) {
    throw new Error(`Compugrade get_skills_for_all_course_rubrics failed with status ${response.status}`);
  }
  return response.json();
}
