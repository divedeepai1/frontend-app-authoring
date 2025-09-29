import { useState, useEffect, useRef } from "react";

function ShadowDomPreview({ htmlString }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let shadow = containerRef.current.shadowRoot;
    if (!shadow) {
      shadow = containerRef.current.attachShadow({ mode: "open" });
    }

    shadow.innerHTML = "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // ✅ inject styles
    doc.querySelectorAll("style").forEach((style) => {
      shadow.appendChild(style.cloneNode(true));
    });

    // ✅ inject body content
    if (doc.body) {
      shadow.appendChild(doc.body.cloneNode(true));
    }

    // ✅ process scripts
    doc.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");

      // copy attributes
      [...oldScript.attributes].forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.src) {
        // external script
        newScript.src = oldScript.src;
      } else if (oldScript.textContent) {
        const code = oldScript.textContent;

        // wrap with sandboxed environment
        newScript.textContent = `
          (function(shadowRoot){
            try {
              // shadow-aware document shim
              const shadowDoc = {
                createElement: (...args) => document.createElement(...args),
                getElementById: (...args) => shadowRoot.getElementById(...args),
                querySelector: (...args) => shadowRoot.querySelector(...args),
                querySelectorAll: (...args) => shadowRoot.querySelectorAll(...args),
                body: shadowRoot
              };

              // patch appendChild for body-like usage
              shadowDoc.body.appendChild = (...args) => shadowRoot.appendChild(...args);

              // sandboxed timers
              const timers = new Set();
              const setInterval = (fn, ms, ...a) => {
                const id = window.setInterval(fn, ms, ...a);
                timers.add(id);
                return id;
              };
              const setTimeout = (fn, ms, ...a) => {
                const id = window.setTimeout(fn, ms, ...a);
                timers.add(id);
                return id;
              };
              const clearInterval = (id) => { timers.delete(id); window.clearInterval(id); };
              const clearTimeout = (id) => { timers.delete(id); window.clearTimeout(id); };

              // expose patched APIs
              const document = shadowDoc;
              const window = globalThis;

              ${code}
            } catch(e) {
              console.error("Shadow DOM script error:", e);
            }
          })(window.__shadowDomPreviewRoot);
        `;
      }

      shadow.appendChild(newScript);
    });

    // ✅ global handle for later scripts
    window.__shadowDomPreviewRoot = shadow;

    return () => {
      // cleanup: clear timers if component unmounts
      // (injected code already tracks them in "timers" set)
    };
  }, [htmlString]);

  return <div ref={containerRef} style={{ width: "100%", minHeight: "100vh" }} />;
}
export default function SomeShadowDomComponent() {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NeuralFlow AI</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f9f9f9; }
    h1 { color: #6c2bd9; text-align: center; margin-top: 40px; }
    p { text-align: center; font-size: 18px; color: #444; }
    button { display: block; margin: 20px auto; padding: 10px 20px; background: #6c2bd9; color: white; border: none; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>🚀 NeuralFlow AI</h1>
  <p>The Future of Intelligence</p>
  <button onclick="alert('Hello from inside the iframe!')">Click Me</button>
</body>
</html>`);

  const textAreaRef = useRef(null);
  const lineNumberRef = useRef(null);

  // keep textarea and line numbers in sync
  const syncScroll = () => {
    if (textAreaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  const lines = htmlCode.split("\n").length;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
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
        <h2 style={{ marginBottom: "0.5rem" }}>Insert HTML</h2>

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
              overflow: "auto",
            }}
          />
        </div>
      </div>

      {/* Right side live preview */}
      <div style={{ flex: 1 , overflow: "auto" }}>
        <ShadowDomPreview htmlString={htmlCode} />
      </div>
    </div>
  );
}
