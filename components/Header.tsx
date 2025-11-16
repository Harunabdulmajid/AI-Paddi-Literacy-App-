import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from './AppContext';
import { AppContextType, Language } from '../types';
import { Award, GraduationCap, Languages, LogOut, UserCircle, Settings, Wifi, WifiOff, Mic } from 'lucide-react';
import { useTranslations } from '../i18n';
import { Page } from '../types';

// --- Avatars ---
const Avatar1: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#60a5fa"/>
        <circle cx="50" cy="50" r="35" fill="#3b82f6"/>
        <circle cx="50" cy="50" r="20" fill="#1d4ed8"/>
    </svg>
);
const Avatar2: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="100" height="100" rx="50" fill="#818cf8"/>
        <path d="M25 75L50 25L75 75H25Z" fill="#4f46e5"/>
    </svg>
);
const Avatar3: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#facc15"/>
        <path d="M50 15L62.5 37.5L87.5 37.5L68.75 56.25L75 81.25L50 62.5L25 81.25L31.25 56.25L12.5 37.5L37.5 37.5L50 15Z" fill="#eab308"/>
    </svg>
);
const Avatar4: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#4ade80"/>
        <path d="M25 25H75V75H25V25Z" fill="#22c55e" transform="rotate(45 50 50)"/>
    </svg>
);
const Avatar5: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#fb923c"/>
        <path d="M50 20C20 50 80 50 50 80C80 50 20 50 50 20Z" fill="#f97316"/>
    </svg>
);
const Avatar6: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#f472b6"/>
        <rect x="25" y="25" width="50" height="50" rx="10" fill="#ec4899"/>
    </svg>
);

export const AVATARS: Record<string, React.ComponentType<{ className?: string }>> = {
  'avatar-01': Avatar1,
  'avatar-02': Avatar2,
  'avatar-03': Avatar3,
  'avatar-04': Avatar4,
  'avatar-05': Avatar5,
  'avatar-06': Avatar6,
};

export const UserAvatar: React.FC<{ name: string; avatarUrl?: string; avatarId?: string; className?: string }> = ({ name, avatarUrl, avatarId, className }) => {
    const baseClasses = "rounded-full";
    const finalClassName = `${className || 'w-10 h-10 text-lg'} ${baseClasses}`;
    
    if (avatarUrl) {
        return <img src={avatarUrl} alt={name} className={`${finalClassName} object-cover`} />;
    }
    
    const AvatarComponent = avatarId ? AVATARS[avatarId] : null;

    if (AvatarComponent) {
        return <AvatarComponent className={finalClassName} />;
    }
    
    return (
        <div className={`${finalClassName} bg-primary/20 text-primary flex items-center justify-center font-bold`}>
            {name?.charAt(0).toUpperCase()}
        </div>
    );
};

const OfflineIndicator: React.FC = () => {
    // FIX: Cast context to the correct type to resolve TS inference errors.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) return null;
    const { isOnline } = context;
    const t = useTranslations();
    const title = isOnline ? t.offline.onlineIndicator : t.offline.offlineIndicator;

    return (
        <div title={title} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${isOnline ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600'}`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
        </div>
    );
}

const VoiceIndicator: React.FC = () => {
    // FIX: Cast context to the correct type to resolve TS inference errors.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) return null;
    const { isVoiceModeEnabled, isListening } = context;
    const t = useTranslations();

    if (!isVoiceModeEnabled) return null;

    return (
        <div title={isListening ? t.voice.listening : t.voice.voiceModeActive} className="p-2 text-primary">
            <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
        </div>
    );
};


export const Header: React.FC<{ onSettingsClick: () => void }> = ({ onSettingsClick }) => {
  // FIX: Cast context to the correct type to resolve TS inference errors.
  const context = useContext(AppContext) as AppContextType | null;
  if (!context) throw new Error('Header must be used within an AppProvider');
  const { user, language, setLanguage, setCurrentPage, logout } = context;
  const t = useTranslations();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return null; 
  }

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setIsDropdownOpen(false);
  }

  return (
    <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-20 shadow-sm p-3 md:p-4 border-b border-neutral-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-primary" size={28} />
          <h1 className="text-xl md:text-2xl font-bold text-neutral-800"><span className="hidden sm:inline">AI </span>Kasahorow</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <OfflineIndicator />
          <div className="flex items-center gap-1 md:gap-2">
            <Award className="text-accent" size={22} />
            <span className="font-bold text-neutral-700 text-base md:text-lg">{user.points} <span className="hidden sm:inline">{t.common.pointsAbbr}</span></span>
          </div>
          
          <div className="relative">
            <Languages className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm md:text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
              aria-label="Select language"
            >
              {Object.values(Language).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <VoiceIndicator />
          <button onClick={onSettingsClick} className="p-2 text-neutral-500 hover:text-primary transition-colors" aria-label={t.header.settings}>
            <Settings size={24}/>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all">
                <UserAvatar name={user.name} avatarId={user.avatarId} avatarUrl={user.avatarUrl} />
            </button>
            {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-64 sm:w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-30">
                    <div className="px-4 py-2 border-b border-neutral-200 mb-2">
                        <p className="font-bold text-neutral-800 truncate">{user.name}</p>
                        <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => handleNavigation(Page.Profile)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-100">
                        <UserCircle size={20} /> {t.header.profile}
                    </button>
                    <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50">
                        <LogOut size={20} /> {t.header.logout}
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};