"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, 
  Plus, 
  MessageCircleMore, 
  User2, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Sprout, 
  Microscope, 
  CloudSun, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown,
  X,
  History,
  MessageSquare
} from "lucide-react";
import { getAdvice } from "@/lib/services/advisory";
import {
  getCropRecords,
  getLivestockRecords,
} from "@/lib/services/croplivestock";
import Modal from "../ui/Modal";
import { useAuthStore } from "@/lib/store/authStore";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "react-hot-toast";

const formatMessage = (text) => {
  if (!text) return { __html: "" };
  let formattedText = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='font-bold text-slate-800'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em class='italic text-slate-700'>$1</em>")
    .replace(/`(.*?)`/g, "<code class='bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-700'>$1</code>");
  
  formattedText = formattedText.split("\n").map(line => {
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return `<li class="ml-4 list-disc text-slate-700 my-1">${line.substring(2)}</li>`;
    }
    return line;
  }).join("<br />");

  return { __html: formattedText };
};

export const SmartInsight = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCropRecord, setIsCropRecord] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLivestockRecord, setIsLivestockRecord] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [cropRecords, setCropRecords] = useState([]);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { user } = useAuth();

  const fetchCropData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await getCropRecords(user?._id);
      setCropRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  const fetchLivestockData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await getLivestockRecords(user?._id);
      setLivestockRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchCropData();
    fetchLivestockData();
    try {
      const savedHistory = localStorage.getItem("smartAdvisoryHistory");
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      setError(error.message);
    }
  }, [fetchCropData, fetchLivestockData]);

  useEffect(() => {
    try {
      localStorage.setItem("smartAdvisoryHistory", JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleChatSubmit = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = { type: "user", text: textToSend };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const advice = await getAdvice(textToSend, selectedRecord);
      const botMessage = { type: "bot", text: advice.advice };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        text: `Failed to fetch response: ${error.message || "Please check backend availability."}`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsPreview(false);
    }
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    handleChatSubmit(q);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setSelectedRecord(null);
    setIsPreview(false);
    toast.success("Conversation history cleared.");
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReaction = (type) => {
    toast.success("Feedback submitted! Thanks for helping us improve.");
  };

  const handlePromptCardClick = (promptText) => {
    setQuestion(promptText);
  };

  const quickPrompts = [
    {
      title: "Crop Diagnosis",
      desc: "Determine fertilizers and crop health metrics.",
      prompt: "Can you analyze my crop status and suggest the best fertilizer application schedule for my state?",
      icon: <Sprout className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50/50 hover:bg-emerald-50"
    },
    {
      title: "Livestock Rations",
      desc: "Check feeding ratios and health plans.",
      prompt: "What are the optimal feeding ratios and vaccination guidelines for my livestock breed?",
      icon: <HelpCircle className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50/50 hover:bg-blue-50"
    },
    {
      title: "Weather Advisory",
      desc: "Formulate actions based on seasonal patterns.",
      prompt: "Based on local seasonal patterns, how should I schedule my watering and harvesting times?",
      icon: <CloudSun className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50/50 hover:bg-amber-50"
    },
    {
      title: "Soil Optimizations",
      desc: "Analyze nutrients and prevent disease.",
      prompt: "How can I improve soil nutrient concentrations to prevent common crop diseases?",
      icon: <Microscope className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50/50 hover:bg-indigo-50"
    }
  ];

  return (
    <div className="flex h-[calc(100vh-210px)] min-h-[460px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
      
      {/* --- SIDEBAR CHAT PANEL (CLAUDE STYLE) --- */}
      <div className="hidden lg:flex flex-col w-64 bg-slate-50 border-r border-slate-100 p-4 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4" />
            Advisory Assistant
          </h3>
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl transition-all text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </button>

        <div className="flex-1 mt-6 overflow-y-auto space-y-1 pr-1">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">No active advisor chat sessions yet.</p>
            </div>
          ) : (
            <div className="p-3 bg-green-50/50 border border-green-100/30 rounded-xl flex items-center gap-2 text-xs text-green-800 font-bold">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">Current Advisory Session</span>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CHAT CONTAINER --- */}
      <div className="flex flex-col flex-1 h-full bg-white min-w-0">
        
        {/* Messages space */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl w-full mx-auto"
        >
          {chatHistory.length === 0 ? (
            /* --- BEAUTIFUL CLAUDE-STYLE GREETING LANDING --- */
            <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center space-y-8 animate-in fade-in duration-350">
              <div className="p-3.5 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/10">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                  How can I assist you today?
                </h1>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  I can analyze soil conditions, review crop logs, optimize feed allocations, and provide diagnostic recommendations for your farm.
                </p>
              </div>

              {/* Quick Prompts cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
                {quickPrompts.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => handlePromptCardClick(card.prompt)}
                    className={`p-4 rounded-xl border border-slate-100/80 cursor-pointer text-left transition-all hover:scale-[1.01] hover:shadow-md ${card.bg}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">{card.icon}</div>
                      <h4 className="font-bold text-slate-800 text-sm">{card.title}</h4>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- MESSAGES LOG --- */
            <div className="space-y-6">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 animate-in slide-in-from-bottom-3 duration-250 ${
                    chat.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className={`p-2 rounded-xl shrink-0 ${
                    chat.type === "user" 
                      ? "bg-slate-100 text-slate-600" 
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {chat.type === "user" ? (
                      <User2 className="h-4.5 w-4.5" />
                    ) : (
                      <Sparkles className="h-4.5 w-4.5" />
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div className="space-y-1.5 max-w-[80%]">
                    <div className={`px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
                      chat.type === "user"
                        ? "bg-emerald-600 text-white shadow-sm rounded-tr-none"
                        : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none font-medium"
                    }`}>
                      {chat.type === "user" ? (
                        <div>{chat.text}</div>
                      ) : (
                        <div 
                          className="prose prose-slate max-w-none prose-sm"
                          dangerouslySetInnerHTML={formatMessage(chat.text)} 
                        />
                      )}
                    </div>

                    {/* Bot message tools bar */}
                    {chat.type === "bot" && (
                      <div className="flex items-center gap-3 px-1 text-slate-400">
                        <button
                          onClick={() => handleCopy(chat.text, index)}
                          className="hover:text-slate-600 transition-colors p-1"
                          title="Copy reply"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="h-3 border-l border-slate-200" />
                        <button 
                          onClick={() => handleReaction("up")}
                          className="hover:text-slate-600 transition-colors p-1"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleReaction("down")}
                          className="hover:text-slate-600 transition-colors p-1"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-md shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- BOTTOM INPUT COMPOSER PANEL --- */}
        <div className="p-4 md:p-5 bg-white border-t border-slate-100/80 shrink-0">
          <div className="max-w-3xl w-full mx-auto">
            
            {/* Attachment preview capsule */}
            {isPreview && selectedRecord && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200/60 rounded-xl mb-2 text-xs font-semibold text-slate-700 w-fit relative group shadow-sm animate-in slide-in-from-bottom-2">
                <div className="p-1 bg-green-50 rounded text-green-700">
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <span className="truncate max-w-[150px] capitalize font-bold">
                  {selectedRecord.type === "crop" ? selectedRecord.cropName : selectedRecord.breed}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedRecord(null); setIsPreview(false); }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleChat}
              className="bg-white border border-slate-200 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.06)] p-2 relative flex flex-col focus-within:border-emerald-600 transition-colors"
            >
              <textarea
                rows={1}
                placeholder="Ask for smart advice..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChat(e);
                  }
                }}
                className="w-full px-3 py-2 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-medium"
                disabled={isLoading}
              />

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2 px-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    disabled={isLoading}
                    onClick={() => setIsCropRecord(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Crop
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    disabled={isLoading}
                    onClick={() => setIsLivestockRecord(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Livestock
                  </button>
                </div>

                <button
                  type="submit"
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                  disabled={isLoading || !question.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- CROP RECORD SELECTION POPUP --- */}
      <Modal
        show={isCropRecord}
        onClose={() => setIsCropRecord(false)}
        title="Link Crop Record"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {cropRecords.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">No crop records registered.</p>
              <p className="text-xs text-slate-400 mt-0.5">Add crops under farm operations first.</p>
            </div>
          ) : (
            cropRecords.map((record, index) => (
              <div
                key={index}
                className="flex gap-3 items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedRecord({ type: "crop", ...record });
                  setIsCropRecord(false);
                  setIsPreview(true);
                }}
              >
                {record?.cropImages?.[0]?.url ? (
                  <Image
                    alt={record?.cropName || "Crop image"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                    src={record.cropImages[0].url}
                  />
                ) : (
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
                    <Sprout className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-800 font-bold text-sm capitalize truncate">
                    {record?.cropName}
                  </h4>
                  <p className="text-slate-500 text-xs font-semibold truncate mt-0.5">{record?.variety}</p>
                  {record?.note && <p className="text-slate-400 text-xs truncate mt-0.5">{record.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* --- LIVESTOCK RECORD SELECTION POPUP --- */}
      <Modal
        show={isLivestockRecord}
        onClose={() => setIsLivestockRecord(false)}
        title="Link Livestock Record"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {livestockRecords.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">No livestock records registered.</p>
              <p className="text-xs text-slate-400 mt-0.5">Add livestock under farm operations first.</p>
            </div>
          ) : (
            livestockRecords.map((record, index) => (
              <div
                key={index}
                className="flex gap-3 items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedRecord({ type: "livestock", ...record });
                  setIsLivestockRecord(false);
                  setIsPreview(true);
                }}
              >
                {record?.livestockImages?.[0]?.url ? (
                  <Image
                    alt={record?.breed || "Livestock image"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover"
                    src={record.livestockImages[0].url}
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-750">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-800 font-bold text-sm capitalize truncate">
                    {record?.breed}
                  </h4>
                  <p className="text-slate-500 text-xs font-semibold truncate mt-0.5">{record?.specie}</p>
                  {record?.note && <p className="text-slate-400 text-xs truncate mt-0.5">{record.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
