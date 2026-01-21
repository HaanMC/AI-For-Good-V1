import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isDanger = false,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-900/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-stone-200 dark:border-stone-700 animate-scale-in">
        <div
          className={`p-6 border-b border-stone-200 dark:border-stone-700 flex items-center gap-4 ${
            isDanger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
          }`}
        >
          <div
            className={`p-3 rounded-full ${
              isDanger
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
            }`}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-800 dark:text-stone-100">
              {title}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg font-bold transition-all text-sm bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all text-sm shadow-lg hover:shadow-xl flex items-center gap-2 ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-accent hover:bg-accent/90 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
