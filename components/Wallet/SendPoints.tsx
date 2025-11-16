import React, { useContext, useState } from 'react';
// FIX: Correct the import path for AppContext.
import { AppContext } from '../AppContext';
import { useTranslations } from '../../i18n';
import { apiService } from '../../services/apiService';
import { Loader2, Send } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { AppContextType } from '../../types';

export const SendPoints: React.FC = () => {
  const context = useContext(AppContext);
  const t = useTranslations();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'confirming'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  if (!context || !context.user) return null;
  const { user, setUser } = context;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setError('');
    setSuccess('');
    setStatus('confirming');
  };
  
  const handleConfirmSend = async () => {
    setStatus('sending');
    try {
        const { sender } = await apiService.sendPoints(user.email, recipientEmail, parseInt(amount, 10), message);
        setUser(sender);
        setSuccess(t.wallet.sendSuccess(parseInt(amount, 10), recipientEmail)); // In a real app, we'd get the recipient name back
        // Reset form
        setRecipientEmail('');
        setAmount('');
        setMessage('');
    } catch (err: any) {
        setError(err.message || t.wallet.sendError);
    } finally {
        setStatus('idle');
    }
  };

  const dailyLimit = user.wallet.dailyTransfer;
  const today = new Date().toISOString().split('T')[0];
  const usedToday = dailyLimit.date === today ? dailyLimit.amount : 0;
  const limit = 200;

  return (
    <div>
        {success && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 font-semibold">{success}</div>}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 font-semibold">{error}</div>}

        <ConfirmationModal
            isOpen={status === 'confirming'}
            onClose={() => setStatus('idle')}
            onConfirm={handleConfirmSend}
            isConfirming={status === 'sending'}
            title={t.wallet.confirmationTitle}
            message={t.wallet.confirmationSend(parseInt(amount || '0', 10), recipientEmail)}
            confirmText={t.wallet.confirm}
        />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        <div>
          <label htmlFor="recipientEmail" className="font-semibold text-neutral-700 block mb-1.5">{t.wallet.recipientEmail}</label>
          <input
            type="email"
            id="recipientEmail"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="font-semibold text-neutral-700 block mb-1.5">{t.wallet.amount}</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
            min="1"
            max={user.wallet.balance}
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="font-semibold text-neutral-700 block mb-1.5">{t.wallet.messageOptional}</label>
          <input
            type="text"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.wallet.messagePlaceholder}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
            maxLength={100}
          />
        </div>
        <div className="pt-2">
            <div className="text-sm text-neutral-500 mb-2">{t.wallet.dailyLimit(usedToday, limit)}</div>
            <button
                type="submit"
                disabled={status !== 'idle' || !recipientEmail || !amount}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg text-lg transition hover:bg-primary-dark disabled:bg-neutral-300"
            >
                {status === 'sending' ? <Loader2 className="animate-spin"/> : <Send size={20}/>}
                <span>{t.wallet.sendButton}</span>
            </button>
        </div>
      </form>
    </div>
  );
};
