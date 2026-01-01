import { base_url } from '../../compugrade-constants';
import { getCourseItem } from '../../course-outline/data/api';

export async function exportLessonDataMapping(courseId, courseBlockId, options = {}) {
  try {
    if (!courseBlockId) {
      throw new Error('Course Block ID is required');
    }

    const course = await getCourseItem(courseBlockId);
    if (!course || !course.childInfo || !course.childInfo.children) {
      throw new Error('Invalid course structure');
    }

    const lessonDataMapping = {};
    let processedUnits = 0;

    const getAppName = () => {
      const courseType = sessionStorage.getItem('courseType');
      if (courseType === 'ms-word') return "word";
      if (courseType === "powerpoint") return "powerpoint";
      return "excel";
    };

    // First, count total units for accurate progress tracking
    const countTotalUnits = (sections) => {
      let total = 0;
      for (const section of sections) {
        if (section.childInfo && section.childInfo.children) {
          for (const subsection of section.childInfo.children) {
            if (subsection.childInfo && subsection.childInfo.children) {
              total += subsection.childInfo.children.length;
            }
          }
        }
      }
      return total;
    };

    const totalUnits = countTotalUnits(course.childInfo.children || []);
    
    // Report initial progress
    if (options.onProgress && totalUnits > 0) {
      options.onProgress(0, totalUnits);
    }

    const collectUnits = async (sections, sectionPath = '') => {
      for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
        const section = sections[sectionIdx];
        const sectionPathKey = sectionPath ? `${sectionPath}.${sectionIdx}` : `${sectionIdx}`;
        
        if (section.childInfo && section.childInfo.children) {
          for (let subsectionIdx = 0; subsectionIdx < section.childInfo.children.length; subsectionIdx++) {
            const subsection = section.childInfo.children[subsectionIdx];
            const subsectionPathKey = `${sectionPathKey}.${subsectionIdx}`;
            
            if (subsection.childInfo && subsection.childInfo.children) {
              for (let unitIdx = 0; unitIdx < subsection.childInfo.children.length; unitIdx++) {
                const unit = subsection.childInfo.children[unitIdx];
                const unitPathKey = `${subsectionPathKey}.${unitIdx}`;
                
                let rubricData = null;
                try {
                  const encodedUnitId = encodeURIComponent(unit.id);
                  const getResponse = await fetch(
                    `${base_url}/api/openedx/get_rubric?openedx_based_id=${encodedUnitId}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: "Hello" }),
                    }
                  );

                  if (getResponse.ok) {
                    const result = await getResponse.json();
                    const originalRubric = result?.rubric;

                    if (originalRubric) {
                      rubricData = {
                        skills: originalRubric.skills || [],
                        app_name: originalRubric.app_name || getAppName(),
                        source_document: originalRubric.source_document || null,
                        answer_key: originalRubric.answer_key || null,
                        text_before_video: originalRubric.text_before_video || "",
                        text_after_video: originalRubric.text_after_video || "",
                        lesson_overview: originalRubric.lesson_overview || "",
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
                                weightage: typeof item.weightage === 'number' ? item.weightage : 10,
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
                                weightage: typeof item.weightage === 'number' ? item.weightage : 10,
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
                    }
                  }
                } catch (error) {
                  rubricData = null;
                }

                const mappingKey = unit.displayName || `Unit at ${unitPathKey}`;
                lessonDataMapping[mappingKey] = {
                  originalUnitId: unit.id,
                  displayName: unit.displayName,
                  path: unitPathKey,
                  sectionId: section.id,
                  subsectionId: subsection.id,
                  sectionDisplayName: section.displayName || section.name || '',
                  subsectionDisplayName: subsection.displayName || subsection.name || '',
                  sectionIndex: sectionIdx,
                  subsectionIndex: subsectionIdx,
                  unitIndex: unitIdx,
                  rubricData,
                };
                processedUnits++;
                
                if (options.onProgress) {
                  options.onProgress(processedUnits, totalUnits);
                }
              }
            }
          }
        }
      }
    };

    await collectUnits(course.childInfo.children || []);

    const exportData = {
      courseId,
      courseBlockId,
      exportedAt: Date.now(),
      lessonDataMapping,
      exportedUnits: processedUnits,
    };

    // Try to save to sessionStorage, but NEVER let it block the export
    // The download will always work regardless of sessionStorage success/failure
    if (!options.skipSessionStorage) {
      try {
        const courseSpecificKey = `exported_lesson_data_${courseId}`;
        const genericKey = 'exported_lesson_data_latest';
        
        // Don't stringify again if we already have the data - just estimate size
        // We'll stringify in CourseExportPage for the download anyway
        const estimatedSizeMB = JSON.stringify(exportData).length / (1024 * 1024);
        
        // Check if data is too large for sessionStorage (typically 5-10MB limit)
        const SESSION_STORAGE_LIMIT_MB = 4; // Conservative limit
        
        if (estimatedSizeMB > SESSION_STORAGE_LIMIT_MB) {
          console.warn(`Export data (${estimatedSizeMB.toFixed(2)}MB) is too large for sessionStorage. Skipping storage. Data will only be available in downloaded file.`);
          // Store a minimal reference instead
          const minimalData = {
            courseId,
            courseBlockId,
            exportedAt: exportData.exportedAt,
            exportedUnits: exportData.exportedUnits,
            dataTooLarge: true,
            sizeMB: estimatedSizeMB,
          };
          sessionStorage.setItem(courseSpecificKey, JSON.stringify(minimalData));
          sessionStorage.setItem(genericKey, JSON.stringify(minimalData));
        } else {
          // Data is small enough, try to save full data
          try {
            const jsonString = JSON.stringify(exportData);
            sessionStorage.setItem(courseSpecificKey, jsonString);
            sessionStorage.setItem(genericKey, jsonString);
          } catch (stringifyError) {
            // If stringify fails, save minimal data
            console.warn('Failed to stringify for sessionStorage, saving minimal reference:', stringifyError);
            const minimalData = {
              courseId,
              courseBlockId,
              exportedAt: exportData.exportedAt,
              exportedUnits: exportData.exportedUnits,
              dataTooLarge: true,
            };
            sessionStorage.setItem(courseSpecificKey, JSON.stringify(minimalData));
            sessionStorage.setItem(genericKey, JSON.stringify(minimalData));
          }
        }
      } catch (storageError) {
        // Handle quota exceeded or other storage errors gracefully
        // IMPORTANT: This error does NOT affect the export - download will still work
        if (storageError.name === 'QuotaExceededError' || storageError.message.includes('quota')) {
          console.warn('SessionStorage quota exceeded. Export will continue - data will be available in downloaded JSON file only.');
          // Try to save minimal reference (this might also fail, but that's OK)
          try {
            const minimalData = {
              courseId,
              courseBlockId,
              exportedAt: exportData.exportedAt,
              exportedUnits: exportData.exportedUnits,
              dataTooLarge: true,
            };
            const courseSpecificKey = `exported_lesson_data_${courseId}`;
            const genericKey = 'exported_lesson_data_latest';
            sessionStorage.setItem(courseSpecificKey, JSON.stringify(minimalData));
            sessionStorage.setItem(genericKey, JSON.stringify(minimalData));
          } catch (minimalStorageError) {
            // Even minimal save failed - that's OK, export continues
            console.warn('Could not save even minimal data to sessionStorage. Export continues - download will work:', minimalStorageError);
          }
        } else {
          // Other storage errors - log but don't block
          console.warn('Failed to save to sessionStorage (non-critical). Export continues - download will work:', storageError);
        }
      }
    }

    return {
      success: true,
      exportedUnits,
      exportData,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      exportedUnits: 0,
    };
  }
}

/**
 * Retrieves exported lesson data mapping for a course
 * Tries course-specific key first, then falls back to latest export
 * @param {string} courseId - The course ID (optional, for course-specific lookup)
 * @returns {Object|null} - The exported lesson data mapping or null if not found
 */
export function getExportedLessonDataMapping(courseId = null) {
  try {
    // Try course-specific key first
    if (courseId) {
      const courseSpecificKey = `exported_lesson_data_${courseId}`;
      const stored = sessionStorage.getItem(courseSpecificKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if this is minimal data (data was too large for storage)
        if (parsed.dataTooLarge) {
          console.warn('Stored export data is minimal reference only. Full data was too large for sessionStorage and is only available in downloaded file.');
        }
        return parsed;
      }
    }
    
    // Fall back to latest export (for cross-course imports)
    const genericKey = `exported_lesson_data_latest`;
    const latestStored = sessionStorage.getItem(genericKey);
    if (latestStored) {
      const parsed = JSON.parse(latestStored);
      // Check if this is minimal data (data was too large for storage)
      if (parsed.dataTooLarge) {
        console.warn('Stored export data is minimal reference only. Full data was too large for sessionStorage and is only available in downloaded file.');
      }
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving exported lesson data mapping:', error);
    return null;
  }
}

