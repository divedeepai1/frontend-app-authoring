import editIcon from "../../compugrade-assets/edit-black.svg";
import MultiSelectInput from "../../compugrade/components/MultiSelectInput";
import { Editor } from "@tinymce/tinymce-react";

import { useEffect, useRef, useState } from "react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";
import InstructionsPreviewEngine from "../../compugrade/components/InstructionsPreviewEngine";
import { Container } from "react-bootstrap";
import { useParams } from "react-router";
import { base_url } from "../../compugrade-constants";
import magic from "../../compugrade-assets/magic.svg"

const WriterEngine = () => {
  const [showSelect, setShowSelect] = useState(false);
  const [difficulty, setDifficultiy] = useState("Beginner");
  const [contentText, setContentText] = useState("");
  const [grade, setGrade] = useState("1-5");
  const [themeDescription, setThemeDescription] = useState("");

  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState([]);
  const [instructions, setinstructions] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInstruction, setLoadingInstructions] = useState(false);

  const { blockId } = useParams();
  const encodedBlockId = encodeURIComponent(blockId);

  useEffect(() => {
    const savedData = sessionStorage.getItem("unitData");
    if (savedData) {

      const fetchRubricItems = async () => {
        try {
          const response = await fetch(
            `${base_url}/api/openedx/get_all_edx_rubric_items?openedx_based_id=${encodedBlockId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ body: "Hello" }),
            }
          );
    
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
    
          const data = await response.json();
          console.log(data);
    
          const naturalTextList = data.items.map((item) => item.natural_text);
          console.log(naturalTextList);
          setinstructions(naturalTextList);
        } catch (err) {
          console.error(err);
        }
      };
    
      fetchRubricItems();
      const parsedData =JSON.parse(savedData)

      setTheme(parsedData?.theme)
      setGrade(parsedData?.grade_level)

      if (parsedData?.skills_used) {
        const preselected = parsedData.skills_used.map((item) => ({
          label: item,
          value: item,
          color: 'orange', // You can enhance this if `item.color` is actually available
        }));
        setSelected(preselected);
      }
    
      setThemeDescription(parsedData?.theme_description)
      setContent(parsedData?.text)
      setDifficultiy(parsedData?.difficulty_level)
    

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedData?.text || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      setContentText(plainText);

    }
  }, []);

  const [search, setSearch] = useState("");

  const generateContent = async (e) => {
    e.preventDefault();
    const token = await fetchCsrfToken();

    if (!theme.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${
          getConfig().STUDIO_BASE_URL
        }/myplugin/writer-engine/generate-document/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            theme: theme,
            theme_description: themeDescription,
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
  };

  const generateInstuctions = async () => {
    const token = await fetchCsrfToken();
    setLoadingInstructions(true);
    try {
      const skills = selected.map((item) => item.value);
      // const gradeInt = parseInt(grade, 10);
      const response = await fetch(
        `${
          getConfig().STUDIO_BASE_URL
        }/myplugin/writer-engine/generate-instructions/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            skills: skills,
            text: contentText,
            grade_level: grade,
            difficulty_level: difficulty,
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
  };
  return (
    <div className="bg-white min-vh-100">
      <div
        className="py-3 border-bottom border-2  d-flex"
        style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}

      >
        <Container className="px-4">
        <span >
        Compugrade Writer Engine{" "}
        </span>
       
        <span>
          {" "}
          <img src={editIcon} alt="edit" />
        </span>
        </Container>
      </div>
    
      <Container>
      <div className="d-flex" syyle={{ width: "100%" }}>
        <section className="py-4 px-4" style={{ width: "60%" }}>
          <div className="d-flex justify-content-between align-items-end">
            <h3
              className="mt-4"
              style={{ fontSize: "18px", fontWeight: "600", color: "black" }}
            >
              Theme Topic
            </h3>
            <select
              id="difficulty"
              className="custom-select-black p-2"
              value={grade}
              style={{ width: "300px" }}
              onChange={(e) => setGrade(e.target.value)}
            >
              <div className="p-4">
                <option value="1-5">Grade 1 to 5 </option>
                <option value="6-8">Grade 6 to 8 </option>
                <option value="9-12">Grade 9 to 12</option>
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
            <h3
              className="mt-4"
              style={{ fontSize: "18px", fontWeight: "600", color: "black" }}
            >
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
            <button
              type="submit"
              disabled={theme?.trim() =="" || loading}
              className="primary-button my-3 py-2 px-4"
            >
              {loading && (
                <span className="spinner-border spinner-border-sm mr-2"></span>
              )}
              {loading ? "Generating..." : "Generate Content"}
            </button>
          </form>
          {content && (
            <h3
              className="mt-1"
              style={{ fontSize: "18px", fontWeight: "600", color: "black" }}
            >
              Generated Content
            </h3>
          )}

          {content && 
          <div className="mt-3">
          
            <Editor
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
            />
          
          </div>
          }

          {content && (
            <div className="d-flex justify-content-between mt-3 align-items-end">
              <p
                className="mt-2"
                onClick={(e) => setShowSelect(true)}
                style={{
                  width: "max-content",
                  textDecoration: "underline",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                + Add Skills Covered
              </p>
              <select
                id="difficulty"
                className="custom-select-black p-2"
                value={difficulty}
                style={{ width: "350px" }}
                onChange={(e) => setDifficultiy(e.target.value)}
              >
                <div>
                  <option value="Beginner">
                    Instruction Difficulty : Beginner
                  </option>
                  <option value="Intermediate">
                    Instruction Difficulty : Intermediate
                  </option>
                  <option value="Advanced">
                    Instruction Difficulty : Advanced
                  </option>
                </div>
              </select>
            </div>
          )}
          {content && (
            <MultiSelectInput
              search={search}
              setSearch={setSearch}
              selected={selected}
              setSelected={setSelected}
            />
          )}

          {content && 
            <div className="d-flex justify-content-between">
            <button
              onClick={(e) => generateInstuctions()}
              disabled={!content || selected.length == 0}
              className="primary-button my-3 py-2 px-4"
            >
              {loadingInstruction && (
                <span className="spinner-border spinner-border-sm mr-2"></span>
              )}
              {loadingInstruction ? "Generating..." : "Generate Instructions"}
            </button>
            <button className="answer-key my-3 px-2"> <img src={magic} />Answer key</button>
            </div>}
        </section>
        <section style={{ width: "40%" }}>
          
          {instructions && (
            <InstructionsPreviewEngine data={instructions} text={content} selectedSkills={selected} theme={theme} description={themeDescription} grade={grade} difficulty={difficulty} />
          )}
        </section>
      </div>
      </Container>
    </div>
  );
};
export default WriterEngine;
