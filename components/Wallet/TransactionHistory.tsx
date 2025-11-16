import React, { useContext } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from '../AppContext';
import { useTranslations } from '../../i18n';
import { ArrowDownLeft, ArrowUpRight, Award, ShoppingCart } from 'lucide-react';
import { Transaction, AppContextType } from '../../types';

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const getIcon = () => {
        switch (tx.type) {
            case 'earn': return <Award className="text-green-500" />;
            case 'spend': return <ShoppingCart className="text-red-500" />;
            case 'send': return <ArrowUpRight className="text-orange-500" />;
            case 'receive': return <ArrowDownLeft className="text-blue-500" />;
        }
    };
    
    const getAmountColor = () => {
        switch (tx.type) {
            case 'earn':
            case 'receive':
                return 'text-green-600';
            case 'spend':
            case 'send':
                return 'text-red-600';
        }
    };
    
    const amountPrefix = (tx.type === 'earn' || tx.type === 'receive') ? '+' : '-';
    
    const date = new Date(tx.timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="flex items-center gap-4 py-3 border-b border-neutral-200 last:border-b-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                {getIcon()}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-neutral-800">{tx.description}</p>
                <p className="text-sm text-neutral-500">{date}</p>
            </div>
            <div className={`font-bold text-lg ${getAmountColor()}`}>
                {amountPrefix}{tx.amount}
            </div>
        </div>
    );
};


export const TransactionHistory: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.user) return null;
    const { user } = context;
    const t = useTranslations();

    const transactions = user.wallet.transactions;

    return (
        <div>
            {transactions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-neutral-500">{t.wallet.noTransactions}</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {transactions.map(tx => (
                        <TransactionRow key={tx.id} tx={tx} />
                    ))}
                </div>
            )}
        </div>
    );
};
