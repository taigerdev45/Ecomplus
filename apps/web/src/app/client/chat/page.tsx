'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useAuth } from '@/store/useAuth';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Send, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
}

function ChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Pre-fill message for Commande Spécifique Sourcing
  useEffect(() => {
    if (searchParams.get('commande_specifique') === 'true') {
      setNewMessage("Bonjour, je souhaiterais commander un article spécifique ne figurant pas dans le catalogue. Pouvez-vous m'aider à le prospecter ?");
    }
  }, [searchParams]);

  const loadConversation = useCallback(async () => {
    try {
      const convRes = await api.get('/chat/conversations');
      const convs = (convRes.data as any).conversations;
      
      if (convs && convs.length > 0) {
        setConversationId(convs[0].id);
        return convs[0].id;
      }
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
    return null;
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const msgRes = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages((msgRes.data as any).messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const initChat = async () => {
      const convId = await loadConversation();
      if (convId) {
        await loadMessages(convId);
        
        interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            loadMessages(convId);
          }
        }, 4000);
      } else {
        setIsLoading(false);
      }
    };
    
    initChat();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && conversationId) {
        loadMessages(conversationId);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadConversation, loadMessages, conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = newMessage;
    setNewMessage('');

    try {
      const res = await api.post<{ success: boolean; message: any }>('/chat/messages', {
        conversationId: conversationId || undefined,
        content: tempMessage
      });
      
      if (res.data.success) {
        const newMsg = res.data.message;
        if (newMsg && newMsg.conversation_id) {
          setConversationId(newMsg.conversation_id);
          await loadMessages(newMsg.conversation_id);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      setNewMessage(tempMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-xs text-slate-400">Chargement de votre discussion...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">Service Client EcomPlus</h1>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Agent en ligne
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase text-slate-500 tracking-wider dark:bg-slate-800 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Sécurisé
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-3">
            <MessageSquare className="h-10 w-10 text-slate-300" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Aucun message pour l&apos;instant</h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Discutez directement avec un agent de notre service client pour toutes vos demandes de devis et de sourcing.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  <p className="text-xs leading-relaxed break-words">{msg.content}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1.5">
                    <span className={`text-[9px] font-semibold ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-xl bg-primary text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Envoyer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ClientChat() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-xs text-slate-400">Chargement de votre discussion...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
