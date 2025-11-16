import React from 'react';
import { useTranslations } from '../i18n';
import { X, MessageSquare, GraduationCap, Globe } from 'lucide-react';

interface ParentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentGuideModal: React.FC<ParentGuideModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations();

  if (!isOpen) return null;

  const tips = [
    { icon: MessageSquare, title: t.parentGuideModal.tip1Title, content: t.parentGuideModal.tip1Content },
    { icon: GraduationCap, title: t.parentGuideModal.tip2Title, content: t.parentGuideModal.tip2Content },
    { icon: Globe, title: t.parentGuideModal.tip3Title, content: t.parentGuideModal.tip3Content },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full transform transition-all animate-slide-up relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
            <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">{t.parentGuideModal.title}</h2>
        <p className="text-neutral-500 mt-1 mb-6">{t.parentGuideModal.description}</p>
        
        <div className="space-y-4">
            {tips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                           <Icon size={20}/> {tip.title}
                        </h3>
                        <p className="text-neutral-600 mt-1 text-sm">{tip.content}</p>
                    </div>
                );
            })}
        </div>
        
        <div className="flex justify-end pt-6 mt-4 border-t border-neutral-200">
             <button
                onClick={onClose}
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition"
            >
                {t.common.close}
            </button>
        </div>
      </div>
    </div>
  );
};