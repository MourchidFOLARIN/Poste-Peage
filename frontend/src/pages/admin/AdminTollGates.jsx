import React, { useState, useEffect } from 'react';
import { Shield, Plus, MapPin, Activity, Trash2, Edit3, CheckCircle2, XCircle, RefreshCw, X, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminTollGates() {
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Modal création / édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal suppression
  const [gateToDelete, setGateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/tollgates');
      if (res.data?.status === 'success') {
        setGates(res.data.data);
      }
    } catch (err) {
      console.error('Erreur chargement postes de péage :', err);
      addToast('Erreur lors du chargement des postes de péage', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGates();
  }, []);

  const openCreateModal = () => {
    setEditingGate(null);
    setName('');
    setLocation('');
    setIsModalOpen(true);
  };

  const openEditModal = (gate) => {
    setEditingGate(gate);
    setName(gate.name);
    setLocation(gate.location);
    setIsModalOpen(true);
  };

  const handleSaveGate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      addToast('Nom et localisation obligatoires', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (editingGate) {
        const res = await api.patch(`/api/admin/tollgates/${editingGate.id}`, { name, location });
        if (res.data?.status === 'success') {
          addToast(`Poste "${name}" mis à jour avec succès`, 'success');
        }
      } else {
        const res = await api.post('/api/admin/tollgates', { name, location });
        if (res.data?.status === 'success') {
          addToast(`Poste "${name}" créé avec succès`, 'success');
        }
      }
      setIsModalOpen(false);
      fetchGates();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (gate) => {
    const nextStatus = gate.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/admin/tollgates/${gate.id}`, { status: nextStatus });
      if (res.data?.status === 'success') {
        addToast(`Poste "${gate.name}" ${nextStatus === 'ACTIVE' ? 'activé' : 'désactivé'}`, 'success');
        fetchGates();
      }
    } catch (err) {
      addToast('Erreur lors de la modification du statut', 'error');
    }
  };

  const handleDeleteGate = async () => {
    if (!gateToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/api/admin/tollgates/${gateToDelete.id}`);
      if (res.data?.status === 'success') {
        addToast(res.data.message || 'Poste supprimé', 'success');
        setGateToDelete(null);
        fetchGates();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = gates.filter((g) => g.status === 'ACTIVE').length;
  const inactiveCount = gates.filter((g) => g.status === 'INACTIVE').length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* En-tête Page */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Shield className="w-7 h-7 text-blue-400" />
            Postes de <span className="text-gradient-cyan">Péage (Bornes)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestion des bornes physiques, localisation géographique et activation en direct.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchGates}
            className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nouveau Poste
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Bornes</div>
          <div className="text-3xl font-black text-white mt-2">{gates.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Postes configurés dans le réseau</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20">
          <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">Bornes Actives</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{activeCount}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Prêtes à autoriser les passages</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Bornes Inactives / Maintenance</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{inactiveCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Passages temporairement suspendus</div>
        </div>
      </div>

      {/* Liste des postes */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Chargement des postes de péage...</div>
        ) : gates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nom du Poste</th>
                  <th className="py-3.5 px-4">Localisation</th>
                  <th className="py-3.5 px-4 text-center">Passages Enregistrés</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {gates.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-black text-white text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        {g.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{g.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {g.location}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {g._count?.transactions ?? 0} scans
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(g)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 border transition-all ${
                          g.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {g.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ACTIF
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            INACTIF
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(g)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGateToDelete(g)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucun poste de péage enregistré. Cliquez sur "Nouveau Poste" pour en créer un.
          </div>
        )}
      </div>

      {/* MODAL CRÉATION / ÉDITION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              {editingGate ? 'Modifier le Poste de Péage' : 'Nouveau Poste de Péage'}
            </h2>

            <form onSubmit={handleSaveGate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du Poste</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Poste Péage Cotonou Nord"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Localisation / Ville</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Ex: RNIE 2 - Sortie Cotonou"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : editingGate ? 'Mettre à jour' : 'Créer le Poste'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {gateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Supprimer ce poste ?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Êtes-vous sûr de vouloir supprimer le poste <strong className="text-white">"{gateToDelete.name}"</strong> ? Les transactions existantes seront conservées sans référence de borne.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setGateToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteGate}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
