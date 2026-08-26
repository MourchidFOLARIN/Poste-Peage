import React, { useState, useEffect } from 'react';
import { Sliders, DollarSign, Save, RefreshCw, CheckCircle2, ShieldCheck, Cpu, Database, Bell } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const [tollFee, setTollFee] = useState(500);
  const [newFee, setNewFee] = useState('500');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchTollFee = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/toll-fee');
      if (res.data?.status === 'success') {
        const fee = res.data.data.tollFee;
        setTollFee(fee);
        setNewFee(fee.toString());
      }
    } catch (err) {
      console.error('Erreur récupération tarif :', err);
      addToast('Impossible de récupérer le tarif actuel', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTollFee();
  }, []);

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    const amount = parseFloat(newFee);
    if (isNaN(amount) || amount <= 0) {
      addToast('Veuillez saisir un montant positif valide', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch('/api/admin/toll-fee', { amount });
      if (res.data?.status === 'success') {
        setTollFee(res.data.data.tollFee);
        addToast(`Tarif mis à jour à ${res.data.data.tollFee.toLocaleString('fr-FR')} FCFA`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la mise à jour du tarif', 'error');
    } finally {
      setSaving(false);
    }
  };

  const presets = [200, 500, 1000, 1500, 2000];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Sliders className="w-7 h-7 text-amber-400" />
            Paramètres &amp; <span className="text-gradient-gold">Tarification</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configuration globale du péage, tarif de passage à chaud et télémétrie système.
          </p>
        </div>

        <button
          onClick={fetchTollFee}
          disabled={loading}
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recharger
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau Tarif (2 colonnes) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Tarif Standard par Passage
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Montant débité atomiquement de la carte RFID de l'usager à chaque passage autorisé.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Actif en direct
            </span>
          </div>

          {/* Affichage du tarif actuel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tarif Actuel Appliqué</span>
              <div className="text-4xl font-black text-amber-400 mt-1 flex items-baseline gap-2">
                {tollFee.toLocaleString('fr-FR')}
                <span className="text-base text-slate-300 font-bold">FCFA / passage</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/60 max-w-xs">
              💡 Le changement prend effet instantanément sur toutes les requêtes ESP32 sans redémarrer le serveur.
            </div>
          </div>

          {/* Formulaire de modification */}
          <form onSubmit={handleUpdateFee} className="space-y-4 pt-2">
            <label className="block text-xs font-bold text-slate-300">
              Modifier le montant du tarif (FCFA)
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewFee(preset.toString())}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    parseFloat(newFee) === preset
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {preset.toLocaleString('fr-FR')} FCFA
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                min="50"
                step="50"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                required
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-lg font-black text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Ex: 500"
              />
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Appliquer le Tarif'}
              </button>
            </div>
          </form>
        </div>

        {/* Panneau Télémétrie Système */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Télémétrie &amp; Stack
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Spécifications techniques du poste</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Base de données
              </span>
              <span className="font-bold text-white">PostgreSQL (Prisma)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> Protocole Bornes
              </span>
              <span className="font-bold text-white">ESP32 HTTP + RFID SPI</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" /> Flux Direct
              </span>
              <span className="font-bold text-emerald-400 font-mono">Socket.io (WebSocket)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Sécurité
              </span>
              <span className="font-bold text-white">Helmet &amp; RateLimit</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Devise de transaction</span>
              <span className="font-mono font-black text-amber-400">XOF / FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
