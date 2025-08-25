import { useState, useEffect, useCallback } from 'react';
import { SignedMessage } from '../types';
import { saveSignedMessages, loadSignedMessages, clearSignedMessages } from '../utils/storage';

export const useSignedMessages = () => {
  const [messages, setMessages] = useState<SignedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadedMessages = loadSignedMessages();
    setMessages(loadedMessages);
    setIsLoading(false);
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (!isLoading) {
      saveSignedMessages(messages);
    }
  }, [messages, isLoading]);

  const addMessage = useCallback((message: SignedMessage) => {
    setMessages(prev => [message, ...prev]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<SignedMessage>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
    clearSignedMessages();
  }, []);

  const getMessageById = useCallback((id: string): SignedMessage | undefined => {
    return messages.find(msg => msg.id === id);
  }, [messages]);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    removeMessage,
    clearAllMessages,
    getMessageById,
  };
};
