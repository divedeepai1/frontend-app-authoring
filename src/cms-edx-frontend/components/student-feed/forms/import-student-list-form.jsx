import React, { useState, useEffect } from 'react';
import { fetchCsrfToken } from '../../../../cms-csrftoken';
import { getConfig } from '@edx/frontend-platform';
import { useNavigate } from 'react-router';
import ToastContainer from '../../../../compugrade/pages/MultiPartLessonBuilder/components/ui/toast';

const CsvImportForm = ({setSelectedOption,setAddStudents,isNewStudent, onStudentAdded}) => {
  const [csvFile, setCsvFile] = useState(null);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  // Debug: Log when toasts change
  useEffect(() => {
    console.log("Toasts state updated:", toasts);
  }, [toasts]);

  const addToast = ({ title, message, variant = "info", duration = 5000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast = { id, title, message, variant };
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Simple CSV parser that handles quoted fields
  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validateCsvFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject({ message: 'CSV file is empty.' });
            return;
          }

          const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
          const requiredColumns = ['first_name', 'last_name', 'email', 'password'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));

          if (missingColumns.length > 0) {
            reject({ 
              message: `Missing required columns: ${missingColumns.join(', ')}`,
              missingColumns 
            });
            return;
          }

          // Validate data rows
          const dataRows = lines.slice(1).filter(row => row.trim() !== '');
          
          // Check if file only has headers but no data rows
          if (dataRows.length === 0) {
            reject({ 
              message: 'CSV file contains only headers but no data rows. Please add student data to the file.'
            });
            return;
          }
          
          const errors = [];
          
          dataRows.forEach((row, index) => {
            const values = parseCsvLine(row).map(v => v.trim().replace(/^"|"$/g, ''));
            const rowData = {};
            headers.forEach((header, idx) => {
              rowData[header] = values[idx] || '';
            });

            const rowNum = index + 2; // +2 because index is 0-based and we skip header row
            
            if (!rowData.first_name) {
              errors.push(`Row ${rowNum}: Missing first_name`);
            }
            if (!rowData.last_name) {
              errors.push(`Row ${rowNum}: Missing last_name`);
            }
            if (!rowData.email) {
              errors.push(`Row ${rowNum}: Missing email`);
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
              errors.push(`Row ${rowNum}: Invalid email format (${rowData.email})`);
            }
            if (!rowData.password) {
              errors.push(`Row ${rowNum}: Missing password`);
            }
          });

          if (errors.length > 0) {
            reject({ 
              message: `CSV validation failed. Found ${errors.length} error(s).`,
              errors: errors.slice(0, 10) // Show first 10 errors
            });
            return;
          }

          resolve({ headers, dataRows: dataRows.length });
        } catch (error) {
          reject({ message: 'Failed to parse CSV file. Please check the file format.' });
        }
      };
      reader.onerror = () => {
        reject({ message: 'Failed to read CSV file.' });
      };
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCsvFile(null);
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addToast({
        title: 'Invalid File Type',
        message: 'Please select a valid CSV file.',
        variant: 'error'
      });
      e.target.value = null;
      setCsvFile(null);
      return;
    }

    // Validate the CSV file
    try {
      await validateCsvFile(file);
      setCsvFile(file);
    } catch (error) {
      const errorMessage = error.errors 
        ? `${error.message}\n${error.errors.join('\n')}`
        : error.message;
      addToast({
        title: 'CSV Validation Failed',
        message: errorMessage,
        variant: 'error'
      });
      e.target.value = null;
      setCsvFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    // CSV template content
    const csvContent = 'first_name,last_name,username,email,password\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_students.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!csvFile) {
      addToast({
        title: 'No File Selected',
        message: 'Please select a CSV file to import.',
        variant: 'error'
      });
      return;
    }

    // Validate CSV before submitting
    try {
      await validateCsvFile(csvFile);
    } catch (error) {
      const errorMessage = error.errors 
        ? `${error.message}\n${error.errors.join('\n')}`
        : error.message;
      addToast({
        title: 'CSV Validation Failed',
        message: errorMessage,
        variant: 'error'
      });
      return;
    }

    const token = await fetchCsrfToken();
    const classId = sessionStorage.getItem("classId");
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/add-students-csv/`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'X-CSRFToken': token,
        },
        body: formData
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('Failed to parse response as JSON:', text);
        addToast({
          title: 'Import Error',
          message: 'Failed to parse server response. Please try again.',
          variant: 'error'
        });
        return;
      }

      if (response.ok) {
        console.log("responseData", responseData);
        const results = responseData?.results || {};
        console.log("results", results);
        
        // Ensure we have arrays - handle both array and non-array cases
        const created = Array.isArray(results.created) ? results.created : [];
        const updated = Array.isArray(results.updated) ? results.updated : [];
        const skipped = Array.isArray(results.skipped) ? results.skipped : [];
        const errors = Array.isArray(results.errors) ? results.errors : [];
        
        console.log("Arrays:", { created, updated, skipped, errors });
        
        const createdCount = created.length;
        const updatedCount = updated.length;
        const skippedCount = skipped.length;
        const errorCount = errors.length;

        console.log("Counts:", { createdCount, updatedCount, skippedCount, errorCount });

        // Build detailed success message with all counts
        const countsMessage = `Created: ${createdCount} | Updated: ${updatedCount} | Skipped: ${skippedCount} | Errors: ${errorCount}`;

        console.log("Adding success toast with message:", countsMessage);
        
        // Add toast immediately
        addToast({
          title: 'Import Successful',
          message: `Students processed successfully. ${countsMessage}`,
          variant: 'success',
          duration: 6000
        });

        // Show detailed errors if any
        if (errorCount > 0 && errors.length > 0) {
          const errorMessages = errors.slice(0, 5).join(', ');
          const moreErrors = errorCount > 5 ? ` and ${errorCount - 5} more` : '';
          addToast({
            title: 'Some Errors Occurred',
            message: `Errors: ${errorMessages}${moreErrors}`,
            variant: 'error',
            duration: 7000
          });
        }

        // Delay navigation/state updates to ensure toast is visible
        setTimeout(() => {
          setCsvFile(null);
          const fileInput = document.getElementById("csv-file-input");
          if (fileInput) {
            fileInput.value = null;
          }
          
          if(isNewStudent){
            navigate(-1);
          } else {
            if (onStudentAdded) {
              onStudentAdded();
            } else {
              setAddStudents(false);
              setSelectedOption(null);
            }
          }
        }, 2000);
      } else {
        const errorMessage = responseData?.message || responseData?.error || `Server error: ${response.status} ${response.statusText}`;
        addToast({
          title: 'Import Failed',
          message: errorMessage,
          variant: 'error'
        });
      }
    } catch (error) {
      addToast({
        title: 'Upload Error',
        message: error.message || 'An error occurred while uploading the file. Please try again.',
        variant: 'error'
      });
      console.error("Upload error:", error);
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    document.getElementById("csv-file-input").value = null;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 className="primary-text">Import CSV file</h3>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-link p-0 text-primary"
              onClick={handleDownloadTemplate}
              style={{ textDecoration: 'underline', fontSize: '14px' }}
            >
              Download CSV Template
            </button>
          </div>
        </div>
        
        <p className="mb-2 text-black" style={{ fontWeight: "600" }}>Your file</p>

        <input
          type="file"
          id="csv-file-input"
          accept=".csv"
          className="form-control mb-2 bg-transparent p-2"
          style={{ height: "50px" }}
          onChange={handleFileChange}
        />

        {csvFile && (
          <div className="mb-2">
            <span className="text-success">{csvFile.name}</span>
            <button
              type="button"
              className="btn btn-sm btn-danger ml-2"
              onClick={handleRemoveFile}
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-3">
          <button 
            type="submit" 
            className="primary-button px-4 py-2" 
            disabled={!csvFile}
            style={!csvFile ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            Add Students
          </button>
          <button
            type="button"
            className="secondary-button px-4 py-2 ml-3"
            onClick={() => {
              setSelectedOption(null);
              setAddStudents(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default CsvImportForm;
