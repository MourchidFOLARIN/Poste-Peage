import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import SidebarAdmin from './components/SidebarAdmin';

// Pages Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientLogin from './pages/client/ClientLogin';
import ClientHistory from './pages/client/ClientHistory';
import ClientRecharge from './pages/client/ClientRecharge';

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminCards from './pages/admin/AdminCards';
import AdminTransactions from './pages/admin/AdminTransactions';

// Route protégée Client
const ProtectedClientRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route protégée Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Composant Layout Principal décidant de l'affichage de la Navbar ou de la Sidebar Admin
function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAdminLoginPage = location.pathname === '/admin/login';

  if (isAdminLoginPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100">
        <SidebarAdmin />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/cards" element={<ProtectedAdminRoute><AdminCards /></ProtectedAdminRoute>} />
            <Route path="/admin/transactions" element={<ProtectedAdminRoute><AdminTransactions /></ProtectedAdminRoute>} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/" element={<ProtectedClientRoute><ClientDashboard /></ProtectedClientRoute>} />
          <Route path="/recharge" element={<ProtectedClientRoute><ClientRecharge /></ProtectedClientRoute>} />
          <Route path="/history" element={<ProtectedClientRoute><ClientHistory /></ProtectedClientRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Systeme de Peage Electronique Intelligent ESP32 & PostgreSQL - Developpe pour Mourchid FOLARIN
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}
