"use client";
import React, { useState } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Simulate chatbot reply
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      const botMessage: Message = {
        sender: "bot",
        text: `I understand your question: "${userMessage.text}". Our support team will reach out with more details soon.`,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen p-2 md:p-8 bg-white flex flex-col items-center ">
      {/* Introduction Section */}
      <div className="w-full text-start mb-10">
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
        <div className="flex-1 p-5 overflow-y-auto space-y-4 h-[400px]">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-20">
              Start a conversation by asking a question...
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="text-gray-400 text-sm italic">Bot is typing...</div>
          )}
        </div>

        {/* Input Section */}
        <div className="border-t border-green-100 p-4 flex justify-between gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about farming..."
            className="flex-1 border border-gray-300 max-w-35 md:w-full rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-sm text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
