import React, { useEffect, useState } from "react";
import { Button } from "@openedx/paragon";
import editIcon from "../../compugrade-assets/edit.svg";
import deleteIcon from "../../compugrade-assets/delete.svg";
import { base_url } from "../../compugrade-constants";

import { useNavigate, useParams } from "react-router";


const InstructionsPreviewEngine = ({ data,text,selectedSkills,theme,description,grade,difficulty }) => {
  const navigate = useNavigate();
  const { blockId,sequenceId,courseId } = useParams();

  const encodedBlockId = encodeURIComponent(blockId);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tempEdit, setTempEdit] = useState({ index: null, value: "" });

  useEffect(() => {
    setTasks(data || []);
    console.log(text)
  }, [data]);

  const handleEditClick = (index, currentText) => {
    setTempEdit({ index, value: currentText });
  };

  const handleSaveClick = () => {
    const updatedTasks = [...tasks];
    updatedTasks[tempEdit.index] = tempEdit.value;
    setTasks(updatedTasks);
    setTempEdit({ index: null, value: "" });
  };

  const handleCancelClick = () => {
    setTempEdit({ index: null, value: "" });
  };

  const handleDeleteClick = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleSaving = async () => {
    const data = tasks.map(task => ({
      natural_text: task,
      instruction_category: "AB"
    }));
  
    setLoading(true);
  
    try {
      const response = await fetch(base_url+ '/api/openedx/create_base_items_from_scratch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rubric_id: blockId,
          items: data,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create base items: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json();

      const skillValues = selectedSkills.map(skill => skill.value);
  
      const response2 = await fetch(base_url+ '/api/openedx/update_rubric', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          openedx_based_id: blockId,
          text_to_display: text,
          skills_used: skillValues,
          theme: theme,
          theme_description: description,
          grade_level:grade,
          difficulty_level:difficulty,

        }),
      });
  
      if (!response2.ok) {
        throw new Error(`Failed to update rubric: ${response2.status} ${response2.statusText}`);
      }
      sessionStorage.removeItem("unitData")
      navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);

    } catch (error) {
      console.error('Error during saving:', error);
    
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ maxHeight: "90%"}}>
      <div  className="overflow-auto"  style={{ position: "relative" }} >
        <div>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "rgba(255, 89, 89, 0.10)",
                  borderRadius: "3px",
                  marginTop: "10px",
                }}
              >
                <div className="d-flex justify-content-end" style={{ gap: "8px" }}>
                  <button
                    style={{
                      backgroundColor: "white",
                      padding: "0 10px",
                      border: "none",
                    }}
                    onClick={() => handleEditClick(index, task)}
                  >
                    <img src={editIcon} alt="edit" width={20} height={20} />
                  </button>
                  <button
                    style={{
                      backgroundColor: "white",
                      padding: "0 10px",
                      border: "none",
                    }}
                    onClick={() => handleDeleteClick(index)}
                  >
                    <img src={deleteIcon} alt="delete" width={20} height={20} />
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "10px 12px",
                    marginTop: "8px",
                    border: "0.2px solid #104E7F50",
                    borderLeftWidth: "2px",
                    borderLeftStyle: "solid",
                    borderLeftColor: "#a8551c",
                    borderRadius: "0px 4px 4px 0px",
                  }}
                >
                  {tempEdit.index === index ? (
                    <input
                      style={{
                        fontSize: "14px",
                        color: "#000000",
                        fontWeight: "500",
                        margin: "0px",
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                      value={tempEdit.value}
                      onChange={(e) =>
                        setTempEdit({ ...tempEdit, value: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      style={{
                        fontSize: "14px",
                        color: "#000000",
                        fontWeight: "500",
                        margin: "0px",
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                      }}
                      value={task}
                      disabled
                    />
                  )}
                </div>

                {tempEdit.index === index && (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button variant="primary" size="sm" onClick={handleSaveClick}>
                        Save
                      </Button>
                      <Button variant="outline-primary" size="sm" onClick={handleCancelClick}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                marginTop: "56px",
                marginInline: "auto",
              }}
              className="loader"
            />
          )}
        </div>
      </div>
      <div className="d-flex">

        <button onClick={handleSaving} className="primary-button my-3 py-2 px-4">
          {loading &&<span className="spinner-border spinner-border-sm mr-2 "></span>}
           {loading ? "Saving..." : "Save"}
        </button>

      </div>
    </div>
  );
};

export default InstructionsPreviewEngine;
