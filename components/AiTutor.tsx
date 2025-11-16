import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { geminiService } from '../services/geminiService';
import { Chat } from '@google/genai';
import { ChatMessage } from './ChatMessage';
import { UserAvatar } from './Header';
import { Loader2, Send, GraduationCap } from 'lucide-react';

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

export const AiTutor: React.FC = () => {
    const context = useContext(AppContext);
    const t = useTranslations();
    
    if (!context || !context.user) return null;
    const { user, language } = context;

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
            const newChat = geminiService.startTutorChat(language);
            setChat(newChat);
            setMessages([{
                sender: 'ai',
                text: t.aiTutor.welcomeMessage
            }]);
        };
        initChat();
    }, [language, t.aiTutor.welcomeMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: Message = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: currentInput });
            const aiMessage: Message = { text: response.text, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Tutor Error:", error);
            const errorMessage: Message = { text: t.aiTutor.errorMessage, sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const PaddiAvatar = <GraduationCap size={24} />;
    const CurrentUserAvatar = <UserAvatar name={user.name} avatarId={user.avatarId} avatarUrl={user.avatarUrl} className="w-10 h-10 text-lg" />;

    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-160px)]">
            <div className="text-center mb-6">
                 <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.aiTutor.title} 🧠</h2>
                <p className="text-neutral-500 text-base md:text-lg">{t.aiTutor.description}</p>
            </div>
           
            <div className="flex-grow bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            message={msg.text}
                            sender={msg.sender}
                            avatar={msg.sender === 'ai' ? PaddiAvatar : CurrentUserAvatar}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    {PaddiAvatar}
                                </div>
                                <div className="max-w-xs md:max-w-md p-4 rounded-2xl shadow-sm bg-neutral-200 text-neutral-800 rounded-bl-none">
                                    <Loader2 className="animate-spin text-primary" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-neutral-100 border-t border-neutral-200">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder={t.aiTutor.inputPlaceholder}
                            className="flex-grow p-3 border-2 border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center transition-transform active:scale-90 hover:bg-primary-dark disabled:bg-neutral-400 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                           {isLoading ? <Loader2 className="animate-spin" /> : <Send size={22} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};