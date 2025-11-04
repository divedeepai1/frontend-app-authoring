import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronUp,
  IndentIncrease,
  IndentDecrease,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Type,
} from "lucide-react"

const fontFamilies = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Tahoma",
  "Trebuchet MS",
  "Lucida Console",
  "Palatino Linotype",
  "Garamond",
  "Impact",
  "Comic Sans MS",
  "Segoe UI",
  "Monaco",
  "Aptos",
]

const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72]

export function EnhancedRichTextEditor({
  content,
  onContentChange,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [attachedImages, setAttachedImages] = useState(content?.images || [])
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState(16)
  const [fontColor, setFontColor] = useState("#000000")
  const [highlightColor, setHighlightColor] = useState("#D3D3D3") 

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [align, setAlign] = useState("left")
  const [blockFormat, setBlockFormat] = useState("div")

  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
 
  // Undo/Redo system
  const [commandHistory, setCommandHistory] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isUndoRedo, setIsUndoRedo] = useState(false)
 
  // Save state before applying formatting
  const saveState = () => {
    if (editorRef.current && !isUndoRedo) {
      const newState = {
        html: editorRef.current.innerHTML,
        timestamp: Date.now()
      }
      
      // Remove any states after current index (for new operations)
      const newHistory = commandHistory.slice(0, currentIndex + 1)
      newHistory.push(newState)
      
      // Keep only last 50 states to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      
      setCommandHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
    }
  }
 
  // Undo function
  const undo = () => {
    if (currentIndex > 0) {
      setIsUndoRedo(true)
      const prevState = commandHistory[currentIndex - 1]
      if (editorRef.current && prevState) {
        editorRef.current.innerHTML = prevState.html
        setCurrentIndex(currentIndex - 1)
        updateContent()
      }
      setIsUndoRedo(false)
    }
  }
 
  // Redo function
  const redo = () => {
    if (currentIndex < commandHistory.length - 1) {
      setIsUndoRedo(true)
      const nextState = commandHistory[currentIndex + 1]
      if (editorRef.current && nextState) {
        editorRef.current.innerHTML = nextState.html
        setCurrentIndex(currentIndex + 1)
        updateContent()
      }
      setIsUndoRedo(false)
    }
  }

  useEffect(() => {
    try { document.execCommand("styleWithCSS", false, true) } catch(_) {}

    // Inject CSS for proper text formatting
    const style = document.createElement('style')
    style.textContent = `
      [contenteditable] {
        tab-size: 4;
        -moz-tab-size: 4;
        -o-tab-size: 4;
        -webkit-tab-size: 4;
      }
      [contenteditable] span[style*="font-size"] {
        display: inline;
      }
      [contenteditable] span[style*="color"] {
        display: inline;
      }
      [contenteditable] span[style*="background-color"] {
        display: inline;
      }
      [contenteditable] span[style*="font-family"] {
        display: inline;
      }
      /* Prevent browser selection from being treated as formatting */
      [contenteditable]::selection {
        background-color: rgba(0, 123, 255, 0.3);
      }
      [contenteditable]::-moz-selection {
        background-color: rgba(0, 123, 255, 0.3);
      }
      /* Reduce list indentation to bring bullets closer to text */
      [contenteditable] ul,
      [contenteditable] ol {
        padding-left: 24px;
        margin-left: 0;
        margin-top: 0;
        margin-bottom: 0;
      }
      [contenteditable] li {
        margin-left: 0;
        padding-left: 4px;
        margin-top: 2px;
        margin-bottom: 2px;
      }
    `
    document.head.appendChild(style)

    const handleSelectionChange = () => {
      const sel = window.getSelection && window.getSelection()
      if (!sel || typeof sel.rangeCount !== 'number' || sel.rangeCount === 0) return

      // Check if selection is within our editor
      let range
      try {
        range = sel.getRangeAt(0)
      } catch(_) {
        return
      }
      if (!editorRef.current?.contains(range.commonAncestorContainer)) return

      let node = sel.anchorNode
      if (node?.nodeType === Node.TEXT_NODE) {
        node = node.parentNode
      }

      if (!node) return

      // Find the closest element with styles
      let styleNode = node
      while (styleNode && styleNode !== editorRef.current && styleNode.nodeType === Node.ELEMENT_NODE) {
        const computed = window.getComputedStyle(styleNode)
        
        // Get font family
        const ff = computed.fontFamily.replace(/["']/g, "")
        if (ff && ff !== "serif" && ff !== "sans-serif") {
          setFontFamily(ff.split(",")[0])
        }

        // Get font size
        const fs = parseInt(computed.fontSize)
        if (fs) {
          setFontSize(fs)
        } else {
          setFontSize(16) // fallback
        }

        // Get text color
        const color = rgbToHex(computed.color)
        if (color && color !== "#000000") {
          setFontColor(color)
        }

        // Get background color for highlight - ignore browser selection colors
        const bg = rgbToHex(computed.backgroundColor)
        // Only detect highlight if it's not a browser default selection color (usually blue-ish)
        // Ignore colors like rgba(0, 123, 255, 0.3) or similar browser selection colors
        if (bg && bg !== "#ffffff" && bg !== "rgba(0, 0, 0, 0)" && bg !== "#000000") {
          // Check if it's a browser selection color (usually contains transparency or specific blue values)
          const match = computed.backgroundColor.match(/\d+/g)
          if (match && match.length >= 4) {
            const [r, g, b, a] = match.map(Number)
            // Skip browser selection colors (typically blue with low opacity)
            if (!(r < 50 && g > 100 && b > 200 && a < 0.5)) {
              setHighlightColor(bg)
            }
          } else {
            setHighlightColor(bg)
          }
        }

        break
      }

      // Also check inline styles for more accurate detection
      if (node && node.nodeType === Node.ELEMENT_NODE) {
        const inlineStyle = node.style
        
        if (inlineStyle.fontSize) {
          const fs = parseInt(inlineStyle.fontSize)
          if (fs) setFontSize(fs)
        }
        
        if (inlineStyle.color) {
          const color = inlineStyle.color
          if (color && color !== "#000000") {
            setFontColor(color)
          }
        }
        
        if (inlineStyle.backgroundColor) {
          const bg = inlineStyle.backgroundColor
          if (bg && bg !== "#ffffff" && bg !== "rgba(0, 0, 0, 0)" && bg !== "#000000") {
            // Check if it's a browser selection color
            const match = bg.match(/\d+/g)
            if (match && match.length >= 4) {
              const [r, g, b, a] = match.map(Number)
              // Skip browser selection colors (typically blue with low opacity)
              if (!(r < 50 && g > 100 && b > 200 && a < 0.5)) {
                setHighlightColor(bg)
              }
            } else {
              setHighlightColor(bg)
            }
          }
        }
        
        if (inlineStyle.fontFamily) {
          const ff = inlineStyle.fontFamily.replace(/["']/g, "")
          if (ff && ff !== "serif" && ff !== "sans-serif") {
            setFontFamily(ff.split(",")[0])
          }
        }
      }

      // Update formatting states
      setIsBold(document.queryCommandState("bold"))
      setIsItalic(document.queryCommandState("italic"))
      setIsUnderline(document.queryCommandState("underline"))

      // Update alignment
      if (document.queryCommandState("justifyCenter")) {
        setAlign("center")
      } else if (document.queryCommandState("justifyRight")) {
        setAlign("right")
      } else if (document.queryCommandState("justifyLeft")) {
        setAlign("left")
      } else {
        setAlign("left")
      }

      // Update block format - check the actual tag name
      let currentElement = node
      while (currentElement && currentElement !== editorRef.current) {
        const tagName = currentElement.tagName?.toLowerCase()
        if (tagName === "h1" || tagName === "h2" || tagName === "h3" || tagName === "p") {
          setBlockFormat(tagName)
          break
        }
        currentElement = currentElement.parentNode
      }
      
      // If no heading or paragraph found, default to div
      if (currentElement === editorRef.current || !currentElement) {
        setBlockFormat("div")
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    
    // Also listen for click and keyup events on the editor
    const editor = editorRef.current
    if (editor) {
      editor.addEventListener("click", handleSelectionChange)
      editor.addEventListener("keyup", handleSelectionChange)
      // Stop bubbling to parents that may collapse on outside clicks
      const stop = (e) => e.stopPropagation()
      editor.addEventListener("mousedown", stop)
      editor.addEventListener("mouseup", stop)
      editor.addEventListener("pointerdown", stop)
      // Cleanup for these listeners below
      editor.__stopHandler = stop
    }

    // Global CAPTURE handlers to stop outside click/collapse if event originated inside editor
    const stopIfInsideCapture = (e) => {
      const ed = editorRef.current
      if (ed && ed.contains(e.target)) {
        e.stopPropagation()
      }
    }
    document.addEventListener('mousedown', stopIfInsideCapture, true)
    document.addEventListener('pointerdown', stopIfInsideCapture, true)
    document.addEventListener('click', stopIfInsideCapture, true)
    document.addEventListener('touchstart', stopIfInsideCapture, true)
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
      if (editor) {
        editor.removeEventListener("click", handleSelectionChange)
        editor.removeEventListener("keyup", handleSelectionChange)
        if (editor.__stopHandler) {
          editor.removeEventListener("mousedown", editor.__stopHandler)
          editor.removeEventListener("mouseup", editor.__stopHandler)
          editor.removeEventListener("pointerdown", editor.__stopHandler)
          delete editor.__stopHandler
        }
      }
      document.removeEventListener('mousedown', stopIfInsideCapture, true)
      document.removeEventListener('pointerdown', stopIfInsideCapture, true)
      document.removeEventListener('click', stopIfInsideCapture, true)
      document.removeEventListener('touchstart', stopIfInsideCapture, true)
      // Clean up injected CSS
      if (style && style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === "rgba(0, 0, 0, 0)") return null
    const match = rgb.match(/\d+/g)
    if (!match) return null
    const [r, g, b] = match.map(Number)
    return (
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
        .toLowerCase()
    )
  }

  const formatText = (command, value) => {
    saveState() // Save state before applying formatting
    editorRef.current?.focus()
    
    // Special handling for list commands to preserve existing lists
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        let currentNode = range.commonAncestorContainer
        
        // Find if we're inside a list item
        let listItem = null
        let listType = null
        
        while (currentNode && currentNode !== editorRef.current) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const tagName = currentNode.tagName?.toLowerCase()
            if (tagName === "li") {
              listItem = currentNode
              // Find the parent list
              let parent = currentNode.parentNode
              while (parent && parent !== editorRef.current) {
                if (parent.nodeType === Node.ELEMENT_NODE) {
                  const parentTagName = parent.tagName?.toLowerCase()
                  if (parentTagName === "ul" || parentTagName === "ol") {
                    listType = parentTagName
                    break
                  }
                }
                parent = parent.parentNode
              }
              break
            }
          }
          currentNode = currentNode.parentNode
        }
        
        // If we're already in a list of the same type, don't toggle it off
        // Instead, just ensure we're in a list item
        if (listItem && listType) {
          const requestedType = command === "insertUnorderedList" ? "ul" : "ol"
          if (listType === requestedType) {
            // Already in the correct list type, just ensure cursor is positioned correctly
            return
          } else {
            // Different list type, convert it
            // First exit current list, then create new one
            document.execCommand(command === "insertUnorderedList" ? "insertOrderedList" : "insertUnorderedList", false, null)
            document.execCommand(command, false, null)
            updateContent()
            return
          }
        }
        
        // If we're not in a list, check if we're at the start of a line
        // and if so, create a new list item without affecting other blocks
        if (!listItem) {
          // Collapse selection to start if it's not collapsed
          if (!range.collapsed) {
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
          }
          
          // Find the current block element
          let currentBlock = range.commonAncestorContainer
          while (currentBlock && currentBlock !== editorRef.current) {
            if (currentBlock.nodeType === Node.ELEMENT_NODE) {
              const tagName = currentBlock.tagName?.toLowerCase()
              if (tagName === "p" || tagName === "div" || tagName === "h1" || tagName === "h2" || tagName === "h3") {
                // Check if we're at the start of this block
                const isAtStart = range.collapsed && 
                  (range.startContainer.nodeType === Node.TEXT_NODE
                    ? range.startOffset === 0
                    : range.startOffset === 0)
                
                if (isAtStart || currentBlock.textContent.trim() === "") {
                  // Create a new list item for this block only
                  const tempRange = document.createRange()
                  tempRange.selectNodeContents(currentBlock)
                  tempRange.collapse(true)
                  selection.removeAllRanges()
                  selection.addRange(tempRange)
                  
                  document.execCommand(command, false, null)
                  updateContent()
                  return
                }
                break
              }
            }
            currentBlock = currentBlock.parentNode
          }
        }
      }
    }
    
    // Special handling for color commands
    if (command === "foreColor" || command === "hiliteColor") {
      document.execCommand("styleWithCSS", false, true)
    }
    
    document.execCommand(command, false, value)
    updateContent()
    
    // Update states immediately after command
    setTimeout(() => {
      setIsBold(document.queryCommandState("bold"))
      setIsItalic(document.queryCommandState("italic"))
      setIsUnderline(document.queryCommandState("underline"))
      
      if (document.queryCommandState("justifyCenter")) {
        setAlign("center")
      } else if (document.queryCommandState("justifyRight")) {
        setAlign("right")
      } else {
        setAlign("left")
      }
    }, 10)
  }

  // New function to apply text color properly
  const applyTextColor = (color) => {
    saveState() // Save state before applying color
    setFontColor(color)
    editorRef.current?.focus()
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      if (!range.collapsed) {
        // Apply color to selected text
        const span = document.createElement("span")
        span.style.color = color
        try {
          range.surroundContents(span)
        } catch (e) {
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
      } else {
        // Cursor only - create a span for new text
        const span = document.createElement("span")
        span.style.color = color
        span.appendChild(document.createTextNode("\u200B"))
        range.insertNode(span)
        
        // Move cursor inside span
        const newRange = document.createRange()
        newRange.setStart(span.firstChild, 1)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
    updateContent()
  }

  // New function to apply highlight color properly
  const applyHighlightColor = (color) => {
    saveState() // Save state before applying highlight
    setHighlightColor(color)
    editorRef.current?.focus()
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      if (!range.collapsed) {
        // Apply highlight to selected text
        const span = document.createElement("span")
        span.style.backgroundColor = color
        try {
          range.surroundContents(span)
        } catch (e) {
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
      } else {
        // Cursor only - create a span for new text
        const span = document.createElement("span")
        span.style.backgroundColor = color
        span.appendChild(document.createTextNode("\u200B"))
        range.insertNode(span)
        
        // Move cursor inside span
        const newRange = document.createRange()
        newRange.setStart(span.firstChild, 1)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current && onContentChange) {
      // Save state for undo if not already saved
      if (!isUndoRedo) {
        saveState()
      }
      onContentChange({
        ...content,
        html: editorRef.current.innerHTML,
      })
    }
  }

  useEffect(() => {
    const html = content?.html || ""
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html
      // Save initial state for undo
      if (commandHistory.length === 0) {
        setCommandHistory([{ html, timestamp: Date.now() }])
        setCurrentIndex(0)
      }
    }
    if (Array.isArray(content?.images)) {
      setAttachedImages(content.images)
    }
  }, [content?.html])

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      saveState() // Save state before inserting image
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result
        const newImages = [...attachedImages, imageUrl]
        setAttachedImages(newImages)

        const img = document.createElement("img")
        img.src = imageUrl
        img.style.maxWidth = "100%"
        img.style.height = "auto"
        img.style.margin = "10px 0"
        img.style.borderRadius = "8px"
        img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"

        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.insertNode(img)
          range.collapse(false)
        } else {
          editorRef.current?.appendChild(img)
        }

        updateContent()
      }
      reader.readAsDataURL(file)
    }
  }

  const applyFontFamily = (family) => {
    saveState() // Save state before applying font family
    setFontFamily(family)
    editorRef.current?.focus()
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      if (!range.collapsed) {
        // Apply to selected text
        const span = document.createElement("span")
        span.style.fontFamily = family
        try {
          range.surroundContents(span)
        } catch (e) {
          // If surroundContents fails, extract and reinsert
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
        }
      } else {
        // Cursor only - create a span for new text
        const span = document.createElement("span")
        span.style.fontFamily = family
        span.appendChild(document.createTextNode("\u200B"))
        range.insertNode(span)
        
        // Move cursor inside span
        const newRange = document.createRange()
        newRange.setStart(span.firstChild, 1)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    } else {
      // No selection - apply to current cursor position
      const span = document.createElement("span")
      span.style.fontFamily = family
      span.appendChild(document.createTextNode("\u200B"))
      
      if (editorRef.current) {
        editorRef.current.appendChild(span)
        
        // Move cursor to the new span
        const newRange = document.createRange()
        newRange.setStart(span.firstChild, 1)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
    
    updateContent()
  }

  // --- fix applyFontSize ---
const applyFontSize = (px) => {
  saveState() // Save state before applying font size
  setFontSize(px)
  editorRef.current?.focus()

  const selection = window.getSelection && window.getSelection()
  if (selection && typeof selection.rangeCount === 'number' && selection.rangeCount > 0) {
    let range
    try {
      range = selection.getRangeAt(0)
    } catch(_) { range = null }

    if (range && !range.collapsed) {
      // Apply to selected text
      const span = document.createElement("span")
      span.style.fontSize = px + "px"
      try {
        range.surroundContents(span)
      } catch (e) {
        // If surroundContents fails, extract and reinsert
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
    } else {
      // Cursor only - create a span for new text
      const span = document.createElement("span")
      span.style.fontSize = px + "px"
      span.appendChild(document.createTextNode("\u200B"))
      range.insertNode(span)

      // Move cursor inside span
      const newRange = document.createRange()
      newRange.setStart(span.firstChild, 1)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  } else {
    // No selection - apply to current cursor position
    const span = document.createElement("span")
    span.style.fontSize = px + "px"
    span.appendChild(document.createTextNode("\u200B"))
    
    if (editorRef.current) {
      editorRef.current.appendChild(span)
      
      // Move cursor to the new span
      const newRange = document.createRange()
      newRange.setStart(span.firstChild, 1)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }

  updateContent()
}


 // --- fix applyBlockFormat ---
const applyBlockFormat = (tag) => {
  saveState() // Save state before applying block format
  setBlockFormat(tag)
  editorRef.current?.focus()
  
  const selection = window.getSelection && window.getSelection()
  if (selection && typeof selection.rangeCount === 'number' && selection.rangeCount > 0) {
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    
    if (range) {
      // Find the current block element
      let currentBlock = range.commonAncestorContainer
      while (currentBlock && currentBlock !== editorRef.current && currentBlock.nodeType !== Node.ELEMENT_NODE) {
        currentBlock = currentBlock.parentNode
      }
      
      if (currentBlock && currentBlock !== editorRef.current) {
        // Create new block element
        const newBlock = document.createElement(tag)
        
        // Move all content to new block
        while (currentBlock.firstChild) {
          newBlock.appendChild(currentBlock.firstChild)
        }
        
        // Replace old block with new one
        currentBlock.parentNode.insertBefore(newBlock, currentBlock)
        currentBlock.parentNode.removeChild(currentBlock)
        
        // Update selection
        const newRange = document.createRange()
        newRange.selectNodeContents(newBlock)
        newRange.collapse(false)
        selection.removeAllRanges()
        selection.addRange(newRange)
      } else {
        // No block found, create new one
        const newBlock = document.createElement(tag)
        newBlock.appendChild(document.createTextNode("\u200B"))
        editorRef.current.appendChild(newBlock)
        
        // Move cursor to new block
        const newRange = document.createRange()
        newRange.setStart(newBlock.firstChild, 1)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
  } else {
    // No selection - create new block
    const newBlock = document.createElement(tag)
    newBlock.appendChild(document.createTextNode("\u200B"))
    editorRef.current.appendChild(newBlock)
    
    // Move cursor to new block
    const selection = window.getSelection()
    const newRange = document.createRange()
    newRange.setStart(newBlock.firstChild, 1)
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }
  
  updateContent()
}


  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault()
      saveState() // Save state before inserting tab
      
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        
        // Insert tab character (4 spaces or actual tab)
        const tabText = document.createTextNode("\t")
        range.insertNode(tabText)
        
        // Move cursor after tab
        range.setStartAfter(tabText)
        range.setEndAfter(tabText)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        
        updateContent()
      }
    } else if (e.key === "Enter") {
      // Handle Enter key for lists - ensure lists continue properly and allow easy exit
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        let currentNode = range.commonAncestorContainer
        
        // Find if we're inside a list item
        let listItem = null
        let listType = null
        
        while (currentNode && currentNode !== editorRef.current) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const tagName = currentNode.tagName?.toLowerCase()
            if (tagName === "li") {
              listItem = currentNode
              // Find the parent list
              let parent = currentNode.parentNode
              while (parent && parent !== editorRef.current) {
                if (parent.nodeType === Node.ELEMENT_NODE) {
                  const parentTagName = parent.tagName?.toLowerCase()
                  if (parentTagName === "ul" || parentTagName === "ol") {
                    listType = parentTagName
                    break
                  }
                }
                parent = parent.parentNode
              }
              break
            }
          }
          currentNode = currentNode.parentNode
        }
        
        if (listItem && listType) {
          // Check if list item is empty
          const isEmpty = listItem.textContent.trim() === "" || listItem.textContent === ""
          
          // Check if cursor is at the start of the list item
          let isAtStart = false
          if (range.collapsed) {
            if (range.startContainer === listItem || listItem.contains(range.startContainer)) {
              if (range.startContainer.nodeType === Node.TEXT_NODE) {
                isAtStart = range.startOffset === 0
              } else {
                // Check if we're before the first child or at the start
                const firstChild = listItem.firstChild
                if (!firstChild) {
                  isAtStart = true
                } else {
                  try {
                    const testRange = document.createRange()
                    testRange.setStartBefore(firstChild)
                    testRange.setEnd(range.startContainer, range.startOffset)
                    isAtStart = testRange.collapsed
                  } catch {
                    isAtStart = range.startOffset === 0
                  }
                }
              }
            }
          }
          
          // Check if cursor is at the end of the list item
          let isAtEnd = false
          if (range.collapsed) {
            if (range.endContainer === listItem || listItem.contains(range.endContainer)) {
              if (range.endContainer.nodeType === Node.TEXT_NODE) {
                isAtEnd = range.endOffset === range.endContainer.length
              } else {
                const lastChild = listItem.lastChild
                if (!lastChild) {
                  isAtEnd = true
                } else {
                  try {
                    const testRange = document.createRange()
                    testRange.setStart(range.endContainer, range.endOffset)
                    testRange.setEndAfter(lastChild)
                    isAtEnd = testRange.collapsed
                  } catch {
                    isAtEnd = false
                  }
                }
              }
            }
          }
          
          // If empty and at start, exit the list
          if (isEmpty && isAtStart) {
            e.preventDefault()
            saveState()
            
            // Remove the list item and create a paragraph
            const p = document.createElement("p")
            p.appendChild(document.createTextNode("\u200B"))
            
            // Replace list item with paragraph
            if (listItem.parentNode) {
              listItem.parentNode.insertBefore(p, listItem)
              listItem.parentNode.removeChild(listItem)
            } else {
              editorRef.current?.appendChild(p)
            }
            
            // Move cursor to new paragraph
            const newRange = document.createRange()
            newRange.setStart(p.firstChild, 1)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            updateContent()
            return
          }
          
          // If empty and at end, also allow exit (double Enter)
          if (isEmpty && isAtEnd) {
            // Check if this is the second empty item in a row (double Enter)
            const prevSibling = listItem.previousElementSibling
            if (prevSibling && prevSibling.tagName?.toLowerCase() === "li" && 
                (prevSibling.textContent.trim() === "" || prevSibling.textContent === "")) {
              e.preventDefault()
              saveState()
              
              // Exit the list
              const p = document.createElement("p")
              p.appendChild(document.createTextNode("\u200B"))
              
              if (listItem.parentNode) {
                listItem.parentNode.insertBefore(p, listItem)
                listItem.parentNode.removeChild(listItem)
              } else {
                editorRef.current?.appendChild(p)
              }
              
              const newRange = document.createRange()
              newRange.setStart(p.firstChild, 1)
              newRange.collapse(true)
              selection.removeAllRanges()
              selection.addRange(newRange)
              
              updateContent()
              return
            }
          }
          
          // Save state before Enter
          saveState()
          
          // Handle empty list items - manually create new list item
          if (isEmpty && !isAtStart) {
            e.preventDefault()
            
            // Create a new list item
            const newLi = document.createElement("li")
            newLi.appendChild(document.createTextNode("\u200B"))
            
            // Insert after current list item
            if (listItem.parentNode && listItem.nextSibling) {
              listItem.parentNode.insertBefore(newLi, listItem.nextSibling)
            } else if (listItem.parentNode) {
              listItem.parentNode.appendChild(newLi)
            }
            
            // Move cursor to new list item
            const newRange = document.createRange()
            newRange.setStart(newLi.firstChild, 1)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            updateContent()
            return
          }
          
          // For non-empty items, let browser handle Enter naturally
          // But check if list was broken afterwards
          setTimeout(() => {
            const newSel = window.getSelection()
            if (newSel && newSel.rangeCount > 0) {
              const newRange = newSel.getRangeAt(0)
              let newNode = newRange.commonAncestorContainer
              let stillInList = false
              
              // Check if we're still in a list
              while (newNode && newNode !== editorRef.current) {
                if (newNode.nodeType === Node.ELEMENT_NODE) {
                  const tagName = newNode.tagName?.toLowerCase()
                  if (tagName === "ul" || tagName === "ol") {
                    stillInList = true
                    break
                  } else if (tagName === "li") {
                    const parent = newNode.parentNode
                    if (parent && (parent.tagName?.toLowerCase() === "ul" || parent.tagName?.toLowerCase() === "ol")) {
                      stillInList = true
                      break
                    }
                  }
                }
                newNode = newNode.parentNode
              }
              
              // If list was broken, restore it
              if (!stillInList && listType) {
                const command = listType === "ul" ? "insertUnorderedList" : "insertOrderedList"
                document.execCommand(command, false, null)
                updateContent()
              }
            }
          }, 10)
        }
      }
    }
  }

  // Global keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === "z") {
          e.preventDefault()
          undo()
        } else if (e.key === "y") {
          e.preventDefault()
          redo()
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])



  if (isCollapsed) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 truncate">
            {content?.html
              ? content.html.replace(/<[^>]*>/g, "").substring(0, 100) + "..."
              : "Empty text content"}
              
          </div>
          <div
            onClick={onToggleCollapse}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="p-3 shadow-sm border border-blue-200 rounded-lg bg-white focus:bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
         

            {/* Bold/Italic/Underline */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <div
                onClick={() => formatText("bold")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  isBold ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
              >
                <Bold className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("italic")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  isItalic ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
              >
                <Italic className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("underline")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  isUnderline ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
              >
                <Underline className="w-4 h-4" />
              </div>
            </div>

            {/* Headings - Fixed spacing */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <div
                onClick={() => applyBlockFormat("h1")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  blockFormat === "h1" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </div>
              <div
                onClick={() => applyBlockFormat("h2")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  blockFormat === "h2" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </div>
              <div
                onClick={() => applyBlockFormat("h3")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  blockFormat === "h3" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </div>
              <div
                onClick={() => applyBlockFormat("p")}
                className={`h-8 w-8 rounded text-sm font-normal flex items-center justify-center transition-colors ${
                  blockFormat === "p" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Paragraph"
              >
                P
              </div>
            </div>

            {/* Font family */}
            <div className="flex items-center border-r pr-2 mr-2">
              <select
                value={fontFamily}
                onChange={(e) => applyFontFamily(e.target.value)}
                className="px-2 py-1 border rounded text-sm min-w-[120px]"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div className="flex items-center border-r pr-2 mr-2">
              <select
                value={fontSize}
                onChange={(e) => applyFontSize(parseInt(e.target.value))}
                className="px-2 py-1 border rounded text-sm w-16"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Font color */}
            <div className="flex items-center border-r pr-2 mr-2">
              <input
                type="color"
                value={fontColor}
                onChange={(e) => {
                  setFontColor(e.target.value)
                  applyTextColor(e.target.value)
                }}
                className="w-8 h-8 border rounded cursor-pointer"
                title="Text Color"
              />
              <Type className="w-4 h-4 text-blue-400" />
            </div>

            {/* Highlighter */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value)
                  applyHighlightColor(e.target.value)
                }}
                className="w-8 h-8 border rounded cursor-pointer"
                title="Highlight Color"
              />
              <Highlighter className="w-4 h-4 text-blue-400" />
            </div>

            {/* Lists */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <div
                onClick={() => formatText("insertUnorderedList")}
                className="h-8 w-8 hover:bg-blue-100 rounded flex items-center justify-center transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("insertOrderedList")}
                className="h-8 w-8 hover:bg-blue-100 rounded flex items-center justify-center transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </div>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <div
                onClick={() => formatText("justifyLeft")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  align === "left" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("justifyCenter")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  align === "center" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("justifyRight")}
                className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                  align === "right" ? "bg-blue-200 text-blue-700" : "hover:bg-blue-100"
                }`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </div>
            </div>

            {/* Indentation */}
            <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
              <div
                onClick={() => formatText("indent")}
                className="h-8 w-8 hover:bg-blue-100 rounded flex items-center justify-center transition-colors"
                title="Increase Indent"
              >
                <IndentIncrease className="w-4 h-4" />
              </div>
              <div
                onClick={() => formatText("outdent")}
                className="h-8 w-8 hover:bg-blue-100 rounded flex items-center justify-center transition-colors"
                title="Decrease Indent"
              >
                <IndentDecrease className="w-4 h-4" />
              </div>
            </div>

            {/* Image */}
            {/* <div
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 hover:bg-green-50 rounded flex items-center justify-center transition-colors"
              title="Insert Image"
            >
              <Image className="w-4 h-4" />
            </div> */}
          </div>

          {/* {onToggleCollapse && (
            <div
              onClick={onToggleCollapse}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </div>
          )} */}
        </div>
      </div>
     

      {/* Editable area */}
      <div
        className="p-1 shadow-sm border border-blue-200 rounded-lg bg-white"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[170px] p-2 px-3 border-2  rounded-lg focus:outline-none   transition-all"
          style={{ 
            whiteSpace: "pre-wrap",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            lineHeight: "1.5"
          }}
          onInput={updateContent}
          onKeyDown={handleKeyDown}
          onClick={() => editorRef.current?.focus()}
          suppressContentEditableWarning={true}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}