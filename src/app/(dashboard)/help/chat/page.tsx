"use client";
import React, { useEffect, useState } from "react";
import useSocket from "@/lib/hooks/useSocket";

interface Message {
  sender: "user" | "bot" | "Agent";
  text: string;
  id: string;
  userId?: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read";
  agentName?: string;
}

interface SocketMessage {
  agentId?: string;
  message?: string;
  timestamp?: string;
}
import { useAuth } from "@/lib/hooks/useAuth";

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { sendMessage, messages: socketMessages } = useSocket(user?._id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (socketMessages.length > 0) {
      const newMsg = socketMessages[socketMessages.length - 1] as SocketMessage;

      if (!newMsg?.message) return;

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${newMsg.agentId || "fam"}-${newMsg.timestamp || Date.now().toString()}`,
          sender: "Agent",
          text: newMsg.message || "",
          userId: newMsg.agentId || "",
          timestamp: newMsg.timestamp || new Date().toISOString(),
          status: "delivered",
          agentName: newMsg.agentId,
        }
      ]); 
      setIsTyping(false);
    }
  }, [socketMessages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "bot-welcome",
        sender: "bot",
        text: "Hello! I'm your Smart Farm Assistant. Ask me anything about farming, and I'll do my best to help you out!",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [messages])

  // Simulate chatbot reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;
    try {
      setMessages((prev) => [...prev, {
        id: `user-${user?._id || 'default'}-${Date.now()}`,
        text: input,
        sender: "user",
        userId: user?._id,
        timestamp: new Date().toISOString(),
        status: "sent",
      }]);
      setInput("");
      setIsTyping(true);
      sendMessage(input);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }

  };

  return (
    <div className="min-h-screen p-2 md:p-6 bg-white flex flex-col items-center ">
      {/* Introduction Section */}
      <div className="w-full text-start mb-6">
        <h1 className="text-3xl font-bold text-green-700 mb-3">
          Smart Farm Assistant
        </h1>
        <p className="text-gray-700 text-base leading-relaxed">
          Welcome to your AI-powered farming assistant!
          Ask any question about soil health, irrigation, pest control, crop growth, or organic farming —
          and get instant guidance. 🌱
          Our AI is trained to provide helpful insights and connect you with experts when needed.
        </p>
      </div>

      {/* Chat Section */}
      <div className="w-full min-h-150 bg-white rounded-2xl shadow-md border border-green-100 flex flex-col overflow-hidden">
        <div className="flex-1 p-5 overflow-y-auto space-y-4 h-100">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-20">
              Start a conversation by asking a question...
            </p>
          ) : (
            messages.map((msg, i) => {
              const messageTime = msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";

              return (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div className={`${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    {msg.sender === "Agent" && msg.agentName && (
                      <p className="text-xs text-gray-500 mb-1">{msg.agentName}</p>
                    )}
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.sender === "user"
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                    {messageTime && (
                      <p className="text-[11px] text-gray-400 mt-1">{messageTime}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="text-gray-400 text-sm italic">typing...</div>
          )}
        </div>

        {/* Input Section */}
        <form onSubmit={handleSend} className="border-t border-green-100 p-4 flex justify-between gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about farming..."
            className="flex-1 border border-gray-300 w-full rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-sm text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBotPage;
