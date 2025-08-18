import { useState, useRef, useEffect } from "react";
import { Form, Badge, Button } from "react-bootstrap";
import { X } from "lucide-react";

export function MultiSelectTags({
  skills = [],
  selectedSkills = [],
  onChange,
  placeholder
}) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  // Filter skills by label, exclude already selected
  const filteredSkills = skills.filter(
    (skill) =>
      !selectedSkills.some((s) => s.value === skill.value) &&
      skill.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectSkill = (skill) => {
    onChange([...selectedSkills, skill]);
    setInputValue("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const matchedSkill = filteredSkills.find(
        (s) => s.label.toLowerCase() === inputValue.toLowerCase()
      );
      if (matchedSkill) {
        handleSelectSkill(matchedSkill);
      }
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedSkills.length > 0
    ) {
      e.preventDefault();
      handleRemoveTag(selectedSkills[selectedSkills.length - 1]);
    }
  };

  const handleRemoveTag = (skillToRemove) => {
    onChange(selectedSkills.filter((s) => s.value !== skillToRemove.value));
  };

  return (
    <div className="position-relative">
      <div className="d-flex flex-wrap gap-2 border rounded bg-white px-2">
        {selectedSkills.map((skill) => (
          <Badge
            key={skill.value}
            style={{ background: "#52b2fc" }}
            className="d-flex align-items-center badge2 mt-2 gap-1"
          >
            {skill.label}
            <Button
              variant="link"
              size="sm"
              className="p-0 text-white border-0 mt-1"
              onClick={() => handleRemoveTag(skill)}
              style={{ fontSize: "0.75rem", lineHeight: 1 }}
            >
              <X size={14} />
              <span className="visually-hidden">Remove {skill.label}</span>
            </Button>
          </Badge>
        ))}

        <Form.Control
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="flex-grow-1"
          style={{
            minWidth: "120px",
            border: "none",
            outline: "none",
            boxShadow: "none"
          }}
          onFocus={() => setShowDropdown(true)} // ✅ Open dropdown on click/focus
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
      </div>

      {showDropdown && filteredSkills.length > 0 && (
        <div
          className="position-absolute bg-white border rounded mt-1 w-100 shadow-sm"
          style={{ zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
        >
          {filteredSkills.map((skill) => (
            <div
              key={skill.value}
              className="px-3 py-2 hover-bg-light"
              style={{ cursor: "pointer" }}
              onMouseDown={() => handleSelectSkill(skill)} // ✅ Click to select
            >
              {skill.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
