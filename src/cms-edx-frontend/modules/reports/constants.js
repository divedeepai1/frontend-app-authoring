export const REPORT_TYPES = {
  GRADE: "grade",
  LESSON_ACTIVITY: "lesson_activity",
  OVERDUE: "overdue",
}

export const REPORT_TYPE_OPTIONS = [
  {
    id: REPORT_TYPES.GRADE,
    label: "Grade Report",
    description: "One row per student with average and highest score per lesson",
  },
  {
    id: REPORT_TYPES.LESSON_ACTIVITY,
    label: "Lesson Activity Report",
    description: "One row per attempt per student per lesson",
  },
  {
    id: REPORT_TYPES.OVERDUE,
    label: "Overdue Lessons Report",
    description: "Students with past-due lessons or assessments",
  },
]

export const REPORT_ENDPOINTS = {
  [REPORT_TYPES.GRADE]: "/api/grading/grade_report",
  [REPORT_TYPES.LESSON_ACTIVITY]: "/api/grading/lesson_activity_report",
  [REPORT_TYPES.OVERDUE]: "/api/grading/overdue_lessons_report",
}

export const REPORT_EXPORT_ENDPOINTS = {
  [REPORT_TYPES.GRADE]: "/api/grading/export_grade_report_csv",
  [REPORT_TYPES.LESSON_ACTIVITY]: "/api/grading/export_lesson_activity_report_csv",
  [REPORT_TYPES.OVERDUE]: "/api/grading/export_overdue_lessons_report_csv",
}

export const REPORT_EXPORT_FILENAMES = {
  [REPORT_TYPES.GRADE]: "grade-report.csv",
  [REPORT_TYPES.LESSON_ACTIVITY]: "lesson-activity-report.csv",
  [REPORT_TYPES.OVERDUE]: "overdue-lessons-report.csv",
}
