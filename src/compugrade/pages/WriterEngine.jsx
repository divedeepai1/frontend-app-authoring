import editIcon from "../../compugrade-assets/edit-black.svg";
import MultiSelectInput from "../../compugrade/components/MultiSelectInput";
import { Editor } from "@tinymce/tinymce-react";

import { useEffect, useRef, useState } from "react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";
import InstructionsPreviewEngine from "../../compugrade/components/InstructionsPreviewEngine";
import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { base_url } from "../../compugrade-constants";
import magic from "../../compugrade-assets/magic.svg";


const WriterEngine = ({ preview }) => {
  const navigate = useNavigate();
  const [showSelect, setShowSelect] = useState(false);
  const [difficulty, setDifficultiy] = useState("Beginner");
  const [search, setSearch] = useState("");
  const [searchChild, setSearchChild] = useState("");

  const [answerImage, setAnswerImage] = useState("");
  const [contentImage, setContentImage] = useState("");

  const [contentText, setContentText] = useState("");
  const [grade, setGrade] = useState("9-12");
  const [words, setWords] = useState("200-400");
  const [instructionCount, setInstructionCount] = useState(5);
  const [skills, setSkills] = useState([]);
  const [themeDescription, setThemeDescription] = useState("");
  const [activeTab, setActiveTab] = useState("Content");

  

  const editorRef = useRef(null);
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState([]);
  const [instructions, setinstructions] = useState("");
  const [childSkills, setChildSkills] = useState([]);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInstruction, setLoadingInstructions] = useState(false);

  const { blockId } = useParams();
  const encodedBlockId = encodeURIComponent(blockId);

  useEffect(() => {
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
        setSkills(data?.skills);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    
    if (selected.length > 0) {
      const combined = selected.flatMap((skill, skillIndex) => {
        const values = Array.isArray(skill.value)
          ? skill.value
          : [skill.value]; 
  
        return values.map((item, index) => {
          const trimmed = item.trim();
          const color = trimmed.endsWith("(OB)")
            ? "blue"
            : trimmed.endsWith("(AB)")
            ? "green"
            : "orange";
  
          return {
            id: `${skillIndex}-${index}`,
            label: trimmed,
            value: trimmed,
            color: color,
          };
        });
      });
  
      setChildSkills(combined);
    } else {
      setChildSkills([]);
    }
  }, [selected]);



  useEffect(() => {
    const savedData = sessionStorage.getItem("unitData");
    const skills_used = sessionStorage.getItem("skills_used");

    if (skills_used && !savedData && skills_used !== "undefined") {
      const parsedSkills = JSON?.parse(skills_used || {});
      const preselected = parsedSkills?.map((item, index) => ({
        id: index + 1,
        label: item?.customer_facing_name,
        value: item?.skill_json,
        color: "orange",
      }));
      setSelected(preselected);
    }

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

          const transformedList = data?.items.map((item) => ({
            instruction:
              item?.natural_text || item?.objective_json?.natural_text,
            ab_or_ob: item?.instruction_category,
            question_type: item?.objective_type
              ? item?.objective_type == "mcq"
                ? "Multiple Choice Question"
                : "True/False Question"
              : "",
          }));
          setinstructions(transformedList);
        } catch (err) {
          console.error(err);
        }
      };

      fetchRubricItems();
      const parsedData = JSON.parse(savedData);

      setTheme(parsedData?.theme);
      setAnswerImage(parsedData?.answer_image);
      setContentImage(parsedData?.content_image);
      setGrade(parsedData?.grade_level || "9-12");
      setInstructionCount(parsedData?.instruction_count_preference || 5);

      if (parsedData?.skills_used) {
        const preselected = parsedData.skills_used.map((item, index) => ({
          id: index + 1,
          label: item?.customer_facing_name,
          value: item?.skill_json,
          color: "orange",
        }));
        setSelected(preselected);
      }

      setThemeDescription(parsedData?.theme_description);
      setContent(parsedData?.text);
      setDifficultiy(parsedData?.difficulty_level || "Beginner");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedData?.text || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      setContentText(plainText);
    }
  }, []);

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
            grade_level: grade,
            word_range: words,
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
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setContent(content); // Update state with the content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      setContentText(plainText);

      setLoadingInstructions(true);
      try {
        const skills = childSkills.length > 0 &&childSkills.map((item) => item.label);
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
              text: plainText,
              difficulty_level: difficulty,
              instructions_count: instructionCount,
            }),
          }
        );
        const data = await response.json();
        setinstructions(data?.instructions?.instructions);
        setLoadingInstructions(false);
      } catch (error) {
        console.error("Error generating content:", error);
      } finally {
        setLoadingInstructions(false);
      }
    }
  };
  return (
    <div className="bg-white min-vh-100">
      <div
        className="py-3 border-bottom border-2  d-flex"
        style={{ fontSize: "1.5rem", fontWeight: "600", color: "black" }}
      >
        <Container className="px-4">
          <span>
            <span className="mr-2 mb-3" onClick={() => navigate(-1)}>
              <svg
                width="18"
                height="15"
                viewBox="0 0 18 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.292892 6.79289C-0.0976315 7.18342 -0.0976314 7.81658 0.292893 8.20711L6.65686 14.5711C7.04738 14.9616 7.68054 14.9616 8.07107 14.5711C8.46159 14.1805 8.46159 13.5474 8.07107 13.1569L2.41421 7.5L8.07107 1.84315C8.46159 1.45262 8.46159 0.819457 8.07107 0.428933C7.68054 0.0384087 7.04738 0.0384088 6.65685 0.428933L0.292892 6.79289ZM18 7.5L18 6.5L1 6.5L1 7.5L1 8.5L18 8.5L18 7.5Z"
                  fill="black"
                  fill-opacity="0.6"
                />
              </svg>
            </span>

            {preview ? "Addin Preview" : "Compugrade Writer Engine"}
          </span>

          {!preview && (
            <span>
              <img src={editIcon} alt="edit" />
            </span>
          )}
        </Container>
      </div>

      <Container>
        <span
          className="px-4"
          style={{ fontSize: "28px", fontWeight: "600", color: "black" }}
        >
          {" "}
          {sessionStorage?.getItem("unitTitle")}{" "}
        </span>
        <div className="d-flex" style={{ width: "100%" }}>
          <section className="py-2 px-4" style={{ width: "60%" }}>
            {!preview && (
              <h3
                className="mt-1"
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "black",
                }}
              >
                Add Skills Covered
              </h3>
            )}
            {!preview && (
             skills?.length > 0 && <div>
                <MultiSelectInput
                  search={search}
                  setSearch={setSearch}
                  skills={skills}
                  customerFacing={true}
                  setSkills={setSkills}
                  selected={selected}
                  setSelected={setSelected}
                />

                
                   {childSkills?.length > 0 && <MultiSelectInput
                    search={searchChild}
                    setSearch={setSearchChild}
                    fromChild={true}
                    selected={childSkills}
                    setSelected={setChildSkills}
                  />}
                
              </div>
            )}
            {!preview && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <h3
                  className="mt-4"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "black",
                  }}
                >
                  Theme Topic
                </h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  <select
                    id="count"
                    className="custom-select-black p-2"
                    value={words}
                    style={{ width: "200px" }}
                    onChange={(e) => setWords(e.target.value)}
                  >
                    <option value="100-200">Words (100 - 200) </option>
                    <option value="200-400">Words (200 - 400) </option>
                    <option value="400-600">Words (400 - 600)</option>
                  </select>
                  <select
                    id="grade"
                    className="custom-select-black p-2"
                    value={grade}
                    style={{ width: "200px" }}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="1-5">Grade 1 to 5 </option>
                    <option value="6-8">Grade 6 to 8 </option>
                    <option value="9-12">Grade 9 to 12</option>
                  </select>
                </div>
              </div>
            )}
            {!preview && (
              <form onSubmit={(e) => generateContent(e)} className="mt-2">
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
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "black",
                  }}
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
                  disabled={theme?.trim() == "" || loading}
                  className="primary-button my-3 py-2 px-4"
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                  )}
                  {loading ? "Generating..." : "Generate Content"}
                </button>
              </form>
            )}
            {content && preview && (
              <div>
                {preview ? (
                  <div className="d-flex mb-2">
                    <div
                      onClick={() => setActiveTab("Content")}
                      className={`me-4 pb-2 cursor-pointer ${
                        activeTab === "Content"
                          ? "border-bottom border-primary text-primary"
                          : "text-secondary"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                     Initial Content
                    </div>
                    <div
                      onClick={() => setActiveTab("Answer Key")}
                      className={`me-4 pb-2 cursor-pointer ml-3 ${
                        activeTab === "Answer Key"
                          ? "border-bottom border-primary text-primary"
                          : "text-secondary"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      Answer Key
                    </div>
                  </div>
                ) : (
                  <h3
                    className="mt-1"
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "black",
                    }}
                  >
                    Generated Content
                  </h3>
                )}
              </div>
            )}

            {content && (
              <div className="mt-3">
                {preview && activeTab == "Content" ? (
                  
                  contentImage ? 
                  <div style={{height: "500px", overflowY: "auto"}}> 
                  <img
                  src={contentImage} 
                  alt="Initial Content Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                  /> 
                  </div>

                  :(
                    <span className="text-secondary">
                      No Initial content available for preview
                    </span>
                  )
                  
                ): preview && activeTab == "Answer Key" ? (
                 
                  answerImage ? 
                  <div style={{height: "500px", overflowY: "auto"}}>
                  <img
                  src={answerImage} 
                  alt="Answer Key Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                </div>
                : (
                  <span className="text-secondary">
                    No answer key available for preview
                  </span>
                )
                )
                 : (
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
                )}
              </div>
            )}

            {content && !preview && (
              <div className="d-flex justify-content-between mt-4 align-items-end">
                <p
                  className="d-flex"
                  onClick={(e) => setShowSelect(true)}
                  style={{
                    width: "max-content",
                    textDecoration: "underline",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                ></p>
                <div>
                  <select
                    id="instruction-count"
                    className="custom-select-black p-2 mr-3"
                    value={instructionCount}
                    style={{ width: "225px" }}
                    onChange={(e) =>
                      setInstructionCount(parseInt(e.target.value))
                    }
                  >
                    <option value="5">No of Instructions : 5</option>
                    <option value="10">No of Instuctions : 10</option>
                    <option value="15">No of Instructions : 15</option>
                    <option value="20">No of Instructions : 20</option>
                    <option value="25">No of Instructions : 25</option>
                  </select>
                  <select
                    id="difficulty"
                    className="custom-select-black p-2"
                    value={difficulty}
                    style={{ width: "325px" }}
                    onChange={(e) => setDifficultiy(e.target.value)}
                  >
                    <option value="Beginner">
                      Instruction Difficulty : Beginner
                    </option>
                    <option value="Intermediate">
                      Instruction Difficulty : Intermediate
                    </option>
                    <option value="Advanced">
                      Instruction Difficulty : Advanced
                    </option>
                  </select>
                </div>
              </div>
            )}

            {content && !preview && (
              <div className="d-flex justify-content-between">
                <button
                  onClick={(e) => generateInstuctions()}
                  disabled={!content || selected.length == 0}
                  className="primary-button my-3 py-2 px-4"
                >
                  {loadingInstruction && (
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                  )}
                  {loadingInstruction
                    ? "Generating..."
                    : "Generate Instructions"}
                </button>
                <button className="answer-key my-3 px-2">
                  {" "}
                  <img src={magic} />
                  Answer key
                </button>
              </div>
            )}
          </section>
          <section style={{ width: "40%" }}>
            {instructions && (
              <InstructionsPreviewEngine
                data={instructions}
                preview={preview}
                text={content}
                selectedSkills={selected}
                theme={theme}
                description={themeDescription}
                grade={grade}
                instruction_count={instructionCount}
                difficulty={difficulty}
              />
            )}
          </section>
        </div>
      </Container>
    </div>
  );
};
export default WriterEngine;
