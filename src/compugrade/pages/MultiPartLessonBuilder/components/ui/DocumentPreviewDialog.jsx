import { useEffect, useRef, useState, useMemo } from "react";
import { X, FileText } from "lucide-react";
import { renderAsync } from "docx-preview";


export default function DocumentPreviewDialog({
  open,
  onClose,
  title = "Preview",
  source,
  mimeHint = "",
  nameHint = "",
}) {
  const containerRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");

  const resolved = useMemo(() => {
    if (!source) return { type: "none", url: "" };

    if (typeof source === "string") {
      if (/^data:/i.test(source)) return { type: guessTypeFromDataUrl(source), url: source };
      if (/^https?:\/\//i.test(source)) return { type: guessTypeFromString(source), url: source };

      const mime = mimeHint || guessMimeFromContentOrName(nameHint || "", source);
      const dataUrl = `data:${mime};base64,${source}`;
      return { type: guessTypeFromMime(mime), url: dataUrl };
    }

    try {
      const url = URL.createObjectURL(source);
      const mime =
        source?.type ||
        mimeHint ||
        guessMimeFromContentOrName(source?.name || nameHint || "");
      return {
        type: guessTypeFromMime(mime) || guessTypeFromName(source?.name || ""),
        url,
        blob: source,
      };
    } catch (_) {
      return { type: "unknown", url: "" };
    }
  }, [source, mimeHint, nameHint]);

  useEffect(() => {
    if (!open || resolved.type !== "doc") return;

    const renderDocx = async () => {
      try {
        setErrorMsg("");
        let blob = resolved.blob;

        if (!blob && typeof source === "string") {
          const base64 = source.includes(",") ? source.split(",")[1] : source;
          const byteChars = atob(base64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
        }

        if (!blob) throw new Error("No valid DOCX blob found.");

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          await renderAsync(blob, containerRef.current, null, {
            className: "docx",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          });
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Unable to render DOCX preview.");
      }
    };

    renderDocx();
  }, [open, resolved.type, source]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pt-[5%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-4xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-base font-semibold truncate max-w-[65vw]">{title}</div>
          </div>
          <div
            className="p-1 rounded hover:bg-gray-100 cursor-pointer"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 flex items-center justify-center bg-gray-50" style={{ minHeight: 300 }}>
          {resolved.type === "image" ? (
            <img
              src={resolved.url}
              alt="Preview"
              className="max-h-[70vh] max-w-full object-contain rounded"
            />
          ) : resolved.type === "pdf" ? (
            <iframe
              src={resolved.url}
              title="PDF Preview"
              className="w-full h-[70vh] rounded bg-white"
            />
          ) : resolved.type === "doc" ? (
            errorMsg ? (
              <div className="text-red-600">{errorMsg}</div>
            ) : (
              <div
                ref={containerRef}
                className="docx-preview w-full h-[70vh] overflow-auto bg-white p-4 rounded"
              />
            )
          ) : resolved.url ? (
            <iframe
              src={resolved.url}
              title="Document Preview"
              className="w-full h-[70vh] rounded bg-white"
            />
          ) : (
            <div className="text-gray-600 text-sm">No preview available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function guessTypeFromString(s) {
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(s)) return "image";
  if (/\.(docx?)(\?|$)/i.test(s)) return "doc";
  if (/\.(pdf)(\?|$)/i.test(s)) return "pdf";
  return "unknown";
}

function guessTypeFromDataUrl(s) {
  const m = /^data:([^;,]+)/i.exec(s);
  return guessTypeFromMime(m ? m[1] : "");
}

function guessTypeFromName(name) {
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return "image";
  if (/\.(pdf)$/i.test(name)) return "pdf";
  if (/\.(docx?)$/i.test(name)) return "doc";
  return "unknown";
}

function guessTypeFromMime(mime) {
  if (!mime) return "unknown";
  if (/^image\//i.test(mime)) return "image";
  if (/pdf/i.test(mime)) return "pdf";
  if (/msword|officedocument\.wordprocessingml\.document/i.test(mime)) return "doc";
  return "unknown";
}

function guessMimeFromContentOrName(name = "", base64 = "") {
  if (/\.(png)$/i.test(name)) return "image/png";
  if (/\.(jpe?g)$/i.test(name)) return "image/jpeg";
  if (/\.(gif)$/i.test(name)) return "image/gif";
  if (/\.(webp)$/i.test(name)) return "image/webp";
  if (/\.(svg)$/i.test(name)) return "image/svg+xml";
  if (/\.(pdf)$/i.test(name)) return "application/pdf";
  if (/\.(docx?)$/i.test(name))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}
