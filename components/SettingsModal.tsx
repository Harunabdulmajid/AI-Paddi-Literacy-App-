import React, { useContext } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { X, Mic } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const context = useContext(AppContext);
  const t = useTranslations();

  if (!isOpen || !context) return null;

  const { isVoiceModeEnabled, toggleVoiceMode } = context;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full transform transition-all animate-slide-up relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
            <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">{t.settings.title}</h2>
        <div className="mt-6 border-t border-neutral-200 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                        <Mic size={20} /> {t.settings.voiceMode}
                    </h3>
                    <p className="text-neutral-500 text-sm">{t.settings.voiceModeDescription}</p>
                </div>
                 <button
                    onClick={toggleVoiceMode}
                    role="switch"
                    aria-checked={isVoiceModeEnabled}
                    className={`${
                        isVoiceModeEnabled ? 'bg-primary' : 'bg-neutral-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                    <span
                        className={`${
                        isVoiceModeEnabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
