"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '../layout/BrandLogo';
import { siteConfig } from '@/config/site';
import { MessageSquare, X, Send, Trash2, MessageCircle } from 'lucide-react';

interface ChatMessageVehicle {
  id: string;
  make: string;
  model: string;
  version: string;
  year: number;
  price: number | null;
  mileage: number;
  mainPhoto: string;
  slug: string;
  status: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  recommendedVehicles?: ChatMessageVehicle[];
}

/**
 * Generates unique message identifiers.
 * Defined outside the React component scope to satisfy purity rules.
 */
function generateMessageId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${rand}`;
}

/**
 * Safely generates a UUID with a fallback for older browsers or insecure contexts.
 */
function safeGenerateUUID(): string {
  if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Safely extracts text from any message value, parsing nested JSON
 * objects if they accidentally pass through to the frontend.
 */
function getDisplayText(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;

    for (const key of [
      "reply",
      "response",
      "message",
      "content",
      "answer",
      "text",
    ]) {
      if (typeof item[key] === "string" && String(item[key]).trim()) {
        return String(item[key]).trim();
      }
    }
  }

  return "";
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Lead State Machine states
  const [leadState, setLeadState] = useState<'assisting' | 'awaiting_name' | 'awaiting_phone' | 'awaiting_consent' | 'lead_complete'>('assisting');
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadConsent, setLeadConsent] = useState<boolean | null>(null);
  const [leadCreated, setLeadCreated] = useState<boolean>(false);
  const [usefulInteractionCount, setUsefulInteractionCount] = useState<number>(0);

  // Lazy initialize conversationId to prevent set-state-in-effect issues
  const [conversationId, setConversationId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('mrcar_chat_id');
      if (!id) {
        id = safeGenerateUUID();
        localStorage.setItem('mrcar_chat_id', id);
      }
      return id;
    }
    return '';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Diagnostic log for mobile devices
  useEffect(() => {
    console.log("Chatbot mounted: mobile-fix-20260702");
  }, []);

  // Load chat state and history on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedOpenState = localStorage.getItem('mrcar_chat_open');
      if (savedOpenState === 'true') {
        setIsOpen(true);
      }

      // Load lead attributes
      const savedLeadState = localStorage.getItem('mrcar_lead_state') || 'assisting';
      const savedName = localStorage.getItem('mrcar_lead_name') || '';
      const savedPhone = localStorage.getItem('mrcar_lead_phone') || '';
      const savedConsent = localStorage.getItem('mrcar_lead_consent');
      const savedCreated = localStorage.getItem('mrcar_lead_created') === 'true';
      const savedCount = parseInt(localStorage.getItem('mrcar_lead_useful_count') || '0', 10);

      setLeadState(savedLeadState as typeof leadState);
      setLeadName(savedName);
      setLeadPhone(savedPhone);
      setLeadConsent(savedConsent === 'true' ? true : savedConsent === 'false' ? false : null);
      setLeadCreated(savedCreated);
      setUsefulInteractionCount(savedCount);

      const savedMessages = localStorage.getItem('mrcar_chat_messages');
      const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch {
          setMessages([
            {
              id: 'welcome',
              sender: 'bot',
              text: siteConfig.chatbot.welcomeMessage,
              time,
            },
          ]);
        }
      } else {
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: siteConfig.chatbot.welcomeMessage,
            time,
          },
        ]);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Persist messages history when changed
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mrcar_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    localStorage.setItem('mrcar_chat_open', String(nextState));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        localStorage.setItem('mrcar_chat_open', 'false');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClearConversation = () => {
    const newId = safeGenerateUUID();
    localStorage.setItem('mrcar_chat_id', newId);
    setConversationId(newId);
    
    localStorage.removeItem('mrcar_chat_messages');
    localStorage.removeItem('mrcar_lead_state');
    localStorage.removeItem('mrcar_lead_name');
    localStorage.removeItem('mrcar_lead_phone');
    localStorage.removeItem('mrcar_lead_consent');
    localStorage.removeItem('mrcar_lead_created');
    localStorage.removeItem('mrcar_lead_useful_count');
    localStorage.removeItem('mrcar_lead_vehicle_interest');

    setLeadState('assisting');
    setLeadName('');
    setLeadPhone('');
    setLeadConsent(null);
    setLeadCreated(false);
    setUsefulInteractionCount(0);

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: siteConfig.chatbot.welcomeMessage,
        time,
      },
    ]);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg: ChatMessage = {
      id: generateMessageId('user'),
      sender: 'user',
      text,
      time,
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    const historyPayload = messages
      .slice(-19)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: text,
          history: historyPayload,
          lead: {
            state: leadState,
            name: leadName || null,
            phone: leadPhone || null,
            consent: leadConsent,
            leadCreated: leadCreated,
            usefulInteractionCount: usefulInteractionCount,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state machine states
        if (data.leadState) {
          setLeadState(data.leadState);
          localStorage.setItem('mrcar_lead_state', data.leadState);
        }
        if (data.leadUpdate) {
          if (data.leadUpdate.name !== undefined) {
            setLeadName(data.leadUpdate.name || '');
            if (data.leadUpdate.name) {
              localStorage.setItem('mrcar_lead_name', data.leadUpdate.name);
            } else {
              localStorage.removeItem('mrcar_lead_name');
            }
          }
          if (data.leadUpdate.phone !== undefined) {
            setLeadPhone(data.leadUpdate.phone || '');
            if (data.leadUpdate.phone) {
              localStorage.setItem('mrcar_lead_phone', data.leadUpdate.phone);
            } else {
              localStorage.removeItem('mrcar_lead_phone');
            }
          }
          if (data.leadUpdate.consent !== undefined && data.leadUpdate.consent !== null) {
            setLeadConsent(data.leadUpdate.consent);
            localStorage.setItem('mrcar_lead_consent', String(data.leadUpdate.consent));
          } else if (data.leadUpdate.consent === null) {
            setLeadConsent(null);
            localStorage.removeItem('mrcar_lead_consent');
          }
          if (data.leadUpdate.leadCreated === true) {
            setLeadCreated(true);
            localStorage.setItem('mrcar_lead_created', 'true');
          } else {
            setLeadCreated(false);
            localStorage.setItem('mrcar_lead_created', 'false');
          }
          if (data.leadUpdate.usefulInteractionCount !== undefined && data.leadUpdate.usefulInteractionCount !== null) {
            setUsefulInteractionCount(data.leadUpdate.usefulInteractionCount);
            localStorage.setItem('mrcar_lead_useful_count', String(data.leadUpdate.usefulInteractionCount));
          }
        }

        const replyText = getDisplayText(data.reply);
        if (replyText.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              id: generateMessageId('bot'),
              sender: 'bot',
              text: replyText.trim(),
              time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              recommendedVehicles: data.recommendedVehicles,
            },
          ]);
        }
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId('bot-err'),
          sender: 'bot',
          text: 'No pude responder en este momento. Puedes intentarlo nuevamente o comunicarte con un asesor.',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handlePromptClick = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="font-sans">
      
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          data-chatbot-version="mobile-fix-20260702"
          style={{ display: 'flex', visibility: 'visible', opacity: 1, pointerEvents: 'auto' }}
          className="fixed right-4 bottom-32 z-[2147483647] flex h-14 w-14 items-center justify-center rounded-full bg-brand-red hover:bg-brand-red-hover text-white shadow-xl shadow-brand-red/20 transition-all hover:scale-105 active:scale-95 animate-bounce cursor-pointer opacity-100 visible pointer-events-auto"
          aria-label="Abrir asistente virtual"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] w-auto h-[490px] max-h-[75dvh] z-[9999] sm:left-auto sm:right-4 sm:w-[380px] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-fadeInUp">
          
          {/* Header */}
          <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandLogo variant="chatbot" />
              <div>
                <span className="text-xs font-bold text-white tracking-wide block leading-none">Asistente Mr. Car</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En línea
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearConversation}
                title="Limpiar conversación"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                aria-label="Borrar chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={toggleChat}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                aria-label="Cerrar chat"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-red text-white rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-150 rounded-tl-none border border-zinc-750'
                    }`}
                  >
                    <p className="whitespace-pre-line">{getDisplayText(msg.text)}</p>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                </div>

                {/* Inline Recommended Vehicle Cards */}
                {msg.recommendedVehicles && msg.recommendedVehicles.length > 0 && (
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mt-2 pl-2">
                    {msg.recommendedVehicles.map((car) => (
                      <div
                        key={car.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden flex flex-col p-2.5 space-y-2 hover:border-zinc-700 transition-all"
                      >
                        {/* Photo */}
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-800">
                          <Image
                            src={car.mainPhoto}
                            alt={`${car.make} ${car.model}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                        {/* Details */}
                        <div className="text-[10px] space-y-1">
                          <div className="flex justify-between items-baseline gap-1">
                            <span className="font-bold text-zinc-100 truncate">{car.make} {car.model}</span>
                            <span className="text-brand-red font-black flex-shrink-0">
                              {car.price !== null && car.price !== undefined ? `$${car.price.toLocaleString('en-US')}` : 'Consultar'}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[9px] truncate">{car.version} • {car.year}</p>
                          <div className="flex justify-between items-center pt-1.5 text-[8px] text-zinc-500 border-t border-zinc-900">
                            <span>Estado: <strong className="text-zinc-350">{car.status}</strong></span>
                            <span>{car.mileage.toLocaleString('en-US')} mi</span>
                          </div>
                        </div>
                        {/* Links */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <Link
                            href={`/vehiculo/${car.slug}`}
                            className="text-center rounded-lg bg-zinc-900 border border-zinc-800 py-1 text-[9px] font-bold text-zinc-300 hover:text-white"
                          >
                            Detalles
                          </Link>
                          <a
                            href={`https://wa.me/12403195266?text=${encodeURIComponent(
                              `Hola, me interesa el ${car.year} ${car.make} ${car.model} que vi en el chat (https://mrcarimport.com/vehiculo/${car.slug})`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1 text-[9px] font-bold text-white hover:bg-emerald-500"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="mr-auto items-start max-w-[82%] flex flex-col">
                <div className="rounded-2xl bg-zinc-800 border border-zinc-750 px-4 py-2.5 rounded-tl-none flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts chips (only show on fresh welcome screen) */}
          {!isTyping && messages.length <= 1 && (
            <div className="p-3 bg-zinc-950/40 border-t border-zinc-850/60 flex flex-wrap gap-1.5">
              {siteConfig.chatbot.suggestedPrompts.map((prompt) => (
                <button
                  key={prompt.action}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 px-2.5 py-1 text-[10px] text-zinc-300 font-semibold cursor-pointer transition-all active:scale-95"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* Form write input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-zinc-950 border-t border-zinc-850 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isTyping ? "Esperando respuesta..." : "Escribe tu mensaje aquí..."}
              disabled={isTyping}
              aria-label="Mensaje para el chat"
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-550 focus:border-brand-red focus:outline-none disabled:bg-zinc-950 disabled:text-zinc-650"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-9 w-9 rounded-xl bg-brand-red hover:bg-brand-red-hover disabled:bg-zinc-855 disabled:text-zinc-600 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Enviar mensaje"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
export default Chatbot;
