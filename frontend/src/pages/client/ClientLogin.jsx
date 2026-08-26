import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, User, Phone, ArrowRight, Sparkles, AlertCircle, Radio, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ClientLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('jean.dupont@example.com');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { loginUser, registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const res = await registerUser(name, email, phone);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } else {
      const res = await loginUser(email);
      if (res.success) {
        if (email === 'admin@peage.bj' || email.startsWith('admin')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 relative">
      {/* Halos lumineux d'ambiance en fond */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo centré au-dessus */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-float">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            PÉAGE<span className="text-gradient-cyan">EXPRESS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold tracking-widest uppercase">
            Portail Automobiliste Bénin
          </p>
        </div>

        {/* Carte principale */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/08 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Titre & Badge */}
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Système RFID ESP32 Connecté
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {isRegistering ? "Créer un Compte" : "Connexion à votre Espace"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRegistering
                  ? "Enregistrez vos coordonnées pour lier votre badge RFID"
                  : "Consultez votre solde, rechargez et suivez vos passages au péage"}
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Nom et Prénom</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Jean Dupont"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jean.dupont@example.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Téléphone (Optionnel)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <>
                    {isRegistering ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Créer mon Compte Automobiliste
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        Accéder à mon Espace
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Connexion / Inscription */}
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isRegistering
                  ? "Vous avez déjà un compte ? Se connecter"
                  : "Nouveau conducteur ? Créer un compte"}
              </button>
            </div>

            {/* Note de démo */}
            <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 text-[11px] text-slate-400 text-center">
              💡 Email de test : <span className="text-cyan-300 font-mono font-bold">jean.dupont@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
