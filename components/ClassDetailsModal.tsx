import React, { useState, useEffect } from 'react';
import { useTranslations } from '../i18n';
import { SchoolClass, Module } from '../types';
import { apiService } from '../services/apiService';
import { Loader2, X, Users, BookOpen, Check, Save } from 'lucide-react';
import { CURRICULUM_MODULES } from '../constants';
import { UserAvatar } from './Header';

interface ClassDetailsModalProps {
  classId: string;
  onClose: () => void;
}

type Tab = 'students' | 'assignments';

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({ classId, onClose }) => {
  const t = useTranslations();
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const curriculumModules: Module[] = CURRICULUM_MODULES.map(module => ({
    ...module,
    title: t.curriculum[module.id].title,
    description: t.curriculum[module.id].description,
  }));

  useEffect(() => {
    const fetchClassDetails = async () => {
      setIsLoading(true);
      const details = await apiService.getClassDetails(classId);
      setSchoolClass(details);
      if (details) {
        setSelectedModules(new Set(details.assignedModules));
      }
      setIsLoading(false);
    };
    fetchClassDetails();
  }, [classId]);

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleSaveAssignments = async () => {
      setIsSaving(true);
      // FIX: Explicitly type `moduleIds` to resolve TypeScript inference issue.
      const moduleIds: string[] = Array.from(selectedModules);
      const updatedClass = await apiService.assignModulesToClass(classId, moduleIds);
      setSchoolClass(updatedClass);
      setIsSaving(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }
    if (!schoolClass) {
      return <div className="text-center p-8">Could not load class details.</div>;
    }

    if (activeTab === 'students') {
      return (
        <div className="space-y-3">
          {schoolClass.students.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">{t.classDetailsModal.noStudents}</p>
          ) : (
            schoolClass.students.map(student => {
              const assignedCount = schoolClass.assignedModules.length;
              const completedCount = student.completedModules.filter(id => schoolClass.assignedModules.includes(id)).length;
              const progress = assignedCount > 0 ? (completedCount / assignedCount) * 100 : 0;

              return (
                <div key={student.studentId} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg">
                  <UserAvatar name={student.studentName} avatarId={student.avatarId} className="w-12 h-12 text-xl"/>
                  <div className="flex-grow">
                    <p className="font-bold text-neutral-800">{student.studentName}</p>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-1">
                      <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{t.classDetailsModal.moduleProgress(completedCount, assignedCount)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }
    
    if (activeTab === 'assignments') {
        return (
            <div>
                <p className="text-neutral-600 mb-4">{t.classDetailsModal.assignModules}</p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {curriculumModules.map(module => (
                        <label key={module.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100">
                           <input
                                type="checkbox"
                                checked={selectedModules.has(module.id)}
                                onChange={() => handleToggleModule(module.id)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-semibold text-neutral-800">{module.title}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveAssignments}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg bg-primary text-white hover:bg-primary-dark transition disabled:bg-neutral-300"
                    >
                        {isSaving ? <><Loader2 className="animate-spin" size={20}/> {t.classDetailsModal.saving}</> : <><Save size={18}/> {t.classDetailsModal.saveAssignments}</>}
                    </button>
                </div>
            </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full transform transition-all animate-slide-up relative flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 z-20">
            <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex-shrink-0">{t.classDetailsModal.title(schoolClass?.name || '...')}</h2>
        
        <div className="border-b border-neutral-200 mb-4 flex-shrink-0">
            <nav className="-mb-px flex gap-4">
                 <button onClick={() => setActiveTab('students')} className={`py-2 px-1 font-semibold flex items-center gap-2 ${activeTab === 'students' ? 'border-b-2 border-primary text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                    <Users size={18}/> {t.classDetailsModal.studentsTab}
                 </button>
                 <button onClick={() => setActiveTab('assignments')} className={`py-2 px-1 font-semibold flex items-center gap-2 ${activeTab === 'assignments' ? 'border-b-2 border-primary text-primary' : 'text-neutral-500 hover:text-primary'}`}>
                    <BookOpen size={18}/> {t.classDetailsModal.assignmentsTab}
                 </button>
            </nav>
        </div>

        <div className="flex-grow overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};