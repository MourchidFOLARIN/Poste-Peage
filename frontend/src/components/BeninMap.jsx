import React, { useState } from 'react';
import { MapPin, Navigation, Cpu, Activity, Zap, CheckCircle2, ShieldCheck, Layers, Radio, Sparkles, Compass } from 'lucide-react';

export default function BeninMap() {
  const [selectedStation, setSelectedStation] = useState('ekpe');
  const [mapMode, setMapMode] = useState('vector'); // 'vector' | 'geo'

  // Postes de péage réels au Bénin avec géolocalisation et détails
  const tollStations = [
    {
      id: 'ekpe',
      name: 'Poste de Péage d\'Ekpé',
      location: 'Route Cotonou - Sèmè Kpodji (RNIE 1)',
      department: 'Ouémé / Littoral',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '6 Voies Automatiques',
      tech: 'Lecteur RFID UHF 860-960MHz + ESP32',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      coords: { x: 74, y: 88 }, // Position % sur SVG Bénin
      geo: { lat: 6.38, lng: 2.53 },
      traffic: 'Flux Très Élevé (~18 000 veh/jour)',
      desc: 'Principal verrou d\'accès de l\'axe Cotonou - Porto-Novo. Équipé de barrières servo-moteurs à haute vitesse et caméras LPR.'
    },
    {
      id: 'houegbo',
      name: 'Poste de Péage de Houègbo',
      location: 'RNIE 2 (Axe Cotonou - Bohicon)',
      department: 'Atlantique',
      status: 'Opérationnel 24/7',
      rate: '500 FCFA',
      lanes: '4 Voies Mixtes & Rapides',
      tech: 'Capteurs Infrarouges + ESP32 WebSockets',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      coords: { x: 62, y: 78 },
      geo: { lat: 6.78, lng: 2.17 },
      traffic: 'Flux Élevé (~12 000 veh/jour)',
      desc: 'Point stratégique reliant le Sud aux départements du Zou et des Collines. Système anti-bouchon automatisé.'
    },
    {
      id: 'diho',
      name: 'Poste de Péage de Diho',
      location: 'Axe Savè - Parakou (RNIE 2)',
      department: 'Collines',
      status: 'Opérationnel Modernisé',
      rate: '500 FCFA',
      lanes: '4 Voies Haute Fréquence',
      tech: 'Puces RFID UHF & Postgre Cloud',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      coords: { x: 70, y: 62 },
      geo: { lat: 8.03, lng: 2.48 },
      traffic: 'Flux Moyen / Poids Lourds',
      desc: 'Situé au centre du Bénin pour le contrôle du fret inter-états vers le Niger et le Burkina Faso.'
    },
    {
      id: 'cotonou',
      name: 'Poste de Péage de Cotonou Est',
      location: 'Boulevard de la Marina - Contournement',
      department: 'Littoral',
      status: 'Haute Capacité',
      rate: '500 FCFA',
      lanes: '8 Voies de franchissement',
      tech: 'ESP32 Dual Core + Synchro MoMo',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      coords: { x: 69, y: 91 },
      geo: { lat: 6.35, lng: 2.43 },
      traffic: 'Flux Élevé Urbain',
      desc: 'Desserte directe de la zone portuaire et commerciale de Cotonou avec paiement fluide par badge RFID et Mobile Money.'
    },
    {
      id: 'parakou',
      name: 'Poste de Péage de Parakou Nord',
      location: 'RNIE 2 (Axe Parakou - N\'Dali)',
      department: 'Borgou',
      status: 'Connecté ESP32',
      rate: '500 FCFA',
      lanes: '4 Voies Automatisées',
      tech: 'RFID Longue Portée + Solaire',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      coords: { x: 78, y: 44 },
      geo: { lat: 9.35, lng: 2.62 },
      traffic: 'Flux Régional Fret',
      desc: 'Hub de péage électronique du Grand Nord Bénin assurant le passage rapide des convois et véhicules particuliers.'
    }
  ];

  const currentStation = tollStations.find(s => s.id === selectedStation) || tollStations[0];

  return (
    <div className="w-full bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Carte */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-black uppercase tracking-widest">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              Réseau TéléPéage du Bénin 🇧🇯
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Carte Interactive des <span className="text-gradient-cyan">Postes de Péage</span>
            </h2>
            <p className="text-slate-400 text-base max-w-2xl">
              Cliquez sur un point de péage sur la carte du Bénin pour visualiser en direct le statut de la borne ESP32, les voieries et la télémétrie réseau.
            </p>
          </div>

          {/* Toggle Mode Carte */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setMapMode('vector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'vector'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Carte Vectorielle
            </button>
            <button
              onClick={() => setMapMode('geo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'geo'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Vue Satellite / Géo
            </button>
          </div>
        </div>

        {/* Grille Carte + Panneau Détails */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* COLONNE GAUCHE : VUE DE LA CARTE DU BÉNIN (7 Cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-cyan-500/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[540px] bg-slate-900/60 shadow-2xl">

            {/* Halo lumineux en arrière-plan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mode Carte Vectorielle (SVG Stylisé du Bénin) */}
            {mapMode === 'vector' ? (
              <div className="relative w-full max-w-[400px] h-[520px] flex items-center justify-center">

                {/* SVG Silhouette Réelle du Bénin */}
                <svg
                  viewBox="0 0 200 400"
                  className="w-full h-full drop-shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                >
                  <defs>
                    <linearGradient id="beninGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#0d9488" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  {/* Forme du Bénin géographiquement dessinée */}
                  <path
                    d="M 120,10 
                       L 155,25 L 175,60 L 165,95 L 175,130 L 160,170 
                       L 145,210 L 155,250 L 160,290 L 165,340 
                       L 155,365 L 140,380 L 115,385 L 90,380 
                       L 100,340 L 115,300 L 105,260 L 110,210 
                       L 95,170 L 65,140 L 45,100 L 55,60 L 80,30 Z"
                    fill="url(#beninGradient)"
                    stroke="url(#strokeGradient)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="transition-all duration-700 hover:fill-cyan-900/40"
                  />

                  {/* Route Nationale Principale RNIE 2 (Axe Sud - Nord) */}
                  <path
                    d="M 140,375 L 130,340 L 125,290 L 135,210 L 145,130 L 140,70"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    strokeDasharray="2 2"
                  />

                  {/* Label Pays */}
                  <text x="75" y="180" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="4" opacity="0.4">
                    BÉNIN 🇧🇯
                  </text>
                  <text x="65" y="200" fill="#06b6d4" fontSize="8" fontWeight="600" opacity="0.6">
                    RNIE 1 & RNIE 2
                  </text>
                </svg>

                {/* Marqueurs interactifs sur la Carte du Bénin */}
                {tollStations.map((station) => {
                  const isSelected = selectedStation === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStation(station.id)}
                      style={{ top: `${station.coords.y}%`, left: `${station.coords.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20"
                    >
                      {/* Halo d'impulsion */}
                      <span className={`absolute -inset-3 rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-cyan-400/30 animate-ping' : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                      }`} />

                      {/* Pin central */}
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-xl ${
                        isSelected
                          ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 scale-125 ring-4 ring-cyan-400/40'
                          : 'bg-slate-900 border border-cyan-400 text-cyan-400 group-hover:scale-110'
                      }`}>
                        <MapPin className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                      </div>

                      {/* Info bulle sous le pin */}
                      <span className={`absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap transition-all shadow-lg border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 opacity-100 scale-100'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 opacity-80 group-hover:opacity-100'
                      }`}>
                        {station.name.replace('Poste de Péage d\'', '').replace('Poste de Péage de ', '')}
                      </span>
                    </button>
                  );
                })}

              </div>
            ) : (
              /* Mode Vue Satellite / Géo Leaflet Embed / Map Tile */
              <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800">
                <iframe
                  title="Carte du Benin Leaflet"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=1.5000%2C6.1000%2C3.8000%2C12.4000&layer=mapnik&marker=${currentStation.geo.lat}%2C${currentStation.geo.lng}`}
                  className="w-full h-full filter contrast-[1.15] invert-[0.9] hue-rotate-[180deg] brightness-[0.85]"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 px-3.5 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400 animate-bounce" />
                  Repère GPS : {currentStation.geo.lat}° N, {currentStation.geo.lng}° E
                </div>
              </div>
            )}

            {/* Légende bas de carte */}
            <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" /> Borne ESP32 Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> RFID UHF 200ms</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Péage Électronique Bénin 🇧🇯</span>
            </div>

          </div>

          {/* COLONNE DROITE : FICHE DÉTAILLÉE DU POSTE SÉLECTIONNÉ (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6 bg-slate-900/90 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Photo du Poste */}
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-800 group">
                <img
                  src={currentStation.image}
                  alt={currentStation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  {currentStation.department}
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {currentStation.status}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black">
                    {currentStation.rate} / passage
                  </span>
                </div>
              </div>

              {/* Titre et Localisation */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{currentStation.name}</h3>
                <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  {currentStation.location}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {currentStation.desc}
                </p>
              </div>

              {/* Caractéristiques bornes ESP32 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Voies de Péage</span>
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {currentStation.lanes}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Matériel Bornes</span>
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5 truncate">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    ESP32 RFID
                  </span>
                </div>
              </div>

              {/* Télémétrie en direct */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Fréquence Fréquentielle
                  </span>
                  <span className="font-mono text-cyan-400 text-[11px] font-bold">200ms RFID</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {currentStation.traffic}
                </div>
              </div>

              {/* Boutons d'accès direct */}
              <div className="flex items-center gap-3 pt-2">
                {tollStations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStation(st.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedStation === st.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st.id.toUpperCase()}
                  </button>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
