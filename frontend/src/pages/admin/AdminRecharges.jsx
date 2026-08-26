import React, { useState, useEffect } from 'react';
import { Smartphone, Search, Filter, Download, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

const OPERATOR_LABELS = {
  MTN: { label: 'MTN MoMo', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  MOOV: { label: 'Moov Money', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CELTIS: { label: 'Celtis Cash', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
};

export default function AdminRecharges() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/recharges');
      if (res.data?.status === 'success') {
        setRecharges(res.data.data);
      }
    } catch (err) {
      console.error('Erreur de récupération des recharges :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();

    let socketInstance = null;
    import('socket.io-client').then(({ io }) => {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      socketInstance = io(BASE_URL);
      socketInstance.on('card_recharged', () => fetchRecharges());
    }).catch((err) => console.warn('WebSockets fallback:', err));

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  const filteredRecharges = recharges.filter((r) => {
    const matchesOperator = operatorFilter === 'ALL' || r.operator === operatorFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || [
      r.user?.name,
      r.user?.email,
      r.card?.uid,
      r.phoneNumber,
    ].some((field) => field?.toLowerCase().includes(q));
    return matchesOperator && matchesSearch;
  });

  const totalAmount = filteredRecharges
    .filter((r) => r.status === 'SUCCESS')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleExportCSV = () => {
    const headers = 'ID,Date,Usager,Email,UID_Carte,Operateur,Telephone,Montant_FCFA,Nouveau_Solde,Statut\n';
    const rows = filteredRecharges.map((r) =>
      `"${r.id}","${new Date(r.createdAt).toISOString()}","${r.user?.name || ''}","${r.user?.email || ''}","${r.card?.uid || ''}","${r.operator}","${r.phoneNumber}",${r.amount},${r.newBalance ?? ''},"${r.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `export_recharges_peage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatusBadge = ({ status }) => {
    if (status === 'SUCCESS') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Réussi
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3 h-3" />
          Échoué
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <Clock className="w-3 h-3" />
        En attente
      </span>
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Smartphone className="w-7 h-7 text-emerald-400" />
            Recharges <span className="text-gradient-purple">Mobile Money</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Suivi des crédits MTN, Moov et Celtis — mise à jour en temps réel.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:items-end gap-2">
          <div className="text-xs text-slate-400">
            Total filtré : <span className="font-black text-emerald-400">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredRecharges.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-extrabold text-xs border border-emerald-500/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exporter CSV ({filteredRecharges.length})
          </button>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (nom, email, UID, téléphone)..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'MTN', label: 'MTN' },
            { id: 'MOOV', label: 'Moov' },
            { id: 'CELTIS', label: 'Celtis' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setOperatorFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                operatorFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={fetchRecharges}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Chargement des recharges...</div>
        ) : filteredRecharges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date &amp; Heure</th>
                  <th className="py-3.5 px-4">Usager</th>
                  <th className="py-3.5 px-4">UID Carte</th>
                  <th className="py-3.5 px-4">Opérateur</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-right">Nouveau solde</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {filteredRecharges.map((r) => {
                  const op = OPERATOR_LABELS[r.operator] || { label: r.operator, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium text-slate-200">
                        {new Date(r.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{r.user?.name || '—'}</div>
                        <div className="text-[10px] text-slate-500">{r.user?.email}</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-purple-400">
                        {r.card?.uid || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${op.color}`}>
                          {op.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-300">{r.phoneNumber}</td>
                      <td className="py-4 px-4 text-right font-black text-emerald-400">
                        +{r.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-white">
                        {r.newBalance != null ? `${r.newBalance.toLocaleString('fr-FR')} FCFA` : '—'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucune recharge enregistrée.
          </div>
        )}
      </div>
    </div>
  );
}
