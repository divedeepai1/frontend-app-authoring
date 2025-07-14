import React, { useEffect, useState } from "react";
import { Button } from "@openedx/paragon";
import editIcon from "../../compugrade-assets/edit.svg";
import deleteIcon from "../../compugrade-assets/delete.svg";
import { base_url } from "../../compugrade-constants";

import { useNavigate, useParams } from "react-router";

const InstructionsPreviewEngine = ({
  data,
  text,
  selectedSkills,
  theme,
  description,
  grade,
  difficulty,
  instruction_count,
}) => {
  const navigate = useNavigate();
  const { blockId, sequenceId, courseId } = useParams();

  const encodedBlockId = encodeURIComponent(blockId);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tempEdit, setTempEdit] = useState({ index: null, value: "" });
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    setTasks(data || []);
    console.log(data);
  }, [data]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedTasks = [...tasks];
    const draggedItem = updatedTasks[draggedIndex];

    updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(index, 0, draggedItem);

    setTasks(updatedTasks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleEditClick = (index, currentText) => {
    setTempEdit({ index, value: currentText });
  };

  const handleSaveClick = () => {
    const updatedTasks = [...tasks];
    updatedTasks[tempEdit.index] = {
      ...updatedTasks[tempEdit.index],
      instruction: tempEdit.value,
    };
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
    const data = tasks.map((task) => {
      const base = {
        instruction_category: task?.ab_or_ob,
        objective_type: task?.ab_or_ob == "OB" ? task?.question_type : "",
      };

      if (task?.ab_or_ob == "OB") {
        return {
          ...base,
          objective_json: {
            natural_text: task.instruction,
          },
        };
      } else {
        return {
          ...base,
          natural_text: task.instruction,
        };
      }
    });

    setLoading(true);

    try {
      const response = await fetch(
        base_url + "/api/openedx/create_base_items_from_scratch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rubric_id: blockId,
            items: data,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create base items: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      const skillValues = selectedSkills.map((skill) => skill.label);

      const response2 = await fetch(base_url + "/api/openedx/update_rubric", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openedx_based_id: blockId,
          text_to_display: text,
          skills_used: skillValues,
          theme: theme,
          theme_description: description,
          grade_level: grade,
          difficulty_level: difficulty,
          instruction_count_preference: instruction_count,
        }),
      });

      if (!response2.ok) {
        throw new Error(
          `Failed to update rubric: ${response2.status} ${response2.statusText}`
        );
      }
      sessionStorage.removeItem("unitData");
      navigate(`/course/${courseId}/container/${blockId}/${sequenceId}`);
    } catch (error) {
      console.error("Error during saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemTypeChange = async (id, newItemType) => {
    const updatedTasks = tasks.map((task) => {
      if (task.instruction == id) {
        return { ...task, question_type: newItemType };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  return (
    <div style={{ maxHeight: "90%" }}>
      <div className="overflow-auto" style={{ position: "relative" }}>
        <div>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragLeave={() => setDragOverIndex(null)}
                key={index}
                draggable
                style={{
                  transition: "transform 0.2s ease",
                  transform:
                    dragOverIndex === index
                      ? "translateY(-4px)"
                      : "translateY(0)",

                  padding: "12px 16px",
                  backgroundColor:
                    task.ab_or_ob == "AB" ? "#104E7F30" : "#F3B17A30",
                  borderRadius: "3px",
                  marginTop: "10px",
                  cursor: "move",
                }}
              >
                <div
                  className={`d-flex ${
                    task?.ab_or_ob == "OB"
                      ? "justify-content-between"
                      : "justify-content-end"
                  }`}
                  style={{ gap: "8px" }}
                >
                  {task?.ab_or_ob == "OB" && (
                    <select
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        fontSize: "13px",
                        outline: "none",
                      }}
                      value={
                        task?.question_type == "Multiple Choice Question"
                          ? "Multiple Choice Question"
                          : "True/False Question"
                      }
                      onChange={(e) =>
                        handleItemTypeChange(task.instruction, e.target.value)
                      }
                    >
                      <option value="Multiple Choice Question">
                        Multiple Choice Question
                      </option>
                      <option value="True/False Question">
                        True/False Question
                      </option>
                    </select>
                  )}
                  <div>
                    <button
                      style={{
                        backgroundColor: "white",
                        padding: "0 10px",
                        marginRight: "8px",
                        border: "none",
                      }}
                      onClick={() => handleEditClick(index, task.instruction)}
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
                      <img
                        src={deleteIcon}
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "10px 12px",
                    marginTop: "8px",
                    border: "0.2px solid #104E7F50",
                    borderLeftWidth: "2px",
                    borderLeftStyle: "solid",
                    borderLeftColor:
                      task.ab_or_ob == "AB" ? "#104E7F" : "#F3B17A",
                    borderRadius: "0px 4px 4px 0px",
                  }}
                >
                  {tempEdit.index === index ? (
                    <textarea
                      rows={3}
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
                    <textarea
                      rows={3}
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
                      value={(index + 1) +". "+task.instruction}
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
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveClick}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleCancelClick}
                      >
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
        <button
          onClick={handleSaving}
          className="primary-button my-3 py-2 px-4"
        >
          {loading && (
            <span className="spinner-border spinner-border-sm mr-2 "></span>
          )}
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default InstructionsPreviewEngine;
