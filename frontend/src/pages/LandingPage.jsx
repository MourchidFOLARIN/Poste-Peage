import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Zap, Shield, Radio, ArrowRight, CheckCircle,
  Smartphone, BarChart3, Lock, Cpu, Wifi, Clock,
  ChevronRight, Star, Globe, Activity, Users, Coins,
  Menu, X
} from 'lucide-react';

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

  const features = [
    {
      icon: Radio,
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/20',
      title: 'Lecture RFID Instantanée',
      desc: 'Badge scanné en moins de 200ms par les bornes ESP32. Débit fluide sans arrêt complet du véhicule.'
    },
    {
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/20',
      title: 'Recharge Mobile Money',
      desc: 'MTN MoMo, Moov Money et Celtis Cash. Crédit instantané sur votre badge RFID depuis votre téléphone.'
    },
    {
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-500',
      glow: 'shadow-purple-500/20',
      title: 'Dashboard Admin en Temps Réel',
      desc: 'Recettes, flux de véhicules et anomalies affichés en direct via WebSocket. Zéro latence.'
    },
    {
      icon: Shield,
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/20',
      title: 'Blocage d\'Urgence Immédiat',
      desc: 'Badge perdu ou volé ? Bloquez votre carte en 1 clic depuis l\'application mobile ou le portail web.'
    },
    {
      icon: Smartphone,
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/20',
      title: 'Portail Client Mobile-First',
      desc: 'Consultez votre solde, téléchargez vos reçus PDF et gérez votre compte depuis n\'importe quel appareil.'
    },
    {
      icon: Activity,
      color: 'from-blue-500 to-violet-500',
      glow: 'shadow-blue-500/20',
      title: 'Audit & Traçabilité Complète',
      desc: 'Chaque passage est horodaté et archivé en base PostgreSQL. Export CSV disponible pour la comptabilité.'
    },
  ];

  const steps = [
    { number: '01', title: 'Inscrivez-vous', desc: 'Créez votre compte en 30 secondes avec votre email.', icon: Users },
    { number: '02', title: 'Activez votre Badge', desc: 'Récupérez votre badge RFID auprès du guichet du péage.', icon: CreditCard },
    { number: '03', title: 'Rechargez votre Solde', desc: 'Utilisez MTN MoMo, Moov Money ou Celtis Cash depuis votre téléphone.', icon: Coins },
    { number: '04', title: 'Passez sans Attendre', desc: 'Approchez votre badge — la barrière s\'ouvre automatiquement en moins de 1 seconde.', icon: Zap },
  ];

  const stats = [
    { value: 500, suffix: ' FCFA', label: 'Tarif par passage', icon: Coins },
    { value: 200, suffix: 'ms', label: 'Temps de traitement', icon: Clock },
    { value: 99, suffix: '%', label: 'Disponibilité système', icon: Wifi },
    { value: 24, suffix: '/7', label: 'Support & Monitoring', icon: Activity },
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
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors">Fonctionnalités</a>
            <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors">Comment ça marche</a>
            <Link to="/login" className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm">Commencer maintenant</Link>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════ */}
      {/* HERO SECTION                     */}
      {/* ════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-16 overflow-hidden">

        {/* Arrière-plan lumineux animé */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-cyan-500/12 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/6 w-80 h-80 bg-purple-500/12 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

          {/* Grille de fond subtile */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* Badge d'annonce */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-bold shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Système de Péage Électronique Intelligent — Bénin 🇧🇯
          </div>

          {/* Titre principal massif */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Le Péage{' '}
            <span className="text-gradient-cyan">Sans Contact</span>
            <br />
            <span className="text-slate-300">du Futur,</span>{' '}
            <span className="text-gradient-gold">Aujourd'hui</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Passez les barrières de péage en moins d'une seconde avec votre badge RFID ESP32.
            Rechargez depuis votre téléphone. Consultez vos passages en temps réel.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-cyan-500/25 transition-all transform hover:scale-[1.03]"
            >
              <Zap className="w-5 h-5 fill-current" />
              Créer mon Compte Gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/admin/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all"
            >
              <Cpu className="w-5 h-5 text-purple-400" />
              Accès Back-Office Admin
            </Link>
          </div>

          {/* Preuves sociales */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-semibold">
            {['✅ Aucune carte bancaire requise', '⚡ Connexion en 30 secondes', '🔒 Données sécurisées PostgreSQL', '📱 100% Mobile-friendly'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        {/* Carte RFID holographique flottante */}
        <div className="absolute bottom-8 right-8 hidden xl:block animate-float opacity-80">
          <div className="relative w-72 h-44 rounded-3xl hologram-card border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-amber-300 to-amber-500 flex flex-col justify-around p-1">
                <div className="w-full h-0.5 bg-amber-800/40 rounded" />
                <div className="w-2/3 h-0.5 bg-amber-800/40 rounded" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-widest">RFID ESP32</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white">12 500 <span className="text-sm text-cyan-400">FCFA</span></span>
              <span className="block text-[10px] text-slate-400 font-mono mt-1">UID : A1B2C3D4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* STATS                            */}
      {/* ════════════════════════════════ */}
      <section id="statistiques" className="py-16 px-4 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-cyan-400" />
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

      {/* ════════════════════════════════ */}
      {/* FEATURES                         */}
      {/* ════════════════════════════════ */}
      <section id="fonctionnalites" className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* En-tête section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
              Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tout ce dont vous avez besoin pour un{' '}
              <span className="text-gradient-purple">péage intelligent</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Une plateforme complète construite sur ESP32, Node.js, PostgreSQL et React — 
              pensée pour les gestionnaires et les automobilistes béninois.
            </p>
          </div>

          {/* Grille de features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-panel p-6 rounded-3xl glass-card-hover group space-y-4">
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
      <section id="comment-ca-marche" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
              Comment ça marche
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Passez au péage en{' '}
              <span className="text-gradient-cyan">4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Ligne de connexion */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-slate-600 to-slate-700 z-0" />
                  )}

                  <div className="glass-panel p-6 rounded-3xl text-center space-y-4 relative z-10">
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
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden border border-cyan-500/15 space-y-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Système Opérationnel — Rejoignez-nous dès aujourd'hui
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Prêt à moderniser{' '}
                <span className="text-gradient-cyan">votre expérience péage</span> ?
              </h2>

              <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                Créez votre compte en 30 secondes. Rechargez votre badge RFID.
                Passez les barrières sans attendre.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-cyan-500/25 transition-all transform hover:scale-[1.03]"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Créer mon Compte Gratuit
                </Link>
                <Link
                  to="/admin/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition-all"
                >
                  <Shield className="w-5 h-5 text-purple-400" />
                  Espace Administrateur
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 py-10 px-4">
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
            Développé par <span className="text-slate-300 font-bold">Mourchid FOLARIN</span> — Bénin 🇧🇯
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
