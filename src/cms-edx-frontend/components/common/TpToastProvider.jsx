import { useCallback, useEffect, useState } from "react"
import { subscribeTpToast } from "./tpToast"
import TpToaster from "./TpToaster"

export default function TpToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    return subscribeTpToast((toast) => {
      setToasts((prev) => [...prev, toast])
      if (toast.duration > 0) {
        window.setTimeout(() => dismiss(toast.id), toast.duration)
      }
    })
  }, [dismiss])

  return (
    <>
      {children}
      <TpToaster toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
