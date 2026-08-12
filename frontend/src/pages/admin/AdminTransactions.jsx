import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Search, Filter, Download, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import api from '../../services/api';
import ReceiptModal from '../../components/ReceiptModal';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cardUidSearch, setCardUidSearch] = useState('');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = '/api/transactions?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (cardUidSearch) url += `card_uid=${encodeURIComponent(cardUidSearch)}&`;

      const res = await api.get(url);
      if (res.data?.status === 'success') {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error("Erreur de récupération des transactions admin :", err);
    } finally {
      setLoading(false);
    }
  };

  // Écoute WebSocket : rafraîchissement automatique à chaque nouveau scan ESP32
  useEffect(() => {
    fetchTransactions();

    let socketInstance = null;
    import('socket.io-client').then(({ io }) => {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      socketInstance = io(BASE_URL);

      socketInstance.on('scan_event', () => {
        fetchTransactions();
      });
    }).catch(err => console.warn('WebSockets fallback:', err));

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [statusFilter, cardUidSearch]);

  const handleExportCSV = () => {
    const headers = "ID,Date,UID_Carte,Usager,Montant_FCFA,Statut,Motif_Refus\n";
    const rows = transactions.map(t =>
      `"${t.id}","${new Date(t.createdAt).toISOString()}","${t.cardUid}","${t.userName || ''}",${t.amount},"${t.status}","${t.reason || ''}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export_transactions_peage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">

      {/* En-tête Page */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <ArrowLeftRight className="w-7 h-7 text-purple-400" />
            Historique Global des <span className="text-gradient-purple">Transactions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit des passages, génération de reçus PDF avec QR Code et exportation CSV.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
          className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-extrabold text-xs border border-purple-500/30 transition-all self-start md:self-auto disabled:opacity-50 shadow-lg shadow-purple-600/10"
        >
          <Download className="w-4 h-4" />
          Exporter CSV ({transactions.length})
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={cardUidSearch}
            onChange={(e) => setCardUidSearch(e.target.value)}
            placeholder="Filtrer par UID Carte..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'AUTHORIZED', label: 'Autorisés' },
            { id: 'REFUSED', label: 'Refusés' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={fetchTransactions}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID Transaction</th>
                  <th className="py-3.5 px-4">Date &amp; Heure</th>
                  <th className="py-3.5 px-4">UID Carte RFID</th>
                  <th className="py-3.5 px-4">Usager / Conducteur</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4">Motif / Analyse</th>
                  <th className="py-3.5 px-4 text-right">Reçu PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      {t.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-slate-200">
                      {new Date(t.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-purple-400">
                      {t.cardUid}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {t.userName || "Usager non identifié"}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-white">
                      {t.amount > 0 ? `${t.amount.toLocaleString()} FCFA` : '0 FCFA'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        t.status === 'AUTHORIZED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {t.status === 'AUTHORIZED' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Autorisé
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Refusé
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {t.reason ? (
                        <span className="font-semibold text-red-300">
                          {t.reason === 'solde_insuffisant' ? 'Solde Insuffisant (< 500 FCFA)' :
                           t.reason === 'carte_bloquee' ? 'Carte RFID Bloquée' :
                           t.reason === 'carte_inconnue' ? 'Carte non enregistrée' : t.reason}
                        </span>
                      ) : (
                        <span className="text-emerald-400">Passage Validé</span>
                      )}
                    </td>
                    {/* Bouton Reçu PDF */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxForReceipt(t)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[11px] font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Reçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucune transaction enregistrée.
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
