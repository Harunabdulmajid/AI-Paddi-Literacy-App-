import React, { useState, useContext, useRef, useCallback } from 'react';
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { geminiService } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Loader2, Sparkles, Wand2, BookText, RefreshCw, Palette, Download, ArrowRight, CornerDownLeft, Zap } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const projectTemplates = [
    { id: 'poem', icon: Wand2, promptTemplate: (input: string, lang: string) => `Write a short, four-line poem in ${lang} about "${input}". The poem should be simple and suitable for a beginner.` },
    { id: 'story', icon: BookText, promptTemplate: (input: string, lang: string) => `Write the first, exciting paragraph of a story in ${lang} based on this idea: "${input}". Make it engaging for a young reader.` },
    { id: 'proverb', icon: Sparkles, promptTemplate: (input: string, lang: string) => `Create a new, wise-sounding proverb in ${lang} about the modern topic of "${input}".` }
];

const canvasStyles = [
    { id: 'sunset', class: 'bg-gradient-to-br from-amber-100 to-orange-200 text-orange-900', font: 'font-serif' },
    { id: 'sky', class: 'bg-gradient-to-br from-sky-200 to-blue-300 text-blue-900', font: 'font-sans' },
    { id: 'forest', class: 'bg-gradient-to-br from-green-200 to-emerald-300 text-emerald-900', font: 'font-sans' },
    { id: 'night', class: 'bg-gradient-to-br from-slate-800 to-gray-900 text-white', font: 'font-serif' },
];

