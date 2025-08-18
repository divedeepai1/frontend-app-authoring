import './index.css'


import { useEffect, useRef, useState } from 'react'
import { Container, Button } from 'react-bootstrap'
import { LessonConfiguration } from '../components/lesson-configuration'
import { LessonContentEditor } from '../components/lesson-content-editor'
import { useNavigate, useParams } from 'react-router'
import { base_url } from "../../../../compugrade-constants";
import { ImagesProvider } from '../components/ui/images-context'


export default function NewLessonFlow() {
  const navigate= useNavigate();
  const editorRef = useRef(null);

  const [loading,setLoading]=useState(false)
  const [skills,setSkills]=useState([])
  const [lessonConfig, setLessonConfig] = useState({
    lessonType: 'skills-only',
    sourceFile: null,
    answerKeyFile: null,
    skills: [],
  })

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${base_url}/api/skills/get_skills`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const newOptions = data?.skills?.map((item,index) => ({
        label: item.customer_facing_name,
        value: item.skill_json,
      }));
      setSkills(newOptions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  
  const [contentBlocks, setContentBlocks] = useState([])
  const [images, setImages] = useState([])
  const [nextImageId, setNextImageId] = useState(1)

  const { blockId , sequenceId, courseId} = useParams();

  const getFilesByItemId = (itemId) => {
    const files = [];
    const imageObject = images?.find((img,index) => (index + 1) == itemId);
    if (imageObject) {
      files.push({
        file: imageObject.file || imageObject.question[0].file,
        type: "image_url",
        option: imageObject.options || []
      });
    }
   return files;
  };

  
  
  const handleUploadToS3 = async (items) => {
    const uploadPromises = items.flatMap((item) => {
      if (!item.image_url) return [];
  
      const files = getFilesByItemId(item.temporary_item_id);
      if (!files || files.length === 0) return [];
  
      const mainFileUploads = files
        .map((file) => {
          if (!file || !file.file) return null;
          return fetch(item[file.type], {
            method: "PUT",
            body: file.file,
            headers: { "Content-Type": file.type },
          });
        })
        .filter(Boolean);
  
      const optionFileUploads = files.flatMap((file) => {
        if (!file.option || !Array.isArray(file.option) || file.option.length === 0) return [];
        return file.option
          .map((option) => {
            if (!option.option_image) return null;
            const optionUrl = item.objective_image_urls[option.index]?.image_url;
            if (!optionUrl) return null;
            return fetch(optionUrl, {
              method: "PUT",
              body: option.file,
              headers: { "Content-Type": "image/jpeg" },
            });
          })
          .filter(Boolean);
      });
  
      return [...mainFileUploads, ...optionFileUploads];
    });
  
    await Promise.all(uploadPromises);
  
    const res = await fetch(base_url + "/api/openedx/save_base_s3_image_path_to_db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images_data: items,
        rubric_id: blockId,
      }),
    });
  
    if (!res.ok) throw new Error("Failed to save S3 paths");
  };

  const handleSave = async () => {
    const fileToBase64 = (file) =>
      new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
  
    setLoading(true);
    try {
      const sourceBase64 = await fileToBase64(lessonConfig.sourceFile);
      const answerBase64 = await fileToBase64(lessonConfig.answerKeyFile);
  
      const formattedItems = contentBlocks
        .map((block, index) => ({
          id: index + 1,
          instruction_category: "OB",
          objective_json: block,
        }))
        .filter(Boolean);
  
      const response = await fetch(
        base_url + "/api/openedx/create_base_items_from_scratch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rubric_id: blockId,
            items: formattedItems,
            source_docx_base64: sourceBase64,
            answer_docx_base64: answerBase64,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          `Failed to create base items: ${response.status} ${response.statusText}`
        );
      }
  
      const result = await response.json();
  
      const promises = [];
      promises.push(handleUploadToS3(result.items));
  
      if (
        contentBlocks.some((block) => block.type === "text") ||
        lessonConfig?.skills
      ) {

        const skillsUsed = lessonConfig?.skills?.map(item => ({
          customer_facing_name: item.label,
          skill_json: item.value
        }));
        const content = editorRef?.current?.getContent();
        const body = {
          openedx_based_id: blockId,
          skills_used: skillsUsed,
        };
        if (content) {
          body.text_to_display = content;
        }
        promises.push(
          fetch(base_url + "/api/openedx/update_rubric", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        );
      }
  
      await Promise.all(promises);
      navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);
    } catch (error) {
      console.error("Error during saving:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
//  console.log(contentBlocks,lessonConfig)
  const hasConfigErrors = (config) => {
    const isDocEval = config.lessonType === 'document-evaluation-only' || config.lessonType === 'hybrid'
    const isSkills = config.lessonType === 'skills-only' || config.lessonType === 'hybrid'

    const invalidSource = isDocEval && (!config.sourceFile || !/\.docx$/i.test(config.sourceFile.name))
    const invalidAnswer = isDocEval && (!config.answerKeyFile || !/\.docx$/i.test(config.answerKeyFile.name))
    const invalidSkills = isSkills && (!config.skills || config.skills.length === 0)

    return Boolean(invalidSource || invalidAnswer || invalidSkills)
  }

  const hasBlockError = (block) => {
    // if (block.type === 'text') {
    //   const contentOk = Boolean(block.content && block.content.trim())
    // return !contentOk
    // }
    if (block.type === 'question') {
      const qTextOk = Boolean(block.natural_text && block.natural_text.trim())

      switch (block.objective_type) {
        case 'true-false': {
          const hasCorrect = Boolean(block.correct_answer)
          return !(qTextOk || hasCorrect)
        }
        case 'multiple-choice': {
          const options = block.options || []
          const hasEnough = options.length >= 2
          const noEmpty = options.every((o) => o.text && o.text.trim())
          const hasCorrect = Boolean(block.correct_answer)
          return !(qTextOk && hasEnough && noEmpty && hasCorrect)
        }
        case 'fill-in-the-blanks': {
          const blanksInText = (block.natural_text.match(/\[BLANK\]/g) || []).length
          const answers = block.blanks || []
          const countsMatch = blanksInText === answers.length && blanksInText > 0
          const noEmpty = answers.every((b) => b.answer && b.answer.trim())
          return !(qTextOk && countsMatch && noEmpty)
        }
        case 'matching-pairs': {
          const pairs = block.pairs || []
          const hasEnough = pairs.length >= 2
          const noEmpty = pairs.every((p) => p.term && p.term.trim() && p.definition && p.definition.trim())
          return !(qTextOk && hasEnough && noEmpty)
        }
        case 'ordering': {
          const items = block.items || []
          const hasEnough = items.length >= 2
          const noEmpty = items.every((i) => i.text && i.text.trim())
          return !(qTextOk && hasEnough && noEmpty)
        }
        case 'categorizing-items': {
          const categories = block.categories || []
          const hasCat = categories.length >= 1
          const noEmptyCat = categories.every((c) => c.name && c.name.trim())
          const items = block.items || []
          const itemsOk = items.every((i) => (i.text && i.text.trim() && i.categoryId))
          return !(qTextOk && hasCat && noEmptyCat && itemsOk)
        }
        case 'short-answer': {
          const answer =  block.correct_answer.trim()
          return !(qTextOk && answer)
        }
        case 'multi-select': {
          const options = block.options || []
          const hasEnough = options.length >= 2
          const noEmpty = options.every((o) => o.text && o.text.trim())
          const hasAtLeastOneCorrect = options.some((o) => o.isCorrect)
          return !(qTextOk && hasEnough && noEmpty && hasAtLeastOneCorrect)
        }
        default:
          return false
      }
    }
    return false
  }

  const hasContentErrors = (blocks) => blocks.some(hasBlockError)

  const hasErrors = hasConfigErrors(lessonConfig) || hasContentErrors(contentBlocks)

  return (
    <ImagesProvider images={images} setImages={setImages} nextImageId={nextImageId} setNextImageId={setNextImageId} >
    <Container fluid className="px-4" style={{height:"100%"}}>
      <h3 className="py-3 pl-2 fw-bold">Create New Lesson</h3>
      
  <p className=" text-red-600">This is Tailwind styled</p>

      <LessonConfiguration config={lessonConfig} onConfigChange={setLessonConfig} skills={skills} />
      <LessonContentEditor contentBlocks={contentBlocks} onContentBlocksChange={setContentBlocks}  editorRef={editorRef}/>

      <div style={{float:"right", width:"43%"}}>
        <button className='primary-button px-3 py-2' disabled={hasErrors} onClick={() => handleSave()}>
        {loading && (
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                  )}
          {!loading ?"Save Lesson":"Saving Lesson ..."}
        </button>
      </div>
    </Container>
    </ImagesProvider>
  )
}
