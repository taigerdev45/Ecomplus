'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/useAuth';
import api from '@/lib/axios';
import { Send, MessageSquare, ShieldCheck } from 'lucide-react';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Optimize: useCallback for stable dependencies
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
        
        // Smart polling: Only poll messages if document is visible
        interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            loadMessages(convId);
          }
        }, 3000);
      } else {
        setIsLoading(false);
      }
    };
    
    initChat();

    // Restart polling logic when tab visibility changes
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = newMessage;
    setNewMessage('');

    try {
      // The backend creates the conversation automatically if conversationId is null
      await api.post('/chat/messages', {
        conversationId: conversationId,
        content: tempMessage
      });
      
      // Si c'est le premier message, il faut recharger la conversation pour avoir l'ID
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
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-slate-400 flex flex-col items-center">
          <MessageSquare className="h-10 w-10 mb-4 animate-pulse opacity-50" />
          Chargement de la messagerie...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-2xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">Support EcomPlus</h1>
            <p className="text-xs text-slate-500">Nous vous répondons dans les plus brefs délais</p>
          </div>
        </div>
      </div>

      {/* Messages Flow */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-center max-w-sm">
              {"Vous n'avez pas encore de messages."} <br />
              {"Posez-nous vos questions ici, notre équipe vous répondra très vite !"}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            const isAdmin = msg.sender_role !== 'client';
            
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAdmin 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isAdmin ? <ShieldCheck className="h-4 w-4" /> : user?.nom?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                      {isAdmin ? 'Agent EcomPlus' : 'Vous'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl ${
                      isMe 
                        ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' 
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message à l'équipe..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 py-3 pl-6 pr-14 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-950 dark:border-slate-800"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
