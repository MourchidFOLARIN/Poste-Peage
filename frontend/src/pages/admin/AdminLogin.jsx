import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowRight, AlertCircle, Cpu, Lock, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@peage.bj');
  const [error, setError] = useState('');
  const { loginAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await loginAdmin(email);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message || "Erreur d'authentification administrateur");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Halos d'ambiance violets */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo centré */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            PÉAGE<span className="text-gradient-purple">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold tracking-widest uppercase">
            Back-Office Péage Bénin
          </p>
        </div>

        {/* Carte principale */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-purple-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/08 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Badge & Titre */}
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Accès Sécurisé Administrateur
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Connexion Back-Office
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accès réservé aux gestionnaires et agents du péage électronique ESP32.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Identifiant Admin (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@peage.bj"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Authentification...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Se Connecter au Back-Office
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Note d'accès */}
            <div className="mt-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Shield className="w-3.5 h-3.5" />
                Accès de Démonstration
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Email Admin : <span className="font-mono font-bold text-white">admin@peage.bj</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
