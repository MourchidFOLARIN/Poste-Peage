import React, { useState, useEffect } from 'react';
import { Coins, CheckCircle, XCircle, CreditCard, Users, RefreshCw, Activity, ArrowUpRight, ShieldCheck, Radio, Cpu, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/revenue-chart?days=7')
      ]);

      if (statsRes.data?.status === 'success') {
        setStats(statsRes.data.data);
      }
      if (chartRes.data?.status === 'success') {
        setChartData(chartRes.data.data);
      }
    } catch (err) {
      console.error("Erreur de récupération des stats admin :", err);
      addToast('Erreur lors du chargement des statistiques', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Écoute des événements WebSocket en temps réel
    let socketInstance = null;
    import('socket.io-client').then(({ io }) => {
      const BASE_URL = import.meta.env.VITE_API_URL !== undefined 
        ? import.meta.env.VITE_API_URL 
        : (typeof window !== 'undefined' ? window.location.origin : '');
      socketInstance = io(BASE_URL);

      socketInstance.on('scan_event', (scanData) => {
        console.log('⚡ NOUVEAU SCAN ESP32 DÉTECTÉ TEMPS RÉEL :', scanData);
        fetchStats();
      });

      socketInstance.on('card_recharged', () => {
        fetchStats();
      });
    }).catch(err => console.warn('WebSockets fallback:', err));

    const interval = setInterval(fetchStats, 15000);
    return () => {
      clearInterval(interval);
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  // Calcul du max pour la hauteur relative du graphique
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">

      {/* En-tête du Back-Office Admin */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Centre de Contrôle ESP32
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Supervision &amp; <span className="text-gradient-purple">Analytics Péage</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Flux de véhicules en temps réel, encaissements et télémétrie des bornes de péage.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
            title="Modifier le tarif de passage"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Tarif : <strong className="font-mono text-white">{stats?.currentTollFee || 500} FCFA</strong></span>
          </Link>

          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black shadow-lg shadow-emerald-500/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ESP32 EN DIRECT
          </span>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-xl shadow-purple-600/25 transition-all transform hover:scale-[1.02]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Cartes statistiques (Analytics 4 Colonnes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. Recette totale du jour */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glass-card-hover group border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recette du Jour</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Coins className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {stats?.totalTodayRevenue ? stats.totalTodayRevenue.toLocaleString('fr-FR') : '0'}
              <span className="text-sm font-extrabold text-emerald-400 ml-2">FCFA</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Passages autorisés aujourd'hui</span>
          </div>
        </div>

        {/* 2. Passages Autorisés vs Refusés */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glass-card-hover group border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scans Réalisés</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <div>
              <span className="text-3xl font-black text-emerald-400">{stats?.authorizedCount || 0}</span>
              <span className="text-[10px] text-slate-400 block font-black tracking-wider">AUTORISÉS</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <span className="text-3xl font-black text-red-400">{stats?.refusedCount || 0}</span>
              <span className="text-[10px] text-slate-400 block font-black tracking-wider">REFUSÉS</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">Total vérifié sur la barrière</div>
        </div>

        {/* 3. Cartes Actives vs Bloquées */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glass-card-hover group border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cartes RFID</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <div>
              <span className="text-3xl font-black text-white">{stats?.activeCardsCount || 0}</span>
              <span className="text-[10px] text-emerald-400 block font-black tracking-wider">ACTIVES</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <span className="text-3xl font-black text-red-400">{stats?.blockedCardsCount || 0}</span>
              <span className="text-[10px] text-red-400 block font-black tracking-wider">BLOQUÉES</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">Parc global attribué</div>
        </div>

        {/* 4. Total Utilisateurs */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden glass-card-hover group border border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Conducteurs</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stats?.totalUsersCount || 0}</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">Comptes usagers enregistrés</div>
        </div>

      </div>

      {/* GRAPHIQUE DES REVENUS DES 7 DERNIERS JOURS */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Évolution des Recettes (7 Derniers Jours)
            </h2>
            <p className="text-xs text-slate-400">Total des encaissements journaliers réalisés sur l'ensemble des bornes</p>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 self-start sm:self-auto">
            Total 7J : {chartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        {/* Graphique à barres SVG personnalisé et responsive */}
        <div className="pt-6">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-800 pb-2">
            {chartData.map((item, index) => {
              const heightPercent = maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 4) : 4;
              const dateObj = new Date(item.date);
              const dayLabel = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
              const isToday = index === chartData.length - 1;

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip flottant au hover */}
                  {hoveredBar?.date === item.date && (
                    <div className="absolute -top-14 z-20 bg-slate-900 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-xl text-center pointer-events-none whitespace-nowrap animate-float">
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        {item.revenue.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.count} passage{item.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Barre graphique */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 group-hover:scale-105 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 shadow-lg shadow-emerald-500/25'
                        : 'bg-gradient-to-t from-purple-800/80 via-purple-600 to-indigo-500 group-hover:from-emerald-600 group-hover:to-teal-400'
                    }`}
                  />

                  {/* Label Date */}
                  <span className={`text-[10px] sm:text-xs font-semibold mt-2 ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FLUX EN DIRECT DES SCANS ESP32 */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
              Flux Temps Réel des Scans ESP32
            </h2>
            <p className="text-xs text-slate-400">Lectures instantanées transmises via WebSocket par les bornes du péage</p>
          </div>
          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/30 shadow-md">
            En direct via Socket.io
          </span>
        </div>

        {stats?.recentScans && stats.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Heure &amp; Date</th>
                  <th className="py-4 px-4">UID Carte RFID</th>
                  <th className="py-4 px-4">Conducteur / Usager</th>
                  <th className="py-4 px-4">Poste Péage</th>
                  <th className="py-4 px-4 text-right">Montant</th>
                  <th className="py-4 px-4 text-center">Décision Barrière</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {stats.recentScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {new Date(s.createdAt).toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-purple-400 text-sm">{s.cardUid}</td>
                    <td className="py-4 px-4 font-bold text-white">{s.userName || "Inconnu"}</td>
                    <td className="py-4 px-4 font-medium">{s.tollGate?.name || "Poste 1 - Cotonou"}</td>
                    <td className="py-4 px-4 text-right font-black text-white">
                      {s.amount > 0 ? `${s.amount} FCFA` : '0 FCFA'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 border shadow-md ${
                        s.status === 'AUTHORIZED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                          : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10'
                      }`}>
                        {s.status === 'AUTHORIZED' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            OUVERTURE BARRIÈRE
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            REFUS ({s.reason || 'Erreur'})
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucun scan récent reçu pour le moment.
          </div>
        )}
      </div>

    </div>
  );
}
