import React from "react";
interface UniversalModalProps {
  open: boolean; // ← ADD THIS LINE
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  showActionButton?: boolean;
}


const UniversalModal: React.FC<UniversalModalProps> = ({
  title,
  children,
  onClose,
  onAction,
  actionLabel = "Confirm",
  showActionButton = false,
}) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
    <div
      className="bg-[#1a1a1a] border-4 border-[#0d82da] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl"
      style={{ boxShadow: "0 0 25px #0d82da" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🧠 {title}</h2>
        <button
          onClick={onClose}
          className="text-[#c3c3c3] hover:text-white text-2xl font-bold leading-none"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="mb-6 space-y-4 text-[#c3c3c3]">{children}</div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-silver px-4 py-2 rounded-md">
          Cancel
        </button>
        {showActionButton && onAction && (
          <button onClick={onAction} className="btn-blue px-4 py-2 rounded-md">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default UniversalModal;
