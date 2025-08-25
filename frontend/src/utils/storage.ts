import { SignedMessage } from '../types';

const STORAGE_KEY = 'web3-signed-messages';

export const saveSignedMessages = (messages: SignedMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export const loadSignedMessages = (): SignedMessage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const messages = JSON.parse(stored) as SignedMessage[];
    
    return messages.filter(msg =>
      msg.id &&
      msg.message &&
      msg.signature &&
      typeof msg.timestamp === 'number'
    );
  } catch (error) {
    return [];
  }
};

export const clearSignedMessages = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {

  }
};
