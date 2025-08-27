import { useRef, useState } from "react";
import { Pencil } from "lucide-react";

export default function EditableBlockName({ block, renameBlock }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState(
    block.name ||
      (block.type === "text"
        ? "Add Text Block"
        : block.type === "instruction"
        ? "Instruction"
        : block.type === "doc-comparison"
        ? "Document Comparison"
        : "Add Objective Question")
  );
  const [isFocused, setIsFocused] = useState(false);

  const defaultText =
    block.type === "text"
      ? "Add Text Block"
      : block.type === "instruction"
      ? "Instruction"
      : block.type === "doc-comparison"
      ? "Document Comparison"
      : "Add Objective Question";

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim() === "") {
        setValue(defaultText);
        renameBlock(block.id, defaultText);
      } else {
        renameBlock(block.id, value.trim());
      }
      inputRef.current.blur();
    }
  };

  return (
    <div className="flex items-center group">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (value.trim() === "") {
            setValue(defaultText);
            renameBlock(block.id, defaultText);
          } else {
            renameBlock(block.id, value.trim());
          }
        }}
        onKeyDown={handleKeyDown}
        style={{ width: `${value.length}ch` }}
        placeholder={block.type === "instruction" ? "Instruction" : "Block name"}
        className="text-sm font-medium p-2 rounded text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
      />

    
     

      <div
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="cursor-pointer hidden group-hover:block text-gray-500 hover:text-blue-600 transition-colors ml-2"
      >
        <Pencil size={16} />
      </div>
    </div>
  );
}
