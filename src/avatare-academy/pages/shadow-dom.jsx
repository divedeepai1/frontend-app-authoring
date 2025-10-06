import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";

function ShadowDomPreview({ htmlString, setLessonId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const lesson_id = sessionStorage.getItem("lesson_id");
    if (lesson_id) setLessonId(lesson_id);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let shadow = containerRef.current.shadowRoot;
    if (!shadow) shadow = containerRef.current.attachShadow({ mode: "open" });

    shadow.innerHTML = "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Remove all <script> tags
    doc.querySelectorAll("script").forEach((s) => s.remove());

    // Clone styles safely (disable animations)
    doc.querySelectorAll("style").forEach((styleEl) => {
      const safeStyle = document.createElement("style");
      let cssText = styleEl.textContent;
      cssText = cssText
        .replace(/animation[^;{]+;?/gi, "")
        .replace(/transition[^;{]+;?/gi, "")
        .replace(/@keyframes[\s\S]*?{[\s\S]*?}/gi, "");
      safeStyle.textContent = cssText;
      shadow.appendChild(safeStyle);
    });

    // Clone body content and remove inline event handlers
    if (doc.body) {
      const clonedBody = doc.body.cloneNode(true);
      clonedBody.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
        });
      });
      shadow.appendChild(clonedBody);
    }
  }, [htmlString]);

  return <div ref={containerRef} style={{ width: "100%", minHeight: "100vh" }} />;
}

export default function SomeShadowDomComponent() {
  const [lessonId, setLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Safe Shadow DOM Example</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f9f9f9; }
    h1 { color: #6c2bd9; text-align: center; margin-top: 40px; }
    p { text-align: center; font-size: 18px; color: #444; }
    button { display: block; margin: 20px auto; padding: 10px 20px;
      background: #6c2bd9; color: white; border: none; border-radius: 6px;
      cursor: pointer; }
  </style>
</head>
<body>
  <h1>Shadow DOM Example</h1>
  <button onclick="alert('Hello!')">Click Me</button>
</body>
</html>`);

  const textAreaRef = useRef(null);
  const lineNumberRef = useRef(null);

  const syncScroll = () => {
    if (textAreaRef.current && lineNumberRef.current)
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop;
  };

  const lines = htmlCode.split("\n").length;

  // ✅ Fetch existing HTML on page load (with CSRF)
  useEffect(() => {
    const lesson_id = sessionStorage.getItem("lesson_id");
    if (!lesson_id) {
      setLoading(false);
      return;
    }

    setLessonId(lesson_id);

    const fetchLesson = async () => {
      setLoading(true);
      try {
        const token = await fetchCsrfToken();

        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/quizplugin/api/lesson-content/${lesson_id}/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const result = await response.json();

        if (result?.data?.html_content) {
          setHtmlCode(result.data.html_content);
        }

      } catch (err) {
        console.error("Fetch lesson failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, []);

  // ✅ Save handler
  const handleSave = async () => {
    if (!lessonId) {
      console.error("No lessonId found!");
      return;
    }

    try {
      const token = await fetchCsrfToken();
      const data = { html_content: htmlCode };

      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/lesson-content/${lessonId}/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error(`Failed to save quiz: ${response.status}`);
      await response.json();
      window.history.back();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleCancel = () => window.history.back();

  // ✅ Loader
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "92vh",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left side editor */}
        <div
          style={{
            flex: 1,
            padding: "1rem",
            borderRight: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Insert HTML Here</h2>

          <div
            style={{
              display: "flex",
              flex: 1,
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              overflow: "hidden",
            }}
          >
            {/* Line Numbers */}
            <div
              ref={lineNumberRef}
              style={{
                background: "#f4f4f4",
                padding: "10px 5px",
                textAlign: "right",
                userSelect: "none",
                color: "#888",
                overflow: "hidden",
                overflowY: "auto",
              }}
            >
              {Array.from({ length: lines }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textAreaRef}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              onScroll={syncScroll}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "10px",
                resize: "none",
                lineHeight: "1.4em",
                whiteSpace: "pre",
                fontFamily: "monospace",
                fontSize: "14px",
                overflow:"auto"
              }}
            />
          </div>
        </div>

        {/* Right side live preview */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <ShadowDomPreview htmlString={htmlCode} setLessonId={setLessonId} />
        </div>
      </div>

      {/* Footer buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 0,
          background: "white",
          borderTop: "1px solid #ddd",
          padding: "0.75rem 1.5rem",
          zIndex: 999,
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
