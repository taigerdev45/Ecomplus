'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { UserPlus, Mail, Phone, Shield, MoreVertical, Trash2, UserCheck } from 'lucide-react';
import { User } from '@ecom/types';
import { toast } from 'sonner';

import api from '@/lib/axios';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ nom: '', email: '', telephone: '', role: 'agent', password: '' });
  const [editingAgent, setEditingAgent] = useState<User | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/agents');
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/agents', newAgent);
      toast.success('Agent ajouté avec succès');
      setShowAddModal(false);
      setNewAgent({ nom: '', email: '', telephone: '', role: 'agent', password: '' });
      fetchAgents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    try {
      await api.put(`/admin/agents/${editingAgent.id}`, {
        nom: editingAgent.nom,
        email: editingAgent.email,
        telephone: editingAgent.telephone,
        role: editingAgent.role
      });
      toast.success('Agent modifié avec succès');
      setEditingAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/admin/agents/${id}`);
      toast.success('Agent supprimé avec succès');
      fetchAgents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Agents</h1>
            <p className="text-slate-500">Gérez les accès et surveillez la performance de votre équipe.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary/90"
          >
            <UserPlus className="h-5 w-5" />
            Nouvel Agent
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-12 text-center text-sm text-slate-500 animate-pulse">Chargement des agents...</div>
          ) : agents.length > 0 ? (
            agents.map((agent) => (
              <div key={agent.id} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.nom)}&background=random&size=64`}
                      alt={`Avatar de ${agent.nom}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{agent.nom}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${agent.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                        {agent.role}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                        <UserCheck className="h-3 w-3" /> ACTIF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{agent.telephone || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <button
                    onClick={() => setEditingAgent(agent)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Shield className="h-4 w-4 text-violet-500" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-250 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-100 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">Aucun agent ou secrétaire trouvé dans la base de données.</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Nouvel Agent</h2>
            <form onSubmit={handleAddAgent} className="mt-6 space-y-4">
              <div>
                <label htmlFor="agent-nom" className="text-sm font-medium">Nom complet</label>
                <input 
                  id="agent-nom"
                  required
                  type="text" 
                  value={newAgent.nom}
                  onChange={e => setNewAgent({...newAgent, nom: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="agent-email" className="text-sm font-medium">Email</label>
                <input 
                  id="agent-email"
                  required
                  type="email" 
                  value={newAgent.email}
                  onChange={e => setNewAgent({...newAgent, email: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="agent-tel" className="text-sm font-medium">Téléphone</label>
                <input 
                  id="agent-tel"
                  required
                  type="tel" 
                  value={newAgent.telephone}
                  onChange={e => setNewAgent({...newAgent, telephone: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="agent-role" className="text-sm font-medium">Rôle</label>
                <select 
                  id="agent-role"
                  value={newAgent.role}
                  onChange={e => setNewAgent({...newAgent, role: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="agent">Agent (Chine/Libreville)</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label htmlFor="agent-password" className="text-sm font-medium">Mot de passe provisoire</label>
                <input 
                  id="agent-password"
                  required
                  type="text" 
                  value={newAgent.password}
                  onChange={e => setNewAgent({...newAgent, password: e.target.value})}
                  placeholder="Ex: Ecom2026!"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
                <p className="mt-1 text-[10px] text-slate-500">Ce mot de passe devra être changé par l&apos;agent lors de sa première connexion.</p>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary/90"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Modifier l&apos;Agent</h2>
            <form onSubmit={handleEditAgent} className="mt-6 space-y-4">
              <div>
                <label htmlFor="edit-nom" className="text-sm font-medium">Nom complet</label>
                <input 
                  id="edit-nom"
                  required
                  type="text" 
                  value={editingAgent.nom}
                  onChange={e => setEditingAgent({...editingAgent, nom: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                <input 
                  id="edit-email"
                  required
                  type="email" 
                  value={editingAgent.email}
                  onChange={e => setEditingAgent({...editingAgent, email: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="edit-tel" className="text-sm font-medium">Téléphone</label>
                <input 
                  id="edit-tel"
                  required
                  type="tel" 
                  value={editingAgent.telephone || ''}
                  onChange={e => setEditingAgent({...editingAgent, telephone: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="edit-role" className="text-sm font-medium">Rôle</label>
                <select 
                  id="edit-role"
                  value={editingAgent.role}
                  onChange={e => setEditingAgent({...editingAgent, role: e.target.value as any})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="agent">Agent (Chine/Libreville)</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary/90"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

