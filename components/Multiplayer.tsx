import React, { useContext, useEffect } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { PracticeLobby } from './MultiplayerLobby';
import { PracticeGame } from './MultiplayerGame';
import { PracticeResults } from './MultiplayerResults';
import { useTranslations } from '../i18n';
import { Loader2 } from 'lucide-react';

export const PeerPractice: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("PeerPractice must be used within an AppProvider");
    const { gameSession, setGameSession, user } = context;
    const t = useTranslations();

    // Clean up session on unmount if game hasn't finished
    useEffect(() => {
        return () => {
            if (gameSession && gameSession.status !== 'finished') {
                setGameSession(null);
            }
        };
    }, [gameSession, setGameSession]);

    if (!user) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></div>;
    }

    const renderContent = () => {
        if (!gameSession) {
            return <PracticeLobby />;
        }

        switch (gameSession.status) {
            case 'waiting':
                return <PracticeLobby />;
            case 'in-progress':
                return <PracticeGame />;
            case 'finished':
                return <PracticeResults />;
            default:
                return <PracticeLobby />;
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.peerPractice.title}</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.peerPractice.description}</p>
            
            <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-lg min-h-[500px]">
                {renderContent()}
            </div>
        </div>
    );
};
