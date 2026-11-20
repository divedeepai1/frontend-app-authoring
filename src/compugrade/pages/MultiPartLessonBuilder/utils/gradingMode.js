export const GRADING_MODES = {
  ANSWER_KEY: "answer_key",
  PARTIAL_KEY: "partial_key",
};

export const GRADING_MODE_OPTIONS = [
  { value: GRADING_MODES.ANSWER_KEY, label: "Answer key" },
  { value: GRADING_MODES.PARTIAL_KEY, label: "Partial key" },
];

/**
 * Normalize API/UI grading_mode to answer_key | partial_key.
 * Defaults to answer_key when missing or unknown.
 */
export function normalizeGradingMode(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();

  if (raw === GRADING_MODES.PARTIAL_KEY) {
    return GRADING_MODES.PARTIAL_KEY;
  }

  return GRADING_MODES.ANSWER_KEY;
}
