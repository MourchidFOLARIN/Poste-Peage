import React, { useState } from 'react';
import { MapPin, Navigation, Cpu, ShieldCheck, Radio, Zap, Car, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function BeninMap() {
  const [selectedId, setSelectedId] = useState('ekpe');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [stationStats, setStationStats] = useState({
    ekpe: 18450, houegbo: 12310, grandpopo: 8940, diho: 6520,
    parakou: 9180, bembereke: 5430, kpomasse: 7890, djougou: 4820
  });

  const tollStations = [
    {
      id: 'ekpe',
      name: "Poste de Péage d'Ekpé",
      location: 'RNIE 1 — Cotonou / Porto-Novo',
      department: 'Ouémé',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '6 Voies Auto + FastLane',
      tech: 'ESP32 Dual-Core + RFID UHF 860MHz',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      traffic: '~18 500 veh / jour',
      signal: '99.8%',
      desc: "Principal verrou d'accès reliant Cotonou à Porto-Novo et au Nigeria. Barrières servo-moteurs haute vitesse et caméras LPR."
    },
    {
      id: 'houegbo',
      name: 'Poste de Péage de Houègbo',
      location: 'RNIE 2 — Cotonou / Allada / Bohicon',
      department: 'Atlantique',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '4 Voies Mixtes & Rapides',
      tech: 'Capteurs Infrarouges + ESP32 WebSocket',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      traffic: '~12 300 veh / jour',
      signal: '98.5%',
      desc: 'Reliant le littoral aux départements du Zou et des Collines. Système anti-bouchon automatisé.'
    },
    {
      id: 'grandpopo',
      name: "Poste de Péage d'Ahoho",
      location: 'RNIE 1 — Comè / Hillacondji (Togo)',
      department: 'Mono',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '4 Voies Transfrontalières',
      tech: 'RFID UHF + Caméras LPR',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      traffic: '~8 900 veh / jour',
      signal: '99.1%',
      desc: 'Porte d\'entrée ouest vers le Togo. Contrôle du transit poids lourds et véhicules inter-États.'
    },
    {
      id: 'diho',
      name: 'Poste de Péage de Diho',
      location: 'RNIE 2 — Dassa-Zoumè / Savè',
      department: 'Collines',
      region: 'CENTRE',
      status: 'Opérationnel Modernisé',
      rate: '500 FCFA',
      lanes: '4 Voies Poids Lourds & Léger',
      tech: 'Balance Pésage + ESP32 Solaire',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      traffic: '~6 500 veh / jour',
      signal: '97.2%',
      desc: 'Centre géographique du Bénin. Régulation du fret vers Parakou, le Niger et le Burkina Faso.'
    },
    {
      id: 'parakou',
      name: 'Poste de Péage de Sirarou',
      location: 'RNIE 2 — Parakou / N\'Dali',
      department: 'Borgou',
      region: 'NORD',
      status: 'Connecté ESP32',
      rate: '500 FCFA',
      lanes: '4 Voies Automatisées',
      tech: 'RFID Longue Portée + Photovoltaïque',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      traffic: '~9 100 veh / jour',
      signal: '98.9%',
      desc: 'Hub névralgique de la métropole de Parakou pour les convois marchands du Grand Nord.'
    },
    {
      id: 'bembereke',
      name: 'Poste de Péage de Bembèrèkè',
      location: 'RNIE 2 — Parakou / Kandi / Malanville',
      department: 'Alibori',
      region: 'NORD',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '4 Voies Transit Lourd',
      tech: 'Balance Pésage & Puces RFID UHF',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      traffic: '~5 400 veh / jour',
      signal: '96.5%',
      desc: 'Corridor international Cotonou–Niamey. Pesée électronique des camions gros porteurs.'
    },
    {
      id: 'kpomasse',
      name: 'Poste de Péage de Kpomassè',
      location: 'Route des Pêches — Pahou / Ouidah',
      department: 'Atlantique',
      region: 'SUD',
      status: 'Nouvelle Génération',
      rate: '500 FCFA',
      lanes: '4 Voies Express',
      tech: 'Paiement NFC Sans Contact & RFID',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      traffic: '~7 800 veh / jour',
      signal: '99.5%',
      desc: 'Poste moderne sur la Route des Pêches, desservant la zone touristique et historique de Ouidah.'
    },
    {
      id: 'djougou',
      name: 'Poste de Péage de Djougou',
      location: 'RNIE 3 — Djougou / Natitingou',
      department: 'Donga',
      region: 'NORD',
      status: 'Opérationnel',
      rate: '500 FCFA',
      lanes: '4 Voies Régionales',
      tech: 'Détecteurs d\'essieux + ESP32 RFID',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      traffic: '~4 800 veh / jour',
      signal: '98.1%',
      desc: 'Axe commercial reliant l\'Atacora et la Donga vers le Togo et le Burkina Faso.'
    }
  ];

  const regionColors = {
    SUD: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    CENTRE: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    NORD: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
  };

  const current = tollStations.find(s => s.id === selectedId) || tollStations[0];

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      const ok = Math.random() > 0.05;
      const badge = 'BJ-RFID-' + Math.floor(100000 + Math.random() * 900000);
      if (ok) {
        setSimulationResult({ success: true, badge, message: 'Signal RFID Validé (200ms) — Barrière Ouverte !' });
        setStationStats(prev => ({ ...prev, [selectedId]: (prev[selectedId] || 0) + 1 }));
      } else {
        setSimulationResult({ success: false, badge, message: 'Badge Non Reconnu ou Solde Insuffisant' });
      }
    }, 1400);
  };

  return (
    <div className="w-full bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ── EN-TÊTE ── */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Réseau SIRAT — 8 Postes de Péage Électronique Bénin 🇧🇯
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Postes de <span className="text-gradient-cyan">Péage Nationaux</span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Sélectionnez un poste pour visualiser sa fiche technique complète, la télémétrie ESP32 et simuler un passage RFID.
          </p>
        </div>

        {/* ── GRILLE PRINCIPALE : GALERIE (8 CARDS) + FICHE DÉTAIL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── COLONNE GAUCHE : 8 CARTES IMAGES POSTES ─── */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4">
            {tollStations.map((st) => {
              const isSelected = selectedId === st.id;
              return (
                <button
                  key={st.id}
                  id={`station-card-${st.id}`}
                  onClick={() => { setSelectedId(st.id); setSimulationResult(null); }}
                  className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left focus:outline-none ${
                    isSelected
                      ? 'border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-[1.02]'
                      : 'border-slate-800 hover:border-cyan-500/50 hover:scale-[1.01]'
                  }`}
                >
                  {/* Image du poste */}
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img
                      src={st.image}
                      alt={st.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                    {/* Overlay gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                      isSelected
                        ? 'from-slate-950 via-slate-900/70 to-cyan-900/20'
                        : 'from-slate-950 via-slate-900/50 to-transparent group-hover:via-slate-900/60'
                    }`} />

                    {/* Badge région en haut à gauche */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black border ${regionColors[st.region]}`}>
                      {st.region}
                    </span>

                    {/* Indicateur sélectionné */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60">
                        <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    )}

                    {/* Info bas de carte */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className={`text-[11px] font-black leading-tight transition-colors ${
                        isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
                      }`}>
                        {st.name.replace("Poste de Péage d'", '').replace('Poste de Péage de ', '').replace("Poste de Péage d\\'", '')}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{st.department} · {st.location.split('—')[0].trim()}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ─── COLONNE DROITE : FICHE DÉTAILLÉE DU POSTE SÉLECTIONNÉ ─── */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl border border-cyan-500/30 overflow-hidden bg-slate-900/90 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Photo principale grande */}
              <div className="relative h-56 sm:h-64 overflow-hidden group">
                <img
                  key={current.id}
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                {/* Tags superposés */}
                <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-black">
                    📍 {current.department}
                  </span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black border backdrop-blur-md ${regionColors[current.region]}`}>
                    Zone {current.region}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {current.status}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-lg">
                    {current.rate} / passage
                  </span>
                </div>
              </div>

              {/* Corps de la fiche */}
              <div className="p-5 space-y-4 relative">

                {/* Titre & Localisation */}
                <div>
                  <h3 className="text-xl font-black text-white">{current.name}</h3>
                  <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5 mt-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {current.location}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{current.desc}</p>
                </div>

                {/* Grille infos techniques */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Voies</span>
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      {current.lanes}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Trafic / Jour</span>
                    <span className="text-xs font-black text-white">{current.traffic}</span>
                  </div>
                  <div className="col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Matériel IoT</span>
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      {current.tech}
                    </span>
                  </div>
                </div>

                {/* Télémétrie */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Qualité signal ESP32
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-mono">{current.signal}</span>
                    <span className="text-xs text-slate-400">— {stationStats[selectedId]?.toLocaleString('fr-FR')} scans / jour</span>
                  </div>
                </div>

                {/* ── SIMULATEUR ESP32 ── */}
                <div className="space-y-2.5">
                  <button
                    id="btn-simulate-rfid"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isSimulating
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20'
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        Lecture puce RFID par la borne ESP32...
                      </>
                    ) : (
                      <>
                        <Car className="w-4 h-4" />
                        Simuler Scanner Badge RFID à la Borne
                      </>
                    )}
                  </button>

                  {simulationResult && (
                    <div className={`p-3 rounded-xl text-xs border ${
                      simulationResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {simulationResult.success
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <AlertTriangle className="w-4 h-4 text-red-400" />}
                          {simulationResult.message}
                        </span>
                      </div>
                      {simulationResult.success && (
                        <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
                          <span>Badge : <strong className="text-slate-200">{simulationResult.badge}</strong></span>
                          <span className="text-emerald-400 font-bold">Barrière Levée ✓</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
