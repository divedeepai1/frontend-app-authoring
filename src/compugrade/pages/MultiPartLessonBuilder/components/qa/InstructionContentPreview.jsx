import { useEffect, useMemo, useRef, useState } from "react";

function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function InstructionContentPreview({ html }) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const contentRef = useRef(null);

  const plainText = useMemo(() => stripHtmlToText(html), [html]);
  const hasHtml = typeof html === "string" && html.trim().length > 0;

  const clampStyle = !expanded
    ? {
        display: "-webkit-box",
        WebkitLineClamp: 1,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }
    : undefined;

  if (!hasHtml) {
    return (
      <p className="mt-1 text-sm text-gray-900">
        {plainText ? plainText : "No instruction content"}
      </p>
    );
  }

  useEffect(() => {
    setExpanded(false);
  }, [html]);

  useEffect(() => {
    if (!contentRef.current) return;
    if (expanded) return;
    const el = contentRef.current;
    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
    setNeedsToggle(isOverflowing);
  }, [html, expanded]);

  return (
    <div className="mb-2">
      <div
        ref={contentRef}
        className="text-[14px] text-gray-900 [&_p]:mb-1 [&_p:last-child]:mb-0"
        style={clampStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {needsToggle && (
        <div
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-[13px] text-blue-700 hover:text-blue-800 underline underline-offset-2"
        >
          {expanded ? "Show less" : "Show more"}
        </div>
      )}
    </div>
  );
}
