export const getPartAnswerKeyValue = (lesson, rubric, isSyntheticRoot) => {
  if (!lesson || typeof lesson !== "object") return ""
  const fromLesson = lesson.answer_key_url || lesson.answer_key || lesson.answerKey || ""
  if (fromLesson) return fromLesson
  if (isSyntheticRoot && rubric) {
    return rubric.answer_key_url || rubric.answer_key || rubric.answerKey || ""
  }
  return ""
}

export const getPartSkills = (lesson, rubric) => {
  if (lesson && Array.isArray(lesson.skills) && lesson.skills.length > 0) return lesson.skills
  if (rubric && Array.isArray(rubric.skills)) return rubric.skills
  return []
}

export const resolveLessonsFromRubric = (rubric) => {
  if (!rubric) return []
  if (Array.isArray(rubric.lessons) && rubric.lessons.length) return rubric.lessons
  if (Array.isArray(rubric.items) && rubric.items.length) {
    return [{ id: "root", title: "Lesson", items: rubric.items }]
  }
  return []
}
