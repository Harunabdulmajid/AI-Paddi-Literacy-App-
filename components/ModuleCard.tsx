import React, { useContext, useState } from 'react';
import { Module, Page, AppContextType } from '../types';
import { ArrowRight, Download, CheckCircle, Loader2 } from 'lucide-react';
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';

interface ModuleCardProps {
  module: Module;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  // FIX: Cast context to the correct type to resolve TS inference errors.
  const context = useContext(AppContext) as AppContextType | null;
  if (!context) throw new Error("ModuleCard must be used within an AppProvider");
  const { setCurrentPage, setActiveModuleId, downloadedModules, downloadModule, isOnline } = context;
  const t = useTranslations();

  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloaded = downloadedModules.includes(module.id);
  const Icon = module.icon;

  const handleStartLearning = () => {
    setActiveModuleId(module.id);
    setCurrentPage(Page.Lesson);
  };
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    await downloadModule(module.id);
    setIsDownloading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
      <div className="flex justify-between items-start">
        <div>
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <Icon size={32} />
            </div>
        </div>
        {isOnline && (
             <button onClick={handleDownload} disabled={isDownloading || isDownloaded} className="p-2 rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed" aria-label={isDownloaded ? t.offline.downloaded : t.offline.download}>
                {isDownloading ? <Loader2 size={22} className="text-primary animate-spin" /> : 
                 isDownloaded ? <CheckCircle size={22} className="text-secondary" /> : 
                 <Download size={22} className="text-neutral-500 group-hover:text-primary" />
                }
            </button>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">{module.title}</h3>
        <p className="text-neutral-500 text-base leading-relaxed">{module.description}</p>
      </div>
      <button 
        onClick={handleStartLearning}
        disabled={!isOnline && !isDownloaded}
        className="mt-6 text-md font-semibold text-primary hover:text-primary-dark flex items-center gap-2 self-start group-hover:gap-3 transition-all disabled:text-neutral-400 disabled:cursor-not-allowed">
        Start Learning <ArrowRight size={18} />
      </button>
    </div>
  );
};