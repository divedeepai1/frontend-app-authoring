/**
 * Shared title helpers matching cms-edx-frontend Compugrade autonumbering.
 * Pattern: "Lesson 1.2 My Title" → typePart, numberPart, stringPart
 */

export const TITLE_TYPE_OPTIONS = ['Unit', 'Chapter', 'Lesson', 'Assessment'];

export function extractParts(titleValue = '') {
  const match = String(titleValue).match(
    /^(Unit|Chapter|Lesson|Assessment|Part)?\s*(\d+(?:\.\d+)?)?\s*(.*)/i,
  );
  const typePart = match ? match[1] || '' : '';
  const numberPart = match ? match[2] || '' : '';
  let stringPart = match ? match[3] : titleValue;
  stringPart = String(stringPart || '')
    .replace(/^Duplicate of ['"]/i, '')
    .replace(/['"]$/, '')
    .trim();
  return { typePart, numberPart, stringPart };
}

export function stripDuplicatePrefix(title = '') {
  return String(title)
    .replace(/^Duplicate of ['"]/i, '')
    .replace(/['"]$/, '')
    .trim();
}

export function buildDisplayName(typePart, numberPart, stringPart) {
  return [typePart, numberPart, stringPart].filter(Boolean).join(' ').trim();
}

/**
 * Build new unit display name like cms: "Unit 1.2 Unit"
 * @param {string} numberPrefix e.g. "1.2"
 * @param {string} [typeLabel='Unit']
 */
export function buildNewUnitDisplayName(numberPrefix, typeLabel = 'Unit') {
  return `${typeLabel} ${numberPrefix} Unit`;
}

/**
 * Renumber all units in a section tree (mutates copy); returns rename ops for persistence.
 * newNumberPrefix = `${subsectionIndex+1}.${unitIndex+1}`
 */
export function renumberSectionUnits(sectionRef) {
  const saveOps = [];
  if (!sectionRef?.childInfo?.children) {
    return { section: sectionRef, saveOps };
  }
  const updatedSubsections = sectionRef.childInfo.children.map((subRef, sIdx) => {
    const units = subRef?.childInfo?.children || [];
    const updatedUnits = units.map((unitItem, uIdx) => {
      const { typePart, stringPart } = extractParts(unitItem.displayName || '');
      const typeLabel = typePart || 'Lesson';
      const newNumberPrefix = `${sIdx + 1}.${uIdx + 1}`;
      const newDisplayName = buildDisplayName(typeLabel, newNumberPrefix, stringPart);
      if (newDisplayName && newDisplayName !== unitItem.displayName) {
        saveOps.push({
          unitId: unitItem.id,
          sectionId: sectionRef.id,
          name: newDisplayName,
        });
      }
      return { ...unitItem, displayName: newDisplayName };
    });
    return { ...subRef, childInfo: { ...subRef.childInfo, children: updatedUnits } };
  });
  return {
    section: {
      ...sectionRef,
      childInfo: { ...sectionRef.childInfo, children: updatedSubsections },
    },
    saveOps,
  };
}
