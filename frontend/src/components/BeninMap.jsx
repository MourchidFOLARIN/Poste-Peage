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
          <div className="lg:col-span-7 glass-panel p-4 rounded-3xl border border-cyan-500/20 relative overflow-hidden flex flex-col items-center justify-start bg-slate-900/70 shadow-2xl">

            {/* Fond d'ambiance néon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* ── MODE 1 : CARTE VECTORIELLE HD DU BÉNIN ET SES 12 DÉPARTEMENTS ── */}
            {mapMode === 'vector' ? (
              <div className="relative w-full select-none" style={{ paddingTop: '0' }}>

                {/* SVG Carte Bénin : viewBox 0 0 400 700 = proportions 4:7 du Bénin réel */}
                <svg
                  viewBox="0 0 400 700"
                  className="w-full h-auto drop-shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                  style={{ display: 'block' }}
                >
                  <defs>
                    <linearGradient id="beninFill" x1="0%" y1="0%" x2="60%" y2="100%">
                      <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#0e7490" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="beninFillActive" x1="0%" y1="0%" x2="60%" y2="100%">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* ── CONTOUR RÉALISTE DU BÉNIN ─────────────────────────────────────────
                       Basé sur les coordonnées géographiques réelles converties en SVG
                       Bénin : ~1.05°E à 3.85°E (longitude) / 6.2°N à 12.4°N (latitude)
                       Mapping: lng → x=(lng-1.05)/(3.85-1.05)*380+10
                                lat → y=(12.4-lat)/(12.4-6.2)*660+20
                  ── */}
                  <path
                    d="
                      M 200,22
                      L 228,25 L 252,20 L 275,28 L 295,22 L 318,35
                      L 340,48 L 360,55 L 372,70 L 370,88 L 362,102
                      L 355,118 L 358,132 L 352,148 L 345,162
                      L 340,178 L 345,195 L 348,212 L 342,228
                      L 338,242 L 342,258 L 348,275 L 345,292
                      L 348,308 L 352,324 L 355,340 L 352,358
                      L 345,372 L 335,382 L 322,390 L 308,395
                      L 295,398 L 282,396 L 268,398 L 255,402
                      L 242,408 L 228,412 L 215,410 L 202,405
                      L 188,395 L 178,382 L 170,368 L 162,355
                      L 155,340 L 148,328 L 138,318 L 125,310
                      L 112,305 L 98,300 L 85,298 L 72,302
                      L 60,310 L 50,322 L 40,335 L 32,348
                      L 28,362 L 30,375 L 38,385 L 50,392
                      L 65,396 L 80,395 L 95,390 L 108,385
                      L 120,382 L 132,380
                      L 140,384 L 148,390 L 155,396 L 160,405
                      L 162,415 L 160,425 L 155,432 L 148,438
                      L 138,442 L 128,444 L 118,442 L 108,438
                      L 98,432 L 90,424 L 84,415 L 80,405
                      L 78,395 L 75,385 L 68,378 L 58,374
                      L 48,372 L 38,372 L 30,375

                      M 30,375 L 25,385 L 22,398 L 25,412
                      L 32,424 L 42,434 L 55,442 L 68,448
                      L 82,450 L 95,448 L 108,444
                      L 120,440 L 132,438 L 142,440
                      L 150,445 L 158,452 L 162,460
                      L 165,470 L 164,480 L 160,490
                      L 154,498 L 146,504 L 136,508
                      L 125,510 L 114,508 L 104,504
                      L 95,498 L 88,490 L 84,480
                      L 82,470 L 83,460 L 87,450
                      L 93,442 L 100,436 L 108,432
                      L 118,430 L 128,430

                      M 202,405 L 210,415 L 218,425 L 225,436
                      L 230,448 L 234,460 L 236,472 L 235,484
                      L 232,495 L 226,505 L 218,513 L 208,518
                      L 196,520 L 184,518 L 172,513 L 162,506
                      L 154,498
                    "
                    fill="url(#beninFill)"
                    stroke="#22d3ee"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Version simplifiée propre du contour Bénin */}
                  <path
                    d="
                      M 198,25
                      C 220,20 260,18 295,28
                      C 330,38 368,60 372,90
                      C 376,120 352,155 348,210
                      C 344,265 355,310 350,360
                      C 345,395 318,410 280,412
                      C 248,414 210,408 188,395
                      C 165,382 152,355 138,322
                      C 124,290 95,298 68,308
                      C 42,318 22,345 28,380
                      C 34,415 70,430 90,438
                      C 100,442 108,448 115,458
                      C 122,468 124,480 118,490
                      C 110,502 95,508 80,505
                      C 62,502 42,488 36,470
                      C 30,452 38,432 52,420
                      C 65,408 82,402 95,402
                      C 108,402 118,408 125,418
                      C 135,430 138,448 135,462
                      C 132,476 122,488 108,494

                      M 188,395
                      C 200,410 215,428 228,448
                      C 236,462 238,478 232,492
                      C 225,508 208,518 190,518
                      C 172,518 155,508 150,494
                      C 144,480 148,465 155,453
                      C 162,441 172,434 182,430
                    "
                    fill="url(#beninFill)"
                    stroke="#0e7490"
                    strokeWidth="1"
                    strokeLinejoin="round"
                    opacity="0.4"
                  />

                  {/* ── CONTOUR PRINCIPAL BÉNIN (forme nette) ── */}
                  <path
                    d="M 198,26 L 228,22 L 262,18 L 295,26 L 322,20 L 346,38 L 368,58 L 372,85 L 364,108 L 354,130 L 358,150 L 348,172 L 340,195 L 346,215 L 350,240 L 344,262 L 350,285 L 354,312 L 350,340 L 344,368 L 330,388 L 308,398 L 280,404 L 252,408 L 225,404 L 202,393 L 185,376 L 172,355 L 158,332 L 142,312 L 120,304 L 94,298 L 68,304 L 48,320 L 34,342 L 26,365 L 30,385 L 44,398 L 62,406 L 80,408 L 98,404 L 112,395 L 124,385 L 136,382 L 148,386 L 158,395 L 164,408 L 165,422 L 160,434 L 150,442 L 136,447 L 120,448 L 104,444 L 90,436 L 80,424 L 76,410 L 78,396"
                    fill="url(#beninFill)"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Golfe de Guinée (côte sud) */}
                  <path
                    d="M 78,396 L 95,400 L 112,404 L 130,408 L 148,412 L 165,422"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* ── AXES ROUTIERS NATIONAUX ── */}
                  {/* RNIE 1 Est (Cotonou → Porto-Novo / Nigeria) */}
                  <line x1="145" y1="402" x2="205" y2="388" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
                  {/* RNIE 1 Ouest (Cotonou → Grand-Popo / Togo) */}
                  <line x1="97" y1="400" x2="50" y2="368" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
                  {/* RNIE 2 (Cotonou → Parakou → Malanville — Axe vertical central) */}
                  <polyline points="140,405 132,360 125,318 130,270 138,225 145,178 148,130 152,80 155,35" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="7 4" opacity="0.85" />
                  {/* RNIE 3 (Djougou → Natitingou) */}
                  <line x1="60" y1="248" x2="85" y2="155" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />

                  {/* Légendes axes */}
                  <text x="210" y="378" fill="#06b6d4" fontSize="9" fontWeight="bold" opacity="0.75">RNIE 1</text>
                  <text x="155" y="55" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.75">RNIE 2</text>
                  <text x="48" y="200" fill="#818cf8" fontSize="9" fontWeight="bold" opacity="0.75">RNIE 3</text>

                  {/* Golfe de Guinée label */}
                  <text x="100" y="468" fill="#0e7490" fontSize="9" fontStyle="italic" opacity="0.55" textAnchor="middle">Golfe de Guinée 🌊</text>

                  {/* Titre pays */}
                  <text x="200" y="220" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="900" letterSpacing="6" opacity="0.18">BÉNIN</text>
                  <text x="200" y="238" textAnchor="middle" fill="#22d3ee" fontSize="9" opacity="0.25" letterSpacing="2">🇧🇯</text>

                  {/* ── MARQUEURS POSTES DE PÉAGE (dans le SVG pour alignement parfait) ── */}
                  {filteredStations.map((station) => {
                    const isSelected = selectedStationId === station.id;
                    // Conversion coordonnées géographiques → SVG
                    // lng: 1.05°E → 3.85°E  sur 380px (x: 10→390)
                    // lat: 12.4°N → 6.2°N   sur 660px (y: 20→680)
                    const svgX = ((station.geo.lng - 1.05) / (3.85 - 1.05)) * 380 + 10;
                    const svgY = ((12.4 - station.geo.lat) / (12.4 - 6.2)) * 540 + 28;

                    return (
                      <g key={station.id} onClick={() => setSelectedStationId(station.id)} style={{ cursor: 'pointer' }}>
                        {/* Halo de pulsation */}
                        {isSelected && (
                          <circle cx={svgX} cy={svgY} r="18" fill="#22d3ee" opacity="0.2">
                            <animate attributeName="r" from="12" to="24" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* Halo externe permanent */}
                        <circle cx={svgX} cy={svgY} r={isSelected ? 14 : 10} fill={isSelected ? 'url(#pinGlow)' : '#22d3ee'} opacity={isSelected ? 0.35 : 0.12} />
                        {/* Disque principal */}
                        <circle
                          cx={svgX} cy={svgY} r={isSelected ? 8 : 6}
                          fill={isSelected ? '#22d3ee' : '#0f172a'}
                          stroke="#22d3ee"
                          strokeWidth={isSelected ? 2.5 : 1.8}
                        />
                        {/* Icône péage (point central) */}
                        <circle cx={svgX} cy={svgY} r={isSelected ? 3.5 : 2.5} fill={isSelected ? '#0f172a' : '#22d3ee'} />
                        {/* Étiquette du poste */}
                        <text
                          x={svgX + (svgX > 200 ? -14 : 14)}
                          y={svgY - 10}
                          textAnchor={svgX > 200 ? 'end' : 'start'}
                          fill={isSelected ? '#22d3ee' : '#94a3b8'}
                          fontSize={isSelected ? '9.5' : '8'}
                          fontWeight={isSelected ? '800' : '600'}
                          className="pointer-events-none"
                        >
                          {station.name.replace("Poste de Péage d'", '').replace('Poste de Péage de ', '').replace('Poste de Péage d\'', '')}
                        </text>
                      </g>
                    );
                  })}
                </svg>


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
