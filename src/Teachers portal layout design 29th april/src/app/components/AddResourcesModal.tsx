import { X, Upload as UploadIcon } from 'lucide-react';
import { useState } from 'react';

interface AddResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (uploadType: string, file: File | null) => void;
}

export default function AddResourcesModal({ isOpen, onClose, onUpload }: AddResourcesModalProps) {
  const [uploadType, setUploadType] = useState('general-resource');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    onUpload(uploadType, selectedFile);
    setSelectedFile(null);
    setUploadType('general-resource');
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadType('general-resource');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <h2 className="text-[#101828] text-[20px] font-semibold">Resources</h2>
          <button
            onClick={handleCancel}
            className="text-[#6a7282] hover:text-[#364153] transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Type Dropdown */}
          <div>
            <label className="block text-[#364153] text-[14px] font-medium mb-2">
              Upload Type:
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg text-[16px] bg-white focus:outline-none focus:ring-2 focus:ring-[#27aae1] focus:border-transparent"
            >
              <option value="general-resource">General Resource</option>
              <option value="upload-by-class">Upload resource by class</option>
              <option value="upload-by-course">Upload resource by course</option>
            </select>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-[#364153] text-[14px] font-medium mb-2">
              Select File
            </label>
            <div
              className="border-2 border-dashed border-[#d1d5db] rounded-lg p-12 text-center bg-white"
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <UploadIcon className="w-8 h-8 text-[#27aae1] mx-auto" strokeWidth={2} />
                  <p className="text-[#364153] text-[14px] font-medium">
                    {selectedFile.name}
                  </p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-[#27aae1] text-[13px] font-medium hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-[#6a7282] text-[14px]">
                    Click to select file
                  </p>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e5e7eb]">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`px-5 py-2.5 rounded-lg text-white text-[14px] font-medium transition-colors ${
              selectedFile
                ? 'bg-[#27aae1] hover:bg-[#1e88c9]'
                : 'bg-[#d1d5db] cursor-not-allowed'
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}