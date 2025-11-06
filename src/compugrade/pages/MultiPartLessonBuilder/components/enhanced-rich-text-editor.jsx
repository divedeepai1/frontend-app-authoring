import React, { useRef, useMemo, useEffect } from "react"
import JoditEditor from "jodit-react"

export function EnhancedRichTextEditor({ content, onContentChange, id }) {
  const editorRef = useRef(null)
  const uniqueId = useRef(id || `editor-${Math.random().toString(36).substr(2, 9)}`)

  const config = useMemo(
    () => ({
      readonly: false,
      height: 250,
      placeholder: "",
      showXPathInStatusbar: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showStatusbar: false,
      toolbarSticky: false,
      toolbarAdaptive: false,
      draggableTags: '',
      allowDragAndDropInEditor: false,
      useIframeResizer: false,
      allowTabNavigation: false, // Disable default tab navigation to handle it manually
      uploader: {
        insertImageAsBase64URI: true
      },
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "align",
        "|",
        "undo",
        "redo",
      ],
      style: {
        background: "#ffffff",
      },
      enter: "P",
      defaultLineHeight: 1.2,
      colors: {
        greyscale: ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF', 'transparent'],
        palette: ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00F0F0', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
        full: [
          '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
          '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
          '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
          '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
          '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#733554',
          '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130',
          'transparent'
        ]
      },
      controls: {
        brush: {
          colors: ['transparent', '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
          removeBackground: true
        }
      },
    }),
    []
  )

  const handleChange = (newContent) => {
    if (onContentChange) {
      onContentChange({ ...content, html: newContent })
    }
  }

  // Handle transparent background in brush tool
  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current.editor
    if (!editor) return

    const handleAfterCommand = (command) => {
      // When brush/color command is executed, check if transparent was selected
      if (command === 'applyStyle' || command === 'brush') {
        setTimeout(() => {
          const selection = editor.selection
          if (selection && selection.range) {
            const range = selection.range
            const container = range.commonAncestorContainer
            
            // Find elements with background color
            const elements = container.nodeType === Node.ELEMENT_NODE 
              ? [container, ...container.querySelectorAll('[style*="background"]')]
              : container.parentElement 
                ? [container.parentElement, ...container.parentElement.querySelectorAll('[style*="background"]')]
                : []
            
            elements.forEach(el => {
              if (el.style && el.style.backgroundColor === 'transparent') {
                el.style.removeProperty('background-color')
              }
            })
          }
        }, 10)
      }
    }

    if (editor.events) {
      editor.events.on('afterCommand', handleAfterCommand)
      
      return () => {
        if (editor.events) {
          editor.events.off('afterCommand', handleAfterCommand)
        }
      }
    }
  }, [])

  // Fix Tab and Backspace handling - only when editor content is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle Tab/Backspace when editor content area is actually focused
      const editorContainer = document.querySelector(`#${uniqueId.current}`)
      if (!editorContainer) return

      // Check if the active element is in the editor's content area (wysiwyg)
      const activeElement = document.activeElement
      const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
      
      // Check if active element is the wysiwyg or inside it
      let isEditorFocused = false
      if (wysiwyg && (wysiwyg === activeElement || wysiwyg.contains(activeElement))) {
        isEditorFocused = true
      } else {
        // Check iframe content if editor uses iframe
        const iframe = editorContainer.querySelector('iframe')
        if (iframe && iframe.contentDocument) {
          const iframeActive = iframe.contentDocument.activeElement
          const iframeWysiwyg = iframe.contentDocument.querySelector('.jodit-wysiwyg')
          if (iframeWysiwyg && (iframeWysiwyg === iframeActive || iframeWysiwyg.contains(iframeActive))) {
            isEditorFocused = true
          }
        }
      }

      // Only handle Tab/Backspace when editor content is focused, not toolbar or other UI
      if (!isEditorFocused) return

      // Get editor instance
      const editor = editorRef.current?.editor
      if (!editor) return

      // Tab key handling
      if (e.key === "Tab") {
        e.preventDefault()
        e.stopPropagation()

        try {
          if (e.shiftKey) {
            // Shift+Tab: outdent
            editor.execCommand("outdent")
          } else {
            // Tab: indent or insert spaces
            const selection = editor.selection
            if (selection && typeof selection.isCollapsed === 'function' && selection.isCollapsed()) {
              // Insert 4 spaces for text formatting
              selection.insertHTML("&nbsp;&nbsp;&nbsp;&nbsp;")
            } else {
              // Indent selected content or list items
              editor.execCommand("indent")
            }
          }
        } catch (err) {
          // Try alternative approach
          try {
            if (e.shiftKey) {
              editor.execCommand("outdent")
            } else {
              editor.execCommand("indent")
            }
          } catch (err2) {
            // If indent/outdent fails, insert spaces
            if (!e.shiftKey) {
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const textNode = document.createTextNode("\u00A0\u00A0\u00A0\u00A0")
                range.insertNode(textNode)
                range.setStartAfter(textNode)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
              }
            }
          }
        }

        return false
      }

      // Backspace key handling
      if (e.key === "Backspace") {
        try {
          const selection = editor.selection
          if (!selection || !selection.range) return

          const range = selection.range
          const startContainer = range.startContainer
          
          if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
            const text = startContainer.nodeValue || ""
            const offset = range.startOffset

            // Check if we're at the start of a line with spaces
            if (offset > 0 && offset <= 4) {
              const beforeText = text.substring(0, offset)
              // If we have spaces or non-breaking spaces at the start, remove them
              if (/^[\s\u00A0]+$/.test(beforeText)) {
                e.preventDefault()
                e.stopPropagation()
                
                // Remove the spaces
                const newText = text.substring(offset)
                startContainer.nodeValue = newText
                
                // Set cursor to the beginning
                range.setStart(startContainer, 0)
                range.collapse(true)
                selection.selectRange(range)
                
                return false
              }
            }
          }
        } catch (err) {
          // Allow default backspace behavior if our handling fails
        }
      }
    }

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])

    return (
    <div
      id={uniqueId.current}
      style={{
        background: "white",
        borderRadius: 8,
      }}
    >
      <style>{`
        #${uniqueId.current} .jodit-container p {
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        #${uniqueId.current} .jodit-wysiwyg p {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.2 !important;
        }
        #${uniqueId.current} .jodit-wysiwyg ul, 
        #${uniqueId.current} .jodit-wysiwyg ol {
          margin: 0 !important;
          padding-left: 20px !important;
          line-height: 1.2 !important;
        }
        #${uniqueId.current} .jodit-wysiwyg li {
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        #${uniqueId.current} .jodit-status-bar {
          display: none !important;
        }
        #${uniqueId.current} .jodit-wysiwyg blockquote {
          margin-left: 40px !important;
        }
        #${uniqueId.current} .jodit-add-new-line {
          display: none !important;
        }
        #${uniqueId.current} .jodit-workplace + * {
          display: none !important;
        }
      `}</style>

      <JoditEditor
          ref={editorRef}
        value={content?.html || ""}
        config={config}
        onBlur={(newContent) => handleChange(newContent)}
        onChange={(newContent) => handleChange(newContent)}
      />
    </div>
  )
}
