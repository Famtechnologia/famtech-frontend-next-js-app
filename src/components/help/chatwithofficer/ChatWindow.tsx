'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSocket } from '@/lib/hooks/useSocket';
import type { Officer } from './OfficerProfile1';
import { Send, Paperclip, Mic, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  officer: Officer;
  userId?: string;
  userName?: string;
  userPhoto?: string;
  onBack?: () => void;
}

interface Message {
  id?: string;
  text: string;
  sender: string;
  senderName?: string;
  senderPhoto?: string;
  timestamp: string;
  room?: string;
}

export default function ChatWindow({
  officer,
  userId = 'user-farmer',
  userName = 'Farmer',
  userPhoto = '/images/help/officer 1.png',
  onBack,
}: ChatWindowProps) {
  const roomId = `officer-${officer.id ?? officer.name}`;
  const { socket, isConnected, messages, sendMessage, error } = useSocket(roomId);
  const [inputValue, setInputValue] = useState('');
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayMessages([
      {
        text: `Hello! I am ${officer.name}, your ${officer.specialty}. How can I assist you with your farm today?`,
        sender: 'officer',
        senderName: officer.name,
        senderPhoto: officer.photo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [officer]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.message) {
        const formatted: Message = {
          text: lastMsg.message,
          sender: lastMsg.agentId || 'officer',
          senderName: officer.name,
          senderPhoto: officer.photo,
          timestamp: lastMsg.timestamp
            ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDisplayMessages((prev) => {
          const exists = prev.some(m => m.text === formatted.text && m.timestamp === formatted.timestamp);
          return exists ? prev : [...prev, formatted];
        });
      }
    }
  }, [messages, officer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping]);

  const triggerSimulationReply = (userText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const t = userText.toLowerCase();
      let reply = '';
      if (officer.name.includes('Grace') || officer.specialty.toLowerCase().includes('crop')) {
        if (t.includes('pest') || t.includes('bug') || t.includes('insect'))
          reply = "Pest management is crucial. If you notice leaf damage or visual insects, please send a photo. For organic control, neem oil spray works well. For chemical intervention, let me know your target crop.";
        else if (t.includes('leaf') || t.includes('wilt') || t.includes('blight') || t.includes('spot'))
          reply = "Spots or wilting leaves often indicate a fungal infection like Early Blight. Avoid watering the foliage directly, trim affected bottom leaves, and consider a copper-based fungicide if it spreads.";
        else if (t.includes('seed') || t.includes('plant'))
          reply = "When planting new seeds, ensure proper spacing (typically 30–40 cm for maize, 1 m for cassava) and adequate initial moisture. Keep the soil weed-free during the first 4 weeks.";
        else
          reply = "That's an interesting query. To give you the best advice, could you share the current age of the crop and describe the soil moisture conditions?";
      } else if (officer.name.includes('Ibrahim') || officer.specialty.toLowerCase().includes('livestock')) {
        if (t.includes('cattle') || t.includes('cow') || t.includes('animal'))
          reply = "For cattle management, monitor feed quality. Lactating cows need around 14–16% protein content. Ensure they are fully dewormed and vaccinate against foot-and-mouth disease.";
        else if (t.includes('feed') || t.includes('food') || t.includes('nutrition'))
          reply = "Feed formulation should combine grass/hay silage with concentrated grain. Adding mineral blocks containing sodium, calcium, and copper improves milk yield and weight gain.";
        else if (t.includes('sick') || t.includes('symptom') || t.includes('cough') || t.includes('fever'))
          reply = "Keep the sick animal isolated to prevent transmission. Check their eyes and gums. If they refuse water, we should schedule a quick video visit for diagnosis.";
        else
          reply = "I've logged your livestock query. Could you specify the breed, age group, and whether they've had their recent veterinary checkup?";
      } else {
        if (t.includes('soil') || t.includes('dirt') || t.includes('earth'))
          reply = "Healthy soil is the foundation. I recommend a soil test to check NPK levels. Adding compost or well-rotted chicken manure naturally raises pH.";
        else if (t.includes('fertilizer') || t.includes('npk'))
          reply = "For organic systems, avoid synthetic NPK. Use bone meal for phosphorus, wood ash for potassium, and legume cover crops to fix nitrogen naturally.";
        else if (t.includes('water') || t.includes('irrigation'))
          reply = "Drip irrigation is the most efficient method. Water early in the morning to reduce evaporation loss significantly.";
        else
          reply = "Soil health varies by region. What crop are you preparing the soil for, and is the texture sandy, clay, or loamy?";
      }
      setIsTyping(false);
      setDisplayMessages((prev) => [
        ...prev,
        {
          text: reply,
          sender: 'officer',
          senderName: officer.name,
          senderPhoto: officer.photo,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      text: inputValue,
      sender: userId,
      senderName: userName,
      senderPhoto: userPhoto,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      room: roomId,
    };
    setDisplayMessages((prev) => [...prev, userMessage]);
    if (isConnected) {
      sendMessage(inputValue);
    } else {
      triggerSimulationReply(inputValue);
    }
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[580px] bg-white dark:bg-[#161b22] rounded-2xl w-full border border-slate-100 dark:border-[#30363d] shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#21262d]/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 hover:bg-slate-200/60 dark:hover:bg-[#30363d] text-slate-500 dark:text-[#8b949e] rounded-lg transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="relative">
            <Image
              src={officer.photo}
              alt={officer.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-[#30363d]"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#161b22] ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-[#e6edf3] text-sm">{officer.name}</h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-[#8b949e]">
              {isConnected ? 'Connected' : 'Offline Mode — Auto-Responder Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 dark:bg-[#0d1117]/40">
        {displayMessages.map((message, index) => {
          const isUser = message.sender === userId;
          return (
            <div key={index} className={`flex items-start ${isUser ? 'justify-end' : ''} gap-2.5`}>
              {!isUser && (
                <Image
                  src={officer.photo}
                  alt={officer.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-100 dark:border-[#30363d] mt-1"
                />
              )}
              <div className={`flex flex-col ${isUser ? 'items-end' : ''}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-sm text-xs font-medium leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-slate-700 dark:text-[#e6edf3] rounded-tl-none shadow-sm'
                }`}>
                  <p>{message.text}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-[#6e7681] mt-1 uppercase tracking-wide px-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2.5">
            <Image
              src={officer.photo}
              alt={officer.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-cover border border-slate-100 dark:border-[#30363d]"
            />
            <div className="bg-white dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-[#8b949e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 dark:text-[#8b949e] hover:text-slate-600 dark:hover:text-[#e6edf3] hover:bg-slate-50 dark:hover:bg-[#21262d] rounded-xl transition">
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            placeholder="Ask your farming question..."
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-xs font-semibold text-slate-800 dark:text-[#e6edf3] placeholder-slate-400 dark:placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button type="button" className="p-2 text-slate-400 dark:text-[#8b949e] hover:text-slate-600 dark:hover:text-[#e6edf3] hover:bg-slate-50 dark:hover:bg-[#21262d] rounded-xl transition">
            <Mic className="h-4 w-4" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2.5 rounded-xl transition ${
              inputValue.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10'
                : 'bg-slate-100 dark:bg-[#21262d] text-slate-300 dark:text-[#6e7681] cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
