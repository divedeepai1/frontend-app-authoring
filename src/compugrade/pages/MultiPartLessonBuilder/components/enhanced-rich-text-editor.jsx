import React, { useRef, useMemo, useEffect } from "react"
import JoditEditor from "jodit-react"

export function EnhancedRichTextEditor({ content, onContentChange, id, lines }) {
  const editorRef = useRef(null)
  const uniqueId = useRef(id || `editor-${Math.random().toString(36).substr(2, 9)}`)

  const config = useMemo(
    () => ({
      readonly: false,
      // Allow overriding height by specifying number of visible lines
      height: lines ? Math.max(40, lines * 22) : 250,
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

  // Show wysiwyg editor once it's ready (hide textarea flash)
  useEffect(() => {
    const editorContainer = document.querySelector(`#${uniqueId.current}`)
    if (!editorContainer) return

    const showWysiwyg = () => {
      const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
      const textarea = editorContainer.querySelector('textarea')
      
      if (wysiwyg) {
        // Hide textarea if still visible
        if (textarea) {
          textarea.style.display = 'none'
          textarea.style.opacity = '0'
          textarea.style.visibility = 'hidden'
        }
        // Show wysiwyg with fade-in
        wysiwyg.style.opacity = '1'
      }
    }

    // Check immediately and periodically
    const interval = setInterval(() => {
      showWysiwyg()
      const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
      if (wysiwyg && wysiwyg.style.opacity === '1') {
        clearInterval(interval)
      }
    }, 50)

    // Also use MutationObserver for faster detection
    const observer = new MutationObserver(() => {
      showWysiwyg()
    })

    observer.observe(editorContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    // Cleanup after editor is ready
    const timeout = setTimeout(() => {
      showWysiwyg()
      clearInterval(interval)
      observer.disconnect()
    }, 500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [id, content?.html])

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

  // Prevent drag events from editor from bubbling to parent drag handlers
  useEffect(() => {
    if (!editorRef.current) return

    const editorContainer = document.querySelector(`#${uniqueId.current}`)
    if (!editorContainer) return

    // Check if user is selecting text
    let isTextSelection = false
    let mouseDownTime = 0
    let mouseDownTarget = null

    const handleMouseDown = (e) => {
      const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
      const toolbar = editorContainer.querySelector('.jodit-toolbar')
      const workplace = editorContainer.querySelector('.jodit-workplace')
      
      // Check if clicking anywhere in the editor (content area, empty areas, etc.)
      // but NOT in the toolbar
      const isInEditorContent = (
        (wysiwyg && (wysiwyg === e.target || wysiwyg.contains(e.target))) ||
        (workplace && (workplace === e.target || workplace.contains(e.target))) ||
        (editorContainer && (editorContainer === e.target || editorContainer.contains(e.target)))
      )
      
      const isInToolbar = toolbar && (toolbar === e.target || toolbar.contains(e.target))
      
      if (isInEditorContent && !isInToolbar) {
        // User is clicking anywhere in editor content (including empty areas)
        isTextSelection = true
        mouseDownTime = Date.now()
        mouseDownTarget = e.target
        // Prevent drag from starting
        e.stopPropagation()
      } else if (isInToolbar) {
        isTextSelection = false
      }
    }

    const handleMouseMove = (e) => {
      // If mouse moved while button is down, user is likely selecting text
      if (isTextSelection && e.buttons === 1) {
        // Check if there's actually a text selection
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
          isTextSelection = true
        }
      }
    }

    const handleMouseUp = () => {
      // Small delay to allow selection to complete
      setTimeout(() => {
        isTextSelection = false
        mouseDownTarget = null
      }, 100)
    }

    // Stop drag events only if they're not part of text selection
    const stopDragEvents = (e) => {
      // Always stop drag events from editor to prevent parent drag handlers
      // Text selection doesn't use drag events, so this is safe
      e.stopPropagation()
      e.stopImmediatePropagation()
      
      // Only prevent default if it's not a text selection drag
      if (!isTextSelection) {
        e.preventDefault()
      }
      return false
    }

    // Stop drag events at multiple phases
    const eventsToStop = [
      'dragstart',
      'drag',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
      'drop'
    ]

    // Add handlers to editor container and all its children
    const addDragStoppers = (element) => {
      eventsToStop.forEach(eventType => {
        element.addEventListener(eventType, stopDragEvents, true) // capture phase
        element.addEventListener(eventType, stopDragEvents, false) // bubble phase
      })
    }

    // Add mouse event handlers for text selection detection
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)

    // Stop drag on the container itself
    addDragStoppers(editorContainer)

    // Also stop on all child elements (especially wysiwyg area and workplace)
    const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
    const workplace = editorContainer.querySelector('.jodit-workplace')
    const wysiwygChildren = wysiwyg ? Array.from(wysiwyg.querySelectorAll('*')) : []
    const workplaceChildren = workplace ? Array.from(workplace.querySelectorAll('*')) : []
    
    if (wysiwyg) {
      addDragStoppers(wysiwyg)
      // Also add to all children of wysiwyg (including empty paragraphs)
      wysiwygChildren.forEach(child => {
        addDragStoppers(child)
      })
    }
    
    if (workplace) {
      addDragStoppers(workplace)
      // Also add to all children of workplace
      workplaceChildren.forEach(child => {
        addDragStoppers(child)
      })
    }

    // Handle iframe content
    const iframe = editorContainer.querySelector('iframe')
    if (iframe) {
      const setupIframe = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            addDragStoppers(iframeDoc.body)
            iframeDoc.body.querySelectorAll('*').forEach(child => {
              addDragStoppers(child)
            })
          }
        } catch (e) {
          // Cross-origin iframe, can't access
        }
      }

      if (iframe.contentDocument) {
        setupIframe()
      } else {
        iframe.addEventListener('load', setupIframe)
      }
    }

    // Also prevent mousedown from initiating drag on the container
    const preventContainerDrag = (e) => {
      // Prevent drag if clicking anywhere in editor content (including empty areas), not toolbar
      const wysiwyg = editorContainer.querySelector('.jodit-wysiwyg')
      const toolbar = editorContainer.querySelector('.jodit-toolbar')
      const workplace = editorContainer.querySelector('.jodit-workplace')
      
      const isInEditorContent = (
        (wysiwyg && (wysiwyg === e.target || wysiwyg.contains(e.target))) ||
        (workplace && (workplace === e.target || workplace.contains(e.target))) ||
        (editorContainer === e.target || editorContainer.contains(e.target))
      )
      
      const isInToolbar = toolbar && (toolbar === e.target || toolbar.contains(e.target))
      
      if (isInEditorContent && !isInToolbar) {
        // User is clicking anywhere in editor content (including empty areas), prevent any drag
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }

    editorContainer.addEventListener('mousedown', preventContainerDrag, true)

    return () => {
      // Remove mouse event handlers
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseup', handleMouseUp, true)

      // Remove drag event handlers
      eventsToStop.forEach(eventType => {
        editorContainer.removeEventListener(eventType, stopDragEvents, true)
        editorContainer.removeEventListener(eventType, stopDragEvents, false)
      })
      
      if (wysiwyg) {
        eventsToStop.forEach(eventType => {
          wysiwyg.removeEventListener(eventType, stopDragEvents, true)
          wysiwyg.removeEventListener(eventType, stopDragEvents, false)
          wysiwygChildren.forEach(child => {
            child.removeEventListener(eventType, stopDragEvents, true)
            child.removeEventListener(eventType, stopDragEvents, false)
          })
        })
      }
      
      if (workplace) {
        eventsToStop.forEach(eventType => {
          workplace.removeEventListener(eventType, stopDragEvents, true)
          workplace.removeEventListener(eventType, stopDragEvents, false)
          workplaceChildren.forEach(child => {
            child.removeEventListener(eventType, stopDragEvents, true)
            child.removeEventListener(eventType, stopDragEvents, false)
          })
        })
      }

      editorContainer.removeEventListener('mousedown', preventContainerDrag, true)
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
      onDragStart={(e) => {
        // Prevent editor container from being dragged
        e.preventDefault()
        e.stopPropagation()
        return false
      }}
      draggable={false}
    >
      <style>{`
        #${uniqueId.current} {
          user-select: none;
        }
        #${uniqueId.current} .jodit-wysiwyg,
        #${uniqueId.current} .jodit-wysiwyg * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
        /* Hide textarea immediately to prevent flash */
        #${uniqueId.current} textarea {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
        }
        /* Initially hide wysiwyg, will be shown via JS when ready */
        #${uniqueId.current} .jodit-wysiwyg {
          opacity: 0;
          transition: opacity 0.2s ease-in;
        }
        /* Show wysiwyg when opacity is set to 1 */
        #${uniqueId.current} .jodit-wysiwyg[style*="opacity: 1"],
        #${uniqueId.current} .jodit-wysiwyg[style*="opacity:1"] {
          opacity: 1 !important;
        }
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
        #${uniqueId.current} iframe {
          pointer-events: auto !important;
        }
        #${uniqueId.current} iframe body,
        #${uniqueId.current} iframe .jodit-wysiwyg,
        #${uniqueId.current} iframe .jodit-wysiwyg * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
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
