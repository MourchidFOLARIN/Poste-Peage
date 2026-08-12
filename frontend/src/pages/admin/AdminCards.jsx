import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Plus, Lock, Unlock, Zap, UserPlus, Filter, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal d'attribution de carte
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCardUid, setNewCardUid] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('5000');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal de recharge manuelle admin
  const [selectedCardForRecharge, setSelectedCardForRecharge] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('2000');

  const fetchCards = async () => {
    try {
      setLoading(true);
      let url = `/api/cards?q=${encodeURIComponent(searchQuery)}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      const res = await api.get(url);
      if (res.data?.status === 'success') {
        setCards(res.data.data);
      }
    } catch (err) {
      console.error("Erreur de chargement des cartes :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [searchQuery, statusFilter]);

  // 1-Click Bloquer / Débloquer
  const handleToggleStatus = async (card) => {
    const nextStatus = card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/cards/${card.uid}/status`, { status: nextStatus });
      if (res.data?.status === 'success') {
        fetchCards();
      }
    } catch (err) {
      alert("Erreur lors de la modification du statut de la carte");
    }
  };

  // Attribution d'une nouvelle carte RFID
  const handleCreateCard = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/api/cards/register', {
        card_uid: newCardUid,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        initial_balance: parseFloat(initialBalance)
      });

      if (res.data?.status === 'success') {
        setFormSuccess('Carte RFID enregistrée et liée avec succès !');
        setTimeout(() => {
          setIsCreateOpen(false);
          setNewCardUid('');
          setUserName('');
          setUserEmail('');
          setUserPhone('');
          setFormSuccess('');
          fetchCards();
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement de la carte");
    } finally {
      setSubmitting(false);
    }
  };

  // Recharge manuelle admin
  const handleManualRecharge = async (e) => {
    e.preventDefault();
    if (!selectedCardForRecharge) return;

    try {
      const res = await api.post('/api/cards/recharge', {
        card_uid: selectedCardForRecharge.uid,
        amount: parseFloat(rechargeAmount)
      });

      if (res.data?.status === 'success') {
        setSelectedCardForRecharge(null);
        fetchCards();
      }
    } catch (err) {
      alert("Erreur de recharge manuelle");
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">

      {/* En-tête Page */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <CreditCard className="w-7 h-7 text-purple-400" />
            Gestion des Cartes &amp; <span className="text-gradient-purple">Clients (CRUD)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Attribution des UIDs ESP32, recherche et blocage/déblocage en 1 clic
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 transition-all transform hover:scale-[1.02] self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Attribuer une Carte RFID
        </button>
      </div>

      {/* Barre de recherche et Filtres */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Input Recherche */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par Nom, Email ou UID RFID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filtres Statut */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'ACTIVE', label: 'Actives' },
            { id: 'BLOCKED', label: 'Bloquées' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={fetchCards}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tableau des Cartes */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {cards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">UID Carte RFID</th>
                  <th className="py-3.5 px-4">Titulaire</th>
                  <th className="py-3.5 px-4">Contact (Email / Tél)</th>
                  <th className="py-3.5 px-4 text-right">Solde Actuel</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {cards.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-purple-400 text-sm">
                      {c.uid}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {c.user?.name || "Sans Nom"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="block text-slate-200">{c.user?.email}</span>
                      <span className="text-[10px] text-slate-500">{c.user?.phone || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-amber-400 text-sm">
                      {c.balance.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {c.status === 'ACTIVE' ? 'Active' : 'Bloquée'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {/* Bouton 1-Click Bloquer/Débloquer */}
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          c.status === 'ACTIVE'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? (
                          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Bloquer</span>
                        ) : (
                          <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> Débloquer</span>
                        )}
                      </button>

                      {/* Recharge manuelle admin */}
                      <button
                        onClick={() => setSelectedCardForRecharge(c)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-[11px] font-bold transition-all"
                      >
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Recharger</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucune carte ne correspond aux critères de recherche.
          </div>
        )}
      </div>

      {/* MODAL CRÉATION DE CARTE RFID */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Attribuer une Carte RFID
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">UID Carte RFID ESP32</label>
                <input
                  type="text"
                  value={newCardUid}
                  onChange={(e) => setNewCardUid(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: A1B2C3D4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom Complet du Client</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  placeholder="Ex: Marc Dossou"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  placeholder="marc.dossou@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+229 97 00 00 00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Solde Initial (FCFA)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                {submitting ? "Enregistrement..." : "Valider l'Attribution"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECHARGE MANUELLE */}
      {selectedCardForRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setSelectedCardForRecharge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Recharge Manuelle Admin
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Carte : <span className="font-mono text-purple-400 font-bold">{selectedCardForRecharge.uid}</span> ({selectedCardForRecharge.user?.name})
            </p>

            <form onSubmit={handleManualRecharge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Montant à créditer (FCFA)</label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  required
                  min="100"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-black text-amber-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Créditer la Carte
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
