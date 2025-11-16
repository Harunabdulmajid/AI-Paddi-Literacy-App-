import React, { useState, useContext, useEffect } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { apiService } from '../services/apiService';
import { useTranslations } from '../i18n';
import { Loader2, Clipboard, Check, Users, Play, Crown, LogIn, Share2 } from 'lucide-react';

export const PracticeLobby: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("PracticeLobby must be used within an AppProvider");
  const { user, language, gameSession, setGameSession } = context;

  const [isLoading, setIsLoading] = useState<'create' | 'join' | 'start' | null>(null);
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Polling for session updates
  useEffect(() => {
    if (gameSession && gameSession.status === 'waiting') {
      const interval = setInterval(async () => {
        try {
          const updatedSession = await apiService.getGameSession(gameSession.code);
          setGameSession(updatedSession);
        } catch (err) {
          console.error("Failed to poll session", err);
        }
      }, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [gameSession, setGameSession]);

  if (!user) return null;

  const handleCreateSession = async () => {
    setIsLoading('create');
    setError(null);
    try {
      const session = await apiService.createGameSession(user, language);
      setGameSession(session);
    } catch (err) {
      setError(t.peerPractice.errorGeneric);
    } finally {
      setIsLoading(null);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) return;
    setIsLoading('join');
    setError(null);
    try {
      const session = await apiService.joinGameSession(gameCode.toUpperCase(), user, language);
      setGameSession(session);
    } catch (err: any) {
        if (err.message.includes('not found')) setError(t.peerPractice.errorNotFound);
        else if (err.message.includes('started')) setError(t.peerPractice.errorAlreadyStarted);
        else if (err.message.includes('full')) setError(t.peerPractice.errorFull);
        else setError(t.peerPractice.errorGeneric);
    } finally {
      setIsLoading(null);
    }
  };

  const handleStartPractice = async () => {
      if (!gameSession) return;
      setIsLoading('start');
      setError(null);
      try {
          const session = await apiService.startGameSession(gameSession.code, user.id);
          setGameSession(session);
      } catch (err) {
          setError(t.peerPractice.errorGeneric);
      } finally {
          setIsLoading(null);
      }
  };

  const handleCopyCode = () => {
    if (!gameSession) return;
    navigator.clipboard.writeText(gameSession.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const t = useTranslations();
  
  if (gameSession) {
      const isHost = gameSession.hostId === user.id;
      return (
        <div className="text-center animate-fade-in">
            <h3 className="text-3xl font-bold text-neutral-800">{t.peerPractice.lobbyTitle}</h3>
            <p className="text-neutral-500 mt-2">{t.peerPractice.shareCode}</p>
            <div className="my-6 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-neutral-100 border-2 border-dashed border-neutral-300 p-4 rounded-xl">
                    <span className="text-4xl font-extrabold text-primary tracking-widest">{gameSession.code}</span>
                    <button onClick={handleCopyCode} className="p-2 text-neutral-500 hover:text-primary transition-colors">
                        {isCopied ? <Check size={24} className="text-secondary"/> : <Clipboard size={24} />}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h4 className="font-bold text-lg text-neutral-700 flex items-center justify-center gap-2"><Users size={20}/> {t.peerPractice.players} ({gameSession.players.length}/10)</h4>
                <div className="mt-4 space-y-2 max-w-sm mx-auto">
                    {gameSession.players.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                            <span className="font-semibold text-neutral-800">{p.name}</span>
                            {p.id === gameSession.hostId && <span title="Host"><Crown size={20} className="text-accent" /></span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10">
                {isHost ? (
                     <button onClick={handleStartPractice} disabled={isLoading === 'start'} className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-neutral-400">
                        {isLoading === 'start' ? <><Loader2 className="animate-spin"/> {t.peerPractice.starting}</> : <><Play/> {t.peerPractice.startPractice}</>}
                    </button>
                ) : (
                    <p className="text-neutral-500 font-semibold flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> {t.peerPractice.waitingForHost}</p>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 h-full">
        <div className="w-full md:w-1/2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-neutral-800">{t.peerPractice.createSession}</h3>
            <button onClick={handleCreateSession} disabled={!!isLoading} className="mt-4 flex w-full md:w-auto items-center justify-center gap-3 bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-neutral-400">
                {isLoading === 'create' ? <><Loader2 className="animate-spin"/> {t.peerPractice.creating}</> : <><Share2/> {t.peerPractice.createSession}</>}
            </button>
        </div>
        <div className="w-full md:w-1/2">
             <h3 className="text-2xl font-bold text-neutral-800 text-center md:text-left">{t.peerPractice.joinSession}</h3>
             <form onSubmit={handleJoinSession} className="mt-4 flex flex-col sm:flex-row gap-2">
                 <input 
                    type="text"
                    value={gameCode}
                    onChange={e => setGameCode(e.target.value)}
                    placeholder={t.peerPractice.sessionCodePlaceholder}
                    className="flex-grow p-3 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900 placeholder:text-neutral-400 uppercase tracking-widest text-center sm:text-left"
                    maxLength={5}
                    required
                 />
                 <button type="submit" disabled={!!isLoading} className="flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-5 rounded-lg hover:opacity-90 transition disabled:bg-neutral-400">
                    {isLoading === 'join' ? <Loader2 className="animate-spin"/> : <LogIn/>}
                 </button>
             </form>
        </div>
         {error && <p className="text-red-600 font-semibold mt-4 w-full text-center md:col-span-2">{error}</p>}
    </div>
  );
};
