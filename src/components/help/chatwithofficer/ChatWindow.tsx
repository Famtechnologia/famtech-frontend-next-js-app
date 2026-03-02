'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSocket } from '@/lib/hooks/useSocket';

interface Officer {
  id?: string;
  name: string;
  photo: string;
}

interface ChatWindowProps {
  officer: Officer;
  userId?: string;
  userName?: string;
  userPhoto?: string;
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

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  officer, 
  userId = 'user-' + Math.random().toString(36).substr(2, 9),
  userName = 'Farmer',
  userPhoto = '/images/help/officer 1.png'
}) => {
  const roomId = `officer-${officer.id || officer.name}`;
  const { socket, isConnected, messages, sendMessage, error } = useSocket(roomId);
  const [inputValue, setInputValue] = useState('');
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add received messages to display
  useEffect(() => {
    if (messages.length > 0) {
      const newMessage = messages[messages.length - 1];
      setDisplayMessages((prev: Message[]) => {
        return prev;
      });
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

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

    // Add to local messages
    setDisplayMessages((prev) => [...prev, userMessage]);

    // Send via socket

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg w-full shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="relative">
            <Image src={officer.photo} alt={officer.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isConnected ? 'bg-green-400' : 'bg-gray-400'} rounded-full ring-2 ring-white`}></span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-800">{officer.name}</h4>
            <p className="text-sm text-gray-500">{isConnected ? 'Online' : 'Offline'}</p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
        <div className="flex space-x-4">
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          <button> </button>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          displayMessages.map((message, index) => {
            const isUserMessage = message.sender === userId;
            return (
              <div key={index} className={`flex items-start ${isUserMessage ? 'justify-end' : ''} space-x-3`}>
                {!isUserMessage && (
                  <Image 
                    src={officer.photo} 
                    alt={officer.name} 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className={`flex flex-col ${isUserMessage ? 'items-end' : ''}`}>
                  <div className={`p-3 rounded-lg max-w-sm ${
                    isUserMessage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p>{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                </div>
                {isUserMessage && (
                  <Image 
                    src={userPhoto} 
                    alt={userName} 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
          <input 
            type="text" 
            placeholder="Type message" 
            className="flex-1 py-2 px-4 rounded-full bg-gray-100 focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
          />
          <button><svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          <button 
            onClick={handleSendMessage}
            disabled={!isConnected || !inputValue.trim()}
            className={`p-2 ${isConnected && inputValue.trim() ? 'bg-green-500' : 'bg-gray-300'} text-white rounded-full`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;