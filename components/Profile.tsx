// FIX: Import `useEffect` from React to resolve the "Cannot find name 'useEffect'" error.
import React, { useContext, useRef, useCallback, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import { Award, CheckCircle, Download, Share2, Edit, X, Check, Loader2, LogOut, ShieldCheck, MessageSquarePlus, Wallet, Feather, BookOpen, BrainCircuit, PenTool, Briefcase } from 'lucide-react';
import { LearningPath, User, Page, AppContextType } from '../types';
import { useTranslations } from '../i18n';
// FIX: Import the `BADGES` constant to resolve the "Cannot find name 'BADGES'" error.
import { CURRICULUM_MODULES, LEARNING_PATHS, BADGES } from '../constants';
import * as htmlToImage from 'html-to-image';
import { apiService } from '../services/apiService';
import { BadgeIcon } from './BadgeIcon';
import { FeedbackModal } from './FeedbackModal';
import { UserAvatar, AVATARS } from './Header';
import { ConfirmationModal } from './Wallet/ConfirmationModal';

const Certificate: React.FC<{ user: User, certificateRef: React.RefObject<HTMLDivElement> }> = ({ user, certificateRef }) => {
    const t = useTranslations();
    const completionDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const certificateId = `AIK-${new Date().getFullYear()}-${user.id.slice(-6).toUpperCase()}`;
    const isDistinction = user.certificateLevel === 'distinction';

    return (
        <div ref={certificateRef} className={`bg-white p-6 md:p-8 rounded-xl border-2 ${isDistinction ? 'border-amber-400' : 'border-primary'} relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-full bg-neutral-50 z-0 opacity-50"></div>
            <div className={`absolute -top-10 -right-10 w-40 h-40 ${isDistinction ? 'bg-amber-400/10' : 'bg-primary/10'} rounded-full z-0`}></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-secondary/10 rounded-full z-0"></div>
            
            <div className="relative z-10 text-center">
                <div className={`flex justify-center items-center gap-3 ${isDistinction ? 'text-amber-500' : 'text-primary'}`}>
                  <ShieldCheck size={40} />
                  <h3 className="text-2xl md:text-3xl font-bold">{t.profile.certificateTitleSingle}{isDistinction && ' with Distinction'}</h3>
                </div>
                <p className="text-neutral-500 mt-1 font-semibold">{t.profile.certificateIssuedBy('AI Paddi')}</p>
                <p className="text-neutral-500 mt-4">{t.profile.certificateFor}</p>
                <p className="text-3xl md:text-4xl font-extrabold text-neutral-800 my-4 md:my-6 border-y-2 border-neutral-200 py-4">{user.name}</p>
                <p className="text-base md:text-lg text-neutral-600 font-medium">{t.profile.certificateCourseName}</p>
                <div className="flex justify-center items-center gap-2 mt-4 text-secondary">
                    <CheckCircle size={24} />
                    <p className="font-bold">{t.profile.certificateCompletedOn(completionDate)}</p>
                </div>
                <p className="text-xs text-neutral-400 mt-6">{t.profile.certificateId}: {certificateId}</p>
            </div>
        </div>
    );
};

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (avatarId: string) => Promise<void>;
    currentAvatarId: string;
    isSaving: boolean;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSave, currentAvatarId, isSaving }) => {
    const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);

    useEffect(() => {
        setSelectedAvatarId(currentAvatarId);
    }, [currentAvatarId, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedAvatarId);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full transform transition-all animate-slide-up relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-neutral-800">Choose Your Avatar</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 my-6">
                    {Object.entries(AVATARS).map(([id, AvatarComponent]) => (
                        <button
                            key={id}
                            onClick={() => setSelectedAvatarId(id)}
                            className={`p-2 rounded-full transition-all duration-200 ${selectedAvatarId === id ? 'ring-4 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-primary/50'}`}
                            aria-label={`Select avatar ${id.split('-')[1]}`}
                        >
                            <AvatarComponent className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
                        </button>
                    ))}
                </div>
                <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
                    <button onClick={onClose} className="font-bold py-2 px-5 rounded-lg text-neutral-600 bg-neutral-200 hover:bg-neutral-300 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || selectedAvatarId === currentAvatarId}
                        className="flex items-center justify-center gap-2 font-bold py-2 px-5 rounded-lg bg-primary text-white hover:bg-primary-dark transition disabled:bg-neutral-300"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PathSelectionModal: React.FC<{ isOpen: boolean, onClose: () => void, onSelect: (path: LearningPath) => void, currentPath: LearningPath }> = ({ isOpen, onClose, onSelect, currentPath }) => {
    const t = useTranslations();
    const paths = [
        { level: LearningPath.Explorer, icon: Feather },
        { level: LearningPath.Creator, icon: PenTool },
        { level: LearningPath.Innovator, icon: Briefcase },
        { level: LearningPath.Ethicist, icon: ShieldCheck },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full transform transition-all animate-slide-up relative" onClick={(e) => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-neutral-800">Change Learning Path</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    {paths.map(({ level, icon: Icon }) => (
                        <button
                            key={level}
                            onClick={() => onSelect(level)}
                            className={`text-left p-5 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 group ${currentPath === level ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}
                        >
                            <Icon className="text-primary mb-3" size={28} />
                            <h3 className="text-lg font-bold text-neutral-800">{t.paths[level].name}</h3>
                            <p className="text-neutral-500 text-sm mt-1">{t.paths[level].description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const Profile: React.FC = () => {
    // FIX: Cast context to the correct type to resolve TS inference errors.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) throw new Error("Profile must be used within an AppProvider");
    const { user, setUser, logout, setCurrentPage } = context;
    const t = useTranslations();
    const certificateRef = useRef<HTMLDivElement>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [isPathConfirmModalOpen, setIsPathConfirmModalOpen] = useState(false);
    const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
    const [isSavingPath, setIsSavingPath] = useState(false);

    if (!user) return null;

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName(user.name);
    };

    const handleSaveName = async () => {
        if (editedName.trim() === '' || editedName.trim() === user.name) {
            setIsEditingName(false);
            return;
        }
        setIsSaving(true);
        const updatedUser = await apiService.updateUser(user.email, { name: editedName.trim() });
        if (updatedUser) {
            setUser(updatedUser as User);
        }
        setIsSaving(false);
        setIsEditingName(false);
    };

    const handleSaveAvatar = async (avatarId: string) => {
        if (avatarId === user.avatarId) {
            setIsAvatarModalOpen(false);
            return;
        }
        setIsSavingAvatar(true);
        const updatedUser = await apiService.updateUser(user.email, { avatarId });
        if (updatedUser) {
            setUser(updatedUser as User);
        }
        setIsSavingAvatar(false);
        setIsAvatarModalOpen(false);
    };
    
    const handlePathSelect = (path: LearningPath) => {
        if (path === user.level) {
            setIsPathModalOpen(false);
            return;
        }
        setSelectedPath(path);
        setIsPathModalOpen(false);
        setIsPathConfirmModalOpen(true);
    };
    
    const handleConfirmPathChange = async () => {
        if (!selectedPath) return;
        setIsSavingPath(true);
        const updatedUser = await apiService.updateUser(user.email, {
            level: selectedPath,
            completedModules: [] // Reset progress
        });
        if (updatedUser) {
            setUser(updatedUser as User);
        }
        setIsSavingPath(false);
        setIsPathConfirmModalOpen(false);
        setSelectedPath(null);
    };

    const userPathModules = user.level ? LEARNING_PATHS[user.level].levels.flat() : [];
    const completedModulesCount = user.completedModules.filter(id => userPathModules.includes(id)).length;
    const totalModules = userPathModules.length;
    const progressPercentage = totalModules > 0 ? (completedModulesCount / totalModules) * 100 : 0;
    const allModulesCompleted = completedModulesCount === totalModules && totalModules > 0;
    
    const handleDownload = useCallback(() => {
        if (certificateRef.current === null) return;
        htmlToImage.toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `AI-Kasahorow-Certificate-${user.name}.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => { console.error('Oops, something went wrong!', err); });
    }, [user.name]);


    return (
        <>
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
            <AvatarSelectionModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleSaveAvatar}
                currentAvatarId={user.avatarId}
                isSaving={isSavingAvatar}
            />
            <PathSelectionModal 
                isOpen={isPathModalOpen}
                onClose={() => setIsPathModalOpen(false)}
                onSelect={handlePathSelect}
                currentPath={user.level!}
            />
            <ConfirmationModal
                isOpen={isPathConfirmModalOpen}
                onClose={() => setIsPathConfirmModalOpen(false)}
                onConfirm={handleConfirmPathChange}
                title={t.profile.changePathConfirmTitle}
                message={t.profile.changePathConfirmMessage}
                isConfirming={isSavingPath}
                confirmText={t.common.submit}
            />

            <div className="container mx-auto p-4 md:p-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.profile.title}</h2>
                <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.profile.description}</p>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-lg text-center flex flex-col items-center">
                        <button onClick={() => setIsAvatarModalOpen(true)} className="relative group rounded-full mb-5 ring-4 ring-white shadow-md hover:ring-primary transition-all">
                            <UserAvatar name={user.name} avatarId={user.avatarId} avatarUrl={user.avatarUrl} className="w-24 h-24 md:w-32 md:h-32 text-4xl md:text-5xl" />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Edit size={32} className="text-white" />
                            </div>
                        </button>
                        
                        {!isEditingName ? (
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl md:text-3xl font-bold text-neutral-800">{user.name}</h3>
                                <button onClick={handleEditName} className="text-neutral-500 hover:text-primary"><Edit size={20}/></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 w-full">
                                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full text-center text-2xl font-bold border-b-2 border-primary focus:outline-none bg-transparent text-neutral-900"/>
                                <button onClick={handleSaveName} disabled={isSaving} className="text-green-600 hover:text-green-800 disabled:text-neutral-400">
                                    {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Check size={24}/>}
                                </button>
                                <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800"><X size={24}/></button>
                            </div>
                        )}

                        <p className="text-neutral-500 text-base md:text-lg mt-1">{t.profile.learnerLevel(user.level || LearningPath.Explorer)}</p>
                        <div className="mt-6 inline-flex items-center gap-2 bg-amber-100 text-amber-800 font-bold px-6 py-3 rounded-full text-base md:text-lg">
                            <Award size={22} />
                            {user.points} {t.profile.points}
                        </div>
                        <div className="mt-4">
                             <button onClick={() => setCurrentPage(Page.Wallet)} className="flex items-center justify-center gap-2 text-md font-bold text-primary hover:text-primary-dark transition-colors">
                                <Wallet size={20} /> {t.profile.viewWallet}
                            </button>
                        </div>
                        <div className="mt-8 border-t border-neutral-200 w-full pt-6 flex flex-col items-center gap-4">
                            <button onClick={() => setIsFeedbackModalOpen(true)} className="flex items-center justify-center gap-2 text-md font-bold text-neutral-600 hover:text-primary transition-colors">
                                <MessageSquarePlus size={20} /> {t.profile.feedbackButton}
                            </button>
                            <button onClick={logout} className="flex items-center justify-center gap-2 text-md font-bold text-red-600 hover:text-red-800 transition-colors">
                                <LogOut size={20} /> {t.header.logout}
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Learning Path */}
                         <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl md:text-2xl font-bold text-neutral-800 mb-1">{t.profile.learningPathTitle}</h4>
                                    <p className="font-bold text-lg text-primary">{t.paths[user.level!].name}</p>
                                </div>
                                <button onClick={() => setIsPathModalOpen(true)} className="font-semibold text-sm text-primary hover:underline">{t.profile.changePath}</button>
                            </div>
                        </div>

                        {/* Multiplayer Stats */}
                         <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                            <h4 className="text-xl md:text-2xl font-bold text-neutral-800 mb-5">{t.profile.multiplayerStatsTitle}</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-primary/10 p-4 rounded-xl">
                                    <p className="text-3xl font-bold text-primary">{user.multiplayerStats.wins}</p>
                                    <p className="text-sm font-semibold text-primary/80">{t.profile.wins}</p>
                                </div>
                                <div className="bg-secondary/10 p-4 rounded-xl">
                                    <p className="text-3xl font-bold text-secondary">{user.multiplayerStats.gamesPlayed}</p>
                                    <p className="text-sm font-semibold text-secondary/80">{t.profile.gamesPlayed}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                            <h4 className="text-xl md:text-2xl font-bold text-neutral-800 mb-5">{t.profile.progressTitle}</h4>
                            <div className="relative">
                                <div className="w-full bg-neutral-200 rounded-full h-6 overflow-hidden">
                                <div className="bg-secondary h-6 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm drop-shadow-sm">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <p className="text-md text-neutral-500 text-right mt-2">{t.profile.progressDescription(completedModulesCount, totalModules)}</p>
                        </div>

                        {/* Badges */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                            <h4 className="text-xl md:text-2xl font-bold text-neutral-800 mb-5">{t.profile.badgesTitle}</h4>
                            {user.badges.length > 0 ? (
                                <div className="flex flex-wrap gap-4">
                                    {user.badges.map(badgeId => (
                                        <BadgeIcon key={badgeId} badge={BADGES[badgeId]} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <p className="text-neutral-500">{t.profile.noBadges}</p>
                                </div>
                            )}
                        </div>

                        {/* Certificates */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                            <h4 className="text-xl md:text-2xl font-bold text-neutral-800 mb-5">{t.profile.certificatesTitle}</h4>
                            { allModulesCompleted ? (
                                <div>
                                    <Certificate user={user} certificateRef={certificateRef} />
                                    <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:justify-end">
                                        <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-neutral-700 text-white font-bold py-3 px-5 rounded-lg hover:bg-neutral-800 transition text-base" aria-label="Download certificate">
                                            <Download size={20} /> {t.profile.downloadButton}
                                        </button>
                                        <button className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-5 rounded-lg hover:bg-primary-dark transition text-base" aria-label="Share certificate">
                                            <Share2 size={20} /> {t.profile.shareButton}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <p className="text-neutral-500">{t.profile.moreCertificates}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}