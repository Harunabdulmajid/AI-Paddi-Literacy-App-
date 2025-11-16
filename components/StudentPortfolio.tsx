import React, { useContext, useRef, useState, useCallback } from 'react';
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { BADGES, LEARNING_PATHS, CURRICULUM_MODULES } from '../constants';
import { UserAvatar } from './Header';
import { BadgeIcon } from './BadgeIcon';
import { Download, Loader2, CheckSquare, GraduationCap } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export const StudentPortfolio: React.FC = () => {
    const context = useContext(AppContext);
    const t = useTranslations();
    const portfolioRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!context || !context.user) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></div>;
    }
    const { user } = context;

    const handleDownload = useCallback(() => {
        if (portfolioRef.current === null) {
          return;
        }
        setIsGenerating(true);
        htmlToImage.toPng(portfolioRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `ai-paddi-portfolio-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
            setIsGenerating(false);
          })
          .catch((err) => {
            console.error('Oops, something went wrong!', err);
            setIsGenerating(false);
          });
    }, [user.name]);

    // FIX: Access the `levels` property and flatten the array to get all module IDs for the user's learning path.
    const userPathModules = user.level ? LEARNING_PATHS[user.level].levels.flat() : [];
    const completedModules = user.completedModules
        .filter(id => userPathModules.includes(id))
        .map(id => t.curriculum[id]?.title || 'Unknown Module')
        .slice(0, 6); // Max 6 modules to keep it clean

    const earnedBadges = user.badges.map(id => BADGES[id]).filter(Boolean).slice(0, 5); // Max 5 badges

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.studentPortfolio.title}</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.studentPortfolio.description}</p>
            
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
                <div 
                    ref={portfolioRef}
                    className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-primary/20 relative overflow-hidden"
                >
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full z-0"></div>
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary/5 rounded-full z-0"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b-2 border-neutral-200 pb-6">
                            <UserAvatar name={user.name} avatarId={user.avatarId} className="w-24 h-24 text-4xl" />
                            <div>
                                <h3 className="text-3xl font-extrabold text-neutral-800 text-center sm:text-left">{user.name}</h3>
                                <p className="text-lg font-semibold text-primary text-center sm:text-left">{t.paths[user.level!].name} Path</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h4 className="font-bold text-lg text-neutral-700 mb-3">{t.studentPortfolio.completedModules}</h4>
                                <ul className="space-y-2">
                                    {completedModules.map((title, index) => (
                                        <li key={index} className="flex items-center gap-2 text-neutral-600">
                                            <CheckSquare size={18} className="text-secondary flex-shrink-0" />
                                            <span>{title}</span>
                                        </li>
                                    ))}
                                    {completedModules.length === 0 && <p className="text-neutral-400 text-sm">No modules completed yet.</p>}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-neutral-700 mb-3">{t.studentPortfolio.badgesEarned}</h4>
                                {earnedBadges.length > 0 ? (
                                     <div className="flex flex-wrap gap-3">
                                        {earnedBadges.map(badge => (
                                            <BadgeIcon key={badge.id} badge={badge} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-neutral-400 text-sm">No badges earned yet.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-8 pt-4 text-center">
                            <div className="inline-flex items-center gap-2">
                                <GraduationCap className="text-primary" size={20} />
                                <p className="text-sm font-bold text-neutral-500">AI Paddi - AI Literacy for All</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full max-w-xs flex items-center justify-center gap-3 bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-neutral-400"
                    aria-label="Download portfolio as PNG image"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" />
                            {t.studentPortfolio.generating}
                        </>
                    ) : (
                        <>
                            <Download />
                            {t.studentPortfolio.downloadButton}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};