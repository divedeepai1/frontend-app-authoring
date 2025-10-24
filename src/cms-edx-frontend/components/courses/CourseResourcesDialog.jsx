import { useState, useRef } from "react";
import { X } from "lucide-react";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";

const CourseResourcesDialog = ({ isOpen, onClose, classId, courseId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState("general");
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from backend
      const token = await fetchCsrfToken();
      const requestBody = { filename: selectedFile.name };
      
      if (uploadType === "class" && classId) {
        requestBody.classroom = classId;
      } else if (uploadType === "course" && courseId) {
        requestBody.course = courseId;
      }
      // For "general" type, only filename is sent

      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/resources/generate-upload-url/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }

      const { upload_url, s3_key } = await response.json();

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to S3: ${uploadResponse.status}`);
      }

      setUploadProgress(50);

      // Step 3: Save s3_key to backend
      const saveResponse = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/resources/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({ s3_key }),
        }
      );

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save resource: ${saveResponse.status} ${errorText}`);
      }

      setUploadProgress(100);
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
          <div
            onClick={handleClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </div>
        </div>

        {/* Upload Type Dropdown */}
        <div className="p-4 border-b border-gray-200">
          <div>
            <label htmlFor="uploadTypeSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Type:
            </label>
            <select
              id="uploadTypeSelect"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            >
              <option value="general">General Resource</option>
              <option value="class">Upload Resource by Class</option>
              <option value="course">Upload Resource by Course</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-auto">
          {/* File Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              
              {selectedFile ? (
                <div className="w-full p-4 border-2 border-solid border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                      {selectedFile.name}
                    </span>
                    <div
                      onClick={clearSelectedFile}
                      disabled={isUploading}
                      className="transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isUploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Click to select file
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="primary-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseResourcesDialog;