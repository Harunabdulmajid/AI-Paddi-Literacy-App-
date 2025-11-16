import React, { useContext, useState, useEffect } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { Page, Module, User, AppContextType } from '../types';
import { ArrowRight, BookOpen, Briefcase, Users, GraduationCap, CheckSquare, Award, BookMarked, UserPlus, Loader2 } from 'lucide-react';
import { LEARNING_PATHS, CURRICULUM_MODULES } from '../constants';
import { ParentGuideModal } from './ParentGuideModal';
import { apiService } from '../services/apiService';

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

const LinkChildAccount: React.FC = () => {
    const context = useContext(AppContext);
    const t = useTranslations();
    const [childEmail, setChildEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    if (!context || !context.user) return null;
    const { user, setUser } = context;

    const handleLinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childEmail.trim() || isLoading) return;
        setIsLoading(true);
        setError('');
        try {
            const updatedParentUser = await apiService.linkChildAccount(user.email, childEmail);
            setUser(updatedParentUser);
        } catch (err: any) {
            if (err.message.includes('not found')) {
                setError(t.parentDashboard.childNotFound);
            } else if (err.message.includes('already linked')) {
                setError(t.parentDashboard.childAlreadyLinked);
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <UserPlus className="text-primary mx-auto" size={40}/>
            <h3 className="text-2xl font-bold text-neutral-800 mt-4">{t.parentDashboard.linkChildTitle}</h3>
            <p className="text-neutral-500 mt-2 max-w-md mx-auto">{t.parentDashboard.linkChildDescription}</p>
            {error && <p className="text-red-600 font-semibold mt-3">{error}</p>}
            <form onSubmit={handleLinkAccount} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                    type="email"
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    placeholder={t.parentDashboard.linkChildInputPlaceholder}
                    className="flex-grow p-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900 placeholder:text-neutral-400"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-5 rounded-lg hover:bg-primary-dark transition disabled:bg-neutral-400"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : t.parentDashboard.linkChildButton}
                </button>
            </form>
        </div>
    );
};

export const ParentDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("ParentDashboard must be used within an AppProvider");
    const { user, setUser, setCurrentPage } = context;
    const t = useTranslations();
    
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [childData, setChildData] = useState<User | null>(null);
    const [isLoadingChild, setIsLoadingChild] = useState(true);

    useEffect(() => {
        const fetchChildData = async () => {
            if (user?.childEmail) {
                setIsLoadingChild(true);
                const child = await apiService.getUserByEmail(user.childEmail);
                setChildData(child);
                setIsLoadingChild(false);
            } else {
                setIsLoadingChild(false);
            }
        };
        fetchChildData();
    }, [user]);

    if (!user || !user.level) return null;
    
    if (isLoadingChild) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }
    
    if (!user.childEmail || !childData) {
        return (
             <main className="container mx-auto p-4 md:p-8">
                <div className="mb-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800">{t.parentDashboard.greeting(user.name)}</h2>
                    <p className="text-neutral-500 mt-2 text-lg md:text-xl">{t.parentDashboard.subGreeting}</p>
                </div>
                <LinkChildAccount />
             </main>
        );
    }
    
    // FIX: Access the `levels` property and flatten the array to get all module IDs for the child's learning path.
    const childPathModules = childData.level ? LEARNING_PATHS[childData.level].levels.flat() : [];
    const curriculumTopics: Module[] = CURRICULUM_MODULES
        .filter(module => childPathModules.includes(module.id))
        .map(module => ({
            ...module,
            title: t.curriculum[module.id].title,
            description: t.curriculum[module.id].description,
        }));

    return (
        <>
            <ParentGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
            <main className="container mx-auto p-4 md:p-8">
                <div className="mb-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800">{t.parentDashboard.greeting(user.name)}</h2>
                    <p className="text-neutral-500 mt-2 text-lg md:text-xl">{t.parentDashboard.subGreeting}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
                    <h3 className="text-2xl font-bold text-neutral-800 mb-4">{t.parentDashboard.childProgressTitle(childData.name)}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="bg-primary/10 p-4 rounded-xl">
                            <GraduationCap className="text-primary mx-auto mb-2" size={32}/>
                            <p className="text-sm font-semibold text-primary/80">{t.parentDashboard.currentPath}</p>
                            <p className="text-xl font-bold text-primary">{t.paths[childData.level!].name}</p>
                        </div>
                        <div className="bg-secondary/10 p-4 rounded-xl">
                            <CheckSquare className="text-secondary mx-auto mb-2" size={32}/>
                            <p className="text-sm font-semibold text-secondary/80">{t.parentDashboard.modulesCompleted}</p>
                            <p className="text-xl font-bold text-secondary">{childData.completedModules.length} / {childPathModules.length}</p>
                        </div>
                        <div className="bg-amber-100 p-4 rounded-xl">
                             <Award className="text-amber-600 mx-auto mb-2" size={32}/>
                            <p className="text-sm font-semibold text-amber-800/80">{t.parentDashboard.pointsEarned}</p>
                            <p className="text-xl font-bold text-amber-700">{childData.points}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <FeatureButton
                        icon={<Briefcase size={32} />}
                        title={t.dashboard.careerExplorerTitle}
                        description={t.dashboard.careerExplorerDescription}
                        onClick={() => setCurrentPage(Page.CareerExplorer)}
                    />
                    <FeatureButton
                        icon={<BookMarked size={32} />}
                        title={t.parentDashboard.parentsGuideTitle}
                        description={t.parentDashboard.parentsGuideDescription}
                        onClick={() => setIsGuideOpen(true)}
                    />
                     <FeatureButton
                        icon={<Users size={32} />}
                        title={t.parentDashboard.familySettingsTitle}
                        description={t.parentDashboard.familySettingsDescription}
                        onClick={() => { /* Placeholder */ alert("Family Settings coming soon!"); }}
                    />
                </div>

                 <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-6">{t.parentDashboard.learningFocusTitle}</h3>
                    <div className="space-y-3">
                        {curriculumTopics.map(module => {
                            const isCompleted = childData.completedModules.includes(module.id);
                            return (
                                <div key={module.id} className={`bg-white p-4 rounded-xl flex items-center gap-4 border ${isCompleted ? 'border-neutral-200' : 'border-primary/50'}`}>
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                        {isCompleted ? <CheckSquare size={28}/> : <module.icon size={28} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-neutral-800 ${isCompleted ? 'line-through text-neutral-500' : ''}`}>{module.title}</h4>
                                        <p className="text-sm text-neutral-500">{module.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>
            </main>
        </>
    );
};