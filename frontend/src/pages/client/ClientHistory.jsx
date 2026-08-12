import React, { useState } from 'react';
import { History, Filter, CheckCircle, XCircle, RefreshCw, FileText, Radio, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReceiptModal from '../../components/ReceiptModal';

export default function ClientHistory() {
  const { transactions, refreshUser, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState(null);

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const totalDeduit = filteredTransactions
    .filter(t => t.status === 'AUTHORIZED')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* En-tête avec stats */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5" />
            Journal des Passages
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            Historique <span className="text-gradient-cyan">Personnel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Détail horodaté de tous vos passages enregistrés par les bornes ESP32
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {/* Mini-stat : total déduit */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Payé</span>
            <span className="text-2xl font-black text-white">{totalDeduit.toLocaleString('fr-FR')}<span className="text-sm font-bold text-cyan-400 ml-1">FCFA</span></span>
          </div>
          <button
            onClick={() => refreshUser()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filtres stylisés */}
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-2xl w-fit">
        <Filter className="w-4 h-4 text-slate-400 ml-1" />
        {[
          { id: 'ALL', label: 'Tous les Passages', count: transactions.length },
          { id: 'AUTHORIZED', label: 'Autorisés', count: transactions.filter(t => t.status === 'AUTHORIZED').length },
          { id: 'REFUSED', label: 'Refusés', count: transactions.filter(t => t.status === 'REFUSED').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === f.id
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              filterStatus === f.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Tableau des transactions */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-black text-[10px] tracking-widest border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Horodatage</th>
                  <th className="py-4 px-4">UID Badge RFID</th>
                  <th className="py-4 px-4">Poste de Péage</th>
                  <th className="py-4 px-4 text-right">Montant Déduit</th>
                  <th className="py-4 px-4 text-center">Statut du Passage</th>
                  <th className="py-4 px-4">Détail / Motif</th>
                  <th className="py-4 px-4 text-right">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-200">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-4 font-mono font-medium text-slate-300">
                      {new Date(t.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-cyan-400 text-sm">{t.cardUid}</td>
                    <td className="py-4 px-4 font-medium">{t.tollGate?.name || "Péage Principal - Cotonou"}</td>
                    <td className="py-4 px-4 text-right font-extrabold text-white">
                      {t.amount > 0 ? (
                        <span className="text-red-400">−{t.amount.toLocaleString()} FCFA</span>
                      ) : '0 FCFA'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border shadow-md ${
                        t.status === 'AUTHORIZED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/10'
                          : 'bg-red-500/10 text-red-400 border-red-500/25 shadow-red-500/10'
                      }`}>
                        {t.status === 'AUTHORIZED' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Barrière Ouverte
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Accès Refusé
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-medium">
                      {t.reason
                        ? (t.reason === 'solde_insuffisant' ? '⚠️ Solde Insuffisant' :
                           t.reason === 'carte_bloquee' ? '🔒 Carte Bloquée' :
                           t.reason === 'carte_inconnue' ? '❓ Carte Inconnue' : t.reason)
                        : (t.status === 'AUTHORIZED' ? '✅ Passage Validé' : '—')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxForReceipt(t)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold transition-all flex items-center gap-1.5 ml-auto shadow-md"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Reçu PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center">
              <History className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400">Aucune transaction trouvée</p>
              <p className="text-xs text-slate-500 mt-1">Vos passages aux péages apparaîtront ici.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Reçu PDF avec QR Code */}
      <ReceiptModal
        isOpen={!!selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
        transaction={selectedTxForReceipt}
      />

    </div>
  );
}
