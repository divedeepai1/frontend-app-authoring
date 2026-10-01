import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildSelectableUnits,
  computeTriState,
  getUnitRubricIds,
  toggleIdsInSet,
} from "../utils/lessonSelection"

export function useLessonSelection(chapters, lessonsByChapter, verticalsByLesson) {
  const [selectedSet, setSelectedSet] = useState(() => new Set())

  const { units, unitsByChapter, unitsByLesson } = useMemo(
    () => buildSelectableUnits(chapters, lessonsByChapter, verticalsByLesson),
    [chapters, lessonsByChapter, verticalsByLesson]
  )

  const allRubricIds = useMemo(() => getUnitRubricIds(units), [units])
  const allRubricIdSet = useMemo(() => new Set(allRubricIds), [allRubricIds])

  useEffect(() => {
    setSelectedSet((prev) => {
      const next = new Set()
      prev.forEach((id) => {
        if (allRubricIdSet.has(id)) next.add(id)
      })
      return next
    })
  }, [allRubricIdSet])

  const globalState = useMemo(
    () => computeTriState(selectedSet, allRubricIds),
    [selectedSet, allRubricIds]
  )

  const selectedRubricIds = useMemo(
    () => allRubricIds.filter((id) => selectedSet.has(id)),
    [allRubricIds, selectedSet]
  )

  const getChapterState = useCallback(
    (chapterId) => {
      const chapterUnits = unitsByChapter[String(chapterId)] || []
      return computeTriState(
        selectedSet,
        chapterUnits.map((u) => u.rubricId)
      )
    },
    [selectedSet, unitsByChapter]
  )

  const getLessonState = useCallback(
    (lessonId) => {
      const lessonUnits = unitsByLesson[String(lessonId)] || []
      return computeTriState(
        selectedSet,
        lessonUnits.map((u) => u.rubricId)
      )
    },
    [selectedSet, unitsByLesson]
  )

  const isSelected = useCallback((rubricId) => selectedSet.has(String(rubricId)), [selectedSet])

  const toggleUnit = useCallback((rubricId) => {
    const id = String(rubricId)
    setSelectedSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleChapter = useCallback(
    (chapterId) => {
      const chapterUnits = unitsByChapter[String(chapterId)] || []
      const ids = chapterUnits.map((u) => u.rubricId)
      const { checked, indeterminate } = computeTriState(selectedSet, ids)
      const shouldSelect = !checked && !indeterminate ? true : !checked
      setSelectedSet((prev) => toggleIdsInSet(prev, ids, shouldSelect))
    },
    [selectedSet, unitsByChapter]
  )

  const toggleLesson = useCallback(
    (lessonId) => {
      const lessonUnits = unitsByLesson[String(lessonId)] || []
      const ids = lessonUnits.map((u) => u.rubricId)
      const { checked, indeterminate } = computeTriState(selectedSet, ids)
      const shouldSelect = !checked && !indeterminate ? true : !checked
      setSelectedSet((prev) => toggleIdsInSet(prev, ids, shouldSelect))
    },
    [selectedSet, unitsByLesson]
  )

  const toggleAll = useCallback(() => {
    const { checked, indeterminate } = computeTriState(selectedSet, allRubricIds)
    const shouldSelect = !checked && !indeterminate ? true : !checked
    setSelectedSet((prev) => toggleIdsInSet(prev, allRubricIds, shouldSelect))
  }, [selectedSet, allRubricIds])

  const clearSelection = useCallback(() => {
    setSelectedSet(new Set())
  }, [])

  return {
    units,
    unitsByChapter,
    unitsByLesson,
    selectedCount: globalState.selectedCount,
    selectedRubricIds,
    globalChecked: globalState.checked,
    globalIndeterminate: globalState.indeterminate,
    getChapterState,
    getLessonState,
    isSelected,
    toggleUnit,
    toggleChapter,
    toggleLesson,
    toggleAll,
    clearSelection,
  }
}
