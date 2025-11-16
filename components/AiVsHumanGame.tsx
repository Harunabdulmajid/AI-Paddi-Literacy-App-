import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AppContext } from './AppContext';
import { geminiService } from '../services/geminiService';
import { Loader2, Bot, User, RefreshCw, Lock } from 'lucide-react';
import { useTranslations } from '../i18n';
import { Difficulty, AppContextType } from '../types';

export const AiVsHumanGame: React.FC = () => {
  // FIX: Cast context to the correct type to resolve TS inference errors.
  const context = useContext(AppContext) as AppContextType | null;
  if (!context) throw new Error("AiVsHumanGame must be used within an AppProvider");
  const { language, user, addTransaction, openUpgradeModal } = context;
  const t = useTranslations();
  
  const [content, setContent] = useState<{ text: string; isAi: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guess, setGuess] = useState<'ai' | 'human' | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  const contentCache = useRef<Array<{ text: string; isAi: boolean }>>([]);
  const isFetching = useRef(false);

  const getNextContent = useCallback(() => {
    const fetchAndSet = async () => {
        if (isFetching.current) return;
        
        setIsLoading(true);
        setGuess(null);
        setResult(null);

        if (contentCache.current.length === 0) {
            isFetching.current = true;
            try {
                const newBatch = await geminiService.generateAiVsHumanContentBatch(language, difficulty);
                contentCache.current = newBatch;
            } finally {
                isFetching.current = false;
            }
        }

        if (contentCache.current.length > 0) {
            const nextContent = contentCache.current.shift();
            setContent(nextContent || null);
        } else {
            setContent({ text: "Could not load new content. Please try again.", isAi: false });
        }
        setIsLoading(false);
    };
    fetchAndSet();
  }, [language, difficulty]);

  useEffect(() => {
    contentCache.current = []; // Clear cache whenever context changes
    getNextContent();
  }, [language, difficulty, getNextContent]);


  const handleGuess = (madeGuess: 'ai' | 'human') => {
    if (!content || guess) return;
    setGuess(madeGuess);
    const correctGuess = (madeGuess === 'ai' && content.isAi) || (madeGuess === 'human' && !content.isAi);
    
    setSessionScore(prev => ({ correct: prev.correct + (correctGuess ? 1 : 0), total: prev.total + 1 }));

    if (correctGuess) {
      setResult('correct');
      addTransaction({
          type: 'earn',
          description: t.game.pointDescription,
          amount: 10
      });
    } else {
      setResult('incorrect');
    }
  };
  
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (newDifficulty === 'Hard' && !user?.isPro) {
        openUpgradeModal(`${t.game.title} (${t.game.hard})`);
        return;
    }
    setDifficulty(newDifficulty);
  };

  const getResultClasses = () => {
    if (result === 'correct') return 'bg-green-100 border-green-400 text-green-900';
    if (result === 'incorrect') return 'bg-red-100 border-red-400 text-red-900';
    return 'bg-neutral-100 border-neutral-300 text-neutral-700';
  };
  
  const getButtonClasses = (buttonType: 'human' | 'ai') => {
    if (!guess) {
        return 'border-transparent hover:border-primary hover:bg-primary/10';
    }
    const isCorrectAnswer = (buttonType === 'ai' && content?.isAi) || (buttonType === 'human' && !content?.isAi);
    if(isCorrectAnswer) {
      return 'border-secondary bg-secondary/10 scale-105';
    }
    if (guess === buttonType && !isCorrectAnswer) {
      return 'border-red-500 bg-red-500/10 opacity-70';
    }
    return 'border-transparent opacity-50';
  }

  if (!user) return null;

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-2xl shadow-lg text-center">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800">{t.game.title}</h2>
                <div className="bg-neutral-100 text-neutral-700 font-bold text-lg px-4 py-2 rounded-lg">
                    Score: {sessionScore.correct} / {sessionScore.total}
                </div>
            </div>
            <p className="text-neutral-500 mb-6 text-base md:text-lg">{t.game.description}</p>

             <div className="flex justify-center items-center gap-4 mb-6">
                <span className="font-bold text-neutral-600">{t.game.difficulty}:</span>
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                    <button
                        onClick={() => handleDifficultyChange('Easy')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${difficulty === 'Easy' ? 'bg-primary text-white shadow' : 'text-neutral-500 hover:bg-neutral-200'}`}
                    >
                        {t.game.easy}
                    </button>
                    <button
                        onClick={() => handleDifficultyChange('Hard')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${difficulty === 'Hard' ? 'bg-primary text-white shadow' : 'text-neutral-500 hover:bg-neutral-200'}`}
                    >
                        {t.game.hard}
                        {!user.isPro && <Lock size={12} />}
                    </button>
                </div>
            </div>

            <div className={`p-6 md:p-8 rounded-2xl min-h-[200px] flex items-center justify-center text-xl md:text-2xl italic font-medium border-2 ${getResultClasses()} transition-colors duration-300`}>
                {isLoading ? (
                    <Loader2 className="animate-spin text-primary" size={40} />
                ) : (
                    <blockquote className={`transition-opacity duration-500 ${content ? 'opacity-100' : 'opacity-0'} leading-relaxed`}>"{content?.text}"</blockquote>
                )}
            </div>

            {result && (
                <div className="mt-6 transition-all duration-300 transform opacity-100 scale-100" style={{ transformOrigin: 'top' }}>
                    <p className={`font-bold text-xl md:text-2xl ${result === 'correct' ? 'text-secondary' : 'text-red-600'}`}>
                        {result === 'correct' ? t.game.correct : t.game.incorrect}
                    </p>
                    <p className="text-md font-medium text-neutral-500">
                        {t.game.writtenBy(content?.isAi ? t.game.aiAuthor : t.game.humanAuthor)}
                    </p>
                </div>
            )}

            <div className={`mt-8 grid grid-cols-2 gap-4 md:gap-6`}>
                <button
                    onClick={() => handleGuess('human')}
                    disabled={!!guess}
                    className={`flex flex-col items-center justify-center gap-3 p-4 md:p-6 border-4 rounded-2xl bg-neutral-100 transition-all duration-300 disabled:cursor-not-allowed ${getButtonClasses('human')}`}
                >
                    <User size={36} className="text-neutral-600 md:hidden"/>
                    <User size={48} className="text-neutral-600 hidden md:block"/>
                    <span className="font-bold text-lg md:text-xl">{t.game.humanButton}</span>
                </button>
                 <button
                    onClick={() => handleGuess('ai')}
                    disabled={!!guess}
                    className={`flex flex-col items-center justify-center gap-3 p-4 md:p-6 border-4 rounded-2xl bg-neutral-100 transition-all duration-300 disabled:cursor-not-allowed ${getButtonClasses('ai')}`}
                >
                    <Bot size={36} className="text-neutral-600 md:hidden"/>
                    <Bot size={48} className="text-neutral-600 hidden md:block"/>
                    <span className="font-bold text-lg md:text-xl">{t.game.aiButton}</span>
                </button>
            </div>
            {guess && (
                 <button
                    onClick={getNextContent}
                    className="mt-8 flex items-center justify-center gap-3 w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary-dark transition-transform active:scale-95"
                >
                    <RefreshCw size={22} /> {t.game.playAgainButton}
                </button>
            )}
        </div>
    </div>
  );
};