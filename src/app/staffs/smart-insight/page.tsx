"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircleMore, User2 } from "lucide-react";
import { getAdvice } from "@/lib/services/advisory";
import SmartAdvisory from "@/components/layout/skeleton/smart-advisory/SmartAdvisory";
import { useAssignee } from "@/lib/hooks/Assignee";

interface ChatMessage {
  type: "user" | "bot";
  text: string;
}

const formatMessage = (text: string) => {
  if (!text) return { __html: "" };
  const formattedText = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
  return { __html: formattedText };
};

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAssignee();

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("smartAdvisoryHistory");
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("smartAdvisoryHistory", JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: ChatMessage = { type: "user", text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setIsLoading(true);

    try {
      // removed undefined selectedRecord
      const advice = await getAdvice(currentQuestion, {});
      const botMessage: ChatMessage = { type: "bot", text: advice.advice };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error: unknown) {
      const errorMessage: ChatMessage = {
        type: "bot",
        text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // removed undefined setIsPreview
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading && chatHistory.length === 0) {
    return <SmartAdvisory />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-3 pt-6 md:p-6 bg-white">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-lg text-green-700 sm:text-xl lg:text-2xl font-bold leading-tight mb-2">
          Hi{" "}
          <span className="capitalize">
            {user?.name ? user.name.split(" ")[0] : "Farmer"}
          </span>
          , here&apos;s your farm health today ⛅
        </h2>
        <p className="text-gray-500 text-base leading-relaxed">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex flex-col flex-grow bg-gray-50 rounded-xl shadow-inner overflow-hidden border border-gray-100">
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-6"
        >
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 animate-fade-in ${
                chat.type === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 p-2 rounded-full ${
                  chat.type === "user" ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {chat.type === "user" ? (
                  <User2 className="h-5 w-5 text-blue-700" />
                ) : (
                  <MessageCircleMore className="h-5 w-5 text-green-700" />
                )}
              </div>
              <div
                className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  chat.type === "user"
                    ? "bg-green-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}
              >
                <div dangerouslySetInnerHTML={formatMessage(chat.text)} />
              </div>
            </div>
          ))}
          {isLoading && chatHistory.length > 0 && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="p-2 bg-green-100 rounded-full">
                <MessageCircleMore className="h-5 w-5 text-green-700" />
              </div>
              <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={handleChat}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask for smart advice..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center justify-center p-3 text-white bg-green-600 rounded-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              disabled={isLoading || !question.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-75 {
          animation-delay: 0.1s;
        }
        .delay-150 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
