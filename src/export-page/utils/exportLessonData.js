import { base_url } from '../../compugrade-constants';
import { getCourseItem } from '../../course-outline/data/api';

/**
 * Exports lesson/rubric data for all units in a course
 * Stores the mapping in sessionStorage so it can be retrieved during import
 * @param {string} courseId - The course ID
 * @param {string} courseBlockId - The course block ID
 * @returns {Promise<{success: boolean, exportedUnits: number, error?: string}>}
 */
export async function exportLessonDataMapping(courseId, courseBlockId, options = {}) {
  try {
    if (!courseBlockId) {
      throw new Error('Course Block ID is required');
    }

    // Fetch the course structure
    const course = await getCourseItem(courseBlockId);
    if (!course || !course.childInfo || !course.childInfo.children) {
      throw new Error('Invalid course structure');
    }

    const lessonDataMapping = {}; // Map unit displayName -> unit ID for matching during import
    let exportedUnits = 0;

    // Recursively collect all units and their lesson data references
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
                
                // Store unit mapping with multiple keys for flexible matching
                const mappingKey = unit.displayName || `Unit at ${unitPathKey}`;
                lessonDataMapping[mappingKey] = {
                  originalUnitId: unit.id,
                  displayName: unit.displayName,
                  path: unitPathKey, // For position-based matching
                  sectionId: section.id,
                  subsectionId: subsection.id,
                  sectionDisplayName: section.displayName || section.name || '',
                  subsectionDisplayName: subsection.displayName || subsection.name || '',
                  sectionIndex: sectionIdx,
                  subsectionIndex: subsectionIdx,
                  unitIndex: unitIdx,
                };
                exportedUnits++;
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
      exportedUnits,
    };

    // Store in sessionStorage with a generic key that can be retrieved during import
    // Use both courseId-specific and generic keys for flexibility unless disabled
    if (!options.skipSessionStorage) {
      const courseSpecificKey = `exported_lesson_data_${courseId}`;
      const genericKey = 'exported_lesson_data_latest';
      sessionStorage.setItem(courseSpecificKey, JSON.stringify(exportData));
      sessionStorage.setItem(genericKey, JSON.stringify(exportData));
    }

    return {
      success: true,
      exportedUnits,
      exportData,
    };
  } catch (error) {
    console.error('Error exporting lesson data mapping:', error);
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
        return JSON.parse(stored);
      }
    }
    
    // Fall back to latest export (for cross-course imports)
    const genericKey = `exported_lesson_data_latest`;
    const latestStored = sessionStorage.getItem(genericKey);
    if (latestStored) {
      return JSON.parse(latestStored);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving exported lesson data mapping:', error);
    return null;
  }
}

