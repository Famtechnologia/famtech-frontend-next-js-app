'use client';

import { useEffect, useState, useCallback } from 'react';

import { initSocket } from '../services/socket';

import { Socket } from 'socket.io-client';

interface SupportMessage {
  agentId?: string;
  message?: string;
  timestamp?: string;
}

export const useSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { socket: newSocket } = initSocket(roomId || 'default');
    setSocket(newSocket);

    if (!newSocket) {
      setError('Failed to initialize socket connection.');
      return;
    }

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
    });

    newSocket.on('support_message', (data: SupportMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      // newSocket.off('connect');
      // newSocket.off('disconnect');
      // newSocket.off('connect_error');
      // newSocket.off('support_message');
      newSocket.disconnect();
    };
  }, [roomId]);

  const sendMessage = useCallback((text: string) => {
    console.log('Attempting to send message:', text);
    if (socket && isConnected) {
      socket.emit("send_to_support", text);
      console.log('Message sent:', text);
    } else {
      setError('Cannot send message: Not connected to the server.');
    }
  }, [socket, isConnected]);

  // Clear messages when roomId changes
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    socket,
    isConnected,
    messages,
    error,
    clearMessages,
    sendMessage,
  };
};

export default useSocket;
