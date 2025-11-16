import React, { useState } from 'react';
import { useTranslations } from '../i18n';
import { apiService } from '../services/apiService';
import { SchoolClass } from '../types';
import { Loader2, X } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClass: SchoolClass) => void;
  teacherId: string;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onClassCreated, teacherId }) => {
  const t = useTranslations();
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const newClass = await apiService.createClass(teacherId, className.trim());
      onClassCreated(newClass);
      setClassName(''); // Reset for next time
    } catch (error) {
      console.error("Failed to create class:", error);
      // Optionally show an error to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full transform transition-all animate-slide-up relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
            <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">{t.createClassModal.title}</h2>
        <p className="text-neutral-500 mt-1 mb-6">{t.createClassModal.description}</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="className" className="font-semibold text-neutral-700 block mb-1.5">
              {t.createClassModal.classNameLabel}
            </label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder={t.createClassModal.classNamePlaceholder}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
              required
            />
          </div>
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading || !className.trim()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition disabled:bg-neutral-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t.createClassModal.creatingButton}
                </>
              ) : (
                t.createClassModal.createButton
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};