import React, { useState, useEffect } from 'react';
import { useTranslations } from '../i18n';
import { SchoolClass, User } from '../types';
import { Users, Clipboard, BarChart2, PlusCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { CreateClassModal } from './CreateClassModal';
import { ClassDetailsModal } from './ClassDetailsModal';

interface ClassManagementProps {
    user: User;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ user }) => {
    const t = useTranslations();
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingClassId, setViewingClassId] = useState<string | null>(null);

    const fetchClasses = async () => {
        setIsLoading(true);
        const fetchedClasses = await apiService.getClassesForTeacher(user.id);
        setClasses(fetchedClasses);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchClasses();
    }, [user.id]);
    
    const handleClassCreated = (newClass: SchoolClass) => {
        setClasses(prev => [...prev, newClass]);
        setIsCreateModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <>
            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onClassCreated={handleClassCreated}
                teacherId={user.id}
            />
            {viewingClassId && (
                <ClassDetailsModal
                    classId={viewingClassId}
                    onClose={() => setViewingClassId(null)}
                />
            )}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-neutral-800">{t.teacherDashboard.myClasses}</h3>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition"
                    >
                        <PlusCircle size={20} />
                        <span className="hidden sm:inline">{t.teacherDashboard.createClass}</span>
                    </button>
                </div>
                {classes.length > 0 ? (
                    <div className="space-y-4">
                        {classes.map(cls => (
                            <div key={cls.id} className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-lg text-neutral-800">{cls.name}</h4>
                                    <div className="flex items-center flex-wrap gap-4 text-sm text-neutral-500 mt-1">
                                        <span className="flex items-center gap-1.5"><Users size={16} /> {t.teacherDashboard.studentsCount(cls.students.length)}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold">{t.teacherDashboard.joinCode}:</span>
                                            <span className="font-mono bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">{cls.joinCode}</span>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(cls.joinCode)}
                                                title="Copy code" 
                                                className="text-neutral-500 hover:text-primary"
                                            >
                                                <Clipboard size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingClassId(cls.id)}
                                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition text-sm self-start sm:self-center"
                                >
                                    <BarChart2 size={16} />
                                    {t.teacherDashboard.viewProgress}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
                        <p className="text-neutral-500">{t.teacherDashboard.noClasses}</p>
                    </div>
                )}
            </div>
        </>
    );
};