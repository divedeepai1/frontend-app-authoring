import { useEffect, useRef, useState } from "react";
import { Layers, BookOpen, Settings } from "lucide-react";
import { AddPartDialog } from "../components/add-part-dialog";
import { EditPartDialog } from "../components/edit-part-dialog";
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog";
import { HybridContentEditor } from "../components/hybrid-content-editor";
import { base_url } from "../../../../compugrade-constants";
import { useNavigate, useParams } from "react-router";
import { ImagesProvider } from "../components/ui/images-context";
import { ValidationErrorsModal } from "../components/validation-errors-modal";
import LessonPreviewDialog from "../components/ui/preview";
import downloadFile from "../utils/downloadFile";
import ToastContainer from "../components/ui/toast";
import SaveTimestampsDialog from "../components/ui/ai-video-preview";
import LessonVideoPopup from "../components/ui/lesson-video-popup";
import DocumentPreviewDialog from "../components/ui/DocumentPreviewDialog";
import PageHeader from "../components/PageHeader";
import RightSidebar from "../components/RightSidebar";
import LessonConfigModal from "../components/LessonConfigModal";
import AssessmentTimerModal from "../components/AssessmentTimerModal";
import PartConfigModal from "../components/PartConfigModal";
import LessonQAModal from "../components/qa/LessonQAModal";
import LessonStateModal from "../components/LessonStateModal";
import { fetchCsrfToken } from "../../../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useUniqueId } from "@dnd-kit/utilities";


