import { useState } from "react"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { getConfig } from "@edx/frontend-platform"
import { useNavigate } from "react-router"
import { Download, FileSpreadsheet, Upload } from "lucide-react"
import { tpToast } from "../../common/tpToast"

const CsvImportForm = ({ setSelectedOption, setAddStudents, isNewStudent, onStudentAdded }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const navigate = useNavigate()

  const notify = ({ title, message, variant = "info", duration }) => {
    const opts = duration ? { description: message, duration } : message
    if (variant === "success") tpToast.success(title, opts)
    else if (variant === "error") tpToast.error(title, opts)
    else tpToast.info(title, opts)
  }

  const parseCsvLine = (line) => {
    const result = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const validateCsvFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "")

          if (lines.length === 0) {
            reject({ message: "CSV file is empty." })
            return
          }

          const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""))
          const requiredColumns = ["first_name", "last_name", "email", "password"]
          const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

          if (missingColumns.length > 0) {
            reject({
              message: `Missing required columns: ${missingColumns.join(", ")}`,
              missingColumns,
            })
            return
          }

          const dataRows = lines.slice(1).filter((row) => row.trim() !== "")

          if (dataRows.length === 0) {
            reject({
              message: "CSV file contains only headers but no data rows. Please add student data to the file.",
            })
            return
          }

          const errors = []

          dataRows.forEach((row, index) => {
            const values = parseCsvLine(row).map((v) => v.trim().replace(/^"|"$/g, ""))
            const rowData = {}
            headers.forEach((header, idx) => {
              rowData[header] = values[idx] || ""
            })

            const rowNum = index + 2

            if (!rowData.first_name) errors.push(`Row ${rowNum}: Missing first_name`)
            if (!rowData.last_name) errors.push(`Row ${rowNum}: Missing last_name`)
            if (!rowData.email) {
              errors.push(`Row ${rowNum}: Missing email`)
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
              errors.push(`Row ${rowNum}: Invalid email format (${rowData.email})`)
            }
            if (!rowData.password) errors.push(`Row ${rowNum}: Missing password`)
          })

          if (errors.length > 0) {
            reject({
              message: `CSV validation failed. Found ${errors.length} error(s).`,
              errors: errors.slice(0, 10),
            })
            return
          }

          resolve({ headers, dataRows: dataRows.length })
        } catch {
          reject({ message: "Failed to parse CSV file. Please check the file format." })
        }
      }
      reader.onerror = () => {
        reject({ message: "Failed to read CSV file." })
      }
      reader.readAsText(file)
    })
  }

  const applyFile = async (file) => {
    if (isImporting) return

    if (!file) {
      setCsvFile(null)
      return
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      notify({
        title: "Invalid file type",
        message: "Please select a valid CSV file.",
        variant: "error",
      })
      setCsvFile(null)
      return
    }

    try {
      await validateCsvFile(file)
      setCsvFile(file)
    } catch (error) {
      const errorMessage = error.errors ? `${error.message}\n${error.errors.join("\n")}` : error.message
      notify({
        title: "CSV validation failed",
        message: errorMessage,
        variant: "error",
      })
      setCsvFile(null)
    }
  }

  const handleFileChange = async (e) => {
    await applyFile(e.target.files?.[0] || null)
    e.target.value = ""
  }

  const handleDownloadTemplate = () => {
    const csvContent = "first_name,last_name,username,email,password\n"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample_students.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!csvFile) {
      notify({
        title: "No file selected",
        message: "Please select a CSV file to import.",
        variant: "error",
      })
      return
    }

    try {
      await validateCsvFile(csvFile)
    } catch (error) {
      const errorMessage = error.errors ? `${error.message}\n${error.errors.join("\n")}` : error.message
      notify({
        title: "CSV validation failed",
        message: errorMessage,
        variant: "error",
      })
      return
    }

    setIsImporting(true)

    try {
      const token = await fetchCsrfToken()
      const classId = sessionStorage.getItem("classId")
      const formData = new FormData()
      formData.append("file", csvFile)

      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/add-students-csv/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": token,
        },
        body: formData,
      })

      let responseData
      try {
        responseData = await response.json()
      } catch {
        notify({
          title: "Import error",
          message: "Failed to parse server response. Please try again.",
          variant: "error",
        })
        return
      }

      if (response.ok) {
        const results = responseData?.results || {}
        const created = Array.isArray(results.created) ? results.created : []
        const updated = Array.isArray(results.updated) ? results.updated : []
        const skipped = Array.isArray(results.skipped) ? results.skipped : []
        const errors = Array.isArray(results.errors) ? results.errors : []

        const countsMessage = `Created: ${created.length} | Updated: ${updated.length} | Skipped: ${skipped.length} | Errors: ${errors.length}`

        notify({
          title: "Import successful",
          message: `Students processed successfully. ${countsMessage}`,
          variant: "success",
          duration: 6000,
        })

        if (errors.length > 0) {
          const errorMessages = errors.slice(0, 5).join(", ")
          const moreErrors = errors.length > 5 ? ` and ${errors.length - 5} more` : ""
          notify({
            title: "Some errors occurred",
            message: `Errors: ${errorMessages}${moreErrors}`,
            variant: "error",
            duration: 7000,
          })
        }

        setTimeout(() => {
          setCsvFile(null)
          if (isNewStudent) {
            navigate(-1)
          } else if (onStudentAdded) {
            onStudentAdded()
          } else {
            setAddStudents(false)
            setSelectedOption(null)
          }
        }, 2000)
      } else {
        const errorMessage =
          responseData?.message || responseData?.error || `Server error: ${response.status} ${response.statusText}`
        notify({
          title: "Import failed",
          message: errorMessage,
          variant: "error",
        })
      }
    } catch (error) {
      notify({
        title: "Upload error",
        message: error.message || "An error occurred while uploading the file. Please try again.",
        variant: "error",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleRemoveFile = () => {
    if (isImporting) return
    setCsvFile(null)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (isImporting) return
    const file = e.dataTransfer.files?.[0]
    if (file) await applyFile(file)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="tp-csv-import-form">
        <div className="tp-csv-import-head">
          <h3 className="tp-title tp-csv-import-title">Import CSV file</h3>
          <button
            type="button"
            className="tp-btn tp-btn-outline tp-csv-template-btn"
            onClick={handleDownloadTemplate}
            disabled={isImporting}
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            Download CSV template
          </button>
        </div>

        <p className="tp-label" style={{ marginBottom: "0.5rem" }}>
          Your file
        </p>

        <label
          className={`tp-csv-dropzone${isDragging ? " tp-csv-dropzone--active" : ""}${csvFile ? " tp-csv-dropzone--has-file" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            type="file"
            id="csv-file-input"
            accept=".csv"
            className="tp-csv-file-input"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          <div className="tp-csv-dropzone-inner">
            {csvFile ? (
              <>
                <FileSpreadsheet size={32} className="tp-csv-dropzone-icon" strokeWidth={1.5} aria-hidden />
                <p className="tp-csv-dropzone-label">{csvFile.name}</p>
                <p className="tp-csv-dropzone-hint">Click or drop a new file to replace</p>
              </>
            ) : (
              <>
                <Upload size={32} className="tp-csv-dropzone-icon" strokeWidth={1.5} aria-hidden />
                <p className="tp-csv-dropzone-label">Click to upload or drag and drop</p>
                <p className="tp-csv-dropzone-hint">CSV with first_name, last_name, email, password columns</p>
              </>
            )}
          </div>
        </label>

        {csvFile ? (
          <div className="tp-csv-file-row">
            <span className="tp-csv-file-name">{csvFile.name}</span>
            <button type="button" className="tp-csv-file-remove" onClick={handleRemoveFile} disabled={isImporting}>
              Remove
            </button>
          </div>
        ) : null}

        <div className="tp-csv-import-actions">
          <button
            type="submit"
            className="tp-btn tp-btn-primary"
            disabled={!csvFile || isImporting}
            aria-busy={isImporting}
          >
            {isImporting ? "Adding students…" : "Add students"}
          </button>
          <button
            type="button"
            className="tp-btn tp-btn-secondary"
            onClick={() => {
              setSelectedOption(null)
              setAddStudents(false)
            }}
            disabled={isImporting}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}

export default CsvImportForm