export const CreationStudio: React.FC = () => {
    const context = useContext(AppContext);
    const t = useTranslations();

    const [activeTemplateId, setActiveTemplateId] = useState(projectTemplates[0].id);
    const [userInput, setUserInput] = useState('');
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [currentOutput, setCurrentOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pointsAwarded, setPointsAwarded] = useState(false);
    
    const [activeStyleIndex, setActiveStyleIndex] = useState(0);
    const canvasRef = useRef<HTMLDivElement>(null);

    if (!context) return null;
    const { addTransaction, language } = context;

    const activeTemplate = projectTemplates.find(p => p.id === activeTemplateId)!;
    const templateTranslations = t.creationStudio.templates[activeTemplateId];
    const currentStyle = canvasStyles[activeStyleIndex];

    const handleNewCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setCurrentOutput('');
        setPointsAwarded(false);

        const newChat = geminiService.startCreationStudioChat(language);
        setChatSession(newChat);
        
        const prompt = activeTemplate.promptTemplate(userInput, language);

        try {
            const response = await newChat.sendMessage({ message: prompt });
            setCurrentOutput(response.text);
            addTransaction({
                type: 'earn',
                description: t.creationStudio.pointDescription(templateTranslations.title),
                amount: 5,
            });
            setPointsAwarded(true);
        } catch (err) {
            console.error("Error creating content:", err);
            setError(t.creationStudio.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefine = async (refinementPrompt: string) => {
        if (!chatSession || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await chatSession.sendMessage({ message: refinementPrompt });
            setCurrentOutput(response.text);
        } catch (err) {
            console.error("Error refining content:", err);
            setError(t.creationStudio.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadImage = useCallback(() => {
        if (canvasRef.current === null) return;
        htmlToImage.toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `ai-paddi-creation.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => console.error('Oops, something went wrong!', err));
    }, []);

    const handleChangeStyle = () => {
        setActiveStyleIndex((prevIndex) => (prevIndex + 1) % canvasStyles.length);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.creationStudio.title} ✨</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.creationStudio.description}</p>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* === CONTROLS PANEL === */}
                <div className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-lg flex-shrink-0 self-start">
                    <form onSubmit={handleNewCreation}>
                        <div className="mb-4">
                            <label className="font-bold text-lg text-neutral-700 block mb-2">{t.creationStudio.selectTemplate}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {projectTemplates.map(template => {
                                    const Icon = template.icon;
                                    const isActive = activeTemplateId === template.id;
                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => setActiveTemplateId(template.id)}
                                            className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all duration-200 ${isActive ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}`}
                                            title={t.creationStudio.templates[template.id].title}
                                        >
                                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-neutral-500'}`} />
                                            <span className="text-xs font-semibold text-center">{t.creationStudio.templates[template.id].title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="userInput" className="font-bold text-lg text-neutral-700 block mb-2">{templateTranslations.inputLabel}</label>
                            <textarea
                                id="userInput"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={templateTranslations.placeholder}
                                className="w-full p-3 border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                                rows={3}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-5 rounded-lg text-md hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-neutral-400"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                <span>{t.creationStudio.createButton}</span>
                            </button>
                             {pointsAwarded && <p className="font-bold text-sm text-secondary animate-fade-in">{t.creationStudio.pointsAwarded}</p>}
                        </div>
                    </form>
                </div>

                {/* === CANVAS & TOOLS PANEL === */}
                <div className="lg:w-2/3 flex-grow">
                    <div
                        ref={canvasRef}
                        className={`w-full min-h-[300px] p-8 rounded-2xl shadow-lg flex items-center justify-center text-center transition-all duration-300 ${currentStyle.class}`}
                    >
                         {isLoading ? (
                           <div className="flex items-center justify-center h-full">
                                <Loader2 className={`animate-spin w-10 h-10`} />
                           </div>
                        ) : error ? (
                            <p className="text-red-600 font-semibold">{error}</p>
                        ) : currentOutput ? (
                            <p className={`text-2xl leading-relaxed animate-fade-in ${currentStyle.font}`}>{currentOutput}</p>
                        ) : (
                            <p className="text-xl opacity-70">{t.creationStudio.canvasPlaceholder}</p>
                        )}
                    </div>
                    {currentOutput && !isLoading && (
                        <div className="mt-4 p-4 bg-white rounded-2xl shadow-lg animate-fade-in">
                           <p className="text-sm font-bold text-neutral-600 mb-3">What's next? Remix your creation!</p>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                               <button onClick={() => handleRefine(t.creationStudio.refinementActions.longer)} className="remix-btn"><Zap size={16}/> {t.creationStudio.refinementActions.longer}</button>
                               <button onClick={() => handleRefine(t.creationStudio.refinementActions.shorter)} className="remix-btn"><Zap size={16}/> {t.creationStudio.refinementActions.shorter}</button>
                               <button onClick={() => handleRefine(t.creationStudio.refinementActions.funnier)} className="remix-btn"><Zap size={16}/> {t.creationStudio.refinementActions.funnier}</button>
                               <button onClick={() => handleRefine(t.creationStudio.refinementActions.moreSerious)} className="remix-btn"><Zap size={16}/> {t.creationStudio.refinementActions.moreSerious}</button>
                               <button onClick={() => handleRefine(t.creationStudio.refinementActions.tryAgain)} className="remix-btn col-span-2 md:col-span-1"><RefreshCw size={16}/> {t.creationStudio.refinementActions.tryAgain}</button>
                           </div>
                            <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
                                 <button onClick={handleChangeStyle} className="flex-1 creator-btn bg-secondary/10 text-secondary hover:bg-secondary/20"><Palette size={18}/> {t.creationStudio.creatorTools.changeStyle}</button>
                                 <button onClick={handleDownloadImage} className="flex-1 creator-btn bg-primary/10 text-primary hover:bg-primary/20"><Download size={18}/> {t.creationStudio.creatorTools.downloadImage}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add some base styles for the new buttons in a style tag to avoid clutter
const styles = `
.remix-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    background-color: #e2e8f0;
    color: #475569;
    transition: background-color 0.2s;
}
.remix-btn:hover {
    background-color: #cbd5e1;
}
.creator-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-weight: 700;
    transition: background-color 0.2s;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
