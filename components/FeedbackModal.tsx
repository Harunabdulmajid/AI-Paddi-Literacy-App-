import React, { useState, useContext } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { apiService } from '../services/apiService';
import { FeedbackType } from '../types';
import { Loader2, X, ThumbsUp } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmissionStatus = 'idle' | 'submitting' | 'submitted';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const context = useContext(AppContext);
  const t = useTranslations();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(FeedbackType.General);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');

  if (!isOpen) return null;
  if (!context || !context.user) {
    // Should not happen if modal is opened from a logged-in view
    onClose(); 
    return null;
  }
  const { user } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status === 'submitting') return;

    setStatus('submitting');
    try {
      await apiService.submitFeedback(user.email, feedbackType, message);
      setStatus('submitted');
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setStatus('idle'); // Or show an error state
    }
  };

  const handleClose = () => {
    // Reset form for next time
    setTimeout(() => {
        setFeedbackType(FeedbackType.General);
        setMessage('');
        setStatus('idle');
    }, 300); // Allow for closing animation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full transform transition-all animate-slide-up relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
            <X size={24} />
        </button>

        {status === 'submitted' ? (
            <div className="text-center py-8">
                <ThumbsUp className="text-secondary mx-auto" size={48} />
                <h2 className="text-2xl font-bold text-neutral-800 mt-4">{t.feedback.successTitle}</h2>
                <p className="text-neutral-600 mt-2">{t.feedback.successDescription}</p>
                <button
                    onClick={handleClose}
                    className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
                >
                    {t.common.close}
                </button>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-neutral-800">{t.feedback.title}</h2>
                <p className="text-neutral-500 mt-1 mb-6">{t.feedback.description}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="feedbackType" className="font-semibold text-neutral-700 block mb-1.5">{t.feedback.typeLabel}</label>
                        <select
                            id="feedbackType"
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
                        >
                            {Object.values(FeedbackType).map(type => (
                                <option key={type} value={type}>{t.feedback.types[type]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                         <label htmlFor="feedbackMessage" className="font-semibold text-neutral-700 block mb-1.5">{t.feedback.messageLabel}</label>
                        <textarea
                            id="feedbackMessage"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t.feedback.messagePlaceholder}
                            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900 resize-none"
                            rows={5}
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={status === 'submitting' || !message.trim()}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition disabled:bg-neutral-300"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t.feedback.submitting}
                                </>
                            ) : (
                                t.common.submit
                            )}
                        </button>
                    </div>
                </form>
            </>
        )}
      </div>
    </div>
  );
};
