import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Zap, ShieldAlert, CheckCircle, RefreshCw, History, ArrowUpRight, Lock, Unlock, AlertTriangle, Radio, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RechargeModal from '../../components/RechargeModal';
import api from '../../services/api';

export default function ClientDashboard() {
  const { user, cards, transactions, refreshUser, loading } = useAuth();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const primaryCard = cards && cards.length > 0 ? cards[0] : null;

  const handleToggleBlock = async () => {
    if (!primaryCard) return;
    const newStatus = primaryCard.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    if (newStatus === 'BLOCKED' && !window.confirm("Êtes-vous sûr de vouloir bloquer immédiatement votre carte RFID en cas de perte/vol ?")) {
      return;
    }

    setBlockLoading(true);
    try {
      const res = await api.patch(`/api/cards/${primaryCard.uid}/status`, { status: newStatus });
      if (res.data?.status === 'success') {
        setStatusMessage(`Carte ${newStatus === 'BLOCKED' ? 'bloquée' : 'débloquée'} avec succès.`);
        await refreshUser();
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      alert("Erreur lors de la modification du statut de la carte.");
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Notification d'état */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm flex items-center justify-between shadow-lg shadow-cyan-500/10 animate-fadeIn">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            {statusMessage}
          </span>
          <button onClick={() => refreshUser()} className="text-xs underline font-bold hover:text-white">Actualiser</button>
        </div>
      )}

      {/* Bannière Détection Compte Administrateur */}
      {user?.role === 'ADMIN' && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-purple-950/30">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Compte Gestionnaire Administrateur
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-mono">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vous êtes actuellement sur la vue usager. Rendez-vous sur le Back-Office pour superviser les passages ESP32, les cartes et les recettes.
              </p>
            </div>
          </div>

          <Link
            to="/admin/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all transform hover:scale-105 whitespace-nowrap"
          >
            Ouvrir le Back-Office Admin <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* En-tête de bienvenue moderne */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Péage Électronique Bénin
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bonjour, <span className="text-gradient-cyan">{user?.name || "Automobiliste"}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gérez votre solde et suivez vos passages aux bornes de péage ESP32 en temps réel.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => refreshUser()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>

          {primaryCard && (
            <button
              onClick={() => setIsRechargeOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" />
              Recharger Solde
            </button>
          )}
        </div>
      </div>

      {/* Grille principale : Carte RFID & Sécurité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CARTE RFID HOLOGRAPHIQUE ÉLÉGANTE */}
        <div className="lg:col-span-2 relative group">
          {primaryCard ? (
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 hologram-card border border-cyan-500/30 shadow-2xl shadow-cyan-500/15 flex flex-col justify-between min-h-[270px]">

              {/* Halo lumineux interactif */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

              {/* Haut : Puce dorée & Badge Statut */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 rounded-xl bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 p-1.5 flex flex-col justify-between shadow-lg shadow-amber-500/20 border border-yellow-200/50">
                    <div className="w-full h-1 bg-amber-800/40 rounded-full" />
                    <div className="w-2/3 h-1 bg-amber-800/40 rounded-full" />
                    <div className="w-1/2 h-1 bg-amber-800/40 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-300">RFID PASS ESP32</span>
                  </div>
                </div>

                {/* Badge Statut de la carte */}
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 border backdrop-blur-md shadow-lg ${
                  primaryCard.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-emerald-500/20'
                    : 'bg-red-500/20 border-red-400/40 text-red-300 shadow-red-500/20'
                }`}>
                  {primaryCard.status === 'ACTIVE' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      CARTE ACTIVE
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      BLOQUÉE
                    </>
                  )}
                </span>
              </div>

              {/* Solde au centre avec typographie percutante */}
              <div className="relative z-10 my-4 space-y-1">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-widest block">
                  Solde Disponible
                </span>
                <div className="text-4xl sm:text-6xl font-black text-white tracking-tight flex items-baseline gap-3">
                  {primaryCard.balance.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}
                  <span className="text-2xl font-bold text-gradient-cyan">FCFA</span>
                </div>
              </div>

              {/* Bas : Titulaire & UID */}
              <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">Titulaire du Compte</span>
                  <span className="text-base font-extrabold text-white tracking-wide">{user?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">UID Badge RFID</span>
                  <span className="text-base font-mono font-bold text-cyan-300 tracking-widest">{primaryCard.uid}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center space-y-4">
              <CreditCard className="w-14 h-14 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Aucune carte RFID associée</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Contactez l'administration du péage pour faire associer une carte RFID ESP32 à votre compte.
              </p>
            </div>
          )}
        </div>

        {/* PANNEAU ACTIONS RAPIDES & SÉCURITÉ */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Sécurité & Gestion
            </h2>

            {primaryCard && (
              <div className="space-y-3">
                <button
                  onClick={handleToggleBlock}
                  disabled={blockLoading}
                  className={`w-full p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all shadow-lg ${
                    primaryCard.status === 'ACTIVE'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 shadow-red-500/10'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-emerald-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {primaryCard.status === 'ACTIVE' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    <div>
                      <span className="block font-bold">
                        {primaryCard.status === 'ACTIVE' ? "Blocage d'Urgence" : "Débloquer ma carte"}
                      </span>
                      <span className="text-[11px] opacity-80 font-normal">
                        {primaryCard.status === 'ACTIVE' ? "En cas de perte ou vol de la carte" : "Réactiver l'accès au péage"}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Tarif du Péage
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-400">
                    Déduction automatique de <span className="text-white font-bold">500 FCFA</span> par passage valide sur la barrière ESP32.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TABLEAU DES DERNIERS PASSAGES AVEC DESIGN SOIGNÉ */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <History className="w-5 h-5 text-cyan-400" />
              Derniers Passages au Péage
            </h2>
            <p className="text-xs text-slate-400">Historique récent scanné par les bornes ESP32</p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-extrabold text-cyan-400 transition-all"
          >
            Voir Tout <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Date &amp; Heure</th>
                  <th className="py-4 px-4">UID Carte</th>
                  <th className="py-4 px-4">Poste / Emplacement</th>
                  <th className="py-4 px-4 text-right">Montant</th>
                  <th className="py-4 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {new Date(t.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-cyan-400">{t.cardUid}</td>
                    <td className="py-4 px-4 font-medium">{t.tollGate?.name || "Poste Principal - Cotonou"}</td>
                    <td className="py-4 px-4 text-right font-extrabold text-white">
                      {t.amount > 0 ? `-${t.amount} FCFA` : '0 FCFA'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                        t.status === 'AUTHORIZED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {t.status === 'AUTHORIZED' ? 'Autorisé' : `Refusé (${t.reason || 'Erreur'})`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs">
            Aucun passage enregistré pour le moment.
          </div>
        )}
      </div>

      {/* Modal de Recharge Mobile Money */}
      {primaryCard && (
        <RechargeModal
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
          cardUid={primaryCard.uid}
          onSuccess={() => refreshUser()}
        />
      )}
    </div>
  );
}
