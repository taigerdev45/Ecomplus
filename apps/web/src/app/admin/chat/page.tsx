'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/useAuth';
import api from '@/lib/axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Send, Clock, CheckCircle2, MessageSquare, Users, ShieldAlert, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  status: 'open' | 'closed';
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
}

export default function AdminChat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'support' | 'team'>('support');
  
  // Support state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingSupport, setIsLoadingSupport] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Team chat state
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  const [newTeamMessage, setNewTeamMessage] = useState('');
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const teamChatContainerRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // SUPPORT CHAT LOGIC
  // -------------------------------------------------------------
  
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations((res.data as any).conversations || []);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setIsLoadingSupport(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages((res.data as any).messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }, []);

  // -------------------------------------------------------------
  // TEAM CHAT LOGIC
  // -------------------------------------------------------------

  const fetchTeamMessages = useCallback(async () => {
    try {
      const res = await api.get('/chat/internal');
      setTeamMessages((res.data as any).messages || []);
      scrollToTeamBottom();
    } catch (error) {
      console.error('Failed to load team messages', error);
    } finally {
      setIsLoadingTeam(false);
    }
  }, []);

  // Pollings & Initial load
  useEffect(() => {
    fetchConversations();
    fetchTeamMessages();

    // Background updates with visibility check
    const intervalConvs = setInterval(() => {
      if (document.visibilityState === 'visible') fetchConversations();
    }, 10000);
    const intervalTeam = setInterval(() => {
      if (document.visibilityState === 'visible') fetchTeamMessages();
    }, 4000);

    return () => {
      clearInterval(intervalConvs);
      clearInterval(intervalTeam);
    };
  }, [fetchConversations, fetchTeamMessages]);

  // Select conversation from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0 && !selectedConversation) {
      const params = new URLSearchParams(window.location.search);
      const conversationId = params.get('conversation_id');
      if (conversationId) {
        const found = conversations.find(c => c.id === conversationId);
        if (found) {
          setSelectedConversation(found);
          setActiveTab('support');
        }
      }
    }
  }, [conversations, selectedConversation]);

  // Poll active client conversation
  useEffect(() => {
    if (!selectedConversation || activeTab !== 'support') return;
    
    fetchMessages(selectedConversation.id);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(selectedConversation.id);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedConversation, activeTab, fetchMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const scrollToTeamBottom = () => {
    setTimeout(() => {
      if (teamChatContainerRef.current) {
        teamChatContainerRef.current.scrollTop = teamChatContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  // Sending Messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessage = newMessage;
    setNewMessage('');

    try {
      await api.post('/chat/messages', {
        conversationId: selectedConversation.id,
        content: tempMessage
      });
      await fetchMessages(selectedConversation.id);
      fetchConversations(); 
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      setNewMessage(tempMessage);
    }
  };

  const handleSendTeamMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMessage.trim()) return;

    const tempMessage = newTeamMessage;
    setNewTeamMessage('');

    try {
      await api.post('/chat/internal', {
        content: tempMessage
      });
      await fetchTeamMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message d\'équipe');
      setNewTeamMessage(tempMessage);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden">
        
        {/* Header Tab Selector */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-6 py-3 shrink-0">
          <div className="flex bg-slate-200/60 dark:bg-slate-850 p-1 rounded-xl gap-1">
            <button
              onClick={() => {
                setActiveTab('support');
                scrollToBottom();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'support'
                  ? 'bg-white text-primary shadow-sm dark:bg-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Support Client
            </button>
            <button
              onClick={() => {
                setActiveTab('team');
                fetchTeamMessages();
                scrollToTeamBottom();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-primary shadow-sm dark:bg-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {"Chat d'Équipe"}
            </button>
          </div>
          <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase hidden sm:block">
            Messagerie Ecom Plus
          </div>
        </div>

        {/* Main View Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {activeTab === 'support' ? (
            // ==========================================
            // SUPPORT TAB
            // ==========================================
            <>
              {/* Sidebar: Conversations List */}
              <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-0 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un client..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {isLoadingSupport ? (
                    <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 animate-spin text-primary" />
                      Chargement des conversations...
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                      Aucune conversation trouvée.
                    </div>
                  ) : (
                    <div className="p-3 space-y-1.5">
                      {filteredConversations.map(conv => {
                        const isActive = selectedConversation?.id === conv.id;
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full text-left p-3.5 rounded-xl transition-all ${
                              isActive
                                ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                                : 'hover:bg-slate-200/30 dark:hover:bg-slate-850/30 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-xs font-black truncate ${isActive ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                                {conv.client_name || 'Client inconnu'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 ml-2">
                                <Clock className="h-3 w-3" />
                                {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-semibold truncate">
                              {conv.client_email}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Chat Content */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 relative min-h-0 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Retour à la liste"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {selectedConversation.client_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {selectedConversation.client_name}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold">
                            {selectedConversation.client_email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ouvert
                      </div>
                    </div>

                    {/* Messages Flow */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 min-h-0">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-xs">Aucun message dans cette conversation.</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isMe = msg.sender_id === user?.id;
                          const isClient = msg.sender_role === 'client';
                          
                          return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>
                                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                                  isClient 
                                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400' 
                                    : 'bg-primary/20 text-primary'
                                }`}>
                                  {msg.sender_name?.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <span className="text-[9px] font-semibold text-slate-400 mb-1 px-1">
                                    {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  <div className={`px-4 py-3 rounded-2xl ${
                                    isMe 
                                      ? 'bg-primary text-white rounded-br-sm shadow-sm' 
                                      : 'bg-white border border-slate-200/80 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-bl-sm shadow-sm'
                                  }`}>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                      <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Écrivez votre message..."
                          className="flex-1 rounded-full border border-slate-200 bg-slate-50 py-3 pl-6 pr-12 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:border-slate-800"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          aria-label="Envoyer le message"
                          title="Envoyer le message"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 dark:bg-slate-950/10 p-6">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800 mb-4 shadow-inner">
                      <MessageSquare className="h-8 w-8 text-primary/60" />
                    </div>
                    <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">Centre de Messagerie Support</h2>
                    <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                      Sélectionnez une conversation dans le panneau de gauche pour commencer à échanger en direct avec vos clients.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // ==========================================
            // TEAM CHAT TAB
            // ==========================================
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-h-0">
              {/* Team Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{"Canal Général d'Équipe"}</h3>
                    <p className="text-xs text-slate-400 font-semibold">Discussion confidentielle réservée aux administrateurs et agents</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-full">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Discussion Interne
                </div>
              </div>

              {/* Team Messages Flow */}
              <div ref={teamChatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 min-h-0">
                {isLoadingTeam && teamMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
                    <Clock className="h-4 w-4 animate-spin text-primary" />
                    Chargement du canal...
                  </div>
                ) : teamMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Users className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-xs font-bold">{"Bienvenue sur le chat d'équipe !"}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Commencez la discussion en écrivant le premier message.</p>
                  </div>
                ) : (
                  teamMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id;
                    
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>
                          <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                            isMe 
                              ? 'bg-primary text-white' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {msg.sender_name?.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-semibold text-slate-400 mb-1 px-1">
                              {msg.sender_name} ({msg.sender_role}) • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <div className={`px-4 py-3 rounded-2xl ${
                              isMe 
                                ? 'bg-primary text-white rounded-br-sm shadow-sm' 
                                : 'bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-bl-sm shadow-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Team Message Input Area */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form onSubmit={handleSendTeamMessage} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={newTeamMessage}
                    onChange={(e) => setNewTeamMessage(e.target.value)}
                    placeholder="Envoyez un message à l'équipe..."
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 py-3 pl-6 pr-12 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:border-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!newTeamMessage.trim()}
                    aria-label="Envoyer le message à l'équipe"
                    title="Envoyer le message à l'équipe"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
