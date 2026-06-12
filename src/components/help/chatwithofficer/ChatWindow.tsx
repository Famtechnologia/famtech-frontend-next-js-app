'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSocket } from '@/lib/hooks/useSocket';
import type { Officer } from './OfficerProfile1';
import { Send, Smile, Paperclip, Mic, ArrowLeft } from 'lucide-react';

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
  onBack
}: ChatWindowProps) {
  const roomId = `officer-${officer.id ?? officer.name}`;
  const { socket, isConnected, messages, sendMessage, error } = useSocket(roomId);
  const [inputValue, setInputValue] = useState('');
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial welcome message
  useEffect(() => {
    setDisplayMessages([
      {
        text: `Hello! I am ${officer.name}, your ${officer.specialty}. How can I assist you with your farm today?`,
        sender: 'officer',
        senderName: officer.name,
        senderPhoto: officer.photo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [officer]);

  // Append new messages received from the socket
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.message) {
        const formattedMessage: Message = {
          text: lastMsg.message,
          sender: lastMsg.agentId || 'officer',
          senderName: officer.name,
          senderPhoto: officer.photo,
          timestamp: lastMsg.timestamp 
            ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setDisplayMessages((prev) => {
          // Prevent duplicates
          const exists = prev.some(m => m.text === formattedMessage.text && m.timestamp === formattedMessage.timestamp);
          if (exists) return prev;
          return [...prev, formattedMessage];
        });
      }
    }
  }, [messages, officer]);

  // Scroll to bottom when message list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping]);

  // Local expert responder simulation
  const triggerSimulationReply = (userText: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let replyText = '';
      const textLower = userText.toLowerCase();

      if (officer.name.includes('Grace') || officer.specialty.toLowerCase().includes('crop')) {
        if (textLower.includes('pest') || textLower.includes('bug') || textLower.includes('insects')) {
          replyText = "Pest management is crucial. If you notice leaf damage or visual insects, please send a photo. For organic control, neem oil spray works well. For chemical intervention, let me know your target crop.";
        } else if (textLower.includes('leaf') || textLower.includes('wilt') || textLower.includes('blight') || textLower.includes('spot')) {
          replyText = "Spots or wilting leaves often indicate a fungal infection like Early Blight. Make sure you avoid watering the foliage directly, trim affected bottom leaves, and consider a copper-based fungicide if it spreads.";
        } else if (textLower.includes('seed') || textLower.includes('plant')) {
          replyText = "When planting new seeds, ensure proper spacing (typically 30-40cm for maize, 1m for cassava) and adequate initial moisture. Keep the soil weed-free during the first 4 weeks.";
        } else {
          replyText = "That's an interesting crop layout query. To give you the best advice, could you share the current age of the crop and describe the soil moisture conditions?";
        }
      } else if (officer.name.includes('Ibrahim') || officer.specialty.toLowerCase().includes('livestock')) {
        if (textLower.includes('cattle') || textLower.includes('cow') || textLower.includes('animal')) {
          replyText = "For cattle management, monitor feed quality. Lactating cows need around 14-16% protein content. Ensure they are fully dewormed and vaccinate against foot-and-mouth disease.";
        } else if (textLower.includes('feed') || textLower.includes('food') || textLower.includes('nutrition')) {
          replyText = "Feed formulation should combine grass/hay silage with concentrated grain. Adding mineral blocks containing sodium, calcium, and copper helps improve milk yield and weight gain.";
        } else if (textLower.includes('sick') || textLower.includes('symptom') || textLower.includes('cough') || textLower.includes('fever')) {
          replyText = "Keep the sick animal isolated to prevent transmission. Check their eyes and gums. If they refuse to drink water, we should schedule a quick video visit to diagnose them.";
        } else {
          replyText = "I've logged your livestock query. Could you specify the breed, age group (calves/adults), and if they've had their recent veterinary checkup?";
        }
      } else {
        // Soil / Organic specialist (Ngozi)
        if (textLower.includes('soil') || textLower.includes('dirt') || textLower.includes('earth')) {
          replyText = "Healthy soil is the foundation. I recommend a soil test to check nitrogen, phosphorus, and potassium levels. Adding compost or well-rotted chicken manure naturally raises pH levels.";
        } else if (textLower.includes('fertilizer') || textLower.includes('npk')) {
          replyText = "For organic systems, avoid synthetic NPK. Use bone meal for phosphorus, wood ash for potassium, and legume cover crops (like cowpeas) to fix nitrogen naturally.";
        } else if (textLower.includes('water') || textLower.includes('irrigation')) {
          replyText = "Drip irrigation is the most efficient method to keep soil hydrated without waterlogging roots. Water early in the morning to reduce evaporation loss.";
        } else {
          replyText = "Soil health varies by region. To tailor my organic recommendation, what crop are you preparing the soil for and is the texture sandy, clay, or loamy?";
        }
      }

      setIsTyping(false);
      setDisplayMessages((prev) => [
        ...prev,
        {
          text: replyText,
          sender: 'officer',
          senderName: officer.name,
          senderPhoto: officer.photo,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
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

    // Send via socket if online
    if (isConnected) {
      sendMessage(inputValue);
    } else {
      // Offline simulation response fallback
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
    <div className="flex flex-col h-[550px] bg-white rounded-2xl w-full border border-slate-100 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="lg:hidden p-1.5 hover:bg-slate-200/60 text-slate-500 rounded-lg transition"
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
              className="w-10 h-10 rounded-xl object-cover border border-slate-200" 
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full ring-2 ring-white`}></span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{officer.name}</h4>
            <p className="text-[11px] font-semibold text-slate-400">
              {isConnected ? 'Connected' : 'Offline Mode (Auto-Responder Active)'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
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
                  className="w-8 h-8 rounded-lg object-cover border border-slate-100 mt-1"
                />
              )}
              <div className={`flex flex-col ${isUser ? 'items-end' : ''}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-sm text-xs font-medium leading-relaxed ${
                  isUser 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  <p>{message.text}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide px-1">
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
              className="w-8 h-8 rounded-lg object-cover border border-slate-100"
            />
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <input 
            type="text" 
            placeholder="Ask your farming question..." 
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white transition"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          
          <button 
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
          >
            <Mic className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2.5 rounded-xl transition ${
              inputValue.trim() 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}