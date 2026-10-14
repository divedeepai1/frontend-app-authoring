import { base_url } from '../../compugrade-constants';
import { ensureInstructionItemNums, importQaStates } from '../../compugrade/utils/rubricQaTransfer';
import { getCourseItem } from '../../course-outline/data/api';
import { restoreCourseLevelTextsFromExport } from '../../course-outline/utils/courseIntroApi';
import { valueToJsonBlob } from '../../export-page/utils/chunkedJsonBlob';
import {
  IMPORT_STORE_MARKER,
  clearMetadataImportStore,
  deleteImportUnit,
  getImportUnit,
} from './exportMetadataUnitStore';
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

    // Support both inline full metadata and memory-safe unit-store handles from prepareExportMetadataForImport
    const exportedLessonData = (
      exportedLessonMetadata?.mode === 'inline'
      || exportedLessonMetadata?.mode === 'unit-store'
    )
      ? exportedLessonMetadata.data
      : exportedLessonMetadata;
    const isUnitStore = Boolean(
      exportedLessonData
      && exportedLessonData[IMPORT_STORE_MARKER]
      && exportedLessonData.storeId
      && Array.isArray(exportedLessonData.unitRecords),
    );
    const processed = { sections: 0, subsections: 0, units: 0 };

    // Restore course dashboard text + description onto the target course (same save APIs as outline)
    try {
      await restoreCourseLevelTextsFromExport(actualCourseId, exportedLessonData);
    } catch (courseLevelError) {
      // eslint-disable-next-line no-console
      console.warn('Could not restore course dashboard/description texts:', courseLevelError);
    }

    const normalizeName = (name) => (name || '').trim().toLowerCase();

    const exportedUnitQueue = [];
    if (isUnitStore) {
      // Lightweight sorted index only — full unit payloads loaded one at a time from IndexedDB
      exportedLessonData.unitRecords.forEach((record) => {
        exportedUnitQueue.push({ ...record });
      });
    } else if (exportedLessonData && exportedLessonData.lessonDataMapping) {
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

    const getNextMetadataEntry = async () => {
      if (!exportedUnitQueue.length) {
        return null;
      }
      const next = exportedUnitQueue.shift();
      if (!isUnitStore) {
        return next;
      }
      if (!next?.recordId) {
        return null;
      }
      try {
        // Exact stored unit (rubricData + qaStates + all fields) — then free IDB slot
        const unitData = await getImportUnit(next.recordId);
        await deleteImportUnit(next.recordId);
        if (!unitData) {
          return null;
        }
        return {
          ...unitData,
          sectionDisplayName: normalizeName(unitData.sectionDisplayName),
          subsectionDisplayName: normalizeName(unitData.subsectionDisplayName),
          sectionIndex: typeof unitData.sectionIndex === 'number' ? unitData.sectionIndex : next.sectionIndex,
          subsectionIndex:
            typeof unitData.subsectionIndex === 'number' ? unitData.subsectionIndex : next.subsectionIndex,
          unitIndex: typeof unitData.unitIndex === 'number' ? unitData.unitIndex : next.unitIndex,
          path: unitData.path || next.path || '',
        };
      } catch (loadError) {
        // eslint-disable-next-line no-console
        console.error('Failed to load import unit from store:', loadError);
        return null;
      }
    };

    const duplicateLessonOnly = async (currentUnitId) => {
      const entry = await getNextMetadataEntry();
      if (!entry || !entry.rubricData) {
        return;
      }

      const savePayload = {
        rubric_id: currentUnitId,
        ...ensureInstructionItemNums(entry.rubricData),
      };

      try {
        // Chunked body avoids Invalid string length on very large single-unit payloads
        const saveBody = await valueToJsonBlob(savePayload);
        const saveResponse = await fetch(
          `${base_url}/api/openedx/create_base_lesson_from_scratch`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: saveBody,
          }
        );

        if (!saveResponse.ok) {
          // eslint-disable-next-line no-console
          console.warn(
            `Failed to create lesson for unit ${currentUnitId}:`,
            await saveResponse.text(),
          );
          return;
        }

        if (entry.qaStates?.lessons?.length) {
          await importQaStates(currentUnitId, entry.qaStates);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error creating lesson for unit ${currentUnitId}:`, error);
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

    // Cleanup IndexedDB after successful restore (best-effort)
    if (isUnitStore && exportedLessonData.storeId) {
      try {
        await clearMetadataImportStore(exportedLessonData.storeId);
      } catch (cleanupError) {
        // eslint-disable-next-line no-console
        console.warn('Failed to clear import unit store:', cleanupError);
      }
    }

    return {
      success: true,
      processed,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing imported course:', error);
    // Best-effort cleanup so a failed large import does not leave orphan IDB data
    try {
      const maybeStore = (
        exportedLessonMetadata?.mode === 'inline'
        || exportedLessonMetadata?.mode === 'unit-store'
      )
        ? exportedLessonMetadata.data
        : exportedLessonMetadata;
      if (maybeStore?.[IMPORT_STORE_MARKER] && maybeStore.storeId) {
        await clearMetadataImportStore(maybeStore.storeId);
      }
    } catch {
      // ignore cleanup errors
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

