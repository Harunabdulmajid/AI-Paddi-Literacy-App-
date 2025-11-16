import React, { useState, useContext } from 'react';
import { AppContext } from './AppContext';
import { useTranslations } from '../i18n';
import { apiService } from '../services/apiService';
import { Loader2, X, Sparkles, CheckCircle, Zap, MessageSquare, BookText, Briefcase } from 'lucide-react';
import { ConfirmationModal } from './Wallet/ConfirmationModal';
import { AppContextType } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const PRO_PLAN_COST = 500;

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName }) => {
    const context = useContext(AppContext) as AppContextType;
    const t = useTranslations();
  
    const [status, setStatus] = useState<'idle' | 'confirming' | 'upgrading' | 'success'>('idle');
    const [error, setError] = useState('');

    if (!isOpen) return null;
    if (!context || !context.user) {
        onClose();
        return null;
    }
    const { user, setUser, addTransaction } = context;

    const canAfford = user.wallet.balance >= PRO_PLAN_COST;

    const handleUpgradeClick = () => {
        if (!canAfford) {
            setError(t.proPlan.insufficientPoints);
            return;
        }
        setStatus('confirming');
    };

    const handleConfirmUpgrade = async () => {
        setStatus('upgrading');
        try {
            // Deduct points first
            await addTransaction({
                type: 'spend',
                description: t.proPlan.transactionDescription,
                amount: PRO_PLAN_COST,
            });

            // Then update user to Pro
            const updatedUser = await apiService.updateUser(user.email, { isPro: true });
            if (updatedUser) {
                setUser(updatedUser);
            }
            
            setStatus('success');
        } catch (err) {
            console.error(err);
            setError(t.proPlan.error);
            setStatus('idle');
        }
    };

    const handleClose = () => {
        // Reset state after a delay for the animation
        setTimeout(() => {
            setStatus('idle');
            setError('');
        }, 300);
        onClose();
    };

    const features = [
        { icon: Zap, text: t.proPlan.feature1 },
        { icon: MessageSquare, text: t.proPlan.feature2 },
        { icon: BookText, text: t.proPlan.feature3 },
        { icon: Briefcase, text: t.proPlan.feature4 },
    ];
    
    if (status === 'success') {
         return (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform transition-all animate-slide-up" onClick={(e) => e.stopPropagation()}>
                    <CheckCircle className="text-secondary mx-auto" size={48} />
                    <h2 className="text-3xl font-extrabold text-neutral-800 mt-4">{t.proPlan.successTitle}</h2>
                    <p className="text-lg text-neutral-600 mt-2">{t.proPlan.successDescription}</p>
                    <button 
                        onClick={handleClose}
                        className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-lg transition-transform active:scale-95"
                    >
                        {t.common.close}
                    </button>
                </div>
            </div>
         );
    }

    return (
    <>
        <ConfirmationModal
            isOpen={status === 'confirming'}
            onClose={() => setStatus('idle')}
            onConfirm={handleConfirmUpgrade}
            isConfirming={status === 'upgrading'}
            title={t.wallet.confirmationTitle}
            message={t.proPlan.confirmationMessage(PRO_PLAN_COST)}
            confirmText={t.proPlan.unlocking}
        />
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
            <div 
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full transform transition-all animate-slide-up relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700">
                    <X size={24} />
                </button>
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800">{t.proPlan.modalTitle(featureName)}</h2>
                    <p className="text-neutral-500 mt-2 mb-6">{t.proPlan.modalDescription}</p>
                </div>

                <div className="space-y-3 my-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg">
                            <feature.icon className="w-5 h-5 text-secondary flex-shrink-0" />
                            <span className="text-neutral-700">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {error && <p className="text-red-600 font-semibold text-center mb-4">{error}</p>}

                <button
                    onClick={handleUpgradeClick}
                    disabled={status !== 'idle'}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg transition hover:bg-primary-dark disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                    {t.proPlan.unlockButton(PRO_PLAN_COST)}
                </button>
            </div>
        </div>
    </>
  );
};