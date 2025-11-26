import { base_url } from '../../compugrade-constants';
import { getCourseItem } from '../../course-outline/data/api';
// import { duplicateRubricData } from '../../course-outline/utils/duplicateRubricData';

/**
 * Extracts course ID from course block ID
 * @param {string} courseBlockId - e.g., "block-v1:org+course+run+type@course+block@course"
 * @returns {string} - e.g., "course-v1:org+course+run"
 */
function extractCourseIdFromBlockId(courseBlockId) {
  if (!courseBlockId) return null;
  // Extract from block-v1:org+course+run+type@course+block@course
  const match = courseBlockId.match(/block-v1:([^+]+)\+([^+]+)\+([^+]+)/);
  if (match) {
    return `course-v1:${match[1]}+${match[2]}+${match[3]}`;
  }
  return null;
}

/**
 * Processes imported course structure and creates sections/subsections/units in integrated backend
 * Also duplicates lesson data from original units to imported units
 * @param {string} courseId - The course ID (may be null, will be extracted from courseBlockId)
 * @param {string} courseBlockId - The course block ID (courseStructure.id)
 * @param {Object} originalCourseStructure - The original course structure before import (for mapping units)
 * @param {Object} exportedLessonMetadata - The exported lesson metadata from JSON file (directly from Redux, no sessionStorage)
 * @returns {Promise<{success: boolean, error?: string, processed: {sections: number, subsections: number, units: number}}>}
 */
export async function processImportedCourse(courseId, courseBlockId, originalCourseStructure = null, exportedLessonMetadata = null) {
  try {
    if (!courseBlockId) {
      throw new Error('Course Block ID is required');
    }

    // Extract course ID from courseBlockId if not provided
    const actualCourseId = courseId || extractCourseIdFromBlockId(courseBlockId);
    if (!actualCourseId) {
      throw new Error('Could not determine course ID from course block ID');
    }

    // Fetch the imported course structure
    const importedCourse = await getCourseItem(courseBlockId);
    if (!importedCourse || !importedCourse.childInfo || !importedCourse.childInfo.children) {
      throw new Error('Invalid course structure');
    }

    const exportedLessonData = exportedLessonMetadata;
    const processed = { sections: 0, subsections: 0, units: 0 };
    const normalizeName = (name) => (name || '').trim().toLowerCase();

    const exportedUnitQueue = [];
    if (exportedLessonData && exportedLessonData.lessonDataMapping) {
      Object.entries(exportedLessonData.lessonDataMapping).forEach(([, data]) => {
        exportedUnitQueue.push({
          ...data,
          sectionDisplayName: normalizeName(data.sectionDisplayName),
          subsectionDisplayName: normalizeName(data.subsectionDisplayName),
          sectionIndex: typeof data.sectionIndex === 'number' ? data.sectionIndex : 0,
          subsectionIndex: typeof data.subsectionIndex === 'number' ? data.subsectionIndex : 0,
          unitIndex: typeof data.unitIndex === 'number' ? data.unitIndex : 0,
          path: data.path || '',
        });
      });
      exportedUnitQueue.sort((a, b) => {
        if (a.sectionIndex !== b.sectionIndex) {
          return a.sectionIndex - b.sectionIndex;
        }
        if (a.subsectionIndex !== b.subsectionIndex) {
          return a.subsectionIndex - b.subsectionIndex;
        }
        if (a.unitIndex !== b.unitIndex) {
          return a.unitIndex - b.unitIndex;
        }
        return a.path.localeCompare(b.path);
      });
    }

    const getNextMetadataEntry = () => {
      if (!exportedUnitQueue.length) {
        return null;
      }
      return exportedUnitQueue.shift();
    };

 

    const duplicateLessonOnly = async (currentUnitId) => {
      const entry = getNextMetadataEntry();
      if (!entry || !entry.rubricData) {
        return;
      }

      const savePayload = {
        rubric_id: currentUnitId,
        ...entry.rubricData,
      };

      try {
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
        }
      } catch (error) {
      }
    };

    const importedSections = importedCourse.childInfo.children || [];
    for (let sectionIdx = 0; sectionIdx < importedSections.length; sectionIdx++) {
      const section = importedSections[sectionIdx];

      try {
        const sectionResponse = await fetch(base_url + "/api/openedx/create_section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: section.displayName || section.name || 'Untitled Section',
            openedx_based_id: section.id,
            course_id: actualCourseId,
          }),
        });

        if (sectionResponse.ok) {
          processed.sections++;
        } else if (sectionResponse.status === 500) {
          // Already exists - continue
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Failed to create section ${section.id}:`, await sectionResponse.text());
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error creating section ${section.id}:`, error);
      }
      if (section.childInfo && section.childInfo.children) {
        for (let subsectionIdx = 0; subsectionIdx < section.childInfo.children.length; subsectionIdx++) {
          const subsection = section.childInfo.children[subsectionIdx];

          try {
            const subsectionResponse = await fetch(base_url + "/api/openedx/create_subsection", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: subsection.displayName || subsection.name || 'Untitled Subsection',
                openedx_based_id: subsection.id,
                course_id: actualCourseId,
                section_id: section.id,
              }),
            });

            if (subsectionResponse.ok) {
              processed.subsections++;
            } else if (subsectionResponse.status === 500) {
              // Already exists - continue
            } else {
              // eslint-disable-next-line no-console
              console.warn(`Failed to create subsection ${subsection.id}:`, await subsectionResponse.text());
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error creating subsection ${subsection.id}:`, error);
          }
          if (subsection.childInfo && subsection.childInfo.children) {
            for (let unitIdx = 0; unitIdx < subsection.childInfo.children.length; unitIdx++) {
              const unit = subsection.childInfo.children[unitIdx];
              const currentUnitId = unit.id;
              
              try {
                const rubricResponse = await fetch(base_url + "/api/openedx/create_rubric", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    openedx_based_id: unit.id,
                    course_id: actualCourseId,
                    user_id: 1,
                    subsection_id: subsection.id,
                  }),
                });

                if (rubricResponse.ok) {
                  processed.units++;
                  await duplicateLessonOnly(currentUnitId);
                } else if (rubricResponse.status === 500) {
                  await duplicateLessonOnly(currentUnitId);
                } else {
                  // eslint-disable-next-line no-console
                  console.warn(`Failed to create rubric for unit ${unit.id}:`, await rubricResponse.text());
                  await duplicateLessonOnly(currentUnitId);
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error creating rubric for unit ${unit.id}:`, error);
                await duplicateLessonOnly(currentUnitId);
              }
            }
          }
        }
      }
    }

    return {
      success: true,
      processed,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing imported course:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

