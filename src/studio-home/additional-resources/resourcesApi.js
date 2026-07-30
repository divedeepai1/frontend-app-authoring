import { getConfig } from '@edx/frontend-platform';
import { fetchCsrfToken } from '../../cms-csrftoken';

async function jsonHeaders() {
  const token = await fetchCsrfToken();
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': token,
  };
}

async function csrfHeaderOnly() {
  const token = await fetchCsrfToken();
  return { 'X-CSRFToken': token };
}

function studioUrl(path) {
  return `${getConfig().STUDIO_BASE_URL}${path}`;
}

async function errorMessage(res, fallback) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    return data?.detail || data?.error || data?.message || fallback;
  }

  const text = await res.text().catch(() => '');
  const looksLikeHtml = /<!doctype html|<html|<body|<div/i.test(text);
  if (looksLikeHtml) return fallback;
  return text || fallback;
}

export async function fetchCategories() {
  const res = await fetch(studioUrl('/myplugin/resources/categories/'), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json', ...(await csrfHeaderOnly()) },
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to load categories.'));
  const data = await res.json();
  return Array.isArray(data) ? data : data?.categories || [];
}

export async function renameCategory(oldName, newName) {
  const res = await fetch(studioUrl('/myplugin/resources/categories/'), {
    method: 'PUT',
    credentials: 'include',
    headers: await jsonHeaders(),
    body: JSON.stringify({ old_name: oldName, new_name: newName }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to rename category.'));
  return res.json().catch(() => ({}));
}

export async function deleteCategory(name) {
  const res = await fetch(studioUrl('/myplugin/resources/categories/'), {
    method: 'DELETE',
    credentials: 'include',
    headers: await jsonHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to delete category.'));
  return res.json().catch(() => ({}));
}

export async function browseResources() {
  const res = await fetch(studioUrl('/myplugin/resources/browse/'), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json', ...(await csrfHeaderOnly()) },
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to browse resources.'));
  return res.json();
}

export async function uploadResourceMultipart({ file, category, title, onProgress }) {
  const headers = await csrfHeaderOnly();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (title?.trim()) formData.append('title', title.trim());

  onProgress?.(20);

  const res = await fetch(studioUrl('/myplugin/resources/'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', ...headers },
    body: formData,
  });

  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to upload resource.'));
  onProgress?.(100);
  return res.json().catch(() => ({}));
}

export async function updateResource(id, { title, category }) {
  const body = {};
  if (title != null) body.title = title;
  if (category != null) body.category = category;
  const res = await fetch(studioUrl(`/myplugin/resources/${id}/`), {
    method: 'PUT',
    credentials: 'include',
    headers: await jsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to update resource.'));
  return res.json().catch(() => ({}));
}

export async function deleteResource(id) {
  const res = await fetch(studioUrl('/myplugin/resources/delete/'), {
    method: 'DELETE',
    credentials: 'include',
    headers: await jsonHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, 'Failed to delete resource.'));
  return res.json().catch(() => ({}));
}

export function flattenBrowsePayload(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const legacy = Array.isArray(payload?.legacy_resources) ? payload.legacy_resources : [];
  const rows = [];

  categories.forEach((group) => {
    const name = group?.name || 'Uncategorized';
    (group?.resources || []).forEach((resource) => {
      rows.push({
        ...resource,
        category: resource.category || name,
      });
    });
  });

  legacy.forEach((resource) => {
    rows.push({
      ...resource,
      category: resource.category || 'Legacy',
    });
  });

  return rows;
}
