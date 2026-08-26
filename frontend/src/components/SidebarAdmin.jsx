import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ArrowLeftRight, Smartphone, Users, LogOut, ShieldAlert, Cpu, Menu, X, Shield, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: "Vue d'ensemble (Analytics)", path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Cartes & Usagers (CRUD)', path: '/admin/cards', icon: CreditCard },
    { label: 'Postes de Péage (Bornes)', path: '/admin/tollgates', icon: Shield },
    { label: 'Historique des Scans', path: '/admin/transactions', icon: ArrowLeftRight },
    { label: 'Recharges Mobile Money', path: '/admin/recharges', icon: Smartphone },
    { label: 'Utilisateurs', path: '/admin/users', icon: Users },
    { label: 'Paramètres & Tarifs', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <>
      {/* Top Header Bar sur Mobile (< md) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">
            PÉAGE<span className="text-purple-400">ADMIN</span>
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          aria-label="Toggle Menu Admin"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Desktop (md:flex) + Drawer Mobile */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* En-tête Logo Admin */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  PÉAGE<span className="text-purple-400">ADMIN</span>
                </h1>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  BACK-OFFICE
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu de navigation */}
          <nav className="p-4 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase px-3 py-2">
              Gestion du Péage
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bas de menu / Déconnexion */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Retour au Portail Client
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion Admin
          </button>
        </div>
      </aside>

      {/* Overlay mobile quand le drawer est ouvert */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
