import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Zap, Shield, Radio, ArrowRight, CheckCircle,
  Smartphone, BarChart3, Lock, Cpu, Wifi, Clock,
  ChevronRight, Star, Globe, Activity, Users, Coins,
  Menu, X, MapPin, Navigation, Compass, Sparkles
} from 'lucide-react';
import BeninMap from '../components/BeninMap';

// Compteur animé
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Postes de péage réels au Bénin (SIRAT Bénin)
  const tollStations = [
    {
      id: 'ekpe',
      name: "Poste de Péage d'Ekpé",
      location: 'Route Cotonou - Sèmè Kpodji - Porto-Novo (RNIE 1)',
      badge: 'Flux Élevé · 24/7',
      status: 'Opérationnel',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      lanes: '6 Voies Automatiques',
      tech: 'ESP32 + Lecteur RFID UHF'
    },
    {
      id: 'houegbo',
      name: 'Poste de Péage de Houègbo',
      location: 'RNIE 2 (Cotonou - Allada - Bohicon)',
      badge: 'Voies Rapides Ouvertes',
      status: 'Opérationnel',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      lanes: '4 Voies mixtes & Rapides',
      tech: 'Barrières Servomoteurs IoT'
    },
    {
      id: 'grandpopo',
      name: "Poste de Péage d'Ahoho (Grand-Popo)",
      location: 'RNIE 1 (Cotonou - Comè - Togo)',
      badge: 'Transfrontalier · Togo',
      status: 'Opérationnel',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      lanes: '4 Voies Transfrontalières',
      tech: 'Caméras LPR & RFID FastLane'
    },
    {
      id: 'diho',
      name: 'Poste de Péage de Diho',
      location: 'RNIE 2 (Axe Dassa - Savè)',
      badge: 'Fret Inter-États',
      status: 'Opérationnel',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      lanes: '4 Voies Poids Lourds',
      tech: 'Balance Pésage & ESP32'
    },
    {
      id: 'parakou',
      name: 'Poste de Péage de Sirarou (Parakou)',
      location: 'RNIE 2 (Axe Parakou - N\'Dali)',
      badge: 'Hub Grand Nord',
      status: 'Connecté ESP32',
      image: 'https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg',
      lanes: '4 Voies Automatisées',
      tech: 'Solaire & WebSockets IoT'
    },
    {
      id: 'bembereke',
      name: 'Poste de Péage de Bembèrèkè',
      location: 'RNIE 2 (Corridor Parakou - Niger)',
      badge: 'Transit Niger & Sahel',
      status: 'Opérationnel',
      image: 'https://www.kaweru.com/wp-content/uploads/2025/12/Peage-480x270.jpg',
      lanes: '4 Voies Poids Lourds',
      tech: 'Puces RFID UHF Longue Portée'
    },
    {
      id: 'kpomasse',
      name: 'Poste de Péage de Kpomassè',
      location: 'Route des Pêches (Pahou - Ouidah)',
      badge: 'Express Littoral',
      status: 'Nouvelle Génération',
      image: 'https://lanouvelletribune.info/wp-content/uploads/2023/03/poste-peage.webp',
      lanes: '4 Voies Express',
      tech: 'Paiement Sans Contact NFC'
    },
    {
      id: 'djougou',
      name: 'Poste de Péage de Djougou',
      location: 'RNIE 3 (Axe Djougou - Natitingou)',
      badge: 'Axe Ouest Togo',
      status: 'Opérationnel',
      image: 'https://globalarchiconsult.com/upload/images/projects/0633589001642937881.png',
      lanes: '4 Voies Régionales',
      tech: 'Détecteurs d\'essieux ESP32'
    }
  ];

  const features = [
    {
      icon: Radio,
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/20',
      title: 'Franchissement RFID Instantané',
      desc: 'Badge scanné en moins de 200ms par les bornes ESP32. Ouverture fluide sans arrêt complet du véhicule.'
    },
    {
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/20',
      title: 'Recharge Mobile Money Bénin',
      desc: 'Compatible MTN MoMo, Moov Money et Celtis Cash. Crédit instantané sur votre compte depuis votre téléphone.'
    },
    {
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-500',
      glow: 'shadow-purple-500/20',
      title: 'Dashboard Admin Temps Réel',
      desc: 'Recettes, flux de véhicules et anomalies affichés en direct via WebSockets. Zéro latence pour les opérateurs.'
    },
    {
      icon: Shield,
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/20',
      title: 'Blocage d\'Urgence Anti-Vol',
      desc: 'Badge perdu ou volé ? Bloquez votre carte RFID en 1 clic depuis votre espace client sécurisé.'
    },
    {
      icon: Smartphone,
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/20',
      title: 'Portail Client 100% Mobile',
      desc: 'Suivez votre solde, consultez l\'historique des passages et téléchargez vos reçus PDF à tout moment.'
    },
    {
      icon: Activity,
      color: 'from-blue-500 to-violet-500',
      glow: 'shadow-blue-500/20',
      title: 'Audit & Sécurité PostgreSQL',
      desc: 'Horodatage infalsifiable des transactions et archivage sécurisé sur base de données distribuée.'
    },
  ];

  const steps = [
    { number: '01', title: 'Créer votre Compte', desc: 'Inscription rapide en 30 secondes sans paperasse.', icon: Users },
    { number: '02', title: 'Lier votre Badge RFID', desc: 'Associez le code de votre carte à votre compte utilisateur.', icon: CreditCard },
    { number: '03', title: 'Recharger votre Solde', desc: 'Effectuez une recharge sécurisée par MTN MoMo, Moov Money ou Celtis.', icon: Coins },
    { number: '04', title: 'Passez le Péage', desc: 'La borne ESP32 détecte votre badge et lève la barrière en 1/5 de seconde.', icon: Zap },
  ];

  const stats = [
    { value: 500, suffix: ' FCFA', label: 'Tarif par passage', icon: Coins },
    { value: 200, suffix: 'ms', label: 'Temps de lecture RFID', icon: Clock },
    { value: 99, suffix: '%', label: 'Disponibilité du réseau', icon: Wifi },
    { value: 24, suffix: '/7', label: 'Monitoring automatisé', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* NAVBAR LANDING */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg text-white">PÉAGE<span className="text-gradient-cyan">EXPRESS</span></span>
              <span className="block text-[9px] text-slate-400 tracking-widest font-semibold uppercase">Bénin · ESP32 Smart Toll</span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#reseau-peage" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-400" /> Postes du Bénin</a>
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#statistiques" className="hover:text-white transition-colors">Performances</a>
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-bold transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] flex items-center gap-1.5"
            >
              Commencer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Hamburger Mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3">
            <a href="#reseau-peage" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors">Postes du Bénin</a>
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors">Fonctionnalités</a>
            <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors">Comment ça marche</a>
            <Link to="/login" className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm">Commencer maintenant</Link>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════ */}
      {/* HERO SECTION                     */}
      {/* ════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">

        {/* Arrière-plan lumineux animé */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-cyan-500/12 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/6 w-80 h-80 bg-purple-500/12 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

          {/* Grille de fond subtile */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* COLONNE GAUCHE : Titres, CTA & Preuves */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">

            {/* Badge d'annonce */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-bold shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Réseau National des Péages Électroniques — Bénin 🇧🇯
            </div>

            {/* Titre principal massif */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Le Péage{' '}
              <span className="text-gradient-cyan">Sans Contact</span>
              <br />
              <span className="text-slate-300">du Bénin,</span>{' '}
              <span className="text-gradient-gold">100% Connecté</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Franchissez les péages d'Ekpé, Houègbo et Diho en moins d'une seconde avec votre badge RFID ESP32.
              Rechargez votre solde par Mobile Money et suivez vos passages en temps réel.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-cyan-500/25 transition-all transform hover:scale-[1.03]"
              >
                <Zap className="w-5 h-5 fill-current" />
                Acceder a mon Compte
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/admin/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all"
              >
                <Cpu className="w-5 h-5 text-purple-400" />
                Accès Portail Admin
              </Link>
            </div>

            {/* Preuves sociales */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Recharges MTN MoMo & Moov</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Franchissement 200ms</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-purple-400" /> PostgreSQL & WebSockets</span>
            </div>
          </div>

          {/* COLONNE DROITE : Image principale du Péage d'Ekpé (Cotonou) */}
          <div className="lg:col-span-5 relative group">
            {/* Effet halo néon de fond */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-700" />

            {/* Carte conteneur d'image principale */}
            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-900/90 backdrop-blur-xl p-3">
              <img
                src="https://beninwebtv.bj/wp-content/uploads/2023/07/poste-de-peage-de-Ekpe.jpg"
                alt="Poste de Péage d'Ekpé Cotonou - Bénin"
                className="w-full h-[420px] sm:h-[480px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Tag Localisation en haut à gauche */}
              <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
                Poste de Péage d'Ekpé (Cotonou)
              </div>

              {/* Overlay d'information en bas */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 shadow-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    BORNE INTELLIGENTE ESP32
                  </span>
                  <span className="text-sm font-black text-white">
                    Système Automatisé en Service
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ACTIF
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* STATS                            */}
      {/* ════════════════════════════════ */}
      <section id="statistiques" className="py-24 px-4 border-y border-slate-800/60 bg-slate-900/40">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center space-y-2 group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════ */}
      {/* SECTION : CARTE INTERACTIVE DU RÉSEAU BÉNIN              */}
      {/* ═════════════════════════════════════════════════════════ */}
      <section id="reseau-peage" className="bg-slate-950">
        <BeninMap />
      </section>

      {/* ════════════════════════════════ */}
      {/* FEATURES                         */}
      {/* ════════════════════════════════ */}
      <section id="fonctionnalites" className="py-28 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* En-tête section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
              Fonctionnalités Avancées
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tout ce dont vous avez besoin pour un{' '}
              <span className="text-gradient-purple">péage moderne</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Une architecture robuste intégrant microcontrôleurs ESP32, backend Express, base PostgreSQL et frontend React responsive.
            </p>
          </div>

          {/* Grille de features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-panel p-6 rounded-3xl glass-card-hover group space-y-4 border border-slate-800/80 hover:border-cyan-500/30">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center shadow-xl ${f.glow}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* HOW IT WORKS                     */}
      {/* ════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-28 px-4 relative overflow-hidden bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
              Comment ça marche
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Franchissez le péage en{' '}
              <span className="text-gradient-cyan">4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="glass-panel p-6 rounded-3xl text-center space-y-4 border border-slate-800">
                    <div className="relative mx-auto w-16 h-16">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-cyan-400" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                        {step.number.slice(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* CTA FINAL                        */}
      {/* ════════════════════════════════ */}
      <section className="py-28 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden border border-cyan-500/25 space-y-8 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Réseau Connecté — Opérationnel sur le territoire national
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Prêt à passer au{' '}
                <span className="text-gradient-cyan">péage sans contact</span> ?
              </h2>

              <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                Rejoignez les conducteurs qui économisent du temps chaque jour sur les péages du Bénin.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-cyan-500/25 transition-all transform hover:scale-[1.03]"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Accéder a mon Compte
                </Link>
                <Link
                  to="/admin/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all"
                >
                  <Shield className="w-5 h-5 text-purple-400" />
                  Portail Administrateur
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 py-14 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white">PÉAGE<span className="text-gradient-cyan">EXPRESS</span></span>
          </div>

          <div className="text-center text-xs text-slate-500">
            Système de Péage Électronique Intelligent ESP32 · PostgreSQL · React
            <br />
            Développé par <span className="text-slate-300 font-bold">TechLab</span> — Bénin 🇧🇯
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-200 transition-colors font-semibold">Portail Client</Link>
            <Link to="/admin/login" className="hover:text-slate-200 transition-colors font-semibold">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
