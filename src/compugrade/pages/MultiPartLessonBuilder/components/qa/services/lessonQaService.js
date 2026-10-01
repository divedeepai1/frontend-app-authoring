import { base_url } from "../../../../../../compugrade-constants";

async function parseResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractApiMessage(data, fallback = "") {
  if (!data) return fallback;
  if (typeof data === "string") return data.trim() || fallback;

  const candidates = [
    data.message,
    data.error_message,
    data.success_message,
    data.status_message,
    data.msg,
    data.detail,
    data.error,
    data.description,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (Array.isArray(data.detail)) {
    const detailMessage = data.detail
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.message || item?.msg || item?.detail || "";
      })
      .filter(Boolean)
      .join(", ");
    if (detailMessage) return detailMessage;
  }

  if (data.error && typeof data.error === "object") {
    const nested = extractApiMessage(data.error, "");
    if (nested) return nested;
  }

  return fallback;
}

function extractApiTitle(data, fallback = "") {
  if (!data || typeof data !== "object") return fallback;

  const candidates = [data.title, data.success_title, data.error_title];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return fallback;
}

function getFileNameFromUrl(url) {
  if (!url || typeof url !== "string") return "state file";
  const withoutQuery = url.split("?")[0];
  const parts = withoutQuery.split("/");
  const rawName = parts[parts.length - 1] || "";

  if (!rawName) return "state file";

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

function normalizeQaState(item) {
  const rawFileUrl = item?.document_url ?? "";

  const fileUrl =
    typeof rawFileUrl === "string"
      ? rawFileUrl
      : (rawFileUrl?.document_url ?? "");

  const fileName = getFileNameFromUrl(fileUrl);

  return {
    id: item?.id ?? item?.state_id ?? item?.qa_state_id ?? null,
    subRubricId:
      item?.sub_rubric_id ?? item?.subRubricId ?? item?.lesson_id ?? null,
    rubricItemId:
      item?.rubric_item_id ??
      item?.rubricItemId ??
      item?.instruction_id ??
      null,
    stateType: String(item?.state_type ?? item?.stateType ?? "").toLowerCase(),
    fileUrl,
    fileName,
  };
}

export async function getLessonQaStates(subRubricId) {
  const response = await fetch(
    `${base_url}/api/openedx/qa/lessons/${subRubricId}/qa-states`,
    {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
    },
  );

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      extractApiMessage(data, `Failed to fetch QA states (${response.status})`),
    );
  }
  const list = data?.states || [];

  return list.map(normalizeQaState).filter((s) => s.id && s.rubricItemId);
}

export async function uploadQaState({
  subRubricId,
  rubricItemId,
  stateType,
  file,
  appName,
}) {
  const formData = new FormData();
  formData.append("state_type", stateType);
  formData.append("app_name", appName);
  formData.append("file", file);

  const response = await fetch(
    `${base_url}/api/openedx/qa/lessons/${subRubricId}/instructions/${rubricItemId}/qa-states/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const error = new Error(
      extractApiMessage(data, `Failed to upload QA state (${response.status})`),
    );
    error.title = extractApiTitle(data, "Upload failed");
    throw error;
  }

  if (data?.success === false) {
    const error = new Error(extractApiMessage(data, "Upload failed"));
    error.title = extractApiTitle(data, "Upload failed");
    throw error;
  }

  const candidate =
    data?.document_url ||
    data?.display_name ||
    data?.state_type ||
    data?.file_url ||
    data?.qa_state_id
      ? data
      : data?.qa_state || data?.state || data?.result || data?.data || null;

  if (Array.isArray(candidate)) {
    return normalizeQaState(candidate[0] || {});
  }

  if (!candidate) {
    if (Array.isArray(data?.states))
      return normalizeQaState(data.states[0] || {});
    if (Array.isArray(data?.results))
      return normalizeQaState(data.results[0] || {});
    if (Array.isArray(data?.qa_states))
      return normalizeQaState(data.qa_states[0] || {});
  }

  const state = normalizeQaState(candidate || data);
  const apiMessage = extractApiMessage(data, "");
  const apiTitle = extractApiTitle(data, "");

  return {
    ...state,
    apiMessage,
    apiTitle,
  };
}

export async function deleteQaState({ subRubricId, stateId }) {
  const response = await fetch(
    `${base_url}/api/openedx/qa/lessons/${subRubricId}/qa-states/${stateId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const error = new Error(
      extractApiMessage(data, `Failed to delete QA state (${response.status})`),
    );
    error.title = extractApiTitle(data, "Delete failed");
    throw error;
  }
}

export async function runLessonQa({ subRubricId, appName }) {
  const response = await fetch(
    `${base_url}/api/openedx/qa/lessons/${subRubricId}/qa/run?app_name=${encodeURIComponent(appName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to run QA (${response.status})`);
  }

  return response.json();
}
