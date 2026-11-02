import { useCallback, useEffect, useMemo, useState } from "react"
import { parseEdxUserInfoCookie } from "../../../layout/parseEdxUserInfoCookie"
import { tpToast } from "../../../components/common/tpToast"
import {
  resetStudentPasswordByTeacher,
  updateClassroomStudent,
} from "../services/studentEditApi"
import {
  isAllowedNameInput,
  validateStudentInfoFields,
  validateStudentPasswordFields,
} from "../utils/studentFormValidation"

const EMPTY_INFO = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
}

const EMPTY_PASSWORD = {
  newPassword: "",
  confirmPassword: "",
  sendEmail: true,
}

function studentToInfoForm(student) {
  if (!student) return { ...EMPTY_INFO }
  return {
    username: student.username || "",
    firstName: student.first_name || student.firstName || "",
    lastName: student.last_name || student.lastName || "",
    email: student.email || "",
  }
}

export function useEditStudent({ classId, onUpdated } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [student, setStudent] = useState(null)
  const [infoForm, setInfoForm] = useState(EMPTY_INFO)
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD)
  const [infoErrors, setInfoErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const teacherEmail = useMemo(() => {
    const user = parseEdxUserInfoCookie()
    return String(user?.email || "").trim()
  }, [isOpen])

  const openEdit = useCallback((nextStudent) => {
    setStudent(nextStudent || null)
    setInfoForm(studentToInfoForm(nextStudent))
    setPasswordForm({ ...EMPTY_PASSWORD })
    setInfoErrors({})
    setPasswordErrors({})
    setIsOpen(true)
  }, [])

  const closeEdit = useCallback(() => {
    if (savingInfo || savingPassword) return
    setIsOpen(false)
    setStudent(null)
    setInfoForm(EMPTY_INFO)
    setPasswordForm({ ...EMPTY_PASSWORD })
    setInfoErrors({})
    setPasswordErrors({})
  }, [savingInfo, savingPassword])

  useEffect(() => {
    if (!isOpen || !student) return
    setInfoForm(studentToInfoForm(student))
    setPasswordForm({ ...EMPTY_PASSWORD })
    setInfoErrors({})
    setPasswordErrors({})
  }, [isOpen, student])

  const handleInfoChange = useCallback((event) => {
    const { name, value } = event.target
    if ((name === "firstName" || name === "lastName") && !isAllowedNameInput(value)) {
      return
    }
    setInfoForm((prev) => ({ ...prev, [name]: value }))
    setInfoErrors((prev) => {
      if (!prev[name] && !prev.form) return prev
      const next = { ...prev }
      delete next[name]
      delete next.form
      return next
    })
  }, [])

  const handlePasswordChange = useCallback((event) => {
    const { name, value, type, checked } = event.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setPasswordErrors((prev) => {
      if (!prev[name] && !prev.form) return prev
      const next = { ...prev }
      delete next[name]
      delete next.form
      return next
    })
  }, [])

  const saveInfo = useCallback(async () => {
    const classroomId = classId || sessionStorage.getItem("classId")
    const studentId = student?.id
    if (!classroomId || !studentId) {
      setInfoErrors({ form: "Missing class or student information." })
      return
    }

    const clientErrors = validateStudentInfoFields(infoForm)
    if (Object.keys(clientErrors).length) {
      setInfoErrors(clientErrors)
      return
    }

    setSavingInfo(true)
    setInfoErrors({})
    try {
      await updateClassroomStudent({
        classroomId,
        studentId,
        username: infoForm.username,
        firstName: infoForm.firstName,
        lastName: infoForm.lastName,
        email: infoForm.email,
      })
      const updatedStudent = {
        ...student,
        username: infoForm.username.trim(),
        first_name: infoForm.firstName.trim(),
        last_name: infoForm.lastName.trim(),
        email: infoForm.email.trim(),
      }
      setStudent(updatedStudent)
      tpToast.success("Student updated", "Student information saved successfully.")
      if (typeof onUpdated === "function") {
        await onUpdated(updatedStudent)
      }
    } catch (error) {
      setInfoErrors(error?.fieldErrors || { form: error?.message || "Unable to update student." })
    } finally {
      setSavingInfo(false)
    }
  }, [classId, infoForm, onUpdated, student])

  const savePassword = useCallback(async () => {
    const clientErrors = validateStudentPasswordFields(passwordForm)
    if (Object.keys(clientErrors).length) {
      setPasswordErrors(clientErrors)
      return
    }

    const studentEmail = String(infoForm.email || student?.email || "").trim()
    if (!studentEmail) {
      setPasswordErrors({ form: "Student email is required to reset the password." })
      return
    }
    if (!teacherEmail) {
      setPasswordErrors({ form: "Could not determine the logged-in teacher email." })
      return
    }

    setSavingPassword(true)
    setPasswordErrors({})
    try {
      await resetStudentPasswordByTeacher({
        teacherEmail,
        studentEmail,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
        sendEmail: passwordForm.sendEmail,
      })
      setPasswordForm({ ...EMPTY_PASSWORD, sendEmail: passwordForm.sendEmail })
      tpToast.success(
        "Password updated",
        passwordForm.sendEmail
          ? "New password set and emailed to the student."
          : "New password set for the student.",
      )
    } catch (error) {
      setPasswordErrors(
        error?.fieldErrors || { form: error?.message || "Unable to reset password." },
      )
    } finally {
      setSavingPassword(false)
    }
  }, [infoForm.email, passwordForm, student?.email, teacherEmail])

  return {
    isOpen,
    student,
    infoForm,
    passwordForm,
    infoErrors,
    passwordErrors,
    savingInfo,
    savingPassword,
    openEdit,
    closeEdit,
    handleInfoChange,
    handlePasswordChange,
    saveInfo,
    savePassword,
  }
}
