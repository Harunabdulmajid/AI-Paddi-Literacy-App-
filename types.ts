import React from 'react';

export enum LearningPath {
  Explorer = 'Explorer',
  Creator = 'Creator',
  Innovator = 'Innovator',
  Ethicist = 'Ethicist',
}

export enum Language {
  English = 'English',
  Hausa = 'Hausa',
  Yoruba = 'Yoruba',
  Igbo = 'Igbo',
  Pidgin = 'Pidgin English',
  Swahili = 'Swahili',
  Amharic = 'Amharic',
  Zulu = 'Zulu',
  Shona = 'Shona',
  Somali = 'Somali',
}

export enum Page {
  Dashboard = 'Dashboard',
  PeerPractice = 'Peer-to-Peer Practice',
  AiVsHuman = 'AI vs Human',
  Profile = 'Profile & Certificates',
  Lesson = 'Lesson',
  Leaderboard = 'Leaderboard',
  Wallet = 'Wallet',
  Glossary = 'Glossary',
  PodcastGenerator = 'Podcast Generator',
  CareerExplorer = 'AI Career Explorer',
  CreationStudio = 'Creation Studio',
  StudentPortfolio = 'Student Portfolio',
  AiTutor = 'AI Tutor',
}

export type Difficulty = 'Easy' | 'Hard';

export enum FeedbackType {
    Bug = 'Bug Report',
    Suggestion = 'Suggestion',
    General = 'General Feedback'
}

export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
  Parent = 'Parent',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  cost?: number; // Optional cost for purchasing in the marketplace
}

export interface MultiplayerStats {
    wins: number;
    gamesPlayed: number;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'send' | 'receive';
  description: string;
  amount: number; // Always positive
  timestamp: number;
  from?: string; // Name of sender
  to?: string; // Name of recipient
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
  dailyTransfer: {
    date: string; // YYYY-MM-DD
    amount: number;
  };
}

export interface User {
  id: string;
  googleId: string;
  email: string;
  password?: string;
  name: string;
  phoneNumber?: string;
  country?: string;
  avatarUrl?: string;
  level: LearningPath | null;
  role: UserRole;
  childEmail?: string; // For Parent role
  points: number; // This will mirror wallet.balance for easy access
  completedModules: string[];
  badges: string[];
  multiplayerStats: MultiplayerStats;
  wallet: Wallet;
  lastLoginDate: string; // YYYY-DD-MM
  loginStreak: number;
  certificateLevel: 'basic' | 'distinction';
  theme: string; // e.g., 'default', 'dark'
  avatarId: string; // e.g., 'avatar-01'
  unlockedVoices: Language[];
  tutorTokens: number;
  quizRewinds: number;
  unlockedBanners: string[];
  unlockedThemes: string[];
  isPro: boolean;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  avatarId: string;
  completedModules: string[];
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string;
  joinCode: string;
  students: StudentProgress[];
  assignedModules: string[];
}

export interface Question {
  type: 'multiple-choice' | 'fill-in-the-blank';
  question: string;
  options: string[];
  correctAnswerIndex: number; // Unused for fill-in-the-blank
  answer?: string; // For fill-in-the-blank questions
  explanation: string;
  hint?: string;
}


export interface Quiz {
  questions: Question[];
}

export interface ScenarioChoice {
  text: string;
  response: string;
  isOptimal: boolean;
}

export interface Scenario {
  title: string;
  situation: string;
  choices: ScenarioChoice[];
}

export interface LessonContent {
  title: string;
  introduction: string;
  sections: { heading: string; content: string }[];
  summary:string;
  quiz: Quiz;
  scenario: Scenario; // New scenario field
}


export interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

// --- Multiplayer Types ---
export type GameStatus = 'waiting' | 'in-progress' | 'finished';

export interface Player {
    id: string;
    name: string;
    score: number;
    progressIndex: number;
    language: Language;
    streak: number;
}

export interface MultiplayerQuestion {
    id: string; // e.g., 'what-is-ai-q1'
    moduleId: string;
    questionIndexInModule: number;
}

export interface GameSession {
    code: string;
    hostId: string;
    status: GameStatus;
    players: Player[];
    questions: MultiplayerQuestion[];
    createdAt: number;
    currentQuestionIndex: number;
}
// --- End Multiplayer Types ---

export type MarketplaceCategory = 'Recognition' | 'Customization' | 'Learning Boosters' | 'Social Play' | 'Future Perks';

export interface MarketplaceItem {
    id: string;
    category: MarketplaceCategory;
    title: string;
    description: string;
    cost: number;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    isComingSoon?: boolean;
    isOwned?: (user: User) => boolean;
    payload: Record<string, any>;
}


export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
  activeModuleId: string | null;
  setActiveModuleId: React.Dispatch<React.SetStateAction<string | null>>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  completeModule: (moduleId: string) => Promise<void>;
  gameSession: GameSession | null;
  setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
  // Offline and Voice Features
  isOnline: boolean;
  downloadedModules: string[];
  downloadModule: (moduleId: string) => Promise<void>;
  isVoiceModeEnabled: boolean;
  toggleVoiceMode: () => void;
  speak: (text: string, lang: Language) => void;
  isListening: boolean;
  // Pro Plan
  openUpgradeModal: (featureName: string) => void;
}