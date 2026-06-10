/**
 * Builds a flat list of selectable curriculum units (verticals / rubrics)
 * grouped by chapter for section-level selection.
 */
export function buildSelectableUnits(chapters, lessonsByChapter, verticalsByLesson) {
  const units = []
  const unitsByChapter = {}
  const unitsByLesson = {}

  ;(chapters || []).forEach((chapter) => {
    const chapterId = String(chapter.id)
    const lessons = lessonsByChapter[chapterId] || []
    const chapterUnits = []

    lessons.forEach((lesson) => {
      const lessonId = String(lesson.id)
      const verticals = verticalsByLesson[lessonId] || []
      const lessonUnits = []

      verticals.forEach((vertical) => {
        const rubricId = String(vertical.id || "")
        if (!rubricId) return

        const unit = {
          rubricId,
          title: vertical.title || "Untitled unit",
          chapterId,
          chapterTitle: chapter.title || "",
          lessonId,
          lessonTitle: lesson.title || "",
        }
        units.push(unit)
        chapterUnits.push(unit)
        lessonUnits.push(unit)
      })

      if (lessonUnits.length) {
        unitsByLesson[lessonId] = lessonUnits
      }
    })

    unitsByChapter[chapterId] = chapterUnits
  })

  return { units, unitsByChapter, unitsByLesson }
}

export function getUnitRubricIds(units) {
  return (units || []).map((u) => u.rubricId)
}

export function computeTriState(selectedSet, targetIds) {
  const ids = targetIds || []
  if (!ids.length) {
    return { checked: false, indeterminate: false, selectedCount: 0 }
  }

  let selectedCount = 0
  ids.forEach((id) => {
    if (selectedSet.has(id)) selectedCount += 1
  })

  if (selectedCount === 0) {
    return { checked: false, indeterminate: false, selectedCount: 0 }
  }
  if (selectedCount === ids.length) {
    return { checked: true, indeterminate: false, selectedCount }
  }
  return { checked: false, indeterminate: true, selectedCount }
}

export function toggleIdsInSet(prevSet, ids, shouldSelect) {
  const next = new Set(prevSet)
  ;(ids || []).forEach((id) => {
    if (shouldSelect) next.add(id)
    else next.delete(id)
  })
  return next
}
