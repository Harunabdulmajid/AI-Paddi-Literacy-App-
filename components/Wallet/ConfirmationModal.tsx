import React from 'react';
import { Loader2, X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isConfirming: boolean;
  confirmText: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirming,
  confirmText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full transform transition-all animate-slide-up relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
            <X size={24} />
        </button>
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                <AlertTriangle size={28} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
                <p className="text-neutral-600 mt-2">{message}</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="font-bold py-2 px-5 rounded-lg text-neutral-600 bg-neutral-200 hover:bg-neutral-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className="flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg bg-primary text-white hover:bg-primary-dark transition disabled:bg-neutral-300"
                    >
                        {isConfirming ? (
                            <><Loader2 className="animate-spin" size={20}/> Please wait...</>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
