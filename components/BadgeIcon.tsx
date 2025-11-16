import React from 'react';
import { Badge } from '../types';
import { useTranslations } from '../i18n';

interface BadgeIconProps {
  badge: Badge;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge }) => {
  const t = useTranslations();
  const Icon = badge.icon;
  const translatedBadge = t.badges[badge.id] || { name: badge.name, description: badge.description };

  return (
    <div className="relative group flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 flex items-center justify-center rounded-full shadow-md transition-transform group-hover:scale-110">
        <Icon size={32} />
      </div>
       <div className="absolute bottom-full mb-2 w-56 p-3 bg-neutral-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
        <p className="font-bold">{translatedBadge.name}</p>
        <p className="text-neutral-300">{translatedBadge.description}</p>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-neutral-800"></div>
      </div>
    </div>
  );
};
