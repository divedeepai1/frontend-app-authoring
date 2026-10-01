import { useCallback, useEffect, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import { parseEdxUserInfoCookie } from "../../../layout/parseEdxUserInfoCookie"
import * as accountSettingsApi from "../services/accountSettingsApi"
import { applyEmailFormValidity } from "../utils/validation"

const INITIAL = {
  oldPassword: "",
  newEmail: "",
  confirmEmail: "",
}

export function useChangeEmail() {
  const [currentEmail, setCurrentEmail] = useState("")
  const [form, setForm] = useState(INITIAL)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const user = parseEdxUserInfoCookie()
    setCurrentEmail(user?.email || "")
  }, [])

  const handleChange = useCallback(
    (e) => {
      const { name, value, form: formEl } = e.target
      setForm((prev) => {
        const next = { ...prev, [name]: value }
        applyEmailFormValidity(formEl, next, currentEmail)
        return next
      })
      setFieldErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
    },
    [currentEmail]
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const formEl = e.currentTarget
      applyEmailFormValidity(formEl, form, currentEmail)

      if (!formEl.reportValidity()) {
        return
      }

      setSubmitting(true)
      setFieldErrors({})
      try {
        await accountSettingsApi.changeEmail({
          oldPassword: form.oldPassword,
          newEmail: form.newEmail,
        })
        setForm(INITIAL)
        setCurrentEmail(form.newEmail.trim())
        tpToast.success("Email updated successfully")
      } catch (err) {
        const message = err?.message || "Unable to update email. Please try again."
        setFieldErrors({ form: message })
        tpToast.error("Email update failed", message)
      } finally {
        setSubmitting(false)
      }
    },
    [form, currentEmail]
  )

  return {
    currentEmail,
    form,
    fieldErrors,
    submitting,
    handleChange,
    handleSubmit,
  }
}
