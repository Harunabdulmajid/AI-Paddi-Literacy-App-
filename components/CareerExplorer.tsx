import React, { useState, useContext } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { CAREER_PROFILES, CURRICULUM_MODULES } from '../constants';
import { Page } from '../types';
import { ArrowRight, BookOpen, CheckSquare } from 'lucide-react';

export const CareerExplorer: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("CareerExplorer must be used within an AppProvider");
    
    const { setCurrentPage, setActiveModuleId, user } = context;
    const t = useTranslations();
    const [selectedCareerId, setSelectedCareerId] = useState<string | null>(CAREER_PROFILES[0]?.id || null);

    const selectedCareer = CAREER_PROFILES.find(c => c.id === selectedCareerId);
    const careerTranslations = selectedCareer ? t.careerExplorer.careers[selectedCareer.id] : null;

    const handleStartLesson = (moduleId: string) => {
        setActiveModuleId(moduleId);
        setCurrentPage(Page.Lesson);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.careerExplorer.title} 🚀</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.careerExplorer.description}</p>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Panel: Career List */}
                <div className="lg:w-1/3 flex-shrink-0">
                    <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2">
                        {CAREER_PROFILES.map(career => {
                            const Icon = career.icon;
                            const isActive = selectedCareerId === career.id;
                            const careerTitle = t.careerExplorer.careers[career.id]?.title || career.id;
                            
                            return (
                                <button
                                    key={career.id}
                                    onClick={() => setSelectedCareerId(career.id)}
                                    className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all duration-200 border-2 ${isActive ? 'bg-primary/10 border-primary' : 'border-transparent hover:bg-neutral-50'}`}
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-800">{careerTitle}</h3>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Career Details */}
                <div className="lg:w-2/3 flex-grow">
                    {selectedCareer && careerTranslations ? (
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-fade-in space-y-6">
                            {/* Header */}
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-neutral-800">{careerTranslations.title}</h3>
                                <p className="text-neutral-500 mt-1">{careerTranslations.description}</p>
                            </div>
                            
                            {/* What They Do */}
                            <div>
                                <h4 className="text-lg font-bold text-neutral-700 mb-2">{t.careerExplorer.whatTheyDo}</h4>
                                <p className="text-neutral-600 leading-relaxed">{careerTranslations.what_they_do}</p>
                            </div>
                            
                            {/* A Day in the Life */}
                            <div>
                                <h4 className="text-lg font-bold text-neutral-700 mb-2">{t.careerExplorer.dayInTheLife}</h4>
                                <blockquote className="border-l-4 border-accent bg-accent/5 p-4 text-neutral-600 italic">
                                    "{careerTranslations.day_in_the_life}"
                                </blockquote>
                            </div>
                            
                            {/* Skills Needed */}
                            <div>
                                <h4 className="text-lg font-bold text-neutral-700 mb-3">{t.careerExplorer.skillsNeeded}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {careerTranslations.skills.map(skill => (
                                        <span key={skill} className="bg-secondary/10 text-secondary font-semibold px-3 py-1 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Relevant Lessons */}
                            <div>
                                <h4 className="text-lg font-bold text-neutral-700 mb-3">{t.careerExplorer.relevantLessons}</h4>
                                <div className="space-y-3">
                                    {selectedCareer.relevantModuleIds.map(moduleId => {
                                        const moduleInfo = CURRICULUM_MODULES.find(m => m.id === moduleId);
                                        const moduleTitle = t.curriculum[moduleId]?.title;
                                        if (!moduleInfo || !moduleTitle) return null;
                                        
                                        const isCompleted = user?.completedModules.includes(moduleId);

                                        return (
                                            <div key={moduleId} className="bg-neutral-50 p-4 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {isCompleted ? <CheckSquare size={20} className="text-secondary" /> : <BookOpen size={20} className="text-primary" />}
                                                    <span className={`font-semibold ${isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-800'}`}>{moduleTitle}</span>
                                                </div>
                                                {!isCompleted && (
                                                    <button onClick={() => handleStartLesson(moduleId)} className="font-bold text-sm text-primary hover:underline flex items-center gap-1">
                                                        {t.careerExplorer.startLearning} <ArrowRight size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-lg flex items-center justify-center h-full">
                            <p className="text-neutral-500">Select a career to see the details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
