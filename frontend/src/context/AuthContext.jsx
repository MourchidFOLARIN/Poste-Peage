import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('peage_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('peage_cards');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('peage_is_admin') === 'true';
  });

  // Écoute des événements WebSockets temps réel
  useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const BASE_URL = import.meta.env.VITE_API_URL !== undefined 
        ? import.meta.env.VITE_API_URL 
        : (typeof window !== 'undefined' ? window.location.origin : '');
      const socket = io(BASE_URL);

      socket.on('scan_event', (data) => {
        console.log('⚡ Scan en temps réel reçu via WebSocket :', data);
        if (user && cards.some(c => c.uid === data.cardUid)) {
          refreshUser();
        }
      });

      socket.on('card_recharged', (data) => {
        console.log('⚡ Recharge en temps réel reçue via WebSocket :', data);
        if (user && cards.some(c => c.uid === data.card_uid)) {
          refreshUser();
        }
      });

      return () => {
        socket.disconnect();
      };
    }).catch(err => console.warn('WebSockets désactivé en fallback:', err));
  }, [user, cards]);

  // Rafraîchir le profil et le solde de l'utilisateur connecté
  const refreshUser = async (emailOverride) => {
    const email = emailOverride || user?.email;
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/auth/me?email=${encodeURIComponent(email)}`);
      if (res.data?.status === 'success') {
        const u = res.data.data.user;
        const c = res.data.data.cards;
        const t = res.data.data.transactions;

        setUser(u);
        setCards(c);
        setTransactions(t);
        localStorage.setItem('peage_user', JSON.stringify(u));
        localStorage.setItem('peage_cards', JSON.stringify(c));
      }
    } catch (err) {
      console.error("Erreur de rafraîchissement utilisateur :", err);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email });
      if (res.data?.status === 'success') {
        const { user: u, cards: c, transactions: t } = res.data.data;
        setUser(u);
        setCards(c);
        setTransactions(t);
        setIsAdmin(u.role === 'ADMIN');
        localStorage.setItem('peage_user', JSON.stringify(u));
        localStorage.setItem('peage_cards', JSON.stringify(c));
        localStorage.setItem('peage_auth_token', res.data.token);
        localStorage.setItem('peage_is_admin', u.role === 'ADMIN' ? 'true' : 'false');
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur de connexion" };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, phone) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, phone });
      if (res.data?.status === 'success') {
        const { user: u, card: c } = res.data.data;
        setUser(u);
        setCards([c]);
        localStorage.setItem('peage_user', JSON.stringify(u));
        localStorage.setItem('peage_cards', JSON.stringify([c]));
        localStorage.setItem('peage_auth_token', res.data.token);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur d'inscription" };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email) => {
    setIsAdmin(true);
    localStorage.setItem('peage_is_admin', 'true');
    return loginUser(email);
  };

  const logout = () => {
    setUser(null);
    setCards([]);
    setTransactions([]);
    setIsAdmin(false);
    localStorage.removeItem('peage_user');
    localStorage.removeItem('peage_cards');
    localStorage.removeItem('peage_auth_token');
    localStorage.removeItem('peage_is_admin');
  };

  return (
    <AuthContext.Provider value={{
      user,
      cards,
      transactions,
      loading,
      isAdmin,
      loginUser,
      registerUser,
      loginAdmin,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
