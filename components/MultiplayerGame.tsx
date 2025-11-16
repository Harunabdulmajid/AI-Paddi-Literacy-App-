import React, { useContext, useState, useEffect, useMemo } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { apiService } from '../services/apiService';
import { GameSession, Player } from '../types';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

const ProgressTracker: React.FC<{ players: Player[], currentQuestionIndex: number }> = ({ players, currentQuestionIndex }) => {
    const t = useTranslations();
    
    return (
        <div className="w-full lg:w-1/3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-neutral-700"><Users size={20}/> {t.peerPractice.progress}</h3>
            <div className="space-y-2">
                {players.map((player) => {
                    const hasAnswered = player.progressIndex > currentQuestionIndex;
                    return (
                        <div key={player.id} className="flex justify-between items-center bg-white p-2 rounded-md">
                            <span className="font-semibold text-neutral-800">{player.name}</span>
                            {hasAnswered ? 
                                <CheckCircle size={20} className="text-secondary" /> : 
                                <Loader2 size={20} className="text-neutral-400 animate-spin" />
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const PracticeGame: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("PracticeGame must be used within an AppProvider");
    const { gameSession, setGameSession, user } = context;
    const t = useTranslations();

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    
    const currentPlayer = gameSession?.players.find(p => p.id === user?.id);
    const currentQuestionIndex = gameSession?.currentQuestionIndex ?? 0;
    const currentQuestionInfo = gameSession?.questions[currentQuestionIndex];
    
    const isAnswered = !!(currentPlayer && currentPlayer.progressIndex > currentQuestionIndex);
    
    const questionContent = currentQuestionInfo 
        ? t.curriculum[currentQuestionInfo.moduleId].lessonContent.quiz.questions[currentQuestionInfo.questionIndexInModule] 
        : null;

    // Polling for game state updates
    useEffect(() => {
        const interval = setInterval(async () => {
            if (gameSession && gameSession.status === 'in-progress') {
                try {
                    const updatedSession = await apiService.getGameSession(gameSession.code);
                    setGameSession(updatedSession);
                } catch (err) {
                    console.error("Failed to poll session", err);
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [gameSession, setGameSession]);

    // Reset for next question
    useEffect(() => {
        setSelectedAnswer(null);
        setStartTime(Date.now());
    }, [currentQuestionIndex]);

    if (!gameSession || !user || !currentPlayer || !questionContent) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }
    
    const handleAnswer = async (answerIndex: number) => {
        if (isAnswered || !currentQuestionInfo) return;

        setSelectedAnswer(answerIndex);
        const timeTakenMs = Date.now() - startTime;
        
        try {
            const updatedSession = await apiService.submitAnswer(gameSession.code, user.id, currentQuestionInfo.id, answerIndex, timeTakenMs);
            setGameSession(updatedSession);
        } catch (error) {
            console.error("Failed to submit answer:", error);
            // Optionally show an error to the user
        }
    };
    
    const isCorrect = selectedAnswer === questionContent.correctAnswerIndex;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
                <p className="font-bold text-primary mb-2">
                    {t.peerPractice.question(currentQuestionIndex + 1, gameSession.questions.length)}
                </p>
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">{questionContent.question}</h2>
                <div className="space-y-3">
                    {questionContent.options.map((option, index) => {
                        let buttonClass = 'bg-white hover:bg-neutral-100 border-neutral-300';
                        if (isAnswered) {
                            if (index === questionContent.correctAnswerIndex) {
                                buttonClass = 'bg-green-100 border-green-400 text-green-800';
                            } else if (index === selectedAnswer) {
                                buttonClass = 'bg-red-100 border-red-400 text-red-800';
                            } else {
                                buttonClass = 'bg-neutral-100 border-neutral-200 opacity-60';
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all text-md flex items-center justify-between ${buttonClass}`}
                            >
                                <span>{option}</span>
                                {isAnswered && index === selectedAnswer && (isCorrect ? <CheckCircle /> : <XCircle />)}
                            </button>
                        );
                    })}
                </div>
                 {isAnswered && gameSession.status === 'in-progress' && (
                     <div className="text-center p-4 mt-6">
                        <p className="text-neutral-500 font-semibold">{t.peerPractice.waitingForPlayers}</p>
                        <Loader2 className="animate-spin text-primary mx-auto mt-2"/>
                     </div>
                 )}
            </div>
            <ProgressTracker players={gameSession.players} currentQuestionIndex={currentQuestionIndex} />
        </div>
    );
};
