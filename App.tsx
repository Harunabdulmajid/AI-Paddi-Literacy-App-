import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { PeerPractice } from './components/Multiplayer';
import { AiVsHumanGame } from './components/AiVsHumanGame';
import { Profile } from './components/Profile';
import { AppContextType, User, Language, Page, Badge, GameSession, Module, Transaction, UserRole, LearningPath } from './types';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { translations, englishTranslations } from './i18n';
import { Lesson } from './components/Lesson';
import { AppContext } from './components/AppContext';
import { useLocalStorage } from './services/hooks/useLocalStorage';
import { Leaderboard } from './components/Leaderboard';
import { apiService } from './services/apiService';
import { Toast } from './components/Toast';
import { BADGES, CURRICULUM_MODULES, LEARNING_PATHS } from './constants';
import { dbService } from './services/db';
import { geminiService } from './services/geminiService';
import { SettingsModal } from './components/SettingsModal';
import { useSpeech } from './services/hooks/useSpeech';
import { Wallet } from './components/Wallet';
import { Glossary } from './components/Glossary';
import { PodcastGenerator } from './components/PodcastGenerator';
import { CareerExplorer } from './components/CareerExplorer';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { CreationStudio } from './components/ProjectSandbox';
import { StudentPortfolio } from './components/StudentPortfolio';
import { AiTutor } from './components/AiTutor';
import { UpgradeModal } from './components/UpgradeModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useLocalStorage<Language>('language', Language.English);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastQueue, setToastQueue] = useState<Array<Badge | Transaction>>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  
  // Offline & Voice Features State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedModules, setDownloadedModules] = useState<string[]>([]);
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useLocalStorage('voiceMode', false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isListening, speak, startContinuousListening, stopListening, isSupported: isSpeechSupported } = useSpeech();
  
  // Pro Plan State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [featureToUnlock, setFeatureToUnlock] = useState('');

  const t = translations[language] || englishTranslations;
  
  const showToast = useCallback((item: Badge | Transaction) => {
    setToastQueue(prev => [...prev, item]);
    setTimeout(() => {
        setToastQueue(prev => prev.slice(1));
    }, 5000);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    dbService.getDownloadedModuleIds().then(setDownloadedModules);
  }, []);

  // Sync offline actions when coming online
  useEffect(() => {
    const syncOfflineActions = async () => {
      if (isOnline && user) {
        const actions = await dbService.getActions();
        if (actions.length === 0) return;

        console.log(`Syncing ${actions.length} offline actions...`);

        const offlineUpdates = actions.reduce((acc, action) => {
            if (action.type === 'updateUser') {
               Object.assign(acc, action.payload);
            }
            return acc;
        }, {} as Partial<User>);

        try {
          // IMPORTANT: Fetch latest remote user first to ensure we merge correctly
          // instead of overwriting with potentially stale offline base state.
          const remoteUser = await apiService.getUserByEmail(user.email);
          
          if (remoteUser) {
              const mergedUser = { ...remoteUser, ...offlineUpdates };
              
              // Ensure array merges are unique
              if (offlineUpdates.badges) {
                  mergedUser.badges = [...new Set([...remoteUser.badges, ...offlineUpdates.badges])];
              }
              if (offlineUpdates.completedModules) {
                  mergedUser.completedModules = [...new Set([...remoteUser.completedModules, ...offlineUpdates.completedModules])];
              }
              // ... handle other arrays as needed

              const updatedUser = await apiService.updateUser(user.id, mergedUser); // Use ID, not email
              if (updatedUser) {
                  setUser(updatedUser as User);
              }
          }

          for (const action of actions) {
              if(action.id) await dbService.deleteAction(action.id);
          }
          console.log("Sync complete.");
        } catch (error) {
           console.error("Failed to sync offline actions:", error);
        }
      }
    };
    syncOfflineActions();
  }, [isOnline, user]);

  useEffect(() => {
    const checkUserSession = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        try {
          const { user: fetchedUser, newTransactions } = await apiService.handleUserLogin(userEmail);
          setUser(fetchedUser);
          newTransactions.forEach(showToast);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem('userEmail');
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, [showToast]);
  
  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('userEmail', newUser.email);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, []);

  const logout = useCallback(() => {
    handleSetUser(null);
    setCurrentPage(Page.Dashboard);
    setActiveModuleId(null);
    setGameSession(null);
  }, [handleSetUser]);

  const curriculumTopics: Module[] = useMemo(() => CURRICULUM_MODULES.map(module => ({
    ...module,
    title: t.curriculum[module.id].title,
    description: t.curriculum[module.id].description,
  })), [t]);

  const findModuleFromCommand = useCallback((command: string): { id: string, title: string } | null => {
      const lowerCommand = command.toLowerCase();
      
      const numberMap: { [key: string]: number } = {
          'one': 1, '1': 1,
          'two': 2, '2': 2,
          'three': 3, '3': 3,
          'four': 4, '4': 4,
          'five': 5, '5': 5,
      };

      for (const key in numberMap) {
          if (lowerCommand.includes(`module ${key}`) || lowerCommand.includes(`lesson ${key}`)) {
              const moduleIndex = numberMap[key] - 1;
              if (curriculumTopics[moduleIndex]) {
                  return { id: curriculumTopics[moduleIndex].id, title: curriculumTopics[moduleIndex].title };
              }
          }
      }
      
      for (const module of curriculumTopics) {
          if (lowerCommand.includes(module.title.toLowerCase())) {
              return { id: module.id, title: module.title };
          }
      }

      return null;
  }, [curriculumTopics]);

  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    console.log("Voice command received:", lowerCommand);

    if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
        setCurrentPage(Page.Dashboard);
        speak(t.voice.navigatingTo.dashboard, language);
    } else if (lowerCommand.includes('profile')) {
        setCurrentPage(Page.Profile);
        speak(t.voice.navigatingTo.profile, language);
    } else if (lowerCommand.includes('leaderboard')) {
        setCurrentPage(Page.Leaderboard);
        speak(t.voice.navigatingTo.leaderboard, language);
    } else if (lowerCommand.includes('wallet') || lowerCommand.includes('points')) {
        setCurrentPage(Page.Wallet);
        speak(t.voice.navigatingTo.wallet, language);
    } else if (lowerCommand.includes('game') || lowerCommand.includes('human')) {
        setCurrentPage(Page.AiVsHuman);
        speak(t.voice.navigatingTo.game, language);
    } else if (lowerCommand.includes('practice') || lowerCommand.includes('peer practice')) {
        setCurrentPage(Page.PeerPractice);
        speak(t.voice.navigatingTo.peerPractice, language);
    } else if (lowerCommand.includes('open settings')) {
        setIsSettingsOpen(true);
        speak(t.voice.openingSettings, language);
    } else if (lowerCommand.includes('close settings')) {
        setIsSettingsOpen(false);
        speak(t.voice.closingSettings, language);
    } else if (lowerCommand.includes('logout') || lowerCommand.includes('log out')) {
        speak(t.voice.loggingOut, language);
        logout();
    } else {
        const moduleInfo = findModuleFromCommand(lowerCommand);
        if (moduleInfo) {
            setActiveModuleId(moduleInfo.id);
            setCurrentPage(Page.Lesson);
            speak(t.voice.startingModule(moduleInfo.title), language);
        }
    }
  }, [language, speak, t, findModuleFromCommand, logout]);

  useEffect(() => {
    if (isVoiceModeEnabled && isSpeechSupported) {
      startContinuousListening(handleVoiceCommand, language);
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isVoiceModeEnabled, isSpeechSupported, language, startContinuousListening, stopListening, handleVoiceCommand]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
      if (!user) return;
      
      const fullTransaction: Transaction = {
          ...transaction,
          id: `txn-${Date.now()}`,
          timestamp: Date.now(),
      };
      
      const newBalance = user.wallet.balance + (transaction.type === 'earn' ? transaction.amount : -transaction.amount);
      const newTransactions = [fullTransaction, ...user.wallet.transactions];
      
      const updatedWallet = { ...user.wallet, balance: newBalance, transactions: newTransactions };
      const updates = { points: newBalance, wallet: updatedWallet };

      setUser(prev => prev ? { ...prev, ...updates } : null);

      if (isOnline) {
          const updatedUser = await apiService.updateUser(user.id, updates);
          if (updatedUser) setUser(updatedUser as User);
      } else {
          await dbService.addAction({ type: 'updateUser', payload: updates, timestamp: Date.now() });
      }
      
      if(user.wallet.balance < 100 && newBalance >= 100) {
        awardBadge('point-pioneer');
      }
  }, [user, isOnline]);

  const awardBadge = useCallback(async (badgeId: string) => {
    if (!user || user.badges.includes(badgeId)) return;
    
    const badge = BADGES[badgeId];
    if (badge) {
        const updates = { badges: [...user.badges, badgeId] };
        setUser(prev => prev ? { ...prev, badges: updates.badges } : null);
        
        if (isOnline) {
            const updatedUser = await apiService.updateUser(user.id, updates);
            if(updatedUser) setUser(updatedUser as User);
        } else {
            await dbService.addAction({ type: 'updateUser', payload: updates, timestamp: Date.now() });
        }
        showToast(badge);
    }
  }, [user, isOnline, showToast]);

  const completeModule = useCallback(async (moduleId: string) => {
    if (!user || user.completedModules.includes(moduleId)) return;
    
    const level = user.level || LearningPath.Explorer;
    const updatedCompletedModules = [...user.completedModules, moduleId];
    
    addTransaction({
        type: 'earn',
        description: `Completed '${t.curriculum[moduleId].title}' module`,
        amount: 50
    });
    
    const moduleUpdates = { completedModules: updatedCompletedModules };
    setUser(prev => prev ? { ...prev, ...moduleUpdates } : null);
    
    if (isOnline) {
        const updatedUser = await apiService.updateUser(user.id, moduleUpdates);
        if (updatedUser) setUser(updatedUser as User);
    } else {
        await dbService.addAction({ type: 'updateUser', payload: moduleUpdates, timestamp: Date.now() });
    }

    if(updatedCompletedModules.length === 1) {
      awardBadge('first-step');
    }
    
    const userPathModules = LEARNING_PATHS[level].levels.flat();
    const completedInPath = updatedCompletedModules.filter(id => userPathModules.includes(id));
    if (completedInPath.length === userPathModules.length) {
      awardBadge('ai-graduate');
    }

  }, [user, isOnline, awardBadge, addTransaction, t.curriculum]);

  const downloadModule = useCallback(async (moduleId: string) => {
      const englishContent = englishTranslations.curriculum[moduleId].lessonContent;
      if (!englishContent) return;

      const { title, quiz, ...contentToSave } = englishContent;
      await dbService.saveContent(moduleId, Language.English, contentToSave);

      if (language !== Language.English) {
          try {
              const { scenario, ...contentForTranslation } = contentToSave;
              const translatedContent = await geminiService.generateDynamicLessonContent(contentForTranslation, language);
              await dbService.saveContent(moduleId, language, { ...translatedContent, scenario: contentToSave.scenario });
          } catch (error) {
              console.error(`Failed to download translated content for ${moduleId}`, error);
          }
      }
      setDownloadedModules(prev => [...new Set([...prev, moduleId])]);
  }, [language]);
  
  const toggleVoiceMode = () => {
    if (!isSpeechSupported) {
        alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        return;
    }
    if (!isVoiceModeEnabled) {
        alert("Voice-First mode requires microphone access to function. Please allow access if prompted.");
    }
    setIsVoiceModeEnabled(!isVoiceModeEnabled);
  };
  
  const openUpgradeModal = (featureName: string) => {
    setFeatureToUnlock(featureName);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
      setIsUpgradeModalOpen(false);
      setFeatureToUnlock('');
  };

  const contextValue: AppContextType = useMemo(() => ({
    user,
    setUser: handleSetUser,
    logout,
    language,
    setLanguage,
    currentPage,
    setCurrentPage,
    activeModuleId,
    setActiveModuleId,
    addTransaction,
    completeModule,
    awardBadge,
    gameSession,
    setGameSession,
    isOnline,
    downloadedModules,
    downloadModule,
    isVoiceModeEnabled,
    toggleVoiceMode,
    speak,
    isListening,
    openUpgradeModal,
  }), [user, language, setLanguage, currentPage, activeModuleId, gameSession, isOnline, downloadedModules, isVoiceModeEnabled, addTransaction, completeModule, awardBadge, downloadModule, speak, isListening, logout, handleSetUser]);

  const renderCurrentPage = () => {
    const proPages = [Page.PeerPractice, Page.PodcastGenerator, Page.CareerExplorer, Page.CreationStudio, Page.StudentPortfolio, Page.AiTutor];
    if (proPages.includes(currentPage) && !user?.isPro) {
        if (!isUpgradeModalOpen) {
            openUpgradeModal(currentPage);
        }
        return <Dashboard />; 
    }

    switch(currentPage) {
        case Page.Dashboard:
            if (user?.role === UserRole.Teacher) return <TeacherDashboard />;
            if (user?.role === UserRole.Parent) return <ParentDashboard />;
            return <Dashboard />;
        case Page.PeerPractice: return <PeerPractice />;
        case Page.AiVsHuman: return <AiVsHumanGame />;
        case Page.Profile: return <Profile />;
        case Page.Lesson: return <Lesson />;
        case Page.Leaderboard: return <Leaderboard />;
        case Page.Wallet: return <Wallet />;
        case Page.Glossary: return <Glossary />;
        case Page.PodcastGenerator: return <PodcastGenerator />;
        case Page.CareerExplorer: return <CareerExplorer />;
        case Page.CreationStudio: return <CreationStudio />;
        case Page.StudentPortfolio: return <StudentPortfolio />;
        case Page.AiTutor: return <AiTutor />;
        default: return <Dashboard />;
    }
  }

  const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-100">
            <Header onSettingsClick={() => setIsSettingsOpen(true)} />
            <div className="flex-grow flex flex-col">
                 {currentPage !== Page.Dashboard && (
                    <div className="container mx-auto pt-6 px-4 md:px-8">
                         <button onClick={() => {
                             setCurrentPage(Page.Dashboard);
                             setActiveModuleId(null);
                             setGameSession(null);
                            }} className="flex items-center gap-2 text-md font-bold text-neutral-600 hover:text-primary transition-colors">
                            <ArrowLeft size={20} />
                            {t.common.backToDashboard}
                        </button>
                    </div>
                )}
                <div className="flex-grow">
                  {children}
                </div>
            </div>
             <footer className="text-center p-4 md:p-6 text-sm text-neutral-500 border-t border-neutral-200 mt-auto">
                {t.common.footer(new Date().getFullYear())}
            </footer>
        </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading your session...</p>
      </div>
    );
  }
  
  if (!user) {
      return <Onboarding setUser={handleSetUser} t={t} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
        {toastQueue.map((item, index) => (
             <Toast key={index} item={item} />
        ))}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <UpgradeModal
            isOpen={isUpgradeModalOpen}
            onClose={closeUpgradeModal}
            featureName={featureToUnlock}
        />
        <PageWrapper>
            {renderCurrentPage()}
        </PageWrapper>
    </AppContext.Provider>
  );
};

export default App;