import React, { useEffect, useRef, useState } from "react";
import "./MultiSelectInput.css";
import { base_url } from "../../compugrade-constants";
import { useParams } from "react-router";

export default function MultiSelectInput({
  search,
  setSearch,
  selected,
  setSelected,
  setSkills,
  fromSkills,
  skills,
  customerFacing,
}) {
  const wrapperRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const { blockId, sequenceId, courseId } = useParams();
  const encodedBlockId = encodeURIComponent(blockId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_url}/api/openedx/get_skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        const fetchedOptions =
          data?.skills?.map((item, index) => {
            const rubricString = item.rubric_titles?.join(", ") || "";
            const label = rubricString
              ? `${item.skill} - Already used in lesson: ${rubricString}`
              : item.skill;

            return {
              id: index + 1,
              label: label,
              value: item.skill,
              color: item.color || "orange",
            };
          }) || [];
        setOptions(fetchedOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    if (customerFacing) {
      console.log(skills)
      const newOptions = skills.map((item) => ({
        id: item.id,
        label: item.customer_facing_name,
        value: item.skill_json,
        color: item.color || "orange",
      }));
      setOptions(newOptions);
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options?.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((sel) => sel.label == opt.label)
  );

  const handleSelect = (option) => {
    setSelected((prev) => [...prev, option]);
    setSearch("");
  };
  
  const handleRemove = (label) => {
    setSelected((prev) => prev.filter((s) => s.label !== label));
  };

  



  return (
    <div className="multi-select-wrapper mt-3" ref={wrapperRef}>
      <div className="input-container" onClick={() => setIsDropdownOpen(true)}>
        {selected.map((item) => (
          <span
            key={item.id}
            className={`badge mt-2 ${
              item.color === "red" ? "badge-red" : "badge-orange"
            }`}
          >
            {customerFacing ? item.label : item.value}
            <button onClick={() => handleRemove(item.label)}>&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control p-2"
          style={{ background: "#EFF6F7", outline: "none" }}
          placeholder=""
          onHover={(e) => {
            e.target.style.outline = "none";
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = "#EFF6F7";
          }}
          onFocus={(e) => {
            e.target.style.outline = "none";
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = "#EFF6F7";
            setIsDropdownOpen(true);
          }}
          onBlur={(e) => {
            e.target.style.outline = "none";
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = "#EFF6F7";
          }}
        />
      </div>
      {isDropdownOpen && filteredOptions.length > 0 && (
        <ul className="dropdown-list">
          {filteredOptions.map((opt) => (
            <li key={opt.id} onClick={() => handleSelect(opt)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
