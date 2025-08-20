import { useEffect, useState } from "react";
import {
  Plus,
  Save,
  Upload,
  Layers,
  BookOpen,
  Users,
  Clock,
  Settings,
  FileText,
  Video,
  X,
} from "lucide-react";
import { AddPartDialog } from "../components/add-part-dialog";
import { EditPartDialog } from "../components/edit-part-dialog";
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog";
import { DraggablePartCard } from "../components/draggable-part-card";
import { HybridContentEditor } from "../components/hybrid-content-editor";
import { base_url } from "../../../../compugrade-constants";
import { useNavigate, useParams } from "react-router";
import { ImagesProvider } from "../components/ui/images-context";
import { ValidationErrorsModal } from "../components/validation-errors-modal";

export default function LessonBuilder() {
  const { blockId, sequenceId, courseId } = useParams();
  const navigate = useNavigate();
  const [lessonParts, setLessonParts] = useState([
    // {
    //   id: "1",
    //   title: "Introduction",
    //   weightage: 100,
    //   content: {
    //     blocks: [],
    //     videoEnabled: false,
    //     documentComparison: { enabled: false, documents: [] },
    //   },
    // },
  ]);
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

  // Lesson-level configuration (moved from part configuration)
  const [lessonConfigOpen, setLessonConfigOpen] = useState(false);
  const [lessonConfig, setLessonConfig] = useState({
    sourceDocument: null,
    answerKey: null,
    videoEnabled: false,
    videos: [],
    lessonParts: [],
  });

 

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
        } else if (item.block_type === "instruction") {
          blocks.push({
            id: "instruction-block-" + item.id,
            name: item.block_name,
            type: "instruction",
            content: {
              html: item.natural_text || "",
              attachments: {
                image: item.image_name || null,
                video: item.video_name || null,
              },
            },
          });
        } else if (item.block_type === "doc-comparison") {
          blocks.push({
            id: "doc-comparison-block-" + item.id,
            name: item.block_name,
            type: "doc-comparison",
            content: {
              mode: item.comparison_mode || "",
              document: item.image_name || null,
            },
          });
        }
      });
  
      return {
        id: lesson.id,
        title: lesson.title,
        weightage: lesson.weightage,
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
      lessonParts: lessons || [],
    };
  }
  
  

  useEffect(() => {
    const savedData = sessionStorage.getItem("Rubric");

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const frontendData = fromBackendToFrontend(parsedData);
      setLessonParts(frontendData?.lessonParts);
      setLessonConfig(frontendData);
      if (frontendData.lessonParts.length > 0) {
        setSelectedPartId(frontendData.lessonParts[0].id);
      }
    }
  }, []);

  // keep nested lessonParts in sync with root lessonParts for now
  useEffect(() => {
    setLessonConfig((cfg) => ({ ...cfg, lessonParts }));
  }, [lessonParts]);

  const [images, setImages] = useState([]);
  const [nextImageId, setNextImageId] = useState(1);

  console.log(images);

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
        sourceDocBase64 = await fileToBase64(currentLessonConfig.sourceDocument);
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
        const items = await Promise.all(
          (lesson.content.blocks || []).map(async (block) => {
            if (block.type === "objective") {
              
              return block.content.questions.map((question) => ({
                id: question.id,
                instruction_category: "OB",
                block_name:block.name,
                block_type:block.type,
                item_type: "g",
                objective_json: question,
              }));
            } else if (block.type === "text") {
            
              return [
                {
                  id: block.id,
                  block_name:block.name,
                  instruction_category: "Text",
                  block_type:block.type,
                  item_type: "u",
                  natural_text: block.content.html || "",
                },
              ];
            } else if (block.type === "instruction") {
              // Instruction block with possible attachments
              let imageBase64 = "";
              let videoBase64 = "";
  
              if (block.content.attachments?.image) {
                if (isFile(block.content.attachments.image)) {
                  imageBase64 = await fileToBase64(
                    block.content.attachments.image
                  );
                } else {
                  imageBase64 = block.content.attachments.image;
                }
              }
  
              if (block.content.attachments?.video) {
                if (isFile(block.content.attachments.video)) {
                  videoBase64 = await fileToBase64(
                    block.content.attachments.video
                  );
                } else {
                  videoBase64 = block.content.attachments.video;
                }
              }
  
              return [
                {
                  id: block.id,
                  block_name:block.name,
                  instruction_category: "Text",
                  block_type:block.type,
                  item_type: "u",
                  natural_text: block.content.html || "",
                  image: imageBase64,
                  video: videoBase64,
                },
              ];
            } else if (block.type === "doc-comparison") {
             
              let documentBase64 = "";
             
              if (block.content.document) {
                if (isFile(block.content.document)) {
                  documentBase64 = await fileToBase64(block.content.document);
                } else {
                  documentBase64 = block.content.document;
                }
              }
  
              // if (Array.isArray(block.content.documents)) {
              //   documentsBase64 = await Promise.all(
              //     block.content.documents.map(async (doc) =>
              //       isFile(doc) ? await fileToBase64(doc) : doc
              //     )
              //   );
              // }
  
              return [
                {
                  id: block.id,
                  block_name:block.name,
                  instruction_category: "OB",
                  block_type:block.type,
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
          items: items.flat(),
        };
      })
    );
  
    return {
      rubric_id: rubricId,
      source_document: sourceDocBase64,
      answer_key: answerKeyBase64,
      video: videoBase64,
      lessons:lesson_parts,
    };
  }
  

  const handleUploadToS3 = async (items) => {
    const uploadPromises = items?.flatMap((item) => {
      if (!item?.image_url) return [];
  
      const files = getFilesByItemId(item.temporary_item_id);
      if (!files || files.length === 0) return [];
  
      // Upload main question image
      const mainFileUploads = files
        .map((file) => {
          if (!file?.file) return null;
  
          const uploadUrl = item?.image_url;
          if (!uploadUrl) return null;
  
          console.log("Uploading MAIN image:", file.file.name, "→", uploadUrl);
  
          return fetch(uploadUrl, {
            method: "PUT",
            body: file.file,
            headers: { "Content-Type": file.type || "image/jpeg" },
          });
        })
        .filter(Boolean);
  
      // Upload option images
      const optionFileUploads = files.flatMap((file) => {
        if (!file?.option || !Array.isArray(file.option) || file.option.length === 0)
          return [];
        console.log(item?.objective_image_urls,"length of urls")
        if(item?.objective_image_urls.length > 0){
  
        return file.option
          .map((option,index) => {
            console.log(option, "option in file")
            if (!option?.file.name || !option?.file) return null;
  
            // Match by name
            const matchedImage = item?.objective_image_urls?.[index];
  
            if (!matchedImage?.image_url) {
              console.warn("No upload URL found for option:", option.name);
              return null;
            }
  
            console.log("Uploading OPTION image:", option.file.name, "→", matchedImage.image_url);
  
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
  
    // Save uploaded S3 paths to DB
    const res = await fetch(base_url + "/api/openedx/save_s3_image_path_to_db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images_data: items,
        rubric_id: blockId,
      }),
    });
  
    if (!res.ok) throw new Error("Failed to save S3 paths");
  };
  
  // Utility to get uploaded files by itemId
  const getFilesByItemId = (itemId) => {
    const files = [];
    const imageObject = images?.find((img) => img.questionId == itemId);
  
    if (imageObject) {
      files.push({
        file: imageObject?.question?.[0]?.file || null,
        type: "image/jpeg", // enforce correct MIME
        option: imageObject?.options || [], // options contain { name, file }
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
      console.log(JSON.stringify(backendPayload, null, 2));
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
    // Visual feedback is handled by the DraggablePartCard component
  };

  const handlePartDrop = (dropIndex) => {
    if (draggedPartIndex !== null && draggedPartIndex !== dropIndex) {
      const newParts = [...lessonParts];
      const draggedPart = newParts[draggedPartIndex];

      // Remove the dragged part
      newParts.splice(draggedPartIndex, 1);

      // Insert at the new position
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

  return (
    <ImagesProvider
      images={images}
      setImages={setImages}
      nextImageId={nextImageId}
      setNextImageId={setNextImageId}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Lesson Builder
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Create and organize your lesson content with ease
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-4 text-sm text-gray-600 mr-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>For Students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Auto-saved</span>
                  </div>
                </div>
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Draft
                </div> */}
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Preview
                </div>
                <div
                  onClick={!loading ? handlePublishClick : undefined}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
        border border-transparent rounded-md transition-colors
        ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        }`}
                >
                  {loading ? (
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
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {loading ? "Publishing..." : "Publish Lesson"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-88px)]">
          {/* Left Panel - Main Editing Area (70%) */}
          <div className="flex-1 px-4 py-3 overflow-y-auto">
            {selectedPart ? (
              <div className="space-y-6">
                {/* Enhanced Part Header */}
                <div
                  className="p-3 bg-white rounded-lg shadow-sm "
                  style={{
                    border: "1px solid #d1d5db",
                    borderLeftWidth: "4px",
                    borderLeftColor: "#27AAE1",
                  }}
                >
                  <div className="flex items-center gap-4">
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
                </div>

                {/* Content Editing Areas */}
                <HybridContentEditor
                  selectedPart={selectedPart}
                  content={selectedPart.content || { blocks: [] }}
                  onContentChange={handleContentChange}
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

          {/* Enhanced Right Panel - Lesson Parts Outline (30%) */}
          <div className="w-80 bg-white border-l border-gray-200 shadow-sm overflow-y-auto">
            <div className="px-4 py-2">
              {/* Lesson Configuration launcher */}
              <div
                className="mb-3 rounded-lg border border-blue-200 bg-gradient-to-r from-white to-blue-50 cursor-pointer hover:shadow-sm"
                onClick={() => setLessonConfigOpen(true)}
                style={{ borderLeftWidth: "4px", borderLeftColor: "#3b82f6" }}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Settings className="w-5 h-5 mb-1 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">Lesson Configuration</div>
                    <p className="text-xs text-gray-500">Manage documents, videos, and settings</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lesson Outline
                </h3>
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Part
                </div>
              </div>

              <div className="space-y-3 mb-3">
                {lessonParts.map((part, index) => (
                  <DraggablePartCard
                    key={part.id}
                    part={part}
                    index={index}
                    isSelected={selectedPartId === part.id}
                    onSelect={() => setSelectedPartId(part.id)}
                    onEdit={() => openEditDialog(part)}
                    onDuplicate={() => handleDuplicatePart(part.id)}
                    onDelete={() => openDeleteDialog(part)}
                    onDragStart={handlePartDragStart}
                    onDragOver={handlePartDragOver}
                    onDrop={handlePartDrop}
                  />
                ))}
              </div>

              {/* Enhanced Summary */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Lesson Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Parts:</span>
                    <span className="font-semibold text-gray-900">
                      {lessonParts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Weight:</span>
                    <span
                      className={`font-semibold ${
                        isWeightValid ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {totalWeight}%
                    </span>
                  </div>
                  {!isWeightValid && (
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ Weights should total 100%
                    </p>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-semibold text-gray-900">
                      {lessonParts.reduce(
                        (sum, part) =>
                          sum +
                          (part.content?.blocks || []).reduce(
                            (bSum, block) =>
                              bSum + (block.content?.questions?.length || 0),
                            0
                          ),
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddPartDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddPart={handleAddPart}
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

        {/* Lesson Configuration Modal */}
        {lessonConfigOpen && (
          <div className="fixed inset-0 z-50 pt-[3%] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 border-none" onClick={() => setLessonConfigOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-3xl max-h-[87vh] overflow-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">Lesson Configuration</div>
                    <p className="text-xs text-gray-500">Configure lesson-wide documents and videos</p>
                  </div>
                </div>
                <button className="p-1 rounded hover:bg-gray-100 border-none" onClick={() => setLessonConfigOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Document Uploads */}
                <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-900">Lesson Documents</label>
                      <p className="text-xs text-gray-500">Upload source materials and answer keys</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Source Document</label>
                      {lessonConfig.sourceDocument ? (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-200">
                              <FileText className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{lessonConfig.sourceDocument.name || "Uploaded"}</span>
                              <p className="text-xs text-gray-500">Source document uploaded</p>
                            </div>
                          </div>
                          <div
                            onClick={() => setLessonConfig((c) => ({ ...c, sourceDocument: null }))}
                            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                          <input
                            type="file"
                            accept=".doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setLessonConfig((c) => ({ ...c, sourceDocument: file }));
                            }}
                            className="hidden"
                            id="lesson-source-document"
                          />
                          <label htmlFor="lesson-source-document" className="cursor-pointer">
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 w-fit mx-auto mb-2 transition-colors">
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              Upload source document
                            </p>
                            <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Answer Key</label>
                      {lessonConfig.answerKey ? (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-200">
                              <FileText className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{lessonConfig.answerKey.name || "Uploaded"}</span>
                              <p className="text-xs text-gray-500">Answer key uploaded</p>
                            </div>
                          </div>
                          <div
                            onClick={() => setLessonConfig((c) => ({ ...c, answerKey: null }))}
                            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                          <input
                            type="file"
                            accept=".doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setLessonConfig((c) => ({ ...c, answerKey: file }));
                            }}
                            className="hidden"
                            id="lesson-answer-key"
                          />
                          <label htmlFor="lesson-answer-key" className="cursor-pointer">
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-green-100 w-fit mx-auto mb-2 transition-colors">
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                              Upload answer key
                            </p>
                            <p className="text-xs text-gray-500 mt-1">DOC, DOCX files supported</p>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Attachments */}
                <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-900">Video Attachments</label>
                        <p className="text-xs text-gray-500">Enable video uploads for this lesson</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{lessonConfig.videoEnabled ? "Enabled" : "Disabled"}</span>
                      <div
                        onClick={() => setLessonConfig((c) => ({ ...c, videoEnabled: !c.videoEnabled }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          lessonConfig.videoEnabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            lessonConfig.videoEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {lessonConfig.videoEnabled && (
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      {lessonConfig.videos?.[0] ? (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-200">
                              <Video className="w-4 h-4 text-purple-700" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{lessonConfig.videos[0].name || "Uploaded"}</span>
                              <p className="text-xs text-gray-500">Video file uploaded</p>
                            </div>
                          </div>
                          <div
                            onClick={() => setLessonConfig((c) => ({ ...c, videos: [] }))}
                            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setLessonConfig((c) => ({ ...c, videos: [f] }));
                            }}
                            className="hidden"
                            id="lesson-video-upload"
                          />
                          <label htmlFor="lesson-video-upload" className="cursor-pointer">
                            <div className="p-2 rounded-full bg-gray-100 group-hover:bg-purple-100 w-fit mx-auto mb-2 transition-colors">
                              <Video className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                              Upload video file
                            </p>
                            <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI files supported</p>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ImagesProvider>
  );
}
