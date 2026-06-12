"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, HelpCircle, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How do I create a farm profile?",
  "How to use the Task Planner?",
  "What is Smart Advisory?",
  "How to contact support?",
];

const BOT_RESPONSES: Record<string, string> = {
  profile: `To create or edit your Farm Profile:
1. Go to **Settings > Profile** in the sidebar.
2. Fill in your farm details such as farm name, type (crop/livestock), size, and coordinates.
3. Click **Save Changes** at the bottom of the page.
Our integration tests ensure this profile module is fully stable and saves all your data perfectly!`,
  
  planner: `The **Task Planner** is located under **Farm Operations** in your sidebar.
It allows you to:
- Schedule planting, fertilization, and harvesting tasks.
- Assign tasks to your farm workers.
- View your schedule in a list (Task Planner) or a monthly Calendar view.`,
  
  advisory: `**Smart Advisory** uses advanced AI models to analyze your farm's metadata, weather data, and soil conditions to provide tailored advice.
You can find it by clicking **Smart Advisory** in the sidebar. It generates reports on optimal crop health, watering schedules, and soil nutrient suggestions!`,
  
  support: `If you need to contact a human support representative:
- Go to the **Help & Support > Contact Support** page in the sidebar.
- You can fill out the contact form there, or email us directly at **support@famtech.com**.
We usually reply within 2 hours!`,

  default: `I'm here to help you navigate Famtech! You can ask me about:
- Farm Profiles
- Farm Operations & Task Planner
- Inventory & Warehouse Management
- Smart Advisory
If you have a more specific support request, feel free to visit the **Contact Support** page.`
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! I am your Famtech AI Assistant. How can I help you manage your farm today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botText = BOT_RESPONSES.default;
      const normalizedText = text.toLowerCase();

      if (normalizedText.includes("profile") || normalizedText.includes("create") || normalizedText.includes("edit")) {
        botText = BOT_RESPONSES.profile;
      } else if (normalizedText.includes("planner") || normalizedText.includes("task") || normalizedText.includes("calendar")) {
        botText = BOT_RESPONSES.planner;
      } else if (normalizedText.includes("advisory") || normalizedText.includes("smart") || normalizedText.includes("ai")) {
        botText = BOT_RESPONSES.advisory;
      } else if (normalizedText.includes("support") || normalizedText.includes("contact") || normalizedText.includes("human")) {
        botText = BOT_RESPONSES.support;
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: botText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-[200]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none relative group cursor-pointer`}
          title="Ask AI Assistant"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          
          {/* Subtle pulse ring around the button */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-green-400/20 animate-pulse -z-10 group-hover:scale-110 transition-transform"></span>
          )}

          {/* Premium Label Tooltip */}
          {!isOpen && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
              Ask Famtech AI
            </div>
          )}
        </button>
      </div>

      {/* Chat window panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-[200] overflow-hidden transition-all duration-300 transform scale-100 opacity-100 border border-gray-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles size={18} className="text-green-300" />
                </div>
                {/* Active dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-green-600 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Famtech Support AI</h3>
                <p className="text-[10px] text-green-200">Online & Ready to Help</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      msg.sender === "user" ? "text-green-200" : "text-gray-450"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {/* Simulated Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Sparkles size={14} />
                </div>
                <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-tl-none p-3.5 text-sm shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / Suggestions */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="text-xs bg-white hover:bg-green-50 text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-full px-3 py-1 transition-all cursor-pointer font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-55/40 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-green-600/10"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
