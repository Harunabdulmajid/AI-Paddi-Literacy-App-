
import React from 'react';

interface ChatMessageProps {
  message: string;
  sender: 'user' | 'ai';
  avatar: React.ReactNode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, avatar }) => {
  const isUser = sender === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {avatar}
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-neutral-200 text-neutral-800 rounded-bl-none'
        }`}
      >
        <p className="text-base leading-relaxed">{message}</p>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold">
          {avatar}
        </div>
      )}
    </div>
  );
};