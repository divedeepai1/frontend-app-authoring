import { base_url } from "../../compugrade-constants";

/**
 * Fetches rubric data from the original rubric and copies it to the new rubric
 * @param {string} originalRubricId - The original rubric's openedx_based_id
 * @param {string} newRubricId - The new rubric's openedx_based_id
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function duplicateRubricData(originalRubricId, newRubricId) {
  try {
    // Step 1: Get the original rubric data
    const encodedOriginalId = encodeURIComponent(originalRubricId);
    const getResponse = await fetch(
      `${base_url}/api/openedx/get_rubric?openedx_based_id=${encodedOriginalId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Hello" }),
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch original rubric: ${getResponse.status} ${getResponse.statusText}`);
    }

    const result = await getResponse.json();
    const originalRubric = result?.rubric;

    if (!originalRubric) {
      throw new Error("No rubric data found in response");
    }

    // Step 2: Transform the data to match the save format
    // The get_rubric returns data that needs to be converted to the format expected by create_base_lesson_from_scratch
    const getAppName = () => {
      const courseType = sessionStorage.getItem('courseType');
      if (courseType === 'ms-word') return "word";
      if (courseType === "powerpoint") return "powerpoint";
      return "excel";
    };

    const savePayload = {
      rubric_id: newRubricId,
      skills: originalRubric.skills || [],
      app_name: originalRubric.app_name || getAppName(),
      source_document: originalRubric.source_document || null,
      answer_key: originalRubric.answer_key || null,
      video: originalRubric.video || null,
      lessons: (originalRubric.lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        weightage: lesson.weightage || 0,
        source_document: lesson.source_document || null,
        answer_key: lesson.answer_key || null,
        items: (lesson.items || []).map((item) => {
          const baseItem = {
            id: item.block_type + item.id,
            block_name: item.block_name || "",
            instruction_category: item.instruction_category || "",
            block_type: item.block_type || "",
            item_type: item.item_type || "u",
          };

          if (item.block_type === "objective") {
            return {
              ...baseItem,
              objective_json: item.objective_json || {},
            };
          } else if (item.block_type === "text") {
            return {
              ...baseItem,
              natural_text: item.natural_text || "",
            };
          } else if (item.block_type === "instruction") {
            return {
              ...baseItem,
              natural_text: item.natural_text || "",
              error_codes: item.error_codes || [],
              weightage: item.weightage || 10,
              images: Array.isArray(item.image_name) ? item.image_name : (Array.isArray(item.images) ? item.images : []),
              videos: Array.isArray(item.video_name) ? item.video_name : (Array.isArray(item.videos) ? item.videos : []),
              video_timestamp: item.video_timestamp || null,
            };
          } else if (item.block_type === "doc-comparison") {
            return {
              ...baseItem,
              comparison_mode: item.comparison_mode || "",
              answer_key: item.answer_key || null,
            };
          }
          return baseItem;
        }),
      })),
    };

    // Step 3: Save the data to the new rubric
    const saveResponse = await fetch(
      `${base_url}/api/openedx/create_base_lesson_from_scratch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      }
    );

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`Failed to save duplicated rubric: ${saveResponse.status} ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error duplicating rubric data:", error);
    return { success: false, error: error.message };
  }
}

