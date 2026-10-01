import { useCallback, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as accountSettingsApi from "../services/accountSettingsApi"
import {
  applyPasswordFormValidity,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
} from "../utils/validation"

const INITIAL = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function useChangePassword() {
  const [form, setForm] = useState(INITIAL)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }, [])

  const handleChange = useCallback(
    (e) => {
      const { name, value, form: formEl } = e.target
      setForm((prev) => {
        const next = { ...prev, [name]: value }
        applyPasswordFormValidity(formEl, next)
        return next
      })
      setFieldErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const formEl = e.currentTarget
      applyPasswordFormValidity(formEl, form)

      if (!formEl.reportValidity()) {
        return
      }

      setSubmitting(true)
      setFieldErrors({})
      try {
        await accountSettingsApi.changePassword({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        })
        setForm(INITIAL)
        tpToast.success("Password updated successfully")
      } catch (err) {
        const message = err?.message || "Unable to update password. Please try again."
        setFieldErrors({ form: message })
        tpToast.error("Password update failed", message)
      } finally {
        setSubmitting(false)
      }
    },
    [form]
  )

  return {
    form,
    fieldErrors,
    passwordHint: PASSWORD_HINT,
    passwordMinLength: PASSWORD_MIN_LENGTH,
    passwordPattern: PASSWORD_PATTERN,
    submitting,
    handleChange,
    handleSubmit,
  }
}
