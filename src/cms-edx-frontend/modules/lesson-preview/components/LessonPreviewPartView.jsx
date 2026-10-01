import { getPartAnswerKeyValue, getPartSkills } from "../previewRubric"
import AnswerKeySection from "./AnswerKeySection"
import ContentBlock from "./ContentBlock"
import SkillsPreviewGrid from "./SkillsPreviewGrid"
import { PreviewCard, PreviewStemHtml, SectionLabel } from "./PreviewUi"

export default function LessonPreviewPartView({
  rubric,
  currentLesson,
  safePart,
  partCount,
  showIntro,
  videoSrc,
  isSyntheticRootLesson,
}) {
  const partSkills = getPartSkills(currentLesson, rubric)
  const answerKeyValue = getPartAnswerKeyValue(currentLesson, rubric, isSyntheticRootLesson)

  return (
    <div>
      {videoSrc && (
        <PreviewCard style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
            <SectionLabel>Lesson video</SectionLabel>
          </div>
          <video
            controls
            src={videoSrc}
            style={{ width: "100%", maxHeight: 420, display: "block", background: "#101828" }}
          />
        </PreviewCard>
      )}

      <SkillsPreviewGrid skills={partSkills} />

      {showIntro && (rubric.text_before_video || rubric.lesson_overview || rubric.text_after_video) && (
        <PreviewCard>
          <SectionLabel>Overview</SectionLabel>
          {rubric.text_before_video && (
            <PreviewStemHtml
              html={rubric.text_before_video}
              style={{ fontSize: 14, color: "#334155", marginBottom: 12 }}
            />
          )}
          {rubric.lesson_overview && (
            <PreviewStemHtml
              html={rubric.lesson_overview}
              style={{ fontSize: 14, color: "#334155", marginBottom: 12 }}
            />
          )}
          {rubric.text_after_video && (
            <PreviewStemHtml html={rubric.text_after_video} style={{ fontSize: 14, color: "#334155" }} />
          )}
        </PreviewCard>
      )}

      <div style={{ marginBottom: 14 }}>
        <div className="tp-lesson-preview-part-title">
          {currentLesson.title || (partCount > 1 ? `Part ${safePart + 1}` : "Lesson")}
        </div>
        {currentLesson.weightage != null && (
          <div className="tp-lesson-preview-part-meta">Weight {currentLesson.weightage}%</div>
        )}
      </div>

      <div className="tp-lesson-preview-instructions-title">Instructions in this lesson</div>
      {(currentLesson.items || []).map((item, ii) => (
        <ContentBlock key={`${currentLesson.id}-${item.id ?? ii}`} item={item} index={ii} />
      ))}

      <AnswerKeySection value={answerKeyValue} />
    </div>
  )
}
