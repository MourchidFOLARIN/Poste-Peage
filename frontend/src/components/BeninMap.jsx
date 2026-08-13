import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, Cpu, Activity, Zap, CheckCircle2, ShieldCheck,
  Layers, Radio, Sparkles, Compass, Search, Filter, RefreshCw, Car,
  Truck, CreditCard, ExternalLink, ArrowUpRight, AlertTriangle, Eye, Globe
} from 'lucide-react';

export default function BeninMap() {
  const [selectedStationId, setSelectedStationId] = useState('ekpe');
  const [mapMode, setMapMode] = useState('vector'); // 'vector' | 'geo'
  const [tileProvider, setTileProvider] = useState('dark'); // 'dark' | 'satellite' | 'street'
  const [regionFilter, setRegionFilter] = useState('ALL'); // 'ALL' | 'SUD' | 'CENTRE' | 'NORD'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptHover, setSelectedDeptHover] = useState(null);

  // État du simulateur d'ouverture de barrière ESP32
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [stationStats, setStationStats] = useState({
    ekpe: { scansToday: 18450, totalFcfa: 9225000 },
    houegbo: { scansToday: 12310, totalFcfa: 6155000 },
    grandpopo: { scansToday: 8940, totalFcfa: 4470000 },
    diho: { scansToday: 6520, totalFcfa: 3260000 },
    parakou: { scansToday: 9180, totalFcfa: 4590000 },
    bembereke: { scansToday: 5430, totalFcfa: 2715000 },
    kpomasse: { scansToday: 7890, totalFcfa: 3945000 },
    djougou: { scansToday: 4820, totalFcfa: 2410000 }
  });

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkersRef = useRef({});

  // 8 Postes de Péage Réels du Bénin (SIRAT - Société des Infrastructures Routières du Bénin)
  const tollStations = [
    {
      id: 'ekpe',
      name: "Poste de Péage d'Ekpé",
      location: 'Route Cotonou - Sèmè Kpodji - Porto-Novo (RNIE 1)',
      department: 'Ouémé',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '6 Voies Automatiques + FastLane',
      tech: 'ESP32 Dual-Core + RFID UHF 860-960MHz',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      coords: { x: 78, y: 88 },
      geo: { lat: 6.3833, lng: 2.5500 },
      traffic: 'Très Élevé (~18 500 véhicules / jour)',
      signalQuality: '99.8% (Fibre & 4G Dual)',
      desc: "Principal verrou d'accès reliant Cotonou à la capitale Porto-Novo et au Nigeria. Équipé de barrières servo-moteurs haute vitesse et caméras LPR."
    },
    {
      id: 'houegbo',
      name: 'Poste de Péage de Houègbo',
      location: 'Axe Cotonou - Allada - Bohicon (RNIE 2)',
      department: 'Atlantique',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Mixtes & Rapides',
      tech: 'Capteurs Infrarouges + ESP32 WebSockets',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      coords: { x: 62, y: 78 },
      geo: { lat: 6.7833, lng: 2.1667 },
      traffic: 'Flux Élevé (~12 300 véhicules / jour)',
      signalQuality: '98.5% (Connexion 4G)',
      desc: 'Point stratégique reliant le littoral du Bénin aux départements du Zou, des Collines et du Grand Nord. Système anti-bouchon automatisé.'
    },
    {
      id: 'grandpopo',
      name: "Poste de Péage d'Ahoho (Grand-Popo)",
      location: 'Axe Cotonou - Comè - Hillacondji (RNIE 1)',
      department: 'Mono',
      region: 'SUD',
      status: 'Opérationnel 24/7',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Transfrontalières',
      tech: 'Lecteur RFID UHF + Caméras LPR',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      coords: { x: 48, y: 90 },
      geo: { lat: 6.2833, lng: 1.8333 },
      traffic: 'Flux International (~8 900 véhicules / jour)',
      signalQuality: '99.1% (Ligne Dédiée)',
      desc: 'Porte d\'entrée ouest du Bénin vers le Togo. Assure le contrôle du transit des poids lourds et véhicules légers inter-États.'
    },
    {
      id: 'diho',
      name: 'Poste de Péage de Diho',
      location: 'Axe Dassa-Zoumè - Savè (RNIE 2)',
      department: 'Collines',
      region: 'CENTRE',
      status: 'Opérationnel Modernisé',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Poids Lourds & Léger',
      tech: 'Postgre Cloud + ESP32 Solaired',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      coords: { x: 72, y: 62 },
      geo: { lat: 8.0333, lng: 2.4833 },
      traffic: 'Flux Moyen Poids Lourds (~6 500 veh/jour)',
      signalQuality: '97.2% (Système Solaire + Satellite)',
      desc: 'Situé au centre géographique du Bénin. Essentiel pour la régulation du fret routier vers Parakou, le Niger et le Burkina Faso.'
    },
    {
      id: 'parakou',
      name: 'Poste de Péage de Sirarou (Parakou Nord)',
      location: 'Axe Parakou - N\'Dali (RNIE 2)',
      department: 'Borgou',
      region: 'NORD',
      status: 'Connecté ESP32',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Automatisées',
      tech: 'RFID Longue Portée + Photovoltaïque',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      coords: { x: 80, y: 44 },
      geo: { lat: 9.6000, lng: 2.7167 },
      traffic: 'Hub Grand Nord (~9 100 véhicules / jour)',
      signalQuality: '98.9% (ESP32 IoT Gateway)',
      desc: 'Carrefour névralgique de la métropole de Parakou assurant la fluidité du passage des convois marchands et des usagers locaux.'
    },
    {
      id: 'bembereke',
      name: 'Poste de Péage de Bembèrèkè',
      location: 'Axe Parakou - Kandi - Malanville (RNIE 2)',
      department: 'Alibori',
      region: 'NORD',
      status: 'Opérationnel 24/7',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Transit Lourd',
      tech: 'Balance Pésage & Puces RFID UHF',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      coords: { x: 79, y: 30 },
      geo: { lat: 10.2333, lng: 2.6667 },
      traffic: 'Corridor Transit Niger (~5 400 veh/jour)',
      signalQuality: '96.5% (Satellite Backup)',
      desc: 'Poste stratégique du corridor international Cotonou - Niamey pour la perception électronique et la pesée des camions gros porteurs.'
    },
    {
      id: 'kpomasse',
      name: 'Poste de Péage de Kpomassè',
      location: 'Route des Pêches (Pahou - Ouidah)',
      department: 'Atlantique',
      region: 'SUD',
      status: 'Nouvelle Génération',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Express Tout Véhicule',
      tech: 'Paiement NFC Sans Contact & Badge RFID',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      coords: { x: 58, y: 88 },
      geo: { lat: 6.3667, lng: 2.0500 },
      traffic: 'Flux Touristique (~7 800 véhicules / jour)',
      signalQuality: '99.5% (Fibre Optique)',
      desc: 'Poste moderne desservant la zone touristique de la Route des Pêches et la commune historique de Ouidah.'
    },
    {
      id: 'djougou',
      name: 'Poste de Péage de Djougou',
      location: 'Axe Djougou - Natitingou (RNIE 3)',
      department: 'Donga',
      region: 'NORD',
      status: 'Opérationnel',
      statusType: 'success',
      rate: '500 FCFA',
      lanes: '4 Voies Régionales',
      tech: 'Détections d\'essieux + ESP32 RFID',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      coords: { x: 42, y: 43 },
      geo: { lat: 9.7000, lng: 1.6667 },
      traffic: 'Axe Ouest Togo-Burkina (~4 800 veh/jour)',
      signalQuality: '98.1% (Réseau Télécom 4G)',
      desc: 'Garantit le contrôle et la perception rapide du péage sur le tronçon commercial reliant l\'Atacora et la Donga.'
    }
  ];

  // Départements du Bénin pour la Carte Vectorielle
  const departmentsData = [
    { id: 'alibori', name: 'Alibori', region: 'NORD', capital: 'Kandi', path: 'M 130,20 L 175,25 L 180,75 L 140,80 L 115,50 Z' },
    { id: 'atacora', name: 'Atacora', region: 'NORD', capital: 'Natitingou', path: 'M 60,35 L 130,20 L 115,50 L 105,95 L 45,85 L 50,60 Z' },
    { id: 'borgou', name: 'Borgou', region: 'NORD', capital: 'Parakou', path: 'M 115,50 L 140,80 L 180,75 L 175,145 L 110,140 Z' },
    { id: 'donga', name: 'Donga', region: 'NORD', capital: 'Djougou', path: 'M 45,85 L 105,95 L 110,140 L 70,145 L 50,110 Z' },
    { id: 'collines', name: 'Collines', region: 'CENTRE', capital: 'Dassa-Zoumè', path: 'M 70,145 L 110,140 L 175,145 L 160,205 L 85,210 Z' },
    { id: 'zou', name: 'Zou', region: 'CENTRE', capital: 'Abomey', path: 'M 85,210 L 160,205 L 150,260 L 95,255 Z' },
    { id: 'couffo', name: 'Couffo', region: 'SUD', capital: 'Aplahoué', path: 'M 65,215 L 85,210 L 95,255 L 75,295 L 55,270 Z' },
    { id: 'plateau', name: 'Plateau', region: 'SUD', capital: 'Pobè', path: 'M 150,260 L 170,260 L 175,320 L 145,315 Z' },
    { id: 'mono', name: 'Mono', region: 'SUD', capital: 'Lokossa', path: 'M 55,270 L 75,295 L 90,295 L 80,345 L 45,340 Z' },
    { id: 'atlantique', name: 'Atlantique', region: 'SUD', capital: 'Allada', path: 'M 95,255 L 150,260 L 145,315 L 130,345 L 90,345 Z' },
    { id: 'oueme', name: 'Ouémé', region: 'SUD', capital: 'Porto-Novo', path: 'M 145,315 L 175,320 L 170,355 L 140,355 Z' },
    { id: 'littoral', name: 'Littoral', region: 'SUD', capital: 'Cotonou', path: 'M 120,345 L 140,345 L 140,355 L 120,355 Z' }
  ];

  // Filtrage des postes de péage
  const filteredStations = tollStations.filter(st => {
    const matchesRegion = regionFilter === 'ALL' || st.region === regionFilter;
    const matchesSearch = searchQuery.trim() === '' ||
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const currentStation = tollStations.find(s => s.id === selectedStationId) || tollStations[0];

  // Effet de chargement / mise à jour de Leaflet quand mapMode === 'geo'
  useEffect(() => {
    if (mapMode !== 'geo') return;

    let isMounted = true;

    const loadLeafletScript = async () => {
      if (!window.L) {
        if (!document.getElementById('leaflet-css-cdn')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css-cdn';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!document.getElementById('leaflet-js-cdn')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js-cdn';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          document.body.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        } else {
          await new Promise((resolve) => {
            const checkInt = setInterval(() => {
              if (window.L) {
                clearInterval(checkInt);
                resolve();
              }
            }, 100);
          });
        }
      }

      if (!isMounted || !mapContainerRef.current) return;

      const L = window.L;

      // Détruire l'ancienne carte si elle existe déjà
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      // URLs de tuiles selon tileProvider
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      let attribution = '&copy; <a href="https://carto.com/">CARTO</a>';

      if (tileProvider === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      } else if (tileProvider === 'street') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; OpenStreetMap contributors';
      }

      // Initialiser la carte Leaflet
      const map = L.map(mapContainerRef.current, {
        center: [currentStation.geo.lat, currentStation.geo.lng],
        zoom: 9,
        zoomControl: true
      });

      L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

      leafletMapRef.current = map;
      leafletMarkersRef.current = {};

      // Ajouter tous les marqueurs des péages du Bénin
      tollStations.forEach((st) => {
        const isSelected = st.id === selectedStationId;

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${isSelected ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.15)'}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isSelected ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : '#0f172a'}; border: 2px solid #06b6d4; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([st.geo.lat, st.geo.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedStationId(st.id);
        });

        marker.bindTooltip(`<b>${st.name}</b><br/><span style="color: #06b6d4;">Tarif : ${st.rate}</span>`, {
          direction: 'top',
          offset: [0, -10]
        });

        leafletMarkersRef.current[st.id] = marker;
      });
    };

    loadLeafletScript();

    return () => {
      isMounted = false;
    };
  }, [mapMode, tileProvider]);

  // Déplacement fluide Leaflet lors du changement de sélection
  useEffect(() => {
    if (mapMode === 'geo' && leafletMapRef.current && currentStation) {
      leafletMapRef.current.flyTo([currentStation.geo.lat, currentStation.geo.lng], 12, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedStationId, mapMode, currentStation]);

  // Fonction de simulation du passage ESP32 RFID
  const handleSimulatePassage = () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      const randomCardId = 'BJ-RFID-' + Math.floor(100000 + Math.random() * 900000);
      const isSuccess = Math.random() > 0.05; // 95% succès

      if (isSuccess) {
        setSimulationResult({
          success: true,
          badge: randomCardId,
          user: 'Abonné Transports VIP',
          amount: '500 FCFA',
          message: 'Signal RFID Validé (200ms) - Barrière Ouverte !'
        });

        // Mettre à jour les compteurs de statistiques de la station
        setStationStats(prev => ({
          ...prev,
          [selectedStationId]: {
            scansToday: (prev[selectedStationId]?.scansToday || 1000) + 1,
            totalFcfa: (prev[selectedStationId]?.totalFcfa || 500000) + 500
          }
        }));
      } else {
        setSimulationResult({
          success: false,
          badge: randomCardId,
          message: 'Solde Incalculable ou Badge Non Reconnu'
        });
      }
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ────────────────────────────────────────────────────────────────
            EN-TÊTE PRINCIPAL DE LA CARTE DU BÉNIN
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-widest">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                Réseau TéléPéage du Bénin 🇧🇯
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                8 Postes Connectés ESP32
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Carte Interactive du <span className="text-gradient-cyan">Bénin & Postes de Péage</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
              Explorez le réseau national des péages automatiques (SIRAT). Visualisez la télémétrie des bornes ESP32, découvrez les 12 départements du Bénin et simulez un passage RFID en direct.
            </p>
          </div>

          {/* SÉLECTEUR DE MODE DE CARTE (VECTORIELLE VS LEAFLET GÉO) */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 self-start lg:self-auto shadow-xl">
            <button
              onClick={() => setMapMode('vector')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'vector'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Carte Vectorielle (12 Dép.)
            </button>
            <button
              onClick={() => setMapMode('geo')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'geo'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Vue Géo / Leaflet HD
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            BARRE DE RECHERCHE ET FILTRES RÉGIONAUX
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md">
          {/* Barre de recherche */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un poste, ville ou axe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtres par Régions */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 whitespace-nowrap mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Région :
            </span>
            {[
              { id: 'ALL', label: 'Toutes les régions' },
              { id: 'SUD', label: 'Sud (Littoral/Ouémé/Mono)' },
              { id: 'CENTRE', label: 'Centre (Zou/Collines)' },
              { id: 'NORD', label: 'Grand Nord (Borgou/Alibori)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setRegionFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  regionFilter === f.id
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            GRILLE PRINCIPALE : VUE CARTE (7 COLS) + FICHE BORNE (5 COLS)
        ──────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─────────────────────────────────────────────────────────────
              COLONNE GAUCHE : VUE DE LA CARTE DU BÉNIN
          ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-cyan-500/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[580px] bg-slate-900/70 shadow-2xl">

            {/* Fond d'ambiance néon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── MODE 1 : CARTE VECTORIELLE HD DU BÉNIN ET SES 12 DÉPARTEMENTS ── */}
            {mapMode === 'vector' ? (
              <div className="relative w-full max-w-[440px] h-[540px] flex items-center justify-center select-none">

                <svg
                  viewBox="0 0 220 380"
                  className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  <defs>
                    <linearGradient id="deptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="deptActiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  {/* Tracé des 12 Départements du Bénin */}
                  <g className="departments-group">
                    {departmentsData.map((dept) => {
                      const isHovered = selectedDeptHover === dept.id;
                      const hasSelectedStation = currentStation.department.toLowerCase().includes(dept.name.toLowerCase());
                      return (
                        <path
                          key={dept.id}
                          d={dept.path}
                          fill={hasSelectedStation ? 'url(#deptActiveGradient)' : (isHovered ? 'rgba(6, 182, 212, 0.25)' : 'url(#deptGradient)')}
                          stroke={hasSelectedStation ? '#06b6d4' : (isHovered ? '#38bdf8' : '#334155')}
                          strokeWidth={hasSelectedStation ? '2' : '1'}
                          strokeDasharray={hasSelectedStation ? 'none' : '2 2'}
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setSelectedDeptHover(dept.id)}
                          onMouseLeave={() => setSelectedDeptHover(null)}
                        />
                      );
                    })}
                  </g>

                  {/* Grands Axes Routiers Nationaux (RNIE 1, RNIE 2, RNIE 3) */}
                  {/* RNIE 1 (Axe Sud Littoral : Togo - Grand-Popo - Cotonou - Ekpé - Nigeria) */}
                  <path
                    d="M 45,340 L 90,345 L 120,350 L 140,350 L 170,355"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />

                  {/* RNIE 2 (Axe Transversal Sud-Nord : Cotonou - Houègbo - Bohicon - Diho - Parakou - Bembèrèkè - Malanville) */}
                  <path
                    d="M 130,345 L 120,295 L 115,250 L 125,200 L 135,140 L 140,80 L 150,25"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />

                  {/* RNIE 3 (Axe Djougou - Natitingou) */}
                  <path
                    d="M 80,120 L 70,75 L 85,35"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Libellés des départements lors du survol */}
                  {selectedDeptHover && (
                    <text
                      x="110"
                      y="190"
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md"
                    >
                      Dép. {departmentsData.find(d => d.id === selectedDeptHover)?.name.toUpperCase()}
                    </text>
                  )}

                  {/* Titre géographique sur le SVG */}
                  <text x="110" y="375" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="3" opacity="0.6">
                    BÉNIN 🇧🇯 — AXES RNIE 1, 2, 3
                  </text>
                </svg>

                {/* MARQUEURS INTERACTIFS SUR LA CARTE VECTORIELLE */}
                {filteredStations.map((station) => {
                  const isSelected = selectedStationId === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStationId(station.id)}
                      style={{ top: `${station.coords.y}%`, left: `${station.coords.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20"
                    >
                      {/* Lueur pulsante d'activité */}
                      <span className={`absolute -inset-3 rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-cyan-400/40 animate-ping' : 'bg-cyan-500/10 group-hover:bg-cyan-500/25'
                      }`} />

                      {/* Pin Central du Péage */}
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-2xl ${
                        isSelected
                          ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 scale-125 ring-4 ring-cyan-400/40'
                          : 'bg-slate-900 border border-cyan-400 text-cyan-400 group-hover:scale-110'
                      }`}>
                        <MapPin className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                      </div>

                      {/* Info bulle du poste */}
                      <span className={`absolute left-1/2 -translate-x-1/2 top-9 px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap transition-all shadow-xl border ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 opacity-100 scale-100'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 opacity-80 group-hover:opacity-100'
                      }`}>
                        {station.name.replace("Poste de Péage d'", '').replace('Poste de Péage de ', '')}
                      </span>
                    </button>
                  );
                })}

              </div>
            ) : (
              /* ── MODE 2 : CARTE LEAFLET HD INTERACTIVE ── */
              <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col">

                {/* SÉLECTEUR DE FOND DE CARTE LEAFLET (Sombre / Satellite / OpenStreetMap) */}
                <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 p-1 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] font-bold shadow-xl">
                  <button
                    onClick={() => setTileProvider('dark')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      tileProvider === 'dark' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sombre
                  </button>
                  <button
                    onClick={() => setTileProvider('satellite')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      tileProvider === 'satellite' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setTileProvider('street')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      tileProvider === 'street' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Carto
                  </button>
                </div>

                {/* Indicator GPS station sélectionnée */}
                <div className="absolute top-3 left-3 z-[1000] px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-xl">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  {currentStation.geo.lat}° N, {currentStation.geo.lng}° E ({currentStation.department})
                </div>

                {/* Conteneur de la carte Leaflet */}
                <div ref={mapContainerRef} className="w-full h-full z-10" />
              </div>
            )}

            {/* Légende et bas de carte */}
            <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" /> Bornes ESP32 Actives</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> RFID FastLane 200ms</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Synchro Cloud Postgre</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">Réseau SIRAT Bénin 🇧🇯</span>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              COLONNE DROITE : FICHE DÉTAILLÉE DU POSTE SÉLECTIONNÉ
          ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6 bg-slate-900/90 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Photo & Status du Poste */}
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-800 group">
                <img
                  src={currentStation.image}
                  alt={currentStation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Tag Région & Département */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-black">
                    Dépt : {currentStation.department}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-bold">
                    Zone {currentStation.region}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {currentStation.status}
                  </span>
                  <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-lg">
                    {currentStation.rate} / passage
                  </span>
                </div>
              </div>

              {/* Titre & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{currentStation.name}</h3>
                <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  {currentStation.location}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {currentStation.desc}
                </p>
              </div>

              {/* Caractéristiques bornes & Hardware */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Configuration Voies</span>
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {currentStation.lanes}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Matériel Bornes IoT</span>
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5 truncate">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    ESP32 RFID UHF
                  </span>
                </div>
              </div>

              {/* Télémétrie en Direct & Fréquence */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Fréquence Réseau & Télémétrie
                  </span>
                  <span className="font-mono text-cyan-400 text-[11px] font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {currentStation.signalQuality}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Passages enregistrés aujourd'hui :</span>
                  <span className="font-mono font-black text-white text-sm">
                    {(stationStats[selectedStationId]?.scansToday || 1000).toLocaleString('fr-FR')} veh.
                  </span>
                </div>
              </div>

              {/* ── SIMULATEUR DE PASSAGE VEHICULE ESP32 RFID ── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" /> Simulateur de Passage ESP32
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">WebSocket Ready</span>
                </div>

                <button
                  onClick={handleSimulatePassage}
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
                      Lecture de la Puce RFID par l'ESP32...
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4" />
                      Simuler Scanner Badge RFID à la Borne
                    </>
                  )}
                </button>

                {/* Résultat du test de simulation */}
                {simulationResult && (
                  <div className={`p-3 rounded-xl text-xs space-y-1 border animate-in fade-in zoom-in duration-300 ${
                    simulationResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {simulationResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {simulationResult.message}
                      </span>
                      <span className="font-mono text-[11px]">{simulationResult.badge}</span>
                    </div>
                    {simulationResult.success && (
                      <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                        <span>Montant débité : <strong>{simulationResult.amount}</strong></span>
                        <span className="text-emerald-400 font-bold">Barrière #1 Levée</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Boutons d'accès rapide aux 8 postes de péage */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sélection Rapide des Postes du Bénin :
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {tollStations.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center truncate ${
                        selectedStationId === st.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                      title={st.name}
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
    </div>
  );
}
