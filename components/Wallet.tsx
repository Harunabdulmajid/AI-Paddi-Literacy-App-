import React, { useContext, useState } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { Award, History, Send, Store } from 'lucide-react';
import { TransactionHistory } from './Wallet/TransactionHistory';
import { SendPoints } from './Wallet/SendPoints';
import { Marketplace } from './Wallet/Marketplace';

type WalletTab = 'history' | 'send' | 'marketplace';

export const Wallet: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("Wallet must be used within an AppProvider");
    const { user } = context;
    const t = useTranslations();
    const [activeTab, setActiveTab] = useState<WalletTab>('history');

    if (!user) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'history': return <TransactionHistory />;
            case 'send': return <SendPoints />;
            case 'marketplace': return <Marketplace />;
            default: return <TransactionHistory />;
        }
    };
    
    const TabButton: React.FC<{ tab: WalletTab, icon: React.ReactNode, label: string }> = ({ tab, icon, label }) => (
         <button 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex sm:flex-none sm:w-auto items-center justify-center sm:justify-start gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.wallet.title}</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.wallet.description}</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{t.wallet.currentBalance}</p>
                <div className="flex items-center gap-3 mt-1">
                    <Award className="text-amber-500" size={32}/>
                    <span className="text-5xl font-extrabold text-neutral-800">{user.wallet.balance}</span>
                    <span className="text-xl font-bold text-neutral-500 self-end mb-1">{t.common.pointsAbbr}</span>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4 border-b border-neutral-200 pb-4 mb-6">
                    <TabButton tab="history" icon={<History size={20}/>} label={t.wallet.history} />
                    <TabButton tab="send" icon={<Send size={20}/>} label={t.wallet.send} />
                    <TabButton tab="marketplace" icon={<Store size={20}/>} label={t.wallet.marketplace} />
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};
