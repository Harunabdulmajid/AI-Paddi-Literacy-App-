import React, { useState } from 'react';
import { useTranslations } from '../i18n';
import { Search, BookMarked } from 'lucide-react';

export const Glossary: React.FC = () => {
    const t = useTranslations();
    const [searchTerm, setSearchTerm] = useState('');

    const allTerms = Object.entries(t.tooltips);

    // FIX: Explicitly type the parameters and add a type check to resolve the 'toLowerCase' error on a value that could be 'unknown'.
    const filteredTerms = allTerms.filter(([term, definition]) =>
        term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof definition === 'string' && definition.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.glossary.title}</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.glossary.description}</p>

            <div className="mb-8 sticky top-[88px] bg-neutral-100 py-4 z-10">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t.glossary.searchPlaceholder}
                        className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                        aria-label="Search glossary terms"
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {filteredTerms.length > 0 ? (
                    <div className="space-y-6">
                        {filteredTerms.map(([term, definition]) => (
                            <div key={term} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 animate-fade-in">
                                <h3 className="text-xl font-bold text-primary capitalize flex items-center gap-2">
                                    <BookMarked size={20} /> {term}
                                </h3>
                                <p className="text-neutral-600 mt-2 leading-relaxed">{definition as string}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-neutral-50 rounded-xl">
                        <p className="text-xl font-semibold text-neutral-600">{t.glossary.noResultsTitle}</p>
                        <p className="text-neutral-500 mt-2">{t.glossary.noResultsDescription(searchTerm)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
