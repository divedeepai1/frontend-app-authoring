import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import HeaderActionButton from "./ui/HeaderActionButton";

export default function LessonImportExportButtons({
  onExport,
  onImport,
  loading = false,
}) {
  const inputRef = useRef(null);

  return (
    <>
      <div className="flex items-center gap-3">
        <HeaderActionButton
        //   icon={Upload}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          Import
        </HeaderActionButton>
        <HeaderActionButton
        //   icon={Download}
          onClick={onExport}
          disabled={loading}
        >
          Export
        </HeaderActionButton>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onImport(file);
          }
          event.target.value = "";
        }}
      />
    </>
  );
}
