import { base_url } from "../../../../../../compugrade-constants";

function normalizeQaState(item) {
  const rawFileUrl = item?.document_url ?? "";

  const fileUrl =
    typeof rawFileUrl === "string"
      ? rawFileUrl
      : (rawFileUrl?.document_url ?? "");

  const fileName = "state file";

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

  if (!response.ok) {
    throw new Error(`Failed to fetch QA states (${response.status})`);
  }

  const data = await response.json();
  const list = data?.states || [];

  return list.map(normalizeQaState).filter((s) => s.id && s.rubricItemId);
}

export async function uploadQaState({
  subRubricId,
  rubricItemId,
  stateType,
  file,
}) {
  const formData = new FormData();
  formData.append("state_type", stateType);
  formData.append("file", file);

  const response = await fetch(
    `${base_url}/api/openedx/qa/lessons/${subRubricId}/instructions/${rubricItemId}/qa-states/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to upload QA state (${response.status})`);
  }

  const data = await response.json();
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

  return normalizeQaState(candidate || data);
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

  if (!response.ok) {
    throw new Error(`Failed to delete QA state (${response.status})`);
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
