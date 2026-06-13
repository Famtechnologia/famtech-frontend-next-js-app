import React from 'react';
import { X } from 'lucide-react';
interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-160 md:z-30">
      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto border border-transparent dark:border-[#30363d]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
          <h2 className="text-xl font-semibold text-green-600 dark:text-[#4ade80]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#e6edf3]">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
