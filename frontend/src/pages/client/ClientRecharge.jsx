import React, { useState } from 'react';
import { Zap, Smartphone, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ClientRecharge() {
  const { cards, refreshUser } = useAuth();
  const primaryCard = cards && cards.length > 0 ? cards[0] : null;

  const [amount, setAmount] = useState('5000');
  const [provider, setProvider] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('97000000');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const quickAmounts = [1000, 2000, 5000, 10000, 25000];

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!primaryCard) return;

    const rechargeVal = parseFloat(amount);
    if (isNaN(rechargeVal) || rechargeVal <= 0) {
      setStatus('error');
      setMessage('Veuillez entrer un montant valide.');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.post('/api/cards/recharge', {
        card_uid: primaryCard.uid,
        amount: rechargeVal
      });

      if (res.data?.status === 'success') {
        setStatus('success');
        setMessage(`Recharge de ${rechargeVal.toLocaleString()} FCFA effectuée avec succès via ${provider} !`);
        await refreshUser();
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Erreur lors du traitement du paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* En-tête Page */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Mobile Money Sécurisé
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Zap className="w-7 h-7 text-amber-400 fill-current" />
            Recharger mon <span className="text-gradient-gold">Solde Péage</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Paiement sécurisé via MTN MoMo, Moov Money ou Celtis Cash — crédit immédiat
          </p>
        </div>
      </div>

      {primaryCard ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Informations Solde */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-amber-500/15">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Carte Sélectionnée
            </h2>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/15 space-y-2">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">UID Badge RFID</span>
              <span className="text-lg font-mono font-black text-white tracking-widest">{primaryCard.uid}</span>
              <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Solde actuel</span>
                <span className="text-sm font-extrabold text-amber-400">{primaryCard.balance.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-1">
              <span className="font-bold block">⚡ Recharge instantanée</span>
              <p className="text-[11px] text-amber-300/80">Votre carte sera créditée immédiatement après la validation du paiement Mobile Money.</p>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-6 border border-amber-500/10">
            
            {status === 'success' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleRecharge} className="space-y-6">
              
              {/* Opérateur */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  1. Choisissez le moyen de paiement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'MTN', name: 'MTN MoMo', desc: 'MTN Mobile Money' },
                    { id: 'Moov', name: 'Moov Money', desc: 'Moov Africa Bénin' },
                    { id: 'Celtis', name: 'Celtis Cash', desc: 'Celtis Cash Bénin' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all transform hover:scale-[1.02] ${
                        provider === p.id
                          ? 'border-amber-500 bg-amber-500/10 text-white shadow-xl shadow-amber-500/15'
                          : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <span className="block font-extrabold text-sm text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Numéro de Téléphone {provider}
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+229 97 00 00 00"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  3. Montant à recharger (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="100"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-xl font-black text-amber-400 focus:outline-none focus:border-amber-500 transition-colors"
                />

                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q.toString())}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        amount === q.toString()
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      +{q.toLocaleString()} FCFA
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-2xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validation du paiement Mobile Money...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Payer {parseFloat(amount || 0).toLocaleString('fr-FR')} FCFA via {provider}
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-300 font-bold">Aucune carte RFID associée</p>
          <p className="text-slate-500 text-sm">Contactez l'administration du péage pour faire attribuer un badge RFID ESP32.</p>
        </div>
      )}

    </div>
  );
}
