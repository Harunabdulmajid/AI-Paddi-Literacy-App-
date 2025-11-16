import React, { useContext, useState } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from '../AppContext';
import { useTranslations } from '../../i18n';
import { MARKETPLACE_ITEMS } from '../../constants';
import { MarketplaceItem, MarketplaceCategory, AppContextType } from '../../types';
import { Award, Check, Loader2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { apiService } from '../../services/apiService';
import { Toast } from '../Toast';

const MarketplaceCard: React.FC<{ item: MarketplaceItem, onRedeem: (item: MarketplaceItem) => void }> = ({ item, onRedeem }) => {
    const { user } = useContext(AppContext)!;
    const t = useTranslations();
    const Icon = item.icon;
    const isOwned = item.isOwned ? item.isOwned(user!) : false;
    const canAfford = user!.wallet.balance >= item.cost;
    const isDisabled = isOwned || item.isComingSoon || !canAfford;

    let buttonContent;
    if (isOwned) {
        buttonContent = <><Check size={20}/> {t.marketplace.owned}</>;
    } else if (item.isComingSoon) {
        buttonContent = t.marketplace.comingSoon;
    } else {
        buttonContent = t.marketplace.redeem;
    }

    return (
        <div className={`bg-neutral-50 border border-neutral-200 p-5 rounded-xl flex flex-col justify-between ${isDisabled && !isOwned ? 'opacity-60' : ''}`}>
            <div>
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                        <Icon size={28}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-neutral-800">{item.title}</h4>
                        <div className="flex items-center gap-1.5 font-bold text-amber-600">
                           <Award size={16}/> {item.cost} {t.common.pointsAbbr}
                        </div>
                    </div>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.description}</p>
            </div>
            <button 
                onClick={() => onRedeem(item)}
                disabled={isDisabled}
                className="mt-4 w-full flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:cursor-not-allowed
                           bg-primary/10 text-primary hover:bg-primary/20 disabled:bg-neutral-200 disabled:text-neutral-500"
            >
                {buttonContent}
            </button>
        </div>
    );
};

export const Marketplace: React.FC = () => {
    const context = useContext(AppContext);
    const t = useTranslations();
    
    const categories = [...new Set(MARKETPLACE_ITEMS.map(item => item.category))] as MarketplaceCategory[];
    const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>(categories[0]);
    
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!context || !context.user) return null;
    const { user, setUser } = context;

    const handleRedeem = (item: MarketplaceItem) => {
        setError('');
        setSuccess('');
        setSelectedItem(item);
    };

    const handleConfirmRedeem = async () => {
        if (!selectedItem) return;
        setIsConfirming(true);
        setError('');
        try {
            const updatedUser = await apiService.redeemItem(user!.email, selectedItem.id, selectedItem.cost, selectedItem.payload);
            setUser(updatedUser);
            setSuccess(t.marketplace.redeemSuccess(selectedItem.title));
        } catch (err: any) {
            setError(err.message || t.marketplace.redeemError);
        } finally {
            setIsConfirming(false);
            setSelectedItem(null);
        }
    };
    
    const filteredItems = MARKETPLACE_ITEMS.filter(item => item.category === activeCategory);

    return (
        <div>
            {success && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 font-semibold">{success}</div>}
            {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 font-semibold">{error}</div>}

            <ConfirmationModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onConfirm={handleConfirmRedeem}
                isConfirming={isConfirming}
                title={t.wallet.confirmationTitle}
                message={t.wallet.confirmationSpend(selectedItem?.cost || 0, selectedItem?.title || '')}
                confirmText={t.wallet.confirm}
            />

            {/* Category Tabs */}
            <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`flex-shrink-0 px-4 py-3 font-bold text-sm sm:text-base transition-colors ${activeCategory === category 
                            ? 'border-b-2 border-primary text-primary' 
                            : 'text-neutral-500 hover:text-neutral-800 border-b-2 border-transparent'}`}
                    >
                        {t.marketplace.categories[category]}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                    <MarketplaceCard key={item.id} item={item} onRedeem={handleRedeem} />
                ))}
            </div>
        </div>
    );
};
