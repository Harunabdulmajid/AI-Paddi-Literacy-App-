import React, { useContext, useMemo, useEffect } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { Page, User } from '../types';
import { Trophy, Award, RotateCw, LogOut, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export const PracticeResults: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("PracticeResults must be used within an AppProvider");
    const { gameSession, setGameSession, setCurrentPage, user, setUser } = context;
    const t = useTranslations();

    // Effect to refresh user data when results are shown to get latest points/badges
    useEffect(() => {
        const refreshUserData = async () => {
            if (user) {
                const freshUser = await apiService.getUserByEmail(user.email);
                if (freshUser) {
                    setUser(freshUser as User);
                }
            }
        };
        refreshUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount
    
    const sortedPlayers = useMemo(() => {
        if (!gameSession) return [];
        return [...gameSession.players].sort((a, b) => b.score - a.score);
    }, [gameSession]);

    if (!gameSession) {
        // Should not happen, but as a fallback
        setCurrentPage(Page.Dashboard);
        return null;
    }
    
    const handleExit = () => {
        setGameSession(null);
        setCurrentPage(Page.Dashboard);
    };

    const getRankTrophy = (rank: number) => {
        if (rank === 1) return <Trophy size={28} className="text-amber-400" strokeWidth={2.5}/>;
        if (rank === 2) return <Trophy size={24} className="text-slate-400" strokeWidth={2.5}/>;
        if (rank === 3) return <Trophy size={22} className="text-amber-600" strokeWidth={2.5}/>;
        return <span className="font-bold text-neutral-500 w-8 text-center">{rank}</span>;
    }

    return (
        <div className="text-center animate-fade-in">
            <CheckCircle className="text-secondary mx-auto" size={64} />
            <h2 className="text-3xl font-bold text-neutral-800 mt-4">{t.peerPractice.practiceComplete}</h2>
            
            <div className="mt-8 max-w-lg mx-auto">
                 <h4 className="font-bold text-lg text-neutral-700 mb-3">Final Scores</h4>
                 <div className="space-y-2">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.id} className="flex items-center bg-neutral-50 p-3 rounded-lg text-left">
                            <div className="w-12 text-center">
                                {getRankTrophy(index + 1)}
                            </div>
                            <span className="flex-grow font-semibold text-neutral-800 text-lg">{player.name}</span>
                            <div className="flex items-center gap-2 text-lg font-bold text-primary">
                                <Award size={20} />
                                <span>{player.score}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                    onClick={() => { /* Rematch logic would go here */ }}
                    disabled={true} /* Disabled until implemented */
                    className="flex items-center justify-center gap-3 bg-secondary text-white font-bold py-3 px-6 rounded-xl text-lg hover:opacity-90 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                    <RotateCw/> {t.peerPractice.practiceAgain}
                </button>
                <button 
                    onClick={handleExit}
                    className="flex items-center justify-center gap-3 bg-neutral-600 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-neutral-700 transition"
                >
                    <LogOut/> {t.peerPractice.exit}
                </button>
            </div>
        </div>
    );
};
