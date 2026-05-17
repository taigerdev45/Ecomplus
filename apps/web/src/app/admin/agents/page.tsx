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
            <div className="col-span-full py-12 text-center">Chargement...</div>
          ) : agents.map((agent) => (
            <div key={agent.id} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.nom)}&background=random&size=64`}
                    alt={`Avatar de ${agent.nom}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{agent.nom}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${agent.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {agent.role}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                      <UserCheck className="h-3 w-3" /> ACTIF
                    </span>
                  </div>
                </div>
                <button
                  aria-label={`Options pour ${agent.nom}`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <MoreVertical className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4" />
                  <span>{agent.telephone}</span>
                </div>
              <table className="mt-6 w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-500 dark:border-slate-800">
                    <th className="pb-4">Produit</th>
                    <th className="pb-4">Ventes</th>
                    <th className="pb-4">Chiffre d&apos;Affaires</th>
                    <th className="pb-4">Croissance</th>
                  </tr>
                </thead>
              </table>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Commandes</p>
                  <p className="text-lg font-bold">42</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Délai moy.</p>
                  <p className="text-lg font-bold">2.4j</p>
                </div>
              </div>
            </div>
          ))}
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
    </AdminLayout>
  );
}

