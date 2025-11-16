import React from 'react';
import { Badge, Transaction } from '../types';
import { Award, Send } from 'lucide-react';

interface ToastProps {
  item: Badge | Transaction;
}

const isBadge = (item: Badge | Transaction): item is Badge => {
  return 'icon' in item;
};

export const Toast: React.FC<ToastProps> = ({ item }) => {
  if (isBadge(item)) {
    const Icon = item.icon;
    return (
      <div className="fixed top-5 right-5 bg-white shadow-2xl rounded-xl p-4 flex items-center gap-4 z-50 animate-toast-in">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center rounded-lg shadow-md">
          <Icon size={28} />
        </div>
        <div>
          <p className="font-bold text-neutral-800">Badge Unlocked!</p>
          <p className="text-neutral-600">{item.name}</p>
        </div>
      </div>
    );
  }

  // Handle Transaction Toast
  return (
      <div className="fixed top-5 right-5 bg-white shadow-2xl rounded-xl p-4 flex items-center gap-4 z-50 animate-toast-in">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center rounded-lg shadow-md">
            {item.type === 'receive' ? <Send size={28} /> : <Award size={28} />}
        </div>
        <div>
            <p className="font-bold text-neutral-800">
              {item.type === 'receive' ? 'Points Received!' : 'Points Earned!'}
            </p>
            <p className="text-neutral-600">
                +{item.amount} pts: {item.description}
            </p>
        </div>
      </div>
  )
};