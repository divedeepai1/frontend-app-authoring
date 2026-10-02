/**
 * Compugrade sync helpers for outline duplicate flows.
 * Mirrors cms-edx-frontend/src/course-outline/data/thunk.js duplicate*Query.
 */
import {
  createRubric,
  createSection,
  createSubsection,
  updateRubricTitle,
  updateSectionTitle,
} from '../api';
import { extractParts, stripDuplicatePrefix, buildDisplayName } from '../titleUtils';
import { duplicateRubricData } from '../../course-outline/utils/duplicateRubricData';
import { editItemDisplayName, getCourseItem } from '../../course-outline/data/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function syncUnitRubric({
  originalUnitId,
  duplicatedUnitId,
  courseId,
  subsectionId,
  displayName,
}) {
  await createRubric({
    locator: duplicatedUnitId,
    courseId,
    subsectionId,
  });
  const cleanTitle = stripDuplicatePrefix(displayName);
  if (cleanTitle && cleanTitle !== displayName) {
    await editItemDisplayName({ itemId: duplicatedUnitId, displayName: cleanTitle });
    await updateRubricTitle(duplicatedUnitId, cleanTitle);
  }
  const duplicateResult = await duplicateRubricData(originalUnitId, duplicatedUnitId);
  if (!duplicateResult?.success) {
    // eslint-disable-next-line no-console
    console.error('Error duplicating rubric data:', duplicateResult?.error);
  }
}

export async function syncDuplicatedUnit({
  originalUnitId,
  duplicatedUnitId,
  courseId,
  subsectionId,
}) {
  try {
    const duplicatedUnit = await getCourseItem(duplicatedUnitId);
    await syncUnitRubric({
      originalUnitId,
      duplicatedUnitId,
      courseId,
      subsectionId,
      displayName: duplicatedUnit.displayName,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error syncing duplicated unit:', error);
  }
}

export async function syncDuplicatedSubsection({
  originalSubsectionId,
  duplicatedSubsectionId,
  courseId,
  sectionId,
}) {
  try {
    const duplicatedSubsection = await getCourseItem(duplicatedSubsectionId);
    let subsectionTitle = stripDuplicatePrefix(duplicatedSubsection.displayName);
    if (subsectionTitle !== duplicatedSubsection.displayName) {
      await editItemDisplayName({ itemId: duplicatedSubsectionId, displayName: subsectionTitle });
    }
    await createSubsection({
      title: subsectionTitle,
      locator: duplicatedSubsectionId,
      courseId,
      sectionId,
    });

    await delay(500);
    const duplicatedWithChildren = await getCourseItem(duplicatedSubsectionId);
    const originalSubsection = await getCourseItem(originalSubsectionId);
    const originalUnits = originalSubsection?.childInfo?.children || [];
    const duplicatedUnits = duplicatedWithChildren?.childInfo?.children || [];

    // Create rubrics and copy data
    for (let unitIdx = 0; unitIdx < duplicatedUnits.length; unitIdx += 1) {
      const duplicatedUnit = duplicatedUnits[unitIdx];
      const originalUnit = originalUnits[unitIdx];
      if (!originalUnit) {
        // eslint-disable-next-line no-continue
        continue;
      }
      try {
        await createRubric({
          locator: duplicatedUnit.id,
          courseId,
          subsectionId: duplicatedSubsectionId,
        });
        const duplicateResult = await duplicateRubricData(originalUnit.id, duplicatedUnit.id);
        if (!duplicateResult?.success) {
          // eslint-disable-next-line no-console
          console.error('Error duplicating rubric data:', duplicateResult?.error);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating rubric for unit:', error);
      }
    }

    // Renumber / strip Duplicate of from unit names (cms behavior)
    const unitsAfter = (await getCourseItem(duplicatedSubsectionId))?.childInfo?.children || [];
    // Find subsection index within section for numbering
    const section = await getCourseItem(sectionId);
    const subIdx = (section?.childInfo?.children || []).findIndex(
      (s) => s.id === duplicatedSubsectionId,
    );
    const subsectionIndex = subIdx >= 0 ? subIdx : 0;

    for (let unitIdx = 0; unitIdx < unitsAfter.length; unitIdx += 1) {
      const unit = unitsAfter[unitIdx];
      const originalUnit = originalUnits[unitIdx];
      const sourceTitle = originalUnit?.displayName || unit.displayName;
      const { typePart, stringPart } = extractParts(sourceTitle);
      const typeLabel = typePart || 'Lesson';
      const newNumberPrefix = `${subsectionIndex + 1}.${unitIdx + 1}`;
      const newDisplayName = buildDisplayName(typeLabel, newNumberPrefix, stringPart);
      if (newDisplayName && newDisplayName !== unit.displayName) {
        try {
          await editItemDisplayName({ itemId: unit.id, displayName: newDisplayName });
          await updateRubricTitle(unit.id, newDisplayName);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error renaming duplicated unit:', error);
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error syncing duplicated subsection:', error);
  }
}

export async function syncDuplicatedSection({
  originalSectionId,
  duplicatedSectionId,
  courseId,
}) {
  try {
    const duplicatedSection = await getCourseItem(duplicatedSectionId);
    let sectionTitle = stripDuplicatePrefix(duplicatedSection.displayName);
    if (sectionTitle !== duplicatedSection.displayName) {
      await editItemDisplayName({ itemId: duplicatedSectionId, displayName: sectionTitle });
    }
    await createSection({
      title: sectionTitle,
      locator: duplicatedSectionId,
      courseId,
    });
    if (sectionTitle !== duplicatedSection.displayName) {
      await updateSectionTitle(duplicatedSectionId, sectionTitle);
    }

    await delay(1000);
    const duplicatedWithChildren = await getCourseItem(duplicatedSectionId);
    const originalSection = await getCourseItem(originalSectionId);
    const duplicatedSubsections = duplicatedWithChildren?.childInfo?.children || [];
    const originalSubsections = originalSection?.childInfo?.children || [];

    for (let subIdx = 0; subIdx < duplicatedSubsections.length; subIdx += 1) {
      const duplicatedSubsection = duplicatedSubsections[subIdx];
      const originalSubsection = originalSubsections[subIdx];
      if (!originalSubsection) {
        // eslint-disable-next-line no-continue
        continue;
      }
      try {
        const subsectionTitle = stripDuplicatePrefix(duplicatedSubsection.displayName);
        await createSubsection({
          title: subsectionTitle,
          locator: duplicatedSubsection.id,
          courseId,
          sectionId: duplicatedSectionId,
        });

        const duplicatedSubsectionWithUnits = await getCourseItem(duplicatedSubsection.id);
        const originalUnits = originalSubsection?.childInfo?.children || [];
        const duplicatedUnits = duplicatedSubsectionWithUnits?.childInfo?.children || [];

        for (let unitIdx = 0; unitIdx < duplicatedUnits.length; unitIdx += 1) {
          const duplicatedUnit = duplicatedUnits[unitIdx];
          const originalUnit = originalUnits[unitIdx];
          if (!originalUnit) {
            // eslint-disable-next-line no-continue
            continue;
          }
          try {
            await createRubric({
              locator: duplicatedUnit.id,
              courseId,
              subsectionId: duplicatedSubsection.id,
            });
            const duplicateResult = await duplicateRubricData(originalUnit.id, duplicatedUnit.id);
            if (!duplicateResult?.success) {
              // eslint-disable-next-line no-console
              console.error('Error duplicating rubric data:', duplicateResult?.error);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error creating rubric for unit:', error);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating subsection:', error);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error syncing duplicated section:', error);
  }
}
