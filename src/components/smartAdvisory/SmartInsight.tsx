"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, MessageCircleMore, User2 } from "lucide-react";
import { getAdvice } from "@/lib/services/advisory";
import {
  getCropRecords,
  getLivestockRecords,
} from "@/lib/services/croplivestock";
import Modal from "../ui/Modal";
import { useAuthStore } from "@/lib/store/authStore";
import Image from "next/image";

const formatMessage = (text: string) => {
  if (!text) return { __html: "" };
  const formattedText = text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
  return { __html: formattedText };
};

interface ChatMessage {
  type: "user" | "bot";
  text: string;
}

export const SmartInsight = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCropRecord, setIsCropRecord] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLivestockRecord, setIsLivestockRecord] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const [cropRecords, setCropRecords] = useState([]);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const userId = useAuthStore((state) => state.user?.id);

  const fetchCropData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getCropRecords(userId);

      setCropRecords(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchLivestockData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getLivestockRecords(userId);

      setLivestockRecords(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

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
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: ChatMessage = { type: "user", text: question };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setIsLoading(true);

    try {
      const advice = await getAdvice(currentQuestion, selectedRecord);
      const botMessage: ChatMessage = { type: "bot", text: advice.advice };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        type: "bot",
        text: `Error: ${error.message}`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsPreview(!isPreview);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-full bg-gray-50 rounded-lg shadow-md p-4">
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 space-y-4 pr-4 h-[80vh]"
        >
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 animate-fade-in ${chat.type === "user" ? "justify-end" : ""}`}
            >
              {chat.type === "bot" && (
                <div className="p-2 bg-green-200 rounded-full">
                  <MessageCircleMore className="h-6 w-6 text-green-800" />
                </div>
              )}
              <div
                className={`max-w-xl p-3 rounded-lg ${
                  chat.type === "user"
                    ? "bg-green-500 text-white"
                    : "bg-white shadow"
                }`}
              >
                <div dangerouslySetInnerHTML={formatMessage(chat.text)} />
              </div>
              {chat.type === "user" && (
                <div className="p-2 bg-blue-200 rounded-full">
                  <User2 className="h-6 w-6 text-green-800" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="p-2 bg-green-200 rounded-full">
                <MessageCircleMore className="h-6 w-6 text-green-800" />
              </div>
              <div className="max-w-xl p-3 bg-white shadow rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          {isPreview && (
            <div className="flex gap-2 items-center p-2 bg-gray-200 rounded-xl my-2">
              <Image
                alt={
                  selectedRecord?.type === "crop"
                    ? selectedRecord?.cropName
                    : selectedRecord?.breed
                }
                width={30}
                height={30}
                className="size-16 aspect-square rounded-md"
                src={
                  selectedRecord?.type === "crop"
                    ? selectedRecord?.cropImages[0]?.url
                    : selectedRecord?.livestockImages[0]?.url
                }
              />
              <div>
                <h3 className="text-gray-800 font-semibold text-sm capitalize">
                  {
                  selectedRecord?.type === "crop"
                    ? selectedRecord?.cropName
                    : selectedRecord?.breed}
                </h3>
                <p className="text-gray-700 text-sm">
                  {selectedRecord?.type === "crop"
                    ? selectedRecord?.variety
                    : selectedRecord?.specie}
                </p>
                <p className="text-gray-600 text-sm">{selectedRecord?.note}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleChat}
            className="relative w-full space-x-2 flex items-center"
          >
            <button
              type="button"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
              disabled={isLoading}
              onClick={() => setIsCropRecord(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Crop
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
              disabled={isLoading}
              onClick={() => setIsLivestockRecord(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Livestock
            </button>
            <input
              type="text"
              placeholder="Ask for smart advice..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-100 rounded-md bg-green-700 hover:bg-green-600 transition-colors duration-200"
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" /> Send
            </button>
          </form>
        </div>
        <style jsx>{`
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
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
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          .delay-75 {
            animation-delay: 0.075s;
          }
          .delay-150 {
            animation-delay: 0.15s;
          }
        `}</style>
        <Modal
          show={isCropRecord}
          onClose={() => setIsCropRecord(!isCropRecord)}
          title="Crop Record"
        >
          <div className="space-y-2">
            {cropRecords.length === 0 ? (
              <p>You Don&apos; have any Crop</p>
            ) : (
              cropRecords.map(
                (record, index) => {
                  return (
                    <div
                      key={index}
                      className="flex gap-2 items-center p-2 hover:bg-gray-200 rounded-xl"
                      onClick={() => {
                        setSelectedRecord({ type: "crop", ...record });
                        setIsCropRecord(!isCropRecord);
                        setIsPreview(true);
                      }}
                    >
                      <Image
                        alt={record?.cropName}
                        width={30}
                        height={30}
                        className="size-16 aspect-square rounded-md"
                        src={record?.cropImages[0]?.url}
                      />
                      <div>
                        <h3 className="text-gray-800 font-semibold text-sm capitalize">
                          {record?.cropName}
                        </h3>
                        <p className="text-gray-700 text-sm">
                          {record?.variety}
                        </p>
                        <p className="text-gray-600 text-sm">{record?.note}</p>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </Modal>
        <Modal
          show={isLivestockRecord}
          onClose={() => setIsLivestockRecord(!isLivestockRecord)}
          title="Livestock Record"
        >
          <div className="space-y-2">
            {livestockRecords.length === 0 ? (
              <p>You Don&apos; have any Crop</p>
            ) : (
              livestockRecords.map(
                (record, index) => {
                  return (
                    <div
                      key={index}
                      className="flex gap-2 items-center p-2 hover:bg-gray-200 rounded-xl"
                      onClick={() => {
                        setSelectedRecord({ type: "livestock", ...record });
                        setIsLivestockRecord(!isLivestockRecord);
                        setIsPreview(true);
                      }}
                    >
                      <Image
                        alt={record?.note}
                        width={30}
                        height={30}
                        className="size-16 aspect-square rounded-md"
                        src={record?.livestockImages[0]?.url}
                      />
                      <div>
                        <h3 className="text-gray-800 font-semibold text-sm capitalize">
                          {record?.breed}
                        </h3>
                        <p className="text-gray-700 text-sm">
                          {record?.specie}
                        </p>
                        <p className="text-gray-600 text-sm">{record?.note}</p>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};
