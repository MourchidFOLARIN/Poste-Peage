import React, { useState } from 'react';
import { X, Smartphone, CheckCircle, AlertCircle, Loader2, Sparkles, CreditCard } from 'lucide-react';
import api from '../services/api';

export default function RechargeModal({ isOpen, onClose, cardUid, onSuccess }) {
  const [amount, setAmount] = useState('2000');
  const [provider, setProvider] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('97000000');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleRecharge = async (e) => {
    e.preventDefault();
    const rechargeVal = parseFloat(amount);

    if (isNaN(rechargeVal) || rechargeVal <= 0) {
      setStatus('error');
      setMessage('Veuillez saisir un montant positif valide.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      // Simulation du délai du processeur Mobile Money (MTN / Moov / KKiaPay)
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.post('/api/cards/recharge', {
        card_uid: cardUid,
        amount: rechargeVal,
        operator: provider,
        phoneNumber: phoneNumber
      });

      if (res.data?.status === 'success') {
        setStatus('success');
        setMessage(`Paiement de ${rechargeVal.toLocaleString()} FCFA réussi par ${provider} ! Nouveau solde mis à jour.`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
          setStatus(null);
        }, 2000);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Échec de la transaction Mobile Money.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-slate-100">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Recharge Mobile Money
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Carte RFID : <span className="font-mono text-cyan-400 font-bold">{cardUid}</span></p>
          </div>
        </div>

        {/* Message d'état */}
        {status === 'success' && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleRecharge} className="space-y-5">
          {/* Sélection de l'opérateur Mobile Money */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MTN', name: 'MTN MoMo', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' },
                { id: 'Moov', name: 'Moov Money', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
                { id: 'Celtis', name: 'Celtis Cash', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 ${
                    provider === p.id ? p.color : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {provider === p.id && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Numéro de Téléphone {provider}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Ex: 97 00 00 00"
              />
            </div>
          </div>

          {/* Montant de la recharge */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Montant à recharger (FCFA)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Montant en FCFA"
            />
            
            {/* Montants rapides */}
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    amount === q.toString()
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  +{q.toLocaleString()} F
                </button>
              ))}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement du paiement {provider}...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Valider la Recharge de {parseFloat(amount || 0).toLocaleString()} FCFA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
