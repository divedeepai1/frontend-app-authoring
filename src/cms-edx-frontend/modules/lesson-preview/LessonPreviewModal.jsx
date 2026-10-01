import { useCallback, useEffect, useMemo, useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import TpLessonModalFrame from "../lesson-modals/components/TpLessonModalFrame"
import { fetchRubricForTeacher, unwrapRubric } from "../lesson-modals/services/previewApi"
import "../../theme/teachers-portal-scope.css"
import { PREVIEW_SCOPE_STYLES } from "./previewConstants"
import { resolveLessonsFromRubric } from "./previewRubric"
import LessonPreviewPartView from "./components/LessonPreviewPartView"

export default function LessonPreviewModal({ isOpen, onClose, title, openedxBasedId }) {
  const [rubric, setRubric] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [partIndex, setPartIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setRubric(null)
      setError("")
      setLoading(false)
      setPartIndex(0)
      return undefined
    }
    if (!openedxBasedId) {
      setError("Missing lesson block id.")
      return undefined
    }

    const load = async () => {
      setLoading(true)
      setError("")
      setRubric(null)
      setPartIndex(0)
      try {
        const json = await fetchRubricForTeacher(openedxBasedId)
        const raw = unwrapRubric(json)
        setRubric(raw && typeof raw === "object" ? raw : null)
      } catch (e) {
        setError(e?.message || "Unable to load lesson preview.")
      } finally {
        setLoading(false)
      }
    }

    load()
    return undefined
  }, [isOpen, openedxBasedId])

  const lessons = useMemo(() => resolveLessonsFromRubric(rubric), [rubric])
  const videoSrc = rubric?.video && typeof rubric.video === "string" ? rubric.video.trim() : ""

  const partCount = lessons.length
  const safePart = partCount ? Math.min(partIndex, partCount - 1) : 0
  const currentLesson = lessons[safePart] || null
  const showIntro = safePart === 0
  const isSyntheticRootLesson = currentLesson?.id === "root"

  const goPrev = useCallback(() => {
    setPartIndex((i) => Math.max(0, i - 1))
  }, [])

  const goNext = useCallback(() => {
    setPartIndex((i) => Math.min(partCount - 1, i + 1))
  }, [partCount])

  useEffect(() => {
    if (partIndex > 0 && partCount && partIndex > partCount - 1) {
      setPartIndex(partCount - 1)
    }
  }, [partCount, partIndex])

  const previewSubtitle =
    partCount > 1
      ? `Part ${safePart + 1} of ${partCount}${currentLesson?.title ? ` — ${currentLesson.title}` : ""}`
      : title || "Lesson"

  const previewFooter =
    partCount > 1 && !loading && rubric ? (
      <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--spread">
        <button type="button" className="tp-btn tp-btn-secondary" onClick={goPrev} disabled={safePart <= 0}>
          <ChevronLeft size={18} aria-hidden /> Back
        </button>
        <span className="tp-lesson-modal-footer-meta">{currentLesson?.title || `Part ${safePart + 1}`}</span>
        <button
          type="button"
          className="tp-btn tp-btn-primary"
          onClick={goNext}
          disabled={safePart >= partCount - 1}
        >
          Next <ChevronRight size={18} aria-hidden />
        </button>
      </div>
    ) : null

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Unit preview"
      subtitle={previewSubtitle}
      icon={BookOpen}
      size="preview"
      footer={previewFooter}
    >
      <style>{PREVIEW_SCOPE_STYLES}</style>
      <div className="tp-lesson-preview-body">
        {error && <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div>}
        {loading && (
          <div className="tp-lesson-preview-loading">
            <div className="tp-lesson-preview-spinner" />
            <div style={{ marginTop: 12 }}>Loading preview…</div>
          </div>
        )}

        {!loading && rubric && currentLesson && (
          <LessonPreviewPartView
            rubric={rubric}
            currentLesson={currentLesson}
            safePart={safePart}
            partCount={partCount}
            showIntro={showIntro}
            videoSrc={videoSrc}
            isSyntheticRootLesson={isSyntheticRootLesson}
          />
        )}

        {!loading && !rubric && !error && (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
            No preview data returned.
          </div>
        )}
      </div>
    </TpLessonModalFrame>
  )
}
