import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"

async function csrfHeaderOnly() {
  const token = await fetchCsrfToken()
  return { "X-CSRFToken": token }
}

async function errorMessage(res, fallback) {
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null)
    return data?.detail || data?.error || data?.message || fallback
  }

  const text = await res.text().catch(() => "")
  const looksLikeHtml = /<!doctype html|<html|<body|<div/i.test(text)
  if (looksLikeHtml) return fallback
  return text || fallback
}

export async function browseResources() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/browse/`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(await csrfHeaderOnly()),
    },
  })
  if (!res.ok) throw new Error(await errorMessage(res, "Failed to browse resources."))
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/categories/`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(await csrfHeaderOnly()),
    },
  })
  if (!res.ok) throw new Error(await errorMessage(res, "Failed to load categories."))
  const data = await res.json()
  return Array.isArray(data) ? data : data?.categories || []
}

/**
 * Category-scoped multipart upload (course/classroom fields are not allowed).
 */
export async function uploadResource({ file, category, title, onProgress }) {
  if (!file) throw new Error("File is required.")
  if (!String(category || "").trim()) throw new Error("Category is required.")

  const headers = await csrfHeaderOnly()
  const formData = new FormData()
  formData.append("file", file)
  formData.append("category", String(category).trim())
  if (title?.trim()) formData.append("title", title.trim())

  onProgress?.(20)

  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...headers,
    },
    body: formData,
  })
  if (!res.ok) throw new Error(await errorMessage(res, "Failed to upload resource."))

  onProgress?.(100)
  return res.json().catch(() => ({}))
}

export function flattenBrowsePayload(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : []
  const legacy = Array.isArray(payload?.legacy_resources) ? payload.legacy_resources : []
  const rows = []

  categories.forEach((group) => {
    const name = group?.name || "Uncategorized"
    ;(group?.resources || []).forEach((resource) => {
      rows.push({
        ...resource,
        category: resource.category || name,
      })
    })
  })

  legacy.forEach((resource) => {
    rows.push({
      ...resource,
      category: resource.category || "Legacy",
    })
  })

  return rows
}

export function extractCategoryNames(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : []
  const names = categories.map((item) => item?.name).filter(Boolean)
  const legacy = Array.isArray(payload?.legacy_resources) ? payload.legacy_resources : []
  if (legacy.length) names.push("Legacy")
  return [...new Set(names)]
}
