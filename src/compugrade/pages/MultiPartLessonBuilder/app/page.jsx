import { useEffect, useRef, useState } from "react";
import { Layers, BookOpen,  Settings} from "lucide-react";
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
import PartConfigModal from "../components/PartConfigModal";

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
  const [aiInstructionsLoading, setAiInstructionsLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  const [partConfigOpen, setPartConfigOpen] = useState(false);
  const [lessonConfigOpen, setLessonConfigOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lessonConfig, setLessonConfig] = useState({
    sourceDocument: null,
    answerKey: null,
    videoEnabled: false,
    videos: [],
    lessonParts: [],
    text_before_video: "",
    text_after_video: "",
    lesson_overview: "",
    num_of_attempts: 3,
  });
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const videoObjectUrlRef = useRef("");
  const [docPreview, setDocPreview] = useState({ open: false, title: "", src: null });

  //  console.log(lessonParts);
  // console.log(lessonConfig)
  

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
    const lessons = backendData?.lessons?.map((lesson) => {
      const blocks = [];

      lesson.items?.forEach((item) => {
        if (item.block_type === "objective") {
          blocks.push({
            id: "objective-block-" + item.id,
            name: item.block_name,
            type: "objective",
            content: {
              questions: [
                {
                  id: "objective-question-" + item.id,
                  ...item.objective_json,
                },
              ],
              weightage: typeof item.weightage === 'number' ? item.weightage : 10,
            },
          });
        } else if (item.block_type === "text") {
          blocks.push({
            id: "text-block-" + item.id,
            name: item.block_name,
            type: "text",
            content: {
              html: item.natural_text || "",
            },
          });
        } 
        else if (item.block_type === "instruction") {
          blocks.push({
            id: "instruction-block-" + item.id,
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
      skills: backendData.skills || [],
      videoEnabled: !!backendData.video,
      text_before_video: backendData.text_before_video || "",
      text_after_video: backendData.text_after_video || "",
      lesson_overview: backendData.lesson_overview || "",
      lessonParts: lessons || [],
      num_of_attempts: backendData.num_of_attempts === null ? null : (backendData.num_of_attempts || 3),
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
      console.log(err);
      throw err;
    }
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  useEffect(() => {
    setLessonConfig((cfg) => ({ ...cfg, lessonParts }));
  }, [lessonParts]);

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
            const label = `Part ${pIndex + 1} / Block ${bIndex + 1} / Q${
              qIndex + 1
            }`;
            const type = q.type;
            const text = q.natural_text || q.text || "";
            if (!text.trim()) {
              errors.push(`${label}: Question text is required.`);
            }
            if (type === "multiple-choice") {
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
                q.correct_answer === ""
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
            // if (!part.sourceDocument) {
            //   errors.push(`${label}: Source document is required in part configuration for ${mode} mode.`);
            // }
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
              return block.content.questions.map((question) => ({
                id: question.id,
                instruction_category: "OB",
                block_name: block.name,
                block_type: block.type,
                item_type: "g",
                objective_json: question,
                weightage: typeof block.content.weightage === 'number' ? block.content.weightage : 10,
              }));
            } else if (block.type === "text") {
              return [
                {
                  id: block.id,
                  block_name: block.name,
                  instruction_category: "text",
                  block_type: block.type,
                  item_type: "u",
                  natural_text: block.content.html || "",
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
          source_document: partSourceDoc,
          answer_key: partAnswerKey,
          items: items.flat(),
        };
      })
    );

    return {
      rubric_id: rubricId,
      skills: currentLessonConfig.skills,
      app_name: sessionStorage.getItem('courseType') == 'ms-word' ? "word" : sessionStorage.getItem('courseType') == "powerpoint" ? "powerpoint" : "excel",
      source_document: sourceDocBase64,
      answer_key: answerKeyBase64,
      video: videoBase64,
      text_before_video: currentLessonConfig.text_before_video || "",
      text_after_video: currentLessonConfig.text_after_video || "",
      lesson_overview: currentLessonConfig.lesson_overview || "",
      lessons: lesson_parts,
      num_of_attempts: currentLessonConfig.num_of_attempts === null ? null : (currentLessonConfig.num_of_attempts || 3),
    };
  }

  const handleUploadToS3 = async (items) => {
    const uploadPromises = items?.flatMap((item) => {
      if (!item?.image_url) return [];

      const files = getFilesByItemId(item.temporary_item_id);
      if (!files || files.length === 0) return [];
      const mainFileUploads = files
        .map((file) => {
          if (!file?.file) return null;

          const uploadUrl = item?.image_url[0];
          if (!uploadUrl) return null;
          return fetch(uploadUrl, {
            method: "PUT",
            body: file.file,
            headers: { "Content-Type": file.type || "image/jpeg" },
          });
        })
        .filter(Boolean);
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
    const lessons = Array.isArray(lessonConfig.lessonParts) ? lessonConfig.lessonParts : [];
    const partExists = lessons.some((l) => String(l.id) === String(partId));
    return hasVideo && partExists;
  };

  const getAiVideoDisableReason = (partId) => {
    if (!lessonConfig)
      return "The Lesson is not saved yet. Save it to enable AI Video";
    if (!lessonConfig.videos || lessonConfig.videos.length === 0)
      return "Attach video in Configuration and save lesson to enable AI Video";
    const lessons = Array.isArray(lessonConfig.lessonParts) ? lessonConfig.lessonParts : [];
    const partExists = lessons.some((l) => String(l.id) === String(partId));
    if (!partExists)
      return "This part is not saved/exist in Lesson yet. Save the lesson to enable AI Video";
    return "";
  };

  const videoSplicing = async (sub_rubric_id) => {
    if (aiVideoLoading) return;
    if (!canRunAiVideo(sub_rubric_id)) {
      const reason = getAiVideoDisableReason(sub_rubric_id);
      addToast({
        title: "AI Video Unavailable",
        message: reason || "Cannot run splice the video.",
        variant: "error",
      });
      return;
    }
    setAiVideoLoading(true);
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

      const result = await response.json();
      addToast({
        title: "AI Video Ready",
        message: "Timestamps added successfully.",
        variant: "success",
      });
      setVideoData(result)
      setIsVideoOpen(true);

      return result;
    } catch (error) {
      console.error("Error :", error);
      addToast({
        title: "AI Video Error",
        message: error.message || "Request failed.",
        variant: "error",
      });
    } finally {
      setAiVideoLoading(false);
    }
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
              saveDraftLoading={saveDraftLoading}
              publishLoading={loading}
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
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-transparent transition-colors ${
                            aiVideoLoading
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : canRunAiVideo(selectedPart.id)
                              ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              : "bg-blue-300 text-white cursor-not-allowed"
                          }`}
                          onClick={
                            canRunAiVideo(selectedPart.id) && !aiVideoLoading
                              ? () => videoSplicing(selectedPart.id)
                              : undefined
                          }
                          aria-disabled={
                            !canRunAiVideo(selectedPart.id) || aiVideoLoading
                          }
                        >
                          {aiVideoLoading ? (
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
                          {aiVideoLoading ? "Video splicing..." : "AI Video"}
                        </div>
                        {!canRunAiVideo(selectedPart.id) && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 rounded bg-gray-900 text-white text-xs px-2 py-1 shadow opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            {getAiVideoDisableReason(selectedPart.id)}
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
          setDocPreview={setDocPreview}
          downloadFile={downloadFile}
          setVideoPreviewOpen={setVideoPreviewOpen}
          setVideoPreviewUrl={setVideoPreviewUrl}
          videoObjectUrlRef={videoObjectUrlRef}
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
        </>
      )}
    </ImagesProvider>
  );
}

