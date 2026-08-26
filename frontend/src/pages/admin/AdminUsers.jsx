import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Shield, User, CreditCard, Edit3, Trash2, X, AlertTriangle, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { addToast } = useToast();

  // Modal d'édition
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  // Modal de suppression
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      if (res.data?.status === 'success') {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Erreur de récupération des utilisateurs :', err);
      addToast('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      addToast('Le nom et l\'email sont obligatoires', 'warning');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.patch(`/api/admin/users/${editingUser.id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone
      });

      if (res.data?.status === 'success') {
        addToast('Utilisateur mis à jour avec succès', 'success');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'ADMIN') {
      addToast('Impossible de supprimer un compte administrateur', 'warning');
      setUserToDelete(null);
      return;
    }

    try {
      setDeleting(true);
      const res = await api.delete(`/api/admin/users/${userToDelete.id}`);
      if (res.data?.status === 'success') {
        addToast(res.data.message || 'Utilisateur supprimé', 'success');
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      [u.name, u.email, u.phone].some((field) => field?.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const clientCount = users.filter((u) => u.role === 'USER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Users className="w-7 h-7 text-cyan-400" />
            Gestion des <span className="text-gradient-purple">Utilisateurs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Édition des coordonnées, attribution des rôles et suppression de comptes usagers.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-xs">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3 text-center">
            <div className="font-black text-2xl text-cyan-400">{clientCount}</div>
            <div className="text-slate-500 font-semibold">Conducteurs</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3 text-center">
            <div className="font-black text-2xl text-purple-400">{adminCount}</div>
            <div className="text-slate-500 font-semibold">Admins</div>
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'USER', label: 'Conducteurs' },
            { id: 'ADMIN', label: 'Admins' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roleFilter === f.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tableau Utilisateurs */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Chargement des utilisateurs...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nom</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4 text-center">Rôle</th>
                  <th className="py-3.5 px-4 text-center">Cartes RFID</th>
                  <th className="py-3.5 px-4">Inscription</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-4 px-4 text-slate-300">{u.email}</td>
                    <td className="py-4 px-4 font-mono text-slate-400">{u.phone || '—'}</td>
                    <td className="py-4 px-4 text-center">
                      {u.role === 'ADMIN' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <User className="w-3 h-3" />
                          Conducteur
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold text-purple-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        {u.cards?.length ?? 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Modifier coordonnées"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          title="Supprimer compte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>

      {/* MODAL ÉDITION UTILISATEUR */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              Modifier l'Utilisateur
            </h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom Complet</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro de Téléphone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+229 97 00 00 00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
              >
                {updating ? 'Enregistrement...' : 'Mettre à jour'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Supprimer cet utilisateur ?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Êtes-vous sûr de vouloir supprimer le compte de <strong className="text-white">"{userToDelete.name}"</strong> ({userToDelete.email}) ? Ses cartes associées et historiques de recharges seront supprimés.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
