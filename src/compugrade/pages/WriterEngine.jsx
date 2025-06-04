

import editIcon from "../../compugrade-assets/edit-black.svg";
import MultiSelectInput from "../../compugrade/components/MultiSelectInput";
import { Editor } from "@tinymce/tinymce-react";

import { useRef, useState } from "react";
import { getConfig } from '@edx/frontend-platform'; 
import { fetchCsrfToken } from "../../cms-csrftoken";
import InstructionsPreviewEngine from "../../compugrade/components/InstructionsPreviewEngine";


const WriterEngine = () => {
  const [showSelect, setShowSelect] = useState(false);
  const [difficulty,setDifficultiy]=useState("Beginner")
  const [contentText,setContentText]=useState("")
  const [grade,setGrade]=useState("1")
  const [themeDescription,setThemeDescription]=useState("");

  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState([]);
  const [instructions, setinstructions] = useState("");
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInstruction, setLoadingInstructions] = useState(false);

  const [search, setSearch] = useState('');

  const generateContent = async (e) => {  
    e.preventDefault()
    const token= await fetchCsrfToken();  
 
    if (!theme.trim()) return;
    setLoading(true);
    setTheme('');
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/writer-engine/generate-document/`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token, 
          },
          body: JSON.stringify({
            theme:theme,
            theme_description:themeDescription,
          }),
        }
      );
      const result = await response.json();
      setContentText(result?.document || "No content generated");
      setContent(result?.html_document || "No content generated");
      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  }

  const generateInstuctions = async () => {  
    const token= await fetchCsrfToken();  
    setLoadingInstructions(true);
    try {
      const skills = selected.map(item => item.label);
      const gradeInt = parseInt(grade, 10);
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/writer-engine/generate-instructions/`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token, 
          },
          body: JSON.stringify({
            skills: skills,
            text: contentText,
            grade_level:gradeInt,
            difficulty_level:difficulty,

          }),
        }
      );
      const data = await response.json();
      setinstructions(data?.instructions);
      setLoadingInstructions(false);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoadingInstructions(false);
      
    }
  }
  return (
    <div className="bg-white min-vh-100">
      <div
        className="py-3 border-bottom border-2 px-5"
        style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}
      >
        Compugrade Write Engine{" "}
        <span>
          {" "}
          <img src={editIcon} alt="edit" />
        </span>
      </div>
      <div className="d-flex" syyle={{ width: "100%" }}>
        <section className="py-4 px-5" style={{ width: "60%" }}>
          <div className="d-flex justify-content-between align-items-end">
          <h3  className="mt-4"style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}>
            Write Theme
          </h3>
          <select
              id="difficulty"
              className="custom-select-black p-2"
              value={grade}
              style={{width:"300px"}}
              onChange={(e) => setGrade(e.target.value)}
            >
              <div className="text-black important">
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              </div>
            </select>
            </div>
          <form onSubmit={(e) => generateContent(e)} className="mt-3">
            <input
              type="text"
              required
              onChange={(e) => {
                setTheme(e.target.value);
              }}
              value={theme}
              className="form-control border-none my-2 py-4"
              style={{ background: "#EFF6F7" }}
              placeholder=""
            />
             <h3 className="mt-4" style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}>
             Theme Description (Optional)
          </h3>
          <textarea
              type="text"
              onChange={(e) => {
                setThemeDescription(e.target.value);
              }}
              value={themeDescription}
              className="form-control border-none my-2 mt-3 py-4"
              style={{ background: "#EFF6F7" }}
              placeholder=""
            />
             <button type="submit" disabled={!theme.trim() || loading}  className="primary-button my-3 py-2 px-4">
             {loading && <span className="spinner-border spinner-border-sm mr-2"></span>}
             {loading ? "Generating..." : "Generate Content"} 
            </button>
            {content &&<p
              className="mt-3"
              onClick={(e) => setShowSelect(true)}
              style={{
                width: "max-content",
                textDecoration:"underline",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              + Add Skills Covered
            </p>}
            {showSelect && <MultiSelectInput search={search} setSearch={setSearch} selected={selected} setSelected={setSelected} />}
           
          </form>
          {content &&<div className="py-3 d-flex justify-content-between ">
            {" "}
            <div>
            <button className="secondary-button py-1 px-3">
              {" "}
              Generated Content
            </button>{" "}
            <button className="ml-3 py-1 px-3 border-none" style={{background:"#f5f7f6" ,borderRadius:"4px",border:"none"}}>
              Answer Key
            </button>
            </div>
            <select
              id="difficulty"
              className="custom-select-black p-2"
              value={difficulty}
              onChange={(e) => setDifficultiy(e.target.value)}
            >
              <div className="text-black important">
              <option value="Beginner">Instruction Difficulty : Beginner</option>
              <option value="Intermediate">Instruction Difficulty : Intermediate</option>
              <option value="Advanced">Instruction Difficulty : Advanced</option>
              </div>
            </select>

          </div>}
          {content&& <Editor
                  // apiKey="your-tinymce-api-key" // Replace with your TinyMCE API key
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={content}
                  id="question"
                  editorType="question"
                  init={{
                    height: 500,
                    width: "100%",
                    menubar: false, 
                    toolbar:
                      "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                  }}
                />}
     
          {content &&<button onClick={(e) => generateInstuctions()} disabled={!content || selected.length == 0}  className="primary-button my-3 py-2 px-4">
             {loadingInstruction && <span className="spinner-border spinner-border-sm mr-2"></span>}
             {loadingInstruction ? "Generating..." : "Generate Instructions"} 
            </button>}
        </section>
        <section style={{ width: "40%" }}>
          {instructions &&<InstructionsPreviewEngine data={instructions} text={content} />}

        </section>
      </div>
    </div>
  );
};
export default WriterEngine;
