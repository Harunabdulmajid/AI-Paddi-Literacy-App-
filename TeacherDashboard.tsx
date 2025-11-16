import React, { useContext } from 'react';
import { AppContext } from './components/AppContext';
import { useTranslations } from './i18n';
import { Page } from './types';
import { ArrowRight, BookOpen, Briefcase, Users } from 'lucide-react';
import { ClassManagement } from './components/ClassManagement';

const FeatureButton: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
     <button onClick={onClick} className="w-full text-left bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group border-2 border-transparent hover:border-primary">
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-neutral-800 text-lg">{title}</h3>
            <p className="text-base text-neutral-500">{description}</p>
        </div>
         <ArrowRight className="text-neutral-300 group-hover:text-primary transition-transform group-hover:translate-x-1" size={24} />
    </button>
);

export const TeacherDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("TeacherDashboard must be used within an AppProvider");
    const { user, setCurrentPage } = context;
    const t = useTranslations();

    if (!user) return null;

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="mb-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800">{t.teacherDashboard.greeting(user.name)}</h2>
                <p className="text-neutral-500 mt-2 text-lg md:text-xl">{t.teacherDashboard.subGreeting}</p>
            </div>

            <div className="mb-12">
                <ClassManagement user={user} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureButton
                    icon={<Users size={32} />}
                    title={t.teacherDashboard.resourceHubTitle}
                    description={t.teacherDashboard.resourceHubDescription}
                    onClick={() => { /* Placeholder for future feature */ }}
                />
                 <FeatureButton
                    icon={<BookOpen size={32} />}
                    title={t.teacherDashboard.reviewCurriculumTitle}
                    description={t.teacherDashboard.reviewCurriculumDescription}
                    onClick={() => setCurrentPage(Page.Glossary) /* A simple link to something existing */}
                />
                 <FeatureButton 
                    icon={<Briefcase size={32} />}
                    title={t.dashboard.careerExplorerTitle}
                    description={t.dashboard.careerExplorerDescription}
                    onClick={() => setCurrentPage(Page.CareerExplorer)}
                />
            </div>
        </main>
    );
};