'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface SiteConfig {
  whatsapp_service_1: string;
  whatsapp_service_2: string;
}

export default function FloatingWhatsApp() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/config`)
      .then(res => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .catch(err => console.error('Failed to load WhatsApp config', err));
  }, []);

  if (!config) return null;

  const handleWhatsAppClick = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Menu Expansion */}
      {isOpen && (
        <div className="mb-2 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {config.whatsapp_service_1 && (
            <button
              onClick={() => handleWhatsAppClick(config.whatsapp_service_1)}
              className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl border border-slate-100 transition-transform hover:scale-105 active:scale-95"
              aria-label="Contacter le Service Client 1 sur WhatsApp"
              title="Contacter le Service Client 1 sur WhatsApp"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
              Service Client 1
            </button>
          )}
          {config.whatsapp_service_2 && (
            <button
              onClick={() => handleWhatsAppClick(config.whatsapp_service_2)}
              className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl border border-slate-100 transition-transform hover:scale-105 active:scale-95"
              aria-label="Contacter le Service Client 2 sur WhatsApp"
              title="Contacter le Service Client 2 sur WhatsApp"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
              Service Client 2
            </button>
          )}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-slate-900 text-white' : 'bg-green-500 text-white animate-bounce-subtle'
        }`}
        aria-label={isOpen ? "Fermer le menu de contact" : "Ouvrir le menu de contact WhatsApp"}
        title={isOpen ? "Fermer" : "Besoin d'aide ?"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

