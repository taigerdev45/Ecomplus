'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { Mail, Phone, Shield, Trash2, UserCheck, Search, Edit, MessageSquare } from 'lucide-react';
import { User } from '@ecom/types';
import { toast } from 'sonner';

import api from '@/lib/axios';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (clientId: string) => {
    try {
      const res = await api.post('/chat/conversations', { client_id: clientId });
      const data = res.data as any;
      if (data?.success && data?.conversation) {
        window.location.href = `/admin/chat?conversation_id=${data.conversation.id}`;
      } else {
        toast.error('Impossible de démarrer la messagerie');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ouverture du chat');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await api.put(`/admin/clients/${editingClient.id}`, {
        nom: editingClient.nom,
        email: editingClient.email,
        telephone: editingClient.telephone
      });
      toast.success('Client modifié avec succès');
      setEditingClient(null);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte client ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      toast.success('Client supprimé avec succès');
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredClients = clients.filter(client => 
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.telephone && client.telephone.includes(searchTerm))
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Clients</h1>
            <p className="text-slate-500">Visualisez la liste des clients enregistrés et gérez leurs profils.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-12 text-center text-sm text-slate-500 animate-pulse">Chargement des clients...</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client.id} className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nom)}&background=random&size=64`}
                      alt={`Avatar de ${client.nom}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{client.nom}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        CLIENT
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
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{client.telephone || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <button
                    onClick={() => handleStartChat(client.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition hover:bg-primary/90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Discuter avec le client
                  </button>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Edit className="h-4 w-4 text-violet-500" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-250 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-100 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">Aucun client trouvé dans la base de données.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Modifier le Client</h2>
            <form onSubmit={handleEditClient} className="mt-6 space-y-4">
              <div>
                <label htmlFor="edit-client-nom" className="text-sm font-medium">Nom complet</label>
                <input 
                  id="edit-client-nom"
                  required
                  type="text" 
                  value={editingClient.nom}
                  onChange={e => setEditingClient({...editingClient, nom: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="edit-client-email" className="text-sm font-medium">Email</label>
                <input 
                  id="edit-client-email"
                  required
                  type="email" 
                  value={editingClient.email}
                  onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="edit-client-tel" className="text-sm font-medium">Téléphone</label>
                <input 
                  id="edit-client-tel"
                  required
                  type="tel" 
                  value={editingClient.telephone || ''}
                  onChange={e => setEditingClient({...editingClient, telephone: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingClient(null)}
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
