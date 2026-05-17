'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/useAuth';
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

export default function ClientChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      await api.post('/chat/messages', {
        conversationId: conversationId,
        content: tempMessage
      });
      
      if (!conversationId) {
        const newConvId = await loadConversation();
        if (newConvId) {
          await loadMessages(newConvId);
        }
      } else {
        await loadMessages(conversationId);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      setNewMessage(tempMessage);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold">Initialisation du chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-3xl bg-white border border-slate-200/60 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-fade-in">
      
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:bg-primary/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Service Client EcomPlus</h1>
            <p className="text-[10px] font-semibold text-slate-400">Agent connecté de 8h à 18h</p>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800 mb-3">
              <MessageSquare className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Aucun message pour le moment</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Une question sur vos commandes, les frais ou l&apos;importation ? Écrivez-nous ci-dessous.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            const isAdmin = msg.sender_role !== 'client';
            
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Miniature Avatar / Badge */}
                  <div className={`h-7 w-7 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black ${
                    isAdmin 
                      ? 'bg-primary text-white shadow-sm shadow-primary/30' 
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isAdmin ? 'A' : user?.nom?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Timestamp bubble header */}
                    <span className="text-[9px] text-slate-400 font-semibold mb-0.5 px-1">
                      {isAdmin ? 'Agent EcomPlus' : 'Vous'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-primary text-white rounded-br-none shadow-sm shadow-primary/25' 
                        : 'bg-white border border-slate-200/80 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-bl-none shadow-xs'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input panel */}
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
