import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@openedx/paragon";
import { useNavigate, useParams } from "react-router";
import { base_url } from "../../compugrade-constants";
import WriterEngine from "./WriterEngine";
import NewSkills from "./NewSkills";

const InstructionsHelpEditorPage = ({ courseId }) => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  const [blockInfo, setBlockInfo] = useState({ key: "", title: "" });
  const { blockId,sequenceId, blockType } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    
    // Conditional logic for setting blockInfo based on blockType
    if (blockType === "tools") {
      setBlockInfo({ key: "tools", title: "Tools and Terms" });
    } else if (blockType === "skills") {
      setBlockInfo({ key: "skills", title: "Skills" });
    } else if (blockType === "overview") {
      setBlockInfo({ key: "description", title: "Overview" });
    }
    else if (blockType === "text") {
      setBlockInfo({ key: "text", title: "Document Text" });
    }

    const fetchData = async () => {
      try {
        const encodedBlockId = encodeURIComponent(blockId); // Encode the block ID
        const response = await fetch(
          `${base_url}/api/openedx/get_rubric?openedx_based_id=${encodedBlockId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", 
            },
            body: JSON.stringify({ name: "Hello" }), 
          }
        );

        const result = await response.json();
        if (response.ok && editorRef.current) {
          // Set the editor's content based on the response
          console.log(result[blockInfo.key]);
          
          const content = result[blockType] || ""
          editorRef.current.setContent(content);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [blockType]); // Run when blockType changes

  const handleButtonClick = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent(); // Get the editor's content
      setOutput(content); // Update state with the content
      console.log(content); // Log it to the console

      // Prepare the request body
      const requestBody = {
        openedx_based_id: blockId,
        [blockInfo.key]: content, // Set the dynamic key with the editor content as its value
    };

      try {
        const response = await fetch(base_url+ "/api/openedx/update_rubric", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody), // Send the request body

        });
        if (response) {
          // Navigate to the desired page if the response is successful
          navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);
        } else {
          // Handle the error response
          // console.error("Failed to update rubric:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
    {blockType =="engine"
      ?<WriterEngine />: blockType =="skills"
      ?<NewSkills />:
    
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <h3 className="mb-4">{blockInfo.title}</h3>
      <Editor
        // apiKey="your-tinymce-api-key" // Replace with your TinyMCE API key
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue="<p>Start typing here...</p>"
        id="question"
        editorType="question"
        init={{
          height: 500,
          width: "100%",
          menubar: false, // Disable the menu bar
          toolbar:
            "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
        }}
      />
      <div className="d-flex justify-content-end mt-4">
        <Button
          // data-testid="new-library-button"
          onClick={handleButtonClick}
        >
          Save

        </Button>
      </div>
    </div>}
    </>
    
  );
};

export default InstructionsHelpEditorPage;
