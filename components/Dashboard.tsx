import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import { CURRICULUM_MODULES, LEARNING_PATHS } from '../constants';
import { ModuleCard } from './ModuleCard';
import { Page, Module, UserRole, AppContextType } from '../types';
import { Sword, UserCircle, ArrowRight, BarChart3, BookCopy, Star, Users, Wallet, BookMarked, Mic, Briefcase, Sparkles, ClipboardList, MessageSquare } from 'lucide-react';
import { useTranslations } from '../i18n';

const FeatureButton: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; isProFeature?: boolean }> = ({ icon, title, description, onClick, isProFeature }) => {
    const t = useTranslations();
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-4 md:p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 md:gap-5 group border-2 border-transparent hover:border-primary">
            <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                {icon}
            </div>
            <div className="flex-grow">
                 <h3 className="font-bold text-neutral-800 text-lg flex items-center gap-2">
                    {title}
                    {isProFeature && (
                        <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">{t.proPlan.badge}</span>
                    )}
                </h3>
                <p className="text-base text-neutral-500">{description}</p>
            </div>
             <ArrowRight className="text-neutral-300 group-hover:text-primary transition-transform group-hover:translate-x-1" size={24} />
        </button>
    );
};

const ProgressSummary: React.FC = () => {
    // FIX: Cast context to the correct type to resolve TS inference errors.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) return null;
    const { user, setCurrentPage, setActiveModuleId } = context;
    const t = useTranslations();
    
    if (!user || !user.level) return null;
    
    const userPathModules = LEARNING_PATHS[user.level].levels.flat();
    const completedCount = user.completedModules.filter(id => userPathModules.includes(id)).length;
    const totalCount = userPathModules.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    const nextModule = CURRICULUM_MODULES.find(m => userPathModules.includes(m.id) && !user.completedModules.includes(m.id));

    const handleContinueLearning = () => {
        if (nextModule) {
            setActiveModuleId(nextModule.id);
            setCurrentPage(Page.Lesson);
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                 <h3 className="font-bold text-xl text-neutral-800">{t.dashboard.progressTitle}</h3>
                 <p className="text-neutral-500 mt-1">{t.dashboard.progressDescription(completedCount, totalCount)}</p>
                 <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-4">
                     <div className="bg-secondary h-2.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
                 </div>
            </div>
            {nextModule ? (
                <button onClick={handleContinueLearning} className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform active:scale-95 flex-shrink-0 flex items-center justify-center gap-2">
                    <BookCopy size={20} /> {t.dashboard.continueLearningButton}
                </button>
            ) : (
                 <div className="bg-secondary/10 text-secondary font-bold py-3 px-6 rounded-xl text-lg flex-shrink-0 flex items-center justify-center gap-2">
                    <Star size={20} /> {t.dashboard.allModulesCompleted}
                </div>
            )}
        </div>
    );
};


export const Dashboard: React.FC = () => {
  // FIX: Cast context to the correct type to resolve TS inference errors.
  const context = useContext(AppContext) as AppContextType | null;
  if (!context) throw new Error("Dashboard must be used within an AppProvider");
  const { user, setCurrentPage, openUpgradeModal } = context;
  const t = useTranslations();

  if (!user || !user.level) {
    return null; // Or a loading/error state if level can be null temporarily
  }
  
  const handleFeatureClick = (page: Page, title: string, isPro: boolean) => {
    if (isPro && !user?.isPro) {
        openUpgradeModal(title);
    } else {
        setCurrentPage(page);
    }
  };

  const userPathLevels = LEARNING_PATHS[user.level].levels;
    
  const subGreeting = user.role === UserRole.Parent ? t.dashboard.subGreetingParent : t.dashboard.subGreeting;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800">{t.dashboard.greeting(user.name)}</h2>
        <p className="text-neutral-500 mt-2 text-lg md:text-xl">{subGreeting}</p>
      </div>
      
      <div className="mb-12">
        <ProgressSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <FeatureButton 
            icon={<MessageSquare size={32} />}
            title={t.aiTutor.title}
            description={t.aiTutor.description}
            onClick={() => handleFeatureClick(Page.AiTutor, t.aiTutor.title, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<Sparkles size={32} />}
            title={t.dashboard.creationStudioTitle}
            description={t.dashboard.creationStudioDescription}
            onClick={() => handleFeatureClick(Page.CreationStudio, t.dashboard.creationStudioTitle, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<Mic size={32} />}
            title={t.dashboard.podcastGeneratorTitle}
            description={t.dashboard.podcastGeneratorDescription}
            onClick={() => handleFeatureClick(Page.PodcastGenerator, t.dashboard.podcastGeneratorTitle, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<Briefcase size={32} />}
            title={t.dashboard.careerExplorerTitle}
            description={t.dashboard.careerExplorerDescription}
            onClick={() => handleFeatureClick(Page.CareerExplorer, t.dashboard.careerExplorerTitle, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<Wallet size={32} />}
            title={t.dashboard.walletTitle}
            description={t.dashboard.walletDescription}
            onClick={() => setCurrentPage(Page.Wallet)}
        />
        <FeatureButton 
            icon={<Users size={32} />}
            title={t.dashboard.multiplayerTitle}
            description={t.dashboard.multiplayerDescription}
            onClick={() => handleFeatureClick(Page.PeerPractice, t.dashboard.multiplayerTitle, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<Sword size={32} />}
            title={t.dashboard.gameTitle}
            description={t.dashboard.gameDescription}
            onClick={() => setCurrentPage(Page.AiVsHuman)}
        />
         <FeatureButton 
            icon={<UserCircle size={32} />}
            title={t.dashboard.profileTitle}
            description={t.dashboard.profileDescription}
            onClick={() => setCurrentPage(Page.Profile)}
        />
        <FeatureButton 
            icon={<ClipboardList size={32} />}
            title={t.dashboard.myPortfolioTitle}
            description={t.dashboard.myPortfolioDescription}
            onClick={() => handleFeatureClick(Page.StudentPortfolio, t.dashboard.myPortfolioTitle, true)}
            isProFeature={true}
        />
        <FeatureButton 
            icon={<BarChart3 size={32} />}
            title={t.dashboard.leaderboardTitle}
            description={t.dashboard.leaderboardDescription}
            onClick={() => setCurrentPage(Page.Leaderboard)}
        />
        <FeatureButton 
            icon={<BookMarked size={32} />}
            title={t.dashboard.glossaryTitle}
            description={t.dashboard.glossaryDescription}
            onClick={() => setCurrentPage(Page.Glossary)}
        />
      </div>

      <div className="space-y-12">
        {userPathLevels.map((levelModuleIds, levelIndex) => {
             const curriculumTopics: Module[] = levelModuleIds
                .map(moduleId => {
                    const moduleData = CURRICULUM_MODULES.find(m => m.id === moduleId);
                    if (!moduleData) return null;
                    return {
                        ...moduleData,
                        title: t.curriculum[moduleId].title,
                        description: t.curriculum[moduleId].description,
                    };
                })
                .filter((m): m is Module => m !== null);
            
            return (
                <div key={levelIndex}>
                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-6 border-b-2 border-primary/20 pb-2">
                        Level {levelIndex + 1}: <span className="text-primary">{t.dashboard.learningPathLevels[levelIndex]}</span>
                    </h3>
                    {curriculumTopics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {curriculumTopics.map((module) => (
                                <ModuleCard key={module.id} module={module} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl text-center">
                            <p className="text-neutral-500">No modules available for this level.</p>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </main>
  );
};