const DEFAULT_DURATION = 5000

let listener = null
let idCounter = 0

function normalizeMessage(title, options = {}) {
  if (typeof options === "string") {
    return { title, description: options }
  }
  return {
    title: title ?? "",
    description: options.description ?? "",
    duration: options.duration ?? DEFAULT_DURATION,
  }
}

function emit(payload) {
  if (listener) listener(payload)
}

export const tpToast = {
  show({ title, description = "", variant = "info", duration = DEFAULT_DURATION }) {
    const id = ++idCounter
    emit({ id, title, description, variant, duration })
    return id
  },

  success(title, options) {
    const { title: t, description, duration } = normalizeMessage(title, options)
    return tpToast.show({ title: t, description, variant: "success", duration })
  },

  error(title, options) {
    const { title: t, description, duration } = normalizeMessage(title, options)
    return tpToast.show({ title: t, description, variant: "error", duration })
  },

  info(title, options) {
    const { title: t, description, duration } = normalizeMessage(title, options)
    return tpToast.show({ title: t, description, variant: "info", duration })
  },
}

export function subscribeTpToast(fn) {
  listener = fn
  return () => {
    if (listener === fn) listener = null
  }
}
