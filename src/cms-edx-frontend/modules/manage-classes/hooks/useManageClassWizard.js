import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { tpToast } from "../../../components/common/tpToast"
import * as classroomApi from "../services/classroomApi"

const initialPreferences = {
  cantRedoCompletedLessons: false,
  enableClassScoreboard: false,
  disableAccountChanges: false,
  hideThePauseButton: false,
  studentsCanChangePassword: false,
  showRestartButton: false,
}

const emptyForm = {
  name: "",
  grade: "",
  period: "",
  courses: [],
  preferences: { ...initialPreferences },
  announcement: "",
}

export function useManageClassWizard({ isNewStudent }) {
  const { step } = useParams()
  const navigate = useNavigate()
  const sanitizedStep = Math.max(parseInt(step, 10) || 1, 1)
  const initialStep = sanitizedStep > 3 ? 3 : sanitizedStep

  const [activeStep, setActiveStep] = useState(initialStep)
  const [formData, setFormData] = useState(emptyForm)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const raw = sessionStorage.getItem("classData")
    if (isNewStudent) setActiveStep(2)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const courseIds = parsed.courses?.map((c) => c.id) || []
        setFormData({ ...parsed, courses: courseIds })
      } catch {
        setFormData(emptyForm)
      }
    }
    let cancelled = false
    ;(async () => {
      try {
        const list = await classroomApi.fetchCoursesList()
        if (!cancelled) setCourses(list)
      } catch {
        if (!cancelled) setCourses([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialStep, isNewStudent])

  const handleCourseSelection = useCallback((id) => {
    setFormData((prev) => {
      const next = [...prev.courses]
      const i = next.indexOf(id)
      if (i >= 0) next.splice(i, 1)
      else next.push(id)
      return { ...prev, courses: next }
    })
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const prevStep = useCallback(() => {
    const v = activeStep - 1
    setActiveStep(v)
    navigate(`/manage-classes/${v}`)
  }, [activeStep, navigate])

  const nextStep = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault()
      const storedId = sessionStorage.getItem("classId")

      if (activeStep === 1) {
        try {
          const result = await classroomApi.saveClassroom(
            {
              name: formData.name,
              grade: formData.grade,
              period: formData.period,
            },
            storedId || null
          )
          if (result?.id != null) sessionStorage.setItem("classId", String(result.id))
        } catch {
          return
        }
      }

      if (activeStep === 3) {
        const classId = sessionStorage.getItem("classId")
        if (!classId) return
        try {
          await classroomApi.postClassroomCourses(classId, formData.courses)
          await classroomApi.putClassroomPreferences(classId, formData.preferences)
          if (formData.announcement && formData.announcement.trim()) {
            await classroomApi.postClassroomAnnouncement(classId, formData.announcement.trim())
          }
          sessionStorage.removeItem("manageClassMode")
          tpToast.success("Class saved successfully")
          navigate("/classes")
        } catch {
          tpToast.error("Unable to finish class setup. Please try again.")
          return
        }
        return
      }

      if (activeStep < 3) {
        const next = activeStep + 1
        setActiveStep(next)
        navigate(`/manage-classes/${next}`)
      }
    },
    [activeStep, formData, navigate]
  )

  return {
    activeStep,
    formData,
    courses,
    handleCourseSelection,
    handleInputChange,
    nextStep,
    prevStep,
  }
}
