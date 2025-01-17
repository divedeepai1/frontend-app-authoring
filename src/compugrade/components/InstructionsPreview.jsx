import React, { useEffect, useRef, useState } from "react";
import { Button } from "@openedx/paragon";
import editIcon from "../../compugrade-assets/edit.svg";
import deleteIcon from "../../compugrade-assets/delete.svg";
import { base_url } from "../../compugrade-constants";

// Update Item Type API Call
const updateItemType = async (itemId, newItemType) => {
  try {
    const response = await fetch(`${base_url}/api/openedx/update_rubric_item`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item_type: newItemType, id: itemId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update item type");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating item type:", error);
  }
};

// Update Item Text API Call
const updateItemText = async (itemId, newText) => {
  try {
    const response = await fetch(`${base_url}/api/openedx/update_rubric_item`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ natural_text: newText, id: itemId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update natural text");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating natural text:", error);
  }
};

// Delete Item API Call
const deleteItem = async (itemId) => {
  try {
    const response = await fetch(
      `${base_url}/api/openedx/delete_rubric_item?item_id=${itemId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete item");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};

const addImageToRubricItem = async (formData, item_id) => {
  try {
    const response = await fetch(`${base_url}/api/openedx/add_image_to_rubric_item?item_id=${item_id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

const InstructionsPreview = ({ lessonData, refreshData }) => {
  const [tasks, setTasks] = useState(lessonData ? lessonData.items : []);
  const [tempEdit, setTempEdit] = useState({ id: null, value: "" });
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null); // Reference to the file input

  useEffect(() => {
    setTasks(lessonData ? lessonData.items : []);
  }, [lessonData]);
  

  const handleItemTypeChange = async (taskId, newItemType) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, item_type: newItemType };
      }
      return task;
    });

    setTasks(updatedTasks);

    await updateItemType(taskId, newItemType);
  };

  const handleEditClick = (taskId, currentText) => {
    setTempEdit({ id: taskId, value: currentText });
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, isEditing: true }
          : { ...task, isEditing: false }
      )
    );
  };

  const handleSaveClick = async () => {
    const { id, value } = tempEdit;

    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, isEditing: false, natural_text: value }
          : task
      )
    );

    setTempEdit({ id: null, value: "" });

    await updateItemText(id, value);
  };

  const handleCancelClick = () => {
    setTasks(
      tasks.map((task) =>
        task.id === tempEdit.id ? { ...task, isEditing: false } : task
      )
    );
    setTempEdit({ id: null, value: "" });
  };

  const handleDeleteClick = async (taskId) => {
    const result = await deleteItem(taskId);
    if (result) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const handleImageChange = async (e, item_id) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(
          `${base_url}/api/openedx/add_image_to_rubric_item?item_id=${item_id}`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        // After successful upload, fetch fresh data
        await refreshData();
        
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click(); // Programmatically trigger file input click
  };

  console.log(tasks);
  

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div>
          {tasks &&
            tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#D9E2EB",
                  borderRadius: "3px",
                  marginTop: "10px",
                }}
              >
                <div className="d-flex justify-content-between">
                  <div
                    style={{
                      padding: "7px 9px",
                      backgroundColor: "white",
                      border: "0.5px solid #00000070",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <select
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        outline: "none",
                      }}
                      value={task.item_type}
                      onChange={(e) =>
                        handleItemTypeChange(task.id, e.target.value)
                      }
                    >
                      <option value="g">Graded</option>
                      <option value="u">Ungraded</option>
                      <option value="c">Certification</option>
                    </select>
                  </div>
                  <div className="d-flex" style={{ gap: "8px" }}>
                    <button
                      style={{
                        backgroundColor: "white",
                        padding: "0 10px",
                        border: "none",
                      }}
                      onClick={() =>
                        handleEditClick(task.id, task.natural_text)
                      }
                    >
                      <img src={editIcon} alt="edit" width={20} height={20} />
                    </button>
                    <button
                      style={{
                        backgroundColor: "white",
                        padding: "0 10px",
                        border: "none",
                      }}
                      onClick={() => handleDeleteClick(task.id)}
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
                    borderLeftColor: `${
                      task.item_type === "g"
                        ? "#104E7F"
                        : task.item_type === "u"
                        ? "#b8b8b8"
                        : "#FF0000"
                    }`,
                    borderRadius: "0px 4px 4px 0px",
                  }}
                >
                  {task.isEditing ? (
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
                      value={task.natural_text}
                      disabled
                    />
                  )}
                </div>
                {task.image && (
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`data:image/png;base64,${task.image}`}
                      alt="Uploaded"
                      style={{ width: "100%", maxWidth: "300px" }}
                    />
                  </div>
                )}
                {task.isEditing && (
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
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        style={{
                          backgroundColor: "white",
                          border: "none",
                          outline: "none",
                        }}
                        onClick={triggerFileInput} // Trigger the file input click when button is clicked
                      >
                        Add Image
                      </Button>
                      <input
                        ref={fileInputRef} // Reference the file input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(e, task.id)} // Handle file input change
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
        {!lessonData && (
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
  );
};

export default InstructionsPreview;
