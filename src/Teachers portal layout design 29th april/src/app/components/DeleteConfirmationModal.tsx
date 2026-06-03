import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <h2 className="text-[#101828] text-[20px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#6a7282] hover:text-[#364153] transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#dc2626]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[#364153] text-[14px] leading-relaxed">
                {message}
              </p>
              {itemName && (
                <p className="text-[#27576B] text-[14px] font-semibold mt-2">
                  "{itemName}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e5e7eb]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#d1d5db] bg-white text-[#364153] text-[14px] font-medium hover:bg-[#f9fafb] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg bg-[#dc2626] text-white text-[14px] font-medium hover:bg-[#b91c1c] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