export default function LessonBuilder() {
  const { blockId, sequenceId, courseId } = useParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoData, setVideoData] = useState({timestamps: [], video: ""});
  const [lessonParts, setLessonParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("1");
  const [draggedPartIndex, setDraggedPartIndex] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [deletingPart, setDeletingPart] = useState(null);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [aiVideoLoading, setAiVideoLoading] = useState(false);
  const [aiVideoRegenerating, setAiVideoRegenerating] = useState(false);
  const [aiVideoFetching, setAiVideoFetching] = useState(false);
  const [aiInstructionsLoading, setAiInstructionsLoading] = useState(false);
  const [aiLessonBuilderLoading, setAiLessonBuilderLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [partConfigOpen, setPartConfigOpen] = useState(false);
  const [lessonConfigOpen, setLessonConfigOpen] = useState(false);
  const [assessmentTimerOpen, setAssessmentTimerOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lessonConfig, setLessonConfig] = useState({
    sourceDocument: null,
    answerKey: null,
    videoEnabled: false,
    videos: [],
    lesson_files: [],
    lessonParts: [],
    text_before_video: "",
    text_after_video: "",
    video_transcript: "",
    lesson_overview: "",
    num_of_attempts: 3,
    is_assessment: false,
    time_allowed: null,
    timer_mode: null,
  });
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const videoObjectUrlRef = useRef("");
  const [docPreview, setDocPreview] = useState({ open: false, title: "", src: null });
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [qaModalPartId, setQaModalPartId] = useState(null);
  const [lessonStateModalOpen, setLessonStateModalOpen] = useState(false);
  const [lessonStates, setLessonStates] = useState([]);
  const [lessonStatesLoading, setLessonStatesLoading] = useState(false);
  const [lessonStateSaving, setLessonStateSaving] = useState(false);
  const [restoringStateId, setRestoringStateId] = useState(null);

  useEffect(() => {
    let isFetching = false;
  
    const fetchCourseType = async () => {
      if (isFetching) return;
      isFetching = true;
  
      const token = await fetchCsrfToken();
  
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/courses/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
          }
        );
  
        if (response.ok) {
          const courses = await response.json();
          const currentCourse = courses.find(
            (course) => course.id == courseId
          );
  
          if (currentCourse && currentCourse.course_type) {
            sessionStorage.setItem(
              "courseTitle",
              currentCourse?.display_name
            );
  
            let sessionCourseType = currentCourse.course_type;
  
            if (
              sessionCourseType === "ms_powerpoint" ||
              sessionCourseType === "google_slides"
            ) {
              sessionCourseType = "powerpoint";
            } else if (
              sessionCourseType === "ms_excel" ||
              sessionCourseType === "google_sheets"
            ) {
              sessionCourseType = "excel";
            } else if (
              sessionCourseType === "ms_word" ||
              sessionCourseType === "google_docs"
            ) {
              sessionCourseType = "ms-word";
            }
  
            sessionStorage.setItem("courseType", sessionCourseType);
          } else {
            sessionStorage.setItem("courseType", "ms-word");
          }
        } else {
          sessionStorage.setItem("courseType", "ms-word");
        }
      } catch (err) {
        sessionStorage.setItem("courseType", "ms-word");
      } finally {
        isFetching = false;
      }
    };
  
    const existingCourseType = sessionStorage.getItem("courseType");
    if (!existingCourseType) {
      fetchCourseType();
    }
  
    const interval = setInterval(() => {
      const courseType = sessionStorage.getItem("courseType");
  
      if (!courseType) {
        fetchCourseType();
      }
    }, 2000);
  
    return () => clearInterval(interval);
  }, [courseId]);



  const handleSaveAll = async (instructions) => {
    try {
      const response = await fetch(`${base_url}/api/openedx/update_base_items_timestamp`, {
        method: "PATCH",
        
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items:instructions }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save instructions: ${response.statusText}`);
      }
  
      const data = await response.json();
      navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);

      return { success: true, data };
    } catch (error) {
      console.error("Error saving instructions:", error);
      return { success: false, error };
    }
  };
  

  function fromBackendToFrontend(backendData) {
    const getFileNameFromUrl = (url = "") => {
      if (!url || typeof url !== "string") return "";
      const urlWithoutQuery = url.split("?")[0] || "";
      const fileName = urlWithoutQuery.split("/").pop() || "";
      try {
        return decodeURIComponent(fileName);
      } catch (_) {
        return fileName;
      }
    };

    const getFileTypeFromName = (fileName = "") => {
      if (!fileName || typeof fileName !== "string") return "";
      const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
      return ext ? `.${ext.toLowerCase()}` : "";
    };

    const lessons = backendData?.lessons?.map((lesson) => {
      const blocks = [];

      lesson.items?.forEach((item) => {
        if (item.block_type === "objective") {
          const objectiveJson = item.objective_json || {};
          let questionData = { ...objectiveJson };
          
          if (Array.isArray(objectiveJson.images) && objectiveJson.images.length > 0) {
            questionData.image_url = objectiveJson.images;
            questionData.image_name = Array.isArray(objectiveJson.image_name) 
              ? objectiveJson.image_name 
              : (objectiveJson.image_name ? [objectiveJson.image_name] : []);
          } else if (Array.isArray(objectiveJson.image_url) && objectiveJson.image_url.length > 0) {
            questionData.image_url = objectiveJson.image_url;
            questionData.image_name = Array.isArray(objectiveJson.image_name) 
              ? objectiveJson.image_name 
              : (objectiveJson.image_name ? [objectiveJson.image_name] : []);
          } else if (typeof objectiveJson.image_url === 'string' && objectiveJson.image_url) {
            questionData.image_url = [objectiveJson.image_url];
            questionData.image_name = [objectiveJson.image_name || 'image'];
          } else {
            questionData.image_url = [];
            questionData.image_name = [];
          }

          // Attach video timestamp for objective question (same as instructions)
          if (item.video_timestamp) {
            questionData.video_timestamp = item.video_timestamp;
          }
          
          blocks.push({
            id: "objective-block-" + item.id,
            name: item.block_name,
            type: "objective",
            content: {
              questions: [
                {
                  id: "objective-question-" + item.id,
                  ...questionData,
                },
              ],
              weightage: typeof item.weightage === 'number' ? item.weightage : 10,
              item_type: item.item_type == "foundation" || item.item_type == "certification" || item.item_type == "no-skill" ? item.item_type : "no-skill",
            },
          });
        } else if (item.block_type === "text") {
          blocks.push({
            id: "text-block-" + item.id,
            name: item.block_name,
            type: "text",
            content: {
              html: item.natural_text || "",
              attachments: {
                images: Array.isArray(item.image_name) ? item.image_name : [],
                // videos: [
                //   ...(Array.isArray(item.video_name) ? item.video_name : []),
                //   ...(item.video_timestamp ? [item.video_timestamp] : []),
                // ],
              },
            },
          });
        } 
        else if (item.block_type === "instruction") {
          blocks.push({
            id: "instruction-block-" + item.id,
            item_num:item.item_num,
            name: item.block_name,
            type: "instruction",
            content: {
              html: item.natural_text || "",
              errorCodes: item.error_codes || [],
              weightage: typeof item.weightage === 'number' ? item.weightage : 10,
              attachments: {
                images: Array.isArray(item.image_name) ? item.image_name : [],
                videos: [
                  ...(Array.isArray(item.video_name) ? item.video_name : []),
                  ...(item.video_timestamp ? [item.video_timestamp] : []),
                ],
              },
              item_type: item.item_type == "foundation" || item.item_type == "certification" || item.item_type == "no-skill" ? item.item_type : "no-skill",
            },
          });
        } else if (item.block_type === "doc-comparison") {
          blocks.push({
            id: "doc-comparison-block-" + item.id,
            name: item.block_name,
            type: "doc-comparison",
            content: {
              mode: item.comparison_mode || "",
              document: item.answer_key || null,
            },
          });
        }
      });

      return {
        id: lesson.id,
        title: lesson.title,
        weightage: lesson.weightage,
        time_allowed: lesson.time_allowed ?? null,
        sourceDocument: lesson.source_document || null,
        answerKey: lesson.answer_key || null,
        content: {
          blocks,
        },
      };
    });

    return {
      rubricId: backendData.rubric_id,
      sourceDocument: backendData.source_document || null,
      answerKey: backendData.answer_key || null,
      videos: backendData.video ? [backendData.video] : [],
      lesson_files: Array.isArray(backendData.lesson_files)
        ? backendData.lesson_files.map((url) => {
            const fileName = getFileNameFromUrl(url);
            return {
              presigned_url: url || "",
              file_name: fileName,
              file_type: getFileTypeFromName(fileName),
            };
          })
        : [],
      skills: backendData.skills || [],
      videoEnabled: !!backendData.video,
      text_before_video: backendData.text_before_video || "",
      text_after_video: backendData.text_after_video || "",
      video_transcript: backendData.video_transcript || "",
      lesson_overview: backendData.lesson_overview || "",
      lessonParts: lessons || [],
      num_of_attempts: backendData.num_of_attempts === null ? null : (backendData.num_of_attempts || 3),
      is_assessment: !!backendData.is_assessment,
      time_allowed: backendData.time_allowed ?? null,
      timer_mode:
        backendData.timer_mode === "display" || backendData.timer_mode === "lock"
          ? backendData.timer_mode
          : null,
    };
  }

  const loadRubricFromApi = async (showLoading = false) => {
    if (!blockId) {
      setInitialLoading(false);
      return;
    }
    try {
      if (showLoading) {
        setInitialLoading(true);
      }
      const result = await fetchAndStoreRubric(blockId);
      if (result?.rubric) {
        const frontendData = fromBackendToFrontend(result.rubric);
        setLessonParts(frontendData?.lessonParts || []);
        setLessonConfig(frontendData);
        if (
          (frontendData?.videos && frontendData.videos.length > 0) &&
          !frontendData.videoEnabled
        ) {
          setLessonConfig((c) => ({ ...c, videoEnabled: true }));
        }
        if (frontendData.lessonParts && frontendData.lessonParts.length > 0) {
          setSelectedPartId(frontendData.lessonParts[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading rubric from API:", error);
    } finally {
      if (showLoading) {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRubricFromApi(true); // Show loading on initial load only
  }, [blockId]);

  const addToast = ({ title, message, variant = "info", duration = 3500 }) => {
    const id = Date.now().toString();
    const toast = { id, title, message, variant };
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const handleSubmitDraft = async () => {

    
    setSaveDraftLoading(true);
    const backendPayload = await frontendToBackend(lessonConfig, blockId);
    try {
      const response = await fetch(
        base_url + "/api/openedx/create_base_lesson_from_scratch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendPayload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create base items: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const mergedResult = await mergeLessonItems(result);
      const promises = [];
      promises.push(handleUploadToS3(mergedResult?.items));

      await Promise.all(promises);
      await loadRubricFromApi();
      addToast({ title: "Draft Saved", message: "Lesson draft saved.", variant: "success" });
    } catch (error) {
      console.error("Error during saving draft:", error);
      addToast({ title: "Save Draft Error", message: error.message || "Request failed.", variant: "error" });
    } finally {
      setSaveDraftLoading(false);
    }
  };

  const fetchAndStoreRubric = async (openedxBasedId) => {
    try {
      const encodedBlockId = encodeURIComponent(openedxBasedId);
      const response = await fetch(
        `${base_url}/api/openedx/get_rubric?openedx_based_id=${encodedBlockId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Hello" }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch rubric: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {

      throw err;
    }
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  useEffect(() => {
    setLessonConfig((cfg) => ({ ...cfg, lessonParts }));
  }, [lessonParts]);

  useEffect(() => {
    if (!lessonConfig?.is_assessment) {
      setAssessmentTimerOpen(false);
    }
  }, [lessonConfig?.is_assessment]);

  const [images, setImages] = useState([]);
  const [nextImageId, setNextImageId] = useState(1);

  const validateLesson = (parts) => {
    const errors = [];
    if (!parts || parts.length === 0) {
      errors.push("Add at least one lesson part.");
    }
    const totalWeight = (parts || []).reduce(
      (sum, p) => sum + (p.weightage || 0),
      0
    );
    if (totalWeight !== 100) {
      errors.push("Total weightage must equal 100%.");
    }
    (parts || []).forEach((part, pIndex) => {
      const blocks = part.content?.blocks || [];
      blocks.forEach((block, bIndex) => {
        if (block.type === "objective") {
          const questions = block.content?.questions || [];
          if (questions.length === 0) {
            errors.push(
              `Part ${
                pIndex + 1
              }: Add at least one question in assessment block ${bIndex + 1}.`
            );
          }
          questions.forEach((q, qIndex) => {
            const label = `Part ${pIndex + 1} / Block ${bIndex + 1}`;
            const type = q.objective_type || q.type;
            const text = q.natural_text || q.text || "";
            if (!text.trim()) {
              errors.push(`${label}: Question text is required.`);
            }
            if (type === "true-false") {
              if (q.correct_answer === null || q.correct_answer === undefined) {
                errors.push(`${label}: Select True or False.`);
              }
            } else if (type === "short-answer") {
              if (!q.correct_answer || !q.correct_answer.toString().trim()) {
                errors.push(`${label}: Provide a correct answer.`);
              }
            } else if (type === "multiple-choice") {
              const opts = q.options || [];
              if (opts.length < 2)
                errors.push(`${label}: Add at least two options.`);
              const hasEmpty = (opts || []).some((o) => {
                if (o == null) return true;
                if (typeof o === "string") return !o.trim();
                return !o.text || !o.text.toString().trim();
              });
              if (hasEmpty)
                errors.push(`${label}: Option text cannot be empty.`);
              if (
                q.correct_answer === null ||
                q.correct_answer === undefined ||
                q.correct_answer === "" ||
                (Array.isArray(q.correct_answer) && q.correct_answer.length === 0)
              )
                errors.push(`${label}: Select a correct option.`);
            } else if (type === "multiple-select") {
              const opts = q.options || [];
              if (opts.length < 2)
                errors.push(`${label}: Add at least two options.`);
              const hasEmpty = (opts || []).some((o) => {
                if (o == null) return true;
                if (typeof o === "string") return !o.trim();
                return !o.text || !o.text.toString().trim();
              });
              if (hasEmpty)
                errors.push(`${label}: Option text cannot be empty.`);
              if (
                !Array.isArray(q.correct_answer) ||
                q.correct_answer.length === 0
              )
                errors.push(`${label}: Select at least one correct answer.`);
            } else if (type === "fill-in-the-blank") {
              const blanks = q.blanks || [];
              if (blanks.length === 0)
                errors.push(`${label}: Add at least one blank.`);
              if (blanks.some((b) => !b.answer || !b.answer.toString().trim()))
                errors.push(`${label}: Blank answers cannot be empty.`);
            } else if (type === "matching") {
              const pairs = q.pairs || [];
              if (pairs.length < 1)
                errors.push(`${label}: Add at least one pair.`);
              if (
                pairs.some(
                  (p) =>
                    !p.left?.toString().trim() || !p.right?.toString().trim()
                )
              )
                errors.push(
                  `${label}: Pair terms and definitions cannot be empty.`
                );
            } else if (type === "reordering") {
              const items = q.items || [];
              if (items.length < 2)
                errors.push(`${label}: Add at least two items to reorder.`);
              if (items.some((it) => !it?.toString().trim()))
                errors.push(`${label}: Reordering items cannot be empty.`);
            } else if (type === "categorizing") {
              const cats = q.categories || [];
              const items = q.items || [];
              if (cats.length < 1)
                errors.push(`${label}: Add at least one category.`);
              if (cats.some((c) => !c?.toString().trim()))
                errors.push(`${label}: Category names cannot be empty.`);
              if (items.length < 1)
                errors.push(`${label}: Add at least one item.`);
              if (items.some((it) => !it.text?.toString().trim()))
                errors.push(`${label}: Item text cannot be empty.`);
            }
          });
        } else if (block.type === "doc-comparison") {
          const label = `Part ${pIndex + 1} / Block ${bIndex + 1}`;
          const mode = block.content?.mode || "";
          const document = block.content?.document;
          
          if (!mode.trim()) {
            errors.push(`${label}: Comparison mode is required.`);
          }
          
          if (mode === "comparison-only" || mode === "graded-comparison") {

            if (!part.answerKey) {
              errors.push(`${label}: Answer key is required in part configuration for ${mode} mode.`);
            }
          }
          
          if (mode === "state-of-art") {
            if (!document) {
              errors.push(`${label}: Document attachment is required for state-of-art mode.`);
            }
          }
        }
      });
    });
    return errors;
  };

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  function isFile(input) {
    return input instanceof File || input instanceof Blob;
  }

  async function frontendToBackend(currentLessonConfig, rubricId) {
    let sourceDocBase64 = "";
    let answerKeyBase64 = "";
    let videoBase64 = "";

    if (currentLessonConfig.sourceDocument) {
      if (isFile(currentLessonConfig.sourceDocument)) {
        sourceDocBase64 = await fileToBase64(
          currentLessonConfig.sourceDocument
        );
      } else {
        sourceDocBase64 = currentLessonConfig.sourceDocument;
      }
    }

    if (currentLessonConfig.videos?.[0]) {
      if (isFile(currentLessonConfig.videos[0])) {
        videoBase64 = await fileToBase64(currentLessonConfig.videos[0]);
      } else {
        videoBase64 = currentLessonConfig.videos[0];
      }
    }

    if (currentLessonConfig.answerKey) {
      if (isFile(currentLessonConfig.answerKey)) {
        answerKeyBase64 = await fileToBase64(currentLessonConfig.answerKey);
      } else {
        answerKeyBase64 = currentLessonConfig.answerKey;
      }
    }

    const lesson_files = await Promise.all(
      (Array.isArray(currentLessonConfig.lesson_files)
        ? currentLessonConfig.lesson_files
        : []
      ).map(async (lessonFile) => {
        const localFile = lessonFile?.file;

        if (isFile(localFile)) {
          return {
            base64_data: await fileToBase64(localFile),
            file_type: lessonFile?.file_type || "",
            file_name: lessonFile?.file_name || "",
          };
        }

        return {
          presigned_url: lessonFile?.presigned_url || "",
        };
      })
    );

    const lesson_parts = await Promise.all(
      (currentLessonConfig.lessonParts || []).map(async (lesson) => {
        let partSourceDoc = "";
        if (lesson.sourceDocument) {
          if (isFile(lesson.sourceDocument)) {
            partSourceDoc = await fileToBase64(lesson.sourceDocument);
          } else {
            partSourceDoc = lesson.sourceDocument;
          }
        }

        let partAnswerKey = "";
        if (lesson.answerKey) {
          if (isFile(lesson.answerKey)) {
            partAnswerKey = await fileToBase64(lesson.answerKey);
          } else {
            partAnswerKey = lesson.answerKey;
          }
        }

        const items = await Promise.all(
          (lesson.content.blocks || []).map(async (block) => {
            if (block.type === "objective") {
              return await Promise.all(
                block.content.questions.map(async (question) => {
                  let questionImageUrls = [];
                  let questionImageNames = [];
            
                  if (Array.isArray(question.image_url) && question.image_url.length > 0) {
                    const imageNames = Array.isArray(question.image_name)
                      ? question.image_name
                      : question.image_name
                      ? [question.image_name]
                      : [];
            
                    if (imageNames.length === question.image_url.length && imageNames.length > 0) {
                      const imageObject = images?.find(
                        (img) => img.questionId == question.id
                      );
            
                      const imageData = await Promise.all(
                        question.image_url.map(async (url, index) => {
                          if (!url || (typeof url === 'string' && url.trim() === '')) return null;
                          const imageName = imageNames[index];
                          if (!imageName || (typeof imageName === 'string' && imageName.trim() === '')) return null;
            
                          let base64Url = null;
                          let finalImageName = imageName;
            
                          if (typeof url === "string" && url.startsWith("blob:")) {
                            if (imageObject?.question && Array.isArray(imageObject.question)) {
                              const matchingImage = imageObject.question.find((img) => img.url === url);
                              if (matchingImage?.file) {
                                base64Url = await fileToBase64(matchingImage.file);
                                finalImageName = matchingImage.file.name || finalImageName;
                              } else {
                                return null;
                              }
                            } else {
                              return null;
                            }
                          } else {
                            base64Url = url;
                          }
            
                          if (!base64Url || !finalImageName) return null;
                          
                          return { url: base64Url, name: finalImageName };
                        })
                      );
            
                      const validImages = imageData.filter(img => img !== null && img.url && img.name);
                      
                      if (validImages.length > 0 && validImages.length === imageNames.length) {
                        questionImageUrls = validImages.map((i) => i.url).filter(Boolean);
                        questionImageNames = validImages.map((i) => i.name).filter(Boolean);
                        
                        if (questionImageUrls.length !== questionImageNames.length) {
                          questionImageUrls = [];
                          questionImageNames = [];
                        }
                      } else {
                        questionImageUrls = [];
                        questionImageNames = [];
                      }
                    } else {
                      questionImageUrls = [];
                      questionImageNames = [];
                    }
                  } else if (
                    typeof question.image_url === "string" &&
                    question.image_url &&
                    question.image_name &&
                    typeof question.image_name === "string" &&
                    question.image_name.trim() !== ""
                  ) {
                    questionImageUrls = [question.image_url];
                    questionImageNames = [question.image_name];
                  } else {
                    questionImageUrls = [];
                    questionImageNames = [];
                  }
            
                  if (questionImageNames.length === 0) {
                    questionImageUrls = [];
                  }
                  
                  if (questionImageUrls.length === 0) {
                    questionImageNames = [];
                  }
                  
                  if (questionImageUrls.length !== questionImageNames.length) {
                    questionImageUrls = [];
                    questionImageNames = [];
                  }
                  
                  if (questionImageNames.length === 0) {
                    questionImageUrls = [];
                  }
            
                  const {
                    image_url,
                    image_urls,
                    image_name,
                    ...questionWithoutImageFields
                  } = question;
                  
                  if (questionImageNames.length === 0) {
                    questionImageUrls = [];
                  }
                  
                  if (questionImageUrls.length !== questionImageNames.length) {
                    questionImageUrls = [];
                    questionImageNames = [];
                  }
                  
                  if (questionImageNames.length === 0) {
                    questionImageUrls = [];
                  }
            
                  const objectiveJson = {
                    ...questionWithoutImageFields,
                    images: questionImageUrls,
                    image_name: questionImageNames,
                  };
            
                  return {
                    id: question.id,
                    instruction_category: "OB",
                    block_name: block.name,
                    block_type: block.type,
                    item_type: block.content.item_type,
                    objective_json: objectiveJson,
                    // forward any video timestamp for this objective question
                    video_timestamp: question.video_timestamp || null,
                    weightage:
                      typeof block.content.weightage === "number"
                        ? block.content.weightage
                        : 10,
                  };
                })
              );
            }
            else if (block.type === "text") {
              let imagesBase64 = [];
            
              if (Array.isArray(block.content.attachments?.images)) {
                imagesBase64 = await Promise.all(
                  block.content.attachments.images.map(async (img) =>
                    isFile(img) ? await fileToBase64(img) : img
                  )
                );
              }
            
              return [
                {
                  id: block.id,
                  block_name: block.name,
                  instruction_category: "text",
                  block_type: block.type,
                  item_type: "u",
                  natural_text: block.content.html || "",
                  images: imagesBase64,
                },
              ];
            }
            else if (block.type === "instruction") {
              let imagesBase64 = [];
              let videosBase64 = [];
              let timestamp = null; 
            
              if (Array.isArray(block.content.attachments?.images)) {
                imagesBase64 = await Promise.all(
                  block.content.attachments.images.map(async (img) =>
                    isFile(img) ? await fileToBase64(img) : img
                  )
                );
              }
            
              if (Array.isArray(block.content.attachments?.videos)) {
                videosBase64 = await Promise.all(
                  block.content.attachments.videos.map(async (vid) => {
                    if (typeof vid === "string" && /^(\d+(\.\d+)?)-(None|\d+(\.\d+)?)$/.test(vid)) {
                      
                      timestamp = vid;
                      return null; 
                    }
                    return isFile(vid) ? await fileToBase64(vid) : vid;
                  })
                );
                
                videosBase64 = videosBase64.filter(Boolean);
              }
            
              return [
                {
                  id: block.id,
                  item_num: block.item_num || (Date.now().toString() + "-" + block.id),
                  block_name: block.name,
                  instruction_category: "text",
                  block_type: block.type,
                  item_type: block.content.item_type || "no-skill",
                  natural_text: block.content.html || "",
                  error_codes: block.content.errorCodes || [],
                  weightage: typeof block.content.weightage === 'number' ? block.content.weightage : 10,
                  images: imagesBase64,
                  videos: videosBase64,
                  video_timestamp: timestamp, 
                },
              ];
            }
            
             else if (block.type === "doc-comparison") {
              let documentBase64 = "";

              if (block.content.document) {
                if (isFile(block.content.document)) {
                  documentBase64 = await fileToBase64(block.content.document);
                } else {
                  documentBase64 = block.content.document;
                }
              }

              return [
                {
                  id: block.id,
                  block_name: block.name,
                  instruction_category: "text",
                  block_type: block.type,
                  item_type: "g",
                  comparison_mode: block.content.mode,
                  answer_key: documentBase64,
                },
              ];
            }
            return [];
          })
        );

        return {
          id: lesson.id,
          title: lesson.title,
          weightage: lesson.weightage,
          time_allowed:
            typeof lesson.time_allowed === "number"
              ? lesson.time_allowed
              : lesson.time_allowed
              ? Number(lesson.time_allowed) || null
              : null,
          source_document: partSourceDoc,
          answer_key: partAnswerKey,
          items: items.flat(),
        };
      })
    );

    return {
      rubric_id: rubricId,
      skills: (Array.isArray(currentLessonConfig.skills) ? currentLessonConfig.skills : []).map((skill) => ({
        customer_facing_name: skill?.customer_facing_name || "",
        status: skill?.status || "",
        cert_type: skill?.cert_type || "",
      })),
      app_name: sessionStorage.getItem('courseType') == 'ms-word' ? "word" : sessionStorage.getItem('courseType') == "powerpoint" ? "powerpoint" : "excel",
      source_document: sourceDocBase64,
      answer_key: answerKeyBase64,
      video: videoBase64,
      lesson_files,
      text_before_video: currentLessonConfig.text_before_video || "",
      text_after_video: currentLessonConfig.text_after_video || "",
      video_transcript: currentLessonConfig.video_transcript || "",
      lesson_overview: currentLessonConfig.lesson_overview || "",
      lessons: lesson_parts,
      num_of_attempts: currentLessonConfig.num_of_attempts === null ? null : (currentLessonConfig.num_of_attempts || 3),
      is_assessment: !!currentLessonConfig.is_assessment,
      time_allowed: currentLessonConfig.time_allowed ?? null,
      timer_mode: currentLessonConfig.timer_mode ?? null,
    };
  }

  const normalizeImportedLessonPayload = (payload) => ({
    rubric_id: blockId,
    source_document: payload?.source_document || null,
    answer_key: payload?.answer_key || null,
    video: payload?.video || null,
    lesson_files: Array.isArray(payload?.lesson_files)
      ? payload.lesson_files
      : [],
    skills: payload?.skills || [],
    text_before_video: payload?.text_before_video || "",
    text_after_video: payload?.text_after_video || "",
    video_transcript: payload?.video_transcript || "",
    lesson_overview: payload?.lesson_overview || "",
    num_of_attempts:
      payload?.num_of_attempts === null
        ? null
        : payload?.num_of_attempts || 3,
    is_assessment: !!payload?.is_assessment,
    time_allowed: payload?.time_allowed ?? null,
    timer_mode:
      payload?.timer_mode === "display" || payload?.timer_mode === "lock"
        ? payload.timer_mode
        : null,
    lessons: (payload?.lessons || []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      weightage: lesson.weightage,
      time_allowed: lesson.time_allowed ?? null,
      source_document: lesson.source_document || null,
      answer_key: lesson.answer_key || null,
      items: (lesson.items || []).map((item) => ({
        ...item,
        image_name: Array.isArray(item.image_name)
          ? item.image_name
          : Array.isArray(item.images)
          ? item.images
          : item.image_name
          ? [item.image_name]
          : [],
        video_name: Array.isArray(item.video_name)
          ? item.video_name
          : Array.isArray(item.videos)
          ? item.videos
          : item.video_name
          ? [item.video_name]
          : [],
      })),
    })),
  });

  const handleUploadToS3 = async (items) => {
    const uploadPromises = items?.flatMap((item) => {
      if (!item?.image_url) return [];

      const files = getFilesByItemId(item.temporary_item_id);
      if (!files || files.length === 0) return [];
      
      const mainFileUploads = [];
      const optionFileUploads = files.flatMap((file) => {
        if (
          !file?.option ||
          !Array.isArray(file.option) ||
          file.option.length === 0
        )
          return [];
        if (item?.objective_image_urls.length > 0) {
          return file.option
            .map((option, index) => {
              if (!option?.file.name || !option?.file) return null;

              const matchedImage = item?.objective_image_urls?.[index];

              if (!matchedImage?.image_url) {
                return null;
              }

              return fetch(matchedImage.image_url, {
                method: "PUT",
                body: option.file,
                headers: { "Content-Type": "image/jpeg" },
              });
            })
            .filter(Boolean);
        }
      });

      return [...mainFileUploads, ...optionFileUploads];
    });

    await Promise.all(uploadPromises);
    const res = await fetch(
      base_url + "/api/openedx/save_s3_image_path_to_db",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images_data: items,
          rubric_id: blockId,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to save S3 paths");
  };

  const getFilesByItemId = (itemId) => {
    const files = [];
    const imageObject = images?.find((img) => img.questionId == itemId);

    if (imageObject) {
      files.push({
        file: imageObject?.question?.[0]?.file || null,
        type: "image/jpeg", 
        option: imageObject?.options || [], 
      });
    }
    return files;
  };

  const getQuestionImagesByQuestionId = (questionId) => {
    const imageObject = images?.find((img) => img.questionId == questionId);
    if (imageObject && Array.isArray(imageObject.question)) {
      return imageObject.question.map((img) => img.file).filter(Boolean);
    }
    return [];
  };

  const mergeLessonItems = async (result) => {
    return {
      ...result,
      items: result.lessons.flatMap((lesson) => lesson.items || []),
    };
  };

  const handleSubmit = async () => {
  
    
    setLoading(true);
    const backendPayload = await frontendToBackend(lessonConfig, blockId);
    try {
      backendPayload.publish_flag = true;
      const response = await fetch(
        base_url + "/api/openedx/create_base_lesson_from_scratch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendPayload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create base items: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const mergedResult = await mergeLessonItems(result);
      const promises = [];
      promises.push(handleUploadToS3(mergedResult?.items));

      await Promise.all(promises);
      navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);
    } catch (error) {
      console.error("Error during saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = (newPart) => {
    const part = {
      id: Date.now().toString(),
      ...newPart,
      content: {
        blocks: [],
      },
      sourceDocument: null,
      answerKey: null,
      time_allowed: null,
    };
    setLessonParts([...lessonParts, part]);
    setSelectedPartId(part.id);
  };

  const handleUpdatePart = (id, updates) => {
    setLessonParts((parts) =>
      parts.map((part) => (part.id === id ? { ...part, ...updates } : part))
    );
  };

  const handleContentChange = (content) => {
    if (selectedPartId) {
      handleUpdatePart(selectedPartId, { content });
    }
  };

  const handleDuplicatePart = (id) => {
    const partToDuplicate = lessonParts.find((part) => part.id === id);
    if (partToDuplicate) {
      const duplicatedPart = {
        ...partToDuplicate,
        id: Date.now().toString(),
        title: `${partToDuplicate.title} (Copy)`,
      };
      const partIndex = lessonParts.findIndex((part) => part.id === id);
      const newParts = [...lessonParts];
      newParts.splice(partIndex + 1, 0, duplicatedPart);
      setLessonParts(newParts);
      setSelectedPartId(duplicatedPart.id);
    }
  };

  const handleDeletePart = (id) => {
    setLessonParts((parts) => parts.filter((part) => part.id !== id));
    if (selectedPartId === id) {
      const remainingParts = lessonParts.filter((part) => part.id !== id);
      setSelectedPartId(remainingParts.length > 0 ? remainingParts[0].id : "");
    }
    setShowDeleteDialog(false);
    setDeletingPart(null);
  };

  const handlePartDragStart = (index) => {
    setDraggedPartIndex(index);
  };

  const handlePartDragOver = (index) => {

  };

  const handlePartDrop = (dropIndex) => {
    if (draggedPartIndex !== null && draggedPartIndex !== dropIndex) {
      const newParts = [...lessonParts];
      const draggedPart = newParts[draggedPartIndex];
      newParts.splice(draggedPartIndex, 1);
      const insertIndex =
        draggedPartIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newParts.splice(insertIndex, 0, draggedPart);

      setLessonParts(newParts);
    }
    setDraggedPartIndex(null);
  };

  const handlePublishClick = async () => {
    const errors = validateLesson(lessonParts);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationOpen(true);
      return;
    }
    await handleSubmit();
  };

  const handleSaveDraftClick = async () => {
    const errors = validateLesson(lessonParts);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setValidationOpen(true);
      return;
    }
    await handleSubmitDraft();
  };

  const openEditDialog = (part) => {
    setEditingPart(part);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (part) => {
    setDeletingPart(part);
    setShowDeleteDialog(true);
  };

  const selectedPart = lessonParts.find((part) => part.id == selectedPartId);
  const totalWeight = lessonParts.reduce(
    (sum, part) => sum + part.weightage,
    0
  );
  const isWeightValid = totalWeight === 100;

  const selectedPartConfig = selectedPart || {
    sourceDocument: null,
    answerKey: null,
  };

  const setSelectedPartConfig = (configUpdates) => {
    if (!selectedPart) return;
    handleUpdatePart(selectedPart.id, { ...configUpdates });
  };

  const canRunAiVideo = (partId) => {
    if (!lessonConfig) return false;
    const hasVideo = !!(lessonConfig.videos && lessonConfig.videos.length > 0);
    
    // Find part in frontend state
    const frontendPart = lessonParts.find((p) => String(p.id) === String(partId));
    if (!frontendPart) return false;
    
    // Check if part exists in backend saved parts (lessonConfig.lessonParts)
    // and verify both ID and title/name match
    const backendLessons = Array.isArray(lessonConfig.lessonParts) ? lessonConfig.lessonParts : [];
    const backendPart = backendLessons.find((l) => String(l.id) === String(partId));
    
    if (!backendPart) return false;
    
    // Check if title/name matches between frontend and backend
    const titleMatches = String(frontendPart.title || "").trim() === String(backendPart.title || "").trim();
    
    return hasVideo && titleMatches;
  };

  const getAiVideoDisableReason = (partId) => {
    if (!lessonConfig)
      return "The Lesson is not saved yet. Save it to enable AI Video";
    if (!lessonConfig.videos || lessonConfig.videos.length === 0)
      return "Attach video in Configuration and save lesson to enable AI Video";
    
    // Find part in frontend state
    const frontendPart = lessonParts.find((p) => String(p.id) === String(partId));
    if (!frontendPart)
      return "Part not found in frontend state";
    
    // Check if part exists in backend
    const backendLessons = Array.isArray(lessonConfig.lessonParts) ? lessonConfig.lessonParts : [];
    const backendPart = backendLessons.find((l) => String(l.id) === String(partId));
    
    if (!backendPart)
      return "This part is not saved/exist in Lesson yet. Save the lesson to enable AI Video";
    
    // Check if title/name matches
    const titleMatches = String(frontendPart.title || "").trim() === String(backendPart.title || "").trim();
    if (!titleMatches)
      return "This part has been modified. Save the lesson to enable AI Video";
    
    return "";
  };

  const canRunLessonQa = (partId) => {
    const part = lessonParts.find((p) => String(p.id) === String(partId));
    if (!part) return false;

    const instructionBlocks = (part.content?.blocks || []).filter(
      (block) => block?.type === "instruction"
    );

    return instructionBlocks.every(
      (block) => typeof block?.item_num === "string" && block.item_num.trim() !== ""
    );
  };

  const getLessonQaDisableReason = (partId) => {
    if (canRunLessonQa(partId)) return "";
    return "Save this lesson once to enable Lesson QA.";
  };

  const [videoPartId, setVideoPartId] = useState(null);

  const videoSplicing = async (sub_rubric_id, options = {}) => {
    const { forceRegenerate = false } = options || {};
    if (aiVideoLoading || aiVideoFetching) return;
    if (!canRunAiVideo(sub_rubric_id)) {
      const reason = getAiVideoDisableReason(sub_rubric_id);
      addToast({
        title: "AI Video Unavailable",
        message: reason || "Cannot run splice the video.",
        variant: "error",
      });
      return;
    }
    
    let result = null;

    // First try to fetch existing timestamps unless explicitly regenerating
    if (!forceRegenerate) {
      setAiVideoFetching(true);
      try {
        const existingUrl = new URL(
          base_url + "/api/openedx/get_base_items_timestamp"
        );
        existingUrl.searchParams.append("rubric_id", blockId);
        existingUrl.searchParams.append("sub_rubric_id", sub_rubric_id);

        const existingRes = await fetch(existingUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (existingRes.ok) {
          const existingData = await existingRes.json();
          if (
            existingData &&
            Array.isArray(existingData.timestamps) &&
            existingData.timestamps.length > 0
          ) {
            result = existingData;
            addToast({
              title: "AI Video Ready",
              message: "Timestamps loaded successfully.",
              variant: "success",
            });
          }
        }
      } catch (e) {
        // Swallow and fall back to regeneration
        console.error("Error fetching existing timestamps:", e);
      } finally {
        setAiVideoFetching(false);
      }
    }

    // If nothing found (or forceRegenerate), call old endpoint to regenerate
    if (!result) {
      setAiVideoLoading(true);
      setAiVideoRegenerating(true);
      try {
        const url = new URL(
          base_url + "/api/openedx/get_base_timestamps_for_rubric_video"
        );
        url.searchParams.append("rubric_id", blockId);
        url.searchParams.append("sub_rubric_id", sub_rubric_id);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed : ${response.status} ${response.statusText}`);
        }

        result = await response.json();
        addToast({
          title: "AI Video Ready",
          message: "Timestamps added successfully.",
          variant: "success",
        });
      } catch (error) {
        console.error("Error :", error);
        addToast({
          title: "AI Video Error",
          message: error.message || "Request failed.",
          variant: "error",
        });
      } finally {
        setAiVideoRegenerating(false);
        setAiVideoLoading(false);
      }
    }

    if (result) {
      setVideoData(result);
      setVideoPartId(sub_rubric_id);
      setIsVideoOpen(true);
    }

    return result;
  };



  const handleAiInstructionsClick = () => {
    if (aiInstructionsLoading) return;
    const el = document.getElementById("ai-instructions-doc");
    if (el) el.click();
  };

  const handleAiInstructionsSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      addToast({
        title: "No file selected",
        message: "Please choose a DOC/DOCX file.",
        variant: "info",
      });
      return;
    }
    setAiInstructionsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch(
        base_url + "/api/openedx/create_rubric_item_from_docx",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rubric_openedx_based_id: blockId,
            docx_base64: base64,
            instruction_category: "Text",
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed : ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      const extracted = Array.isArray(result?.instructions)
        ? result.instructions
        : [];

      if (extracted.length === 0) {
        addToast({
          title: "No Instructions Found",
          message: "The document did not return any instructions.",
          variant: "info",
        });
      } else {
        setLessonParts((parts) =>
          (parts || []).map((part) => {
            if (String(part.id) !== String(selectedPartId)) return part;

            const existingBlocks = part.content?.blocks || [];
            const timestamp = Date.now();
            const ins = existingBlocks.filter(b=>b.type==="instruction").length + 1;
            const newBlocks = extracted.map((text, idx) => ({
              id: `instruction-${timestamp}-${idx}`,
              type: "instruction",
              name: "Instruction " + (ins + idx),
              content: {
                html: text || "",
                attachments: { images: [], videos: [] },
                weightage: 10,
                errorWeightage: 10,
              },
              isCollapsed: false,
            }));

            return {
              ...part,
              content: {
                ...(part.content || {}),
                blocks: [...existingBlocks, ...newBlocks],
              },
            };
          })
        );

        addToast({
          title: "AI Instructions Ready",
          message: `Added ${extracted.length} instruction${
            extracted.length > 1 ? "s" : ""
          }.`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("AI Instructions error:", error);
      addToast({
        title: "AI Instructions Error",
        message: error.message || "Request failed.",
        variant: "error",
      });
    } finally {
      setAiInstructionsLoading(false);
      // reset input to allow re-pick of same file
      if (event?.target) event.target.value = "";
    }
  };

  const handleAiLessonBuilderClick = () => {
    if (aiLessonBuilderLoading) return;
    const el = document.getElementById("ai-lesson-builder-excel");
    if (el) el.click();
  };

  const handleAiLessonBuilderSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      addToast({
        title: "No file selected",
        message: "Please choose an Excel file.",
        variant: "info",
      });
      return;
    }
    setAiLessonBuilderLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch(
        base_url + "/api/openedx/parse_lesson_from_excel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            excel_base64: base64,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed : ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      const items = result || [];
      const blocks = [];

      const importBatchId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      items.forEach((item, itemIndex) => {
        const itemSuffix = `${importBatchId}-${itemIndex}`;
        if (item.block_type === "objective") {
          const objectiveJson = item.objective_json || {};
          let questionData = { ...objectiveJson };
          
          if (Array.isArray(objectiveJson.images) && objectiveJson.images.length > 0) {
            questionData.image_url = objectiveJson.images;
            questionData.image_name = Array.isArray(objectiveJson.image_name) 
              ? objectiveJson.image_name 
              : (objectiveJson.image_name ? [objectiveJson.image_name] : []);
          } else if (Array.isArray(objectiveJson.image_url) && objectiveJson.image_url.length > 0) {
            questionData.image_url = objectiveJson.image_url;
            questionData.image_name = Array.isArray(objectiveJson.image_name) 
              ? objectiveJson.image_name 
              : (objectiveJson.image_name ? [objectiveJson.image_name] : []);
          } else if (typeof objectiveJson.image_url === 'string' && objectiveJson.image_url) {
            questionData.image_url = [objectiveJson.image_url];
            questionData.image_name = [objectiveJson.image_name || 'image'];
          } else {
            questionData.image_url = [];
            questionData.image_name = [];
          }
          
          blocks.push({
            id: "objective-block-" + itemSuffix,
            name: item.block_name,
            type: "objective",
            content: {
              questions: [
                {
                  id: "objective-question-" + itemSuffix,
                  ...questionData,
                },
              ],
              weightage: typeof item.weightage === 'number' ? item.weightage : 10,
              item_type: item.item_type == "foundation" || item.item_type == "certification" || item.item_type == "no-skill" ? item.item_type : "no-skill",
            },
          });
        } else if (item.block_type === "text") {
          blocks.push({
            id: "text-block-" + itemSuffix,
            name: item.block_name,
            type: "text",
            content: {
              html: item.natural_text || "",
              attachments: {
                images: Array.isArray(item.image_name) ? item.image_name : [],
              },
            },
          });
        } else if (item.block_type === "instruction") {
          blocks.push({
            id: "instruction-block-" + itemSuffix,
            name: item.block_name,
            type: "instruction",
            content: {
              html: item.natural_text || "",
              errorCodes: item.error_codes || [],
              weightage: typeof item.weightage === 'number' ? item.weightage : 10,
              attachments: {
                images: Array.isArray(item.image_name) ? item.image_name : [],
                videos: [
                  ...(Array.isArray(item.video_name) ? item.video_name : []),
                  ...(item.video_timestamp ? [item.video_timestamp] : []),
                ],
              },
              item_type: item.item_type == "foundation" || item.item_type == "certification" || item.item_type == "no-skill" ? item.item_type : "no-skill",
            },
          });
        } else if (item.block_type === "doc-comparison") {
          blocks.push({
            id: "doc-comparison-block-" + itemSuffix,
            name: item.block_name,
            type: "doc-comparison",
            content: {
              mode: item.comparison_mode || "",
              document: item.answer_key || null,
            },
          });
        }
      });

      if (blocks.length > 0) {
        setLessonParts((parts) =>
          (parts || []).map((part) => {
            if (String(part.id) !== String(selectedPartId)) return part;

            const existingBlocks = part.content?.blocks || [];

            return {
              ...part,
              content: {
                ...(part.content || {}),
                blocks: [...existingBlocks, ...blocks],
              },
            };
          })
        );

        addToast({
          title: "AI Lesson Builder Success",
          message: `Added ${blocks.length} block${blocks.length > 1 ? "s" : ""} from Excel.`,
          variant: "success",
        });
      } else {
        addToast({
          title: "No Blocks Found",
          message: "The Excel file did not return any blocks.",
          variant: "info",
        });
      }
    } catch (error) {
      addToast({
        title: "AI Lesson Builder Error",
        message: error.message || "Request failed.",
        variant: "error",
      });
    } finally {
      setAiLessonBuilderLoading(false);
      if (event?.target) event.target.value = "";
    }
  };

  const handleExportLesson = async () => {
    setTransferLoading(true);
    try {
      const exportedLesson = await buildExportLessonPayload();
      const blob = new Blob([JSON.stringify(exportedLesson, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "exported-lesson.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast({
        title: "Lesson Exported",
        message: "Lesson data downloaded successfully.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Error",
        message: error.message || "Could not export lesson data.",
        variant: "error",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const applyImportedPayload = (payload) => {
    const frontendData = fromBackendToFrontend(
      normalizeImportedLessonPayload(payload)
    );
    const importedLessonParts = frontendData?.lessonParts || [];
    setLessonParts(importedLessonParts);
    setLessonConfig(frontendData);
    setSelectedPartId(importedLessonParts[0]?.id || "");
    setImages([]);
    setNextImageId(1);
  };

  const buildExportLessonPayload = async () => {
    const exportedLessonRaw = await frontendToBackend(
      { ...lessonConfig, lessonParts },
      blockId
    );
    const normalizeInstructionItemIdForExport = (item) => {
      if (item?.block_type !== "instruction" || typeof item?.id !== "string") {
        return item;
      }
      const normalizedId = item.id.includes("-")
        ? item.id.substring(item.id.lastIndexOf("-") + 1)
        : item.id;

      return {
        ...item,
        id: normalizedId,
      };
    };
    return {
      ...exportedLessonRaw,
      lessons: (Array.isArray(exportedLessonRaw?.lessons)
        ? exportedLessonRaw.lessons
        : []
      ).map((lesson) => ({
        ...lesson,
        items: (Array.isArray(lesson?.items) ? lesson.items : []).map(
          normalizeInstructionItemIdForExport
        ),
      })),
      lesson_files: (Array.isArray(exportedLessonRaw?.lesson_files)
        ? exportedLessonRaw.lesson_files
        : []
      )
        .map((item) =>
          typeof item === "string" ? item : item?.presigned_url || ""
        )
        .filter(Boolean),
    };
  };

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return "";
  };

  const getEmailFromCookie = () => {
    const raw = getCookieValue("edx-user-info");
    if (!raw) return "";
    try {
      const fixed = raw.replace(/\\054/g, ",");
      const decoded = decodeURIComponent(fixed);
      const firstParsed = JSON.parse(decoded);
      const parsed =
        typeof firstParsed === "string" ? JSON.parse(firstParsed) : firstParsed;
      return parsed?.email || "";
    } catch {
      try {
        const fixed = raw.replace(/\\054/g, ",");
        const firstParsed = JSON.parse(fixed);
        const parsed =
          typeof firstParsed === "string"
            ? JSON.parse(firstParsed)
            : firstParsed;
        return parsed?.email || "";
      } catch {
        return "";
      }
    }
  };

  const fetchLessonStates = async () => {
    if (!blockId) return;
    const encodedBlockId = encodeURIComponent(blockId);
    setLessonStatesLoading(true);
    try {
      const response = await fetch(
        `${base_url}/api/openedx/rubrics/${encodedBlockId}/save-states`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Could not fetch lesson states.");
      }
      const data = await response.json();
      setLessonStates(Array.isArray(data?.save_states) ? data.save_states : []);
    } catch (error) {
      addToast({
        title: "State List Error",
        message: error.message || "Could not fetch saved states.",
        variant: "error",
      });
    } finally {
      setLessonStatesLoading(false);
    }
  };

  const handleOpenLessonStates = async () => {
    setLessonStateModalOpen(true);
    await fetchLessonStates();
  };

  const handleSaveLessonState = async (note) => {
    if (!blockId) return false;
    const encodedBlockId = encodeURIComponent(blockId);
    setLessonStateSaving(true);
    try {
      const snapshotPayload = await buildExportLessonPayload();
      const email = getEmailFromCookie() || sessionStorage.getItem("email") || "";
      const token = await fetchCsrfToken();
      const response = await fetch(
        `${base_url}/api/openedx/rubrics/${encodedBlockId}/save-states`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            snapshot: snapshotPayload,
            email,
            note: note || "",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Could not save lesson state.");
      }
      addToast({
        title: "State Saved",
        message: "Lesson state saved successfully.",
        variant: "success",
      });
      await fetchLessonStates();
      return true;
    } catch (error) {
      addToast({
        title: "Save State Error",
        message: error.message || "Could not save lesson state.",
        variant: "error",
      });
      return false;
    } finally {
      setLessonStateSaving(false);
    }
  };

  const handleRestoreLessonState = async (saveStateId) => {
    if (!saveStateId) return;
    setRestoringStateId(saveStateId);
    try {
      const response = await fetch(
        `${base_url}/api/openedx/rubrics/save-states/${saveStateId}/restore`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Could not restore lesson state.");
      }
      const data = await response.json();
      const snapshotPayload = data?.snapshot;
      if (!snapshotPayload || typeof snapshotPayload !== "object") {
        throw new Error("Invalid snapshot payload.");
      }
      applyImportedPayload(snapshotPayload);
      setLessonStateModalOpen(false);
      addToast({
        title: "State Restored",
        message: "Lesson state restored successfully.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Restore Error",
        message: error.message || "Could not restore lesson state.",
        variant: "error",
      });
    } finally {
      setRestoringStateId(null);
    }
  };

  const handleImportLesson = async (file) => {
    setTransferLoading(true);
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw);
      applyImportedPayload(payload);
      addToast({
        title: "Lesson Imported",
        message: "Lesson data loaded successfully.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Import Error",
        message: error.message || "Could not import lesson data.",
        variant: "error",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <ImagesProvider
      images={images}
      setImages={setImages}
      nextImageId={nextImageId}
      setNextImageId={setNextImageId}
    >
      {initialLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <PageHeader
              onOpenPreview={() => setOpen(true)}
              onSaveDraft={handleSaveDraftClick}
              onPublish={handlePublishClick}
              onImportLesson={handleImportLesson}
              onExportLesson={handleExportLesson}
              onOpenLessonStates={handleOpenLessonStates}
              onOpenQA={() => {
                const targetPartId = selectedPart?.id ?? lessonParts?.[0]?.id ?? null;
                if (!targetPartId || !canRunLessonQa(targetPartId)) {
                  addToast({
                    title: "Lesson QA Unavailable",
                    message: getLessonQaDisableReason(targetPartId),
                    variant: "error",
                  });
                  return;
                }
                setQaModalPartId(targetPartId);
                setQaModalOpen(true);
              }}
              saveDraftLoading={saveDraftLoading}
              publishLoading={loading}
              transferLoading={transferLoading}
            />

            <div className="flex h-[calc(100vh-88px)]">
              {/* Left Panel - Main Editing Area (70%) */}
              <div className="flex-1 px-4 py-3 overflow-y-auto">
                {selectedPart ? (
              <div className="space-y-6">
                {/* Enhanced Part Header */}
                <div
                  className="p-3 bg-white flex justify-between items-center rounded-lg shadow-sm "
                  style={{
                    border: "1px solid #d1d5db",
                    borderLeftWidth: "4px",
                    borderLeftColor: "#27AAE1",
                  }}
                >
                  <div className="flex items-center jus gap-4">
                    <div className="p-2 bg-[#27AAE1]/10 rounded-lg">
                      <Layers className="w-6 h-6 text-[#27AAE1]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPart.title}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-600">
                          Weight:{" "}
                          <span className="font-semibold">
                            {selectedPart.weightage}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => setPartConfigOpen(true)}
                        className="p-1 px-2 rounded-lg bg-blue-100 cursor-pointer "
                      >
                        <Settings className="w-5 h-5 mb-1 text-blue-600" />
                      </div>

                      <div className="relative group">
                        <div
                          onClick={
                            selectedPart?.id && canRunLessonQa(selectedPart.id)
                              ? () => {
                                  setQaModalPartId(selectedPart.id);
                                  setQaModalOpen(true);
                                }
                              : undefined
                          }
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent transition-colors ${
                            selectedPart?.id && canRunLessonQa(selectedPart.id)
                              ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              : "bg-blue-300 text-white cursor-not-allowed"
                          }`}
                          aria-disabled={!selectedPart?.id || !canRunLessonQa(selectedPart.id)}
                        >
                          Lesson QA
                        </div>
                        {(!selectedPart?.id || !canRunLessonQa(selectedPart.id)) && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 rounded bg-gray-900 text-white text-xs px-2 py-1 shadow opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {getLessonQaDisableReason(selectedPart?.id)}
                          </div>
                        )}
                      </div>

                      <div className="relative group">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent transition-colors ${
                            aiVideoLoading || aiVideoRegenerating
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : aiVideoFetching || !canRunAiVideo(selectedPart.id)
                              ? "bg-blue-300 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          }`}
                          onClick={
                            canRunAiVideo(selectedPart.id) && !aiVideoLoading && !aiVideoFetching && !aiVideoRegenerating
                              ? () => videoSplicing(selectedPart.id)
                              : undefined
                          }
                          aria-disabled={
                            !canRunAiVideo(selectedPart.id) || aiVideoLoading || aiVideoFetching || aiVideoRegenerating
                          }
                        >
                          {aiVideoRegenerating ? (
                            <svg
                              className="w-4 h-4 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                              ></path>
                            </svg>
                          ) : null}
                          {aiVideoRegenerating ? "Video splicing..." : "AI Video"}
                        </div>
                        {(!canRunAiVideo(selectedPart.id) || aiVideoFetching) && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 rounded bg-gray-900 text-white text-xs px-2 py-1 shadow opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {aiVideoFetching ? "Fetching timestamps..." : getAiVideoDisableReason(selectedPart.id)}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent transition-colors ${
                            aiInstructionsLoading
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          }`}
                          onClick={
                            !aiInstructionsLoading
                              ? handleAiInstructionsClick
                              : undefined
                          }
                          aria-disabled={aiInstructionsLoading}
                        >
                          {aiInstructionsLoading ? (
                            <svg
                              className="w-4 h-4 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                              ></path>
                            </svg>
                          ) : null}
                          {aiInstructionsLoading
                            ? "Generating..."
                            : "AI Instructions"}
                        </div>
                        <input
                          id="ai-instructions-doc"
                          type="file"
                          accept=".doc,.docx"
                          className="hidden"
                          onChange={handleAiInstructionsSelected}
                        />
                      </div>
                      <div className="relative">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent transition-colors ${
                            aiLessonBuilderLoading
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          }`}
                          onClick={
                            !aiLessonBuilderLoading
                              ? handleAiLessonBuilderClick
                              : undefined
                          }
                          aria-disabled={aiLessonBuilderLoading}
                        >
                          {aiLessonBuilderLoading ? (
                            <svg
                              className="w-4 h-4 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                              ></path>
                            </svg>
                          ) : null}
                          {aiLessonBuilderLoading
                            ? "Processing..."
                            : "AI Lesson builder"}
                        </div>
                        <input
                          id="ai-lesson-builder-excel"
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={handleAiLessonBuilderSelected}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Editing Areas */}
                <HybridContentEditor
                  video={lessonConfig?.videos[0]}
                  selectedPart={selectedPart}
                  content={selectedPart.content || { blocks: [] }}
                  onContentChange={handleContentChange}
                  lessonSkills={lessonConfig?.skills || []}
                />
              </div>
            ) : (
              <div className="h-full p-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-xl font-semibold mb-2">
                      Select a lesson part to edit
                    </p>
                    <p className="text-sm">
                      Choose a part from the outline to start creating your
                      content
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <RightSidebar
            onOpenLessonConfig={() => setLessonConfigOpen(true)}
            lessonParts={lessonParts}
            selectedPartId={selectedPartId}
            setSelectedPartId={setSelectedPartId}
            onAddPartClick={() => setShowAddDialog(true)}
            onEditPart={openEditDialog}
            onDuplicatePart={handleDuplicatePart}
            onDeletePart={(part) => openDeleteDialog(part)}
            onDragStart={handlePartDragStart}
            onDragOver={handlePartDragOver}
            onDrop={handlePartDrop}
          />
        </div>

        <AddPartDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddPart={handleAddPart}
          remainingWeight={Math.max(0, 100 - lessonParts.reduce((sum, p) => sum + (p.weightage || 0), 0))}
          isFirst={(lessonParts?.length || 0) === 0}
        />

        <SaveTimestampsDialog
          isOpen={isVideoOpen}
          onClose={()=> setIsVideoOpen(false)}
          data={videoData}
          onSaveAll={handleSaveAll}
          onRegenerate={
            videoPartId
              ? () => videoSplicing(videoPartId, { forceRegenerate: true })
              : undefined
          }
          regenerating={aiVideoLoading}
        />

        <EditPartDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          part={editingPart}
          onUpdatePart={handleUpdatePart}
        />

        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          partTitle={deletingPart?.title || ""}
          onConfirm={() => deletingPart && handleDeletePart(deletingPart.id)}
        />
        <ValidationErrorsModal
          open={validationOpen}
          onOpenChange={setValidationOpen}
          errors={validationErrors}
        />

        <LessonConfigModal
          open={lessonConfigOpen}
          onClose={() => setLessonConfigOpen(false)}
          lessonConfig={lessonConfig}
          setLessonConfig={setLessonConfig}
          onOpenTimerSetup={() => setAssessmentTimerOpen(true)}
          setDocPreview={setDocPreview}
          downloadFile={downloadFile}
          setVideoPreviewOpen={setVideoPreviewOpen}
          setVideoPreviewUrl={setVideoPreviewUrl}
          videoObjectUrlRef={videoObjectUrlRef}
        />
        <AssessmentTimerModal
          open={lessonConfigOpen && !!lessonConfig?.is_assessment && assessmentTimerOpen}
          onClose={() => setAssessmentTimerOpen(false)}
          initialTimerMode={lessonConfig?.timer_mode}
          initialTimeAllowed={lessonConfig?.time_allowed}
          onSave={({ timer_mode, time_allowed }) => {
            setLessonConfig((current) => ({
              ...current,
              timer_mode,
              time_allowed,
            }));
          }}
        />
        <PartConfigModal
          open={partConfigOpen}
          onClose={() => setPartConfigOpen(false)}
          selectedPart={selectedPart}
          selectedPartConfig={selectedPartConfig}
          setSelectedPartConfig={setSelectedPartConfig}
          setDocPreview={setDocPreview}
          downloadFile={downloadFile}
        />
        <LessonPreviewDialog
          data={lessonConfig}
          open={open}
          setOpen={setOpen}
        />
        <LessonVideoPopup
        videoPreviewOpen={videoPreviewOpen}
        rubric_id={blockId}
        setVideoPreviewOpen={setVideoPreviewOpen}
        videoPreviewUrl={videoPreviewUrl}
        onVideoUrlUpdate={(newUrl)=>{
          setLessonConfig((c)=>({
            ...c,
            videos: [newUrl],
            videoEnabled: true,
          }));
        }}
      />
      </div>
        <DocumentPreviewDialog
          open={docPreview.open}
          onClose={() => setDocPreview({ open: false, title: "", src: null })}
          title={docPreview.title}
          source={docPreview.src}
          mimeHint={(() => {
            const s = docPreview.src;
            if (!s) return "";
            if (typeof s === "string") {
              if (/^data:/i.test(s)) return ""; // already contains mime
              // Hint DOCX for base64 strings without data: prefix
              if (!/^https?:\/\//i.test(s)) {
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
              }
            } else if (s && !s.type) {
              return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
            return "";
          })()}
          nameHint="document.docx"
        />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
        <LessonQAModal
          open={qaModalOpen}
          onClose={() => {
            setQaModalOpen(false);
            setQaModalPartId(null);
          }}
          lessonParts={lessonParts}
          partId={qaModalPartId}
        />
        <LessonStateModal
          open={lessonStateModalOpen}
          onClose={() => setLessonStateModalOpen(false)}
          saveStates={lessonStates}
          loading={lessonStatesLoading}
          saving={lessonStateSaving}
          restoringId={restoringStateId}
          onSaveNewState={handleSaveLessonState}
          onRestoreState={handleRestoreLessonState}
        />
        </>
      )}
    </ImagesProvider>
  );
}

