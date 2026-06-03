import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

export async function fetchResourcesList() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/list/`, {
    method: "POST",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function deleteResourceById(id) {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/delete/`, {
    method: "DELETE",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
}

export async function uploadResource({ file, uploadType, classId, courseId, onProgress }) {
  const headers = await jsonHeaders()
  const requestBody = { filename: file.name }

  if (uploadType === "class" && classId) {
    requestBody.classroom = classId
  } else if (uploadType === "course" && courseId) {
    requestBody.course = courseId
  }

  const urlRes = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/generate-upload-url/`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(requestBody),
  })
  if (!urlRes.ok) {
    throw new Error((await urlRes.text()) || "Failed to get upload URL.")
  }

  const { upload_url, s3_key } = await urlRes.json()

  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  })
  if (!uploadRes.ok) {
    throw new Error(`Failed to upload file: ${uploadRes.status}`)
  }

  onProgress?.(50)

  const saveRes = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/resources/`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ s3_key }),
  })
  if (!saveRes.ok) {
    throw new Error((await saveRes.text()) || "Failed to save resource.")
  }

  onProgress?.(100)
  return saveRes.json()
}
