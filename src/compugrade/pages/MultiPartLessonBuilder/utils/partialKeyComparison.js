import { base_url } from "../../../../compugrade-constants";

/**
 * Converts a file to base64 string
 * @param {File|Blob|string} input - File, Blob, or base64 string
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = async (input) => {
  if (!input) return "";
  if (input instanceof File || input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(input);
      reader.onload = () => {
        try {
          const base64String = String(reader.result).split(",")[1] || "";
          resolve(base64String);
        } catch (e) {
          resolve("");
        }
      };
      reader.onerror = (err) => reject(err);
    });
  }
  return input;
};

/**
 * Gets app name from session storage
 * @returns {string} App name (word, powerpoint, or excel)
 */
export const getAppName = () => {
  const t = sessionStorage.getItem("courseType");
  if (t === "ms-word") return "word";
  if (t === "powerpoint") return "powerpoint";
  if (t === "excel") return "excel";
  return "word";
};

/**
 * Compares partial key with answer key and returns error codes
 * @param {File|Blob|string} partialKey - Partial key file or base64
 * @param {File|Blob|string} answerKey - Answer key file or base64
 * @param {string} filterText - Optional filter text
 * @param {string} skillStatus - Skill status
 * @returns {Promise<Array<string>>} Array of error codes
 */
export const comparePartialKey = async (partialKey, answerKey, filterText = "", skillStatus = "") => {
  try {
    const partialBase64 = await fileToBase64(partialKey);
    const answerBase64 = await fileToBase64(answerKey);
    
    if (!partialBase64 || !answerBase64) {
      throw new Error("Invalid document(s). Please re-upload files.");
    }

    const payload = {
      source_document: partialBase64, // Partial key becomes source document
      answer_key: answerBase64,
      app_name: getAppName(),
      filter_text: filterText,
      skill_status: skillStatus,
    };

    const res = await fetch(base_url + "/api/openedx/get_error_codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Failed to get error codes: ${res.status} ${t}`);
    }

    const data = await res.json();
    const codes = Array.isArray(data?.error_codes)
      ? data.error_codes
      : Array.isArray(data)
        ? data
        : [];

    return codes;
  } catch (error) {
    throw error;
  }
};

/**
 * Filters error codes into three categories
 * @param {Array<string>} originalCodes - Original error codes list
 * @param {Array<string>} comparisonCodes - New error codes from comparison
 * @returns {Object} Object with matchedCodes, associatedCodesNotSeen, comparisonCodesNotAssociated
 */
export const filterErrorCodes = (originalCodes, comparisonCodes) => {
  const originalSet = new Set(originalCodes || []);
  const comparisonSet = new Set(comparisonCodes || []);

  // Matched codes: codes that exist in both lists
  const matchedCodes = originalCodes.filter((code) => comparisonSet.has(code));

  // Associated codes not seen: codes in original but not in comparison
  const associatedCodesNotSeen = originalCodes.filter((code) => !comparisonSet.has(code));

  // Comparison codes not associated: codes in comparison but not in original
  const comparisonCodesNotAssociated = comparisonCodes.filter((code) => !originalSet.has(code));

  return {
    matchedCodes,
    associatedCodesNotSeen,
    comparisonCodesNotAssociated,
  };
};

/**
 * Determines instruction status based on filtered codes
 * @param {Object} filteredCodes - Object from filterErrorCodes
 * @returns {string} Status: "right", "wrong", or "No comparison run yet"
 */
export const getInstructionStatus = (filteredCodes) => {
  if (!filteredCodes) return "No comparison run yet";
  
  const { matchedCodes } = filteredCodes;
  
  if (matchedCodes && matchedCodes.length > 0) {
    return "wrong";
  }
  
  return "right";
};

