import React, { useContext, useEffect, useState } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { Trophy, Award, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { User } from '../types';

const getRankClasses = (rank: number, isCurrentUser: boolean) => {
    let classes = {
        bg: 'bg-neutral-50',
        text: 'text-neutral-800',
        trophy: 'text-neutral-500',
        ring: ''
    };

    if (isCurrentUser) {
        classes.bg = 'bg-primary/10';
        classes.ring = 'ring-2 ring-primary';
    }

    switch(rank) {
        case 1: 
            classes.trophy = 'text-amber-400';
            break;
        case 2: 
            classes.trophy = 'text-slate-400';
            break;
        case 3: 
            classes.trophy = 'text-amber-600';
            break;
    }
    
    return classes;
}

export const Leaderboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("Leaderboard must be used within an AppProvider");
    const { user, awardBadge } = context;
    const t = useTranslations();

    const [leaderboard, setLeaderboard] = useState<Array<Pick<User, 'name' | 'points'>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const data = await apiService.getLeaderboard();
            setLeaderboard(data);
            setIsLoading(false);

            // Award badge if user is in top 3
            if (user) {
                const userRank = data.findIndex(p => p.name === user.name);
                if (userRank !== -1 && userRank < 3) {
                    awardBadge('top-contender');
                }
            }
        };
        fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user) return null;
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.leaderboard.title}</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.leaderboard.description}</p>
            
            <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center p-3 text-sm font-bold text-neutral-500">
                            <div className="w-12 md:w-16 text-left pl-3">{t.leaderboard.rank.toUpperCase()}</div>
                            <div className="flex-grow">{t.leaderboard.player.toUpperCase()}</div>
                            <div>{t.leaderboard.points.toUpperCase()}</div>
                        </div>
                        {leaderboard?.map((player, index) => {
                            const rank = index + 1;
                            const isCurrentUser = player.name === user.name;
                            const rankClasses = getRankClasses(rank, isCurrentUser);
                            
                            return (
                                <div key={`${player.name}-${rank}`} className={`flex items-center p-3 md:p-4 rounded-xl transition-all ${rankClasses.bg} ${rankClasses.ring}`}>
                                    <div className="flex items-center justify-center w-12 md:w-16">
                                        {rank <= 3 ? (
                                            <Trophy size={28} className={`${rankClasses.trophy} md:w-8 md:h-8`} strokeWidth={2.5}/>
                                        ) : (
                                            <span className="text-lg md:text-xl font-bold text-neutral-500 w-8 text-center">{rank}</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-lg font-bold ${isCurrentUser ? 'text-primary' : 'text-neutral-800'}`}>
                                            {player.name} {isCurrentUser && `(${t.leaderboard.you})`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-lg font-bold text-accent">
                                        <Award size={20} />
                                        <span>{player.points}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
