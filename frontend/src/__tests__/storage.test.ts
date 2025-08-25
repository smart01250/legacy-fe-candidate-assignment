import { saveSignedMessages, loadSignedMessages, clearSignedMessages } from '../utils/storage';
import { SignedMessage } from '../types';

describe('Storage Utils', () => {
  const mockMessages: SignedMessage[] = [
    {
      id: '1',
      message: 'Test message 1',
      signature: '0x123',
      timestamp: Date.now(),
      signer: '0xabc',
      isVerified: true,
    },
    {
      id: '2',
      message: 'Test message 2',
      signature: '0x456',
      timestamp: Date.now(),
      signer: '0xdef',
      isVerified: false,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveSignedMessages', () => {
    it('should save messages to localStorage', () => {
      saveSignedMessages(mockMessages);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'web3-signed-messages',
        JSON.stringify(mockMessages)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => saveSignedMessages(mockMessages)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('loadSignedMessages', () => {
    it('should load messages from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockMessages));
      
      const result = loadSignedMessages();
      
      expect(result).toEqual(mockMessages);
      expect(localStorage.getItem).toHaveBeenCalledWith('web3-signed-messages');
    });

    it('should return empty array when no data exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const result = loadSignedMessages();
      
      expect(result).toEqual([]);
    });

    it('should filter out invalid messages', () => {
      const invalidMessages = [
        mockMessages[0], // valid
        { id: '3', message: '', signature: '0x789', timestamp: Date.now() }, // invalid - empty message
        { message: 'Test', signature: '0x999', timestamp: Date.now() }, // invalid - no id
        mockMessages[1], // valid
      ];
      
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(invalidMessages));
      
      const result = loadSignedMessages();
      
      expect(result).toEqual([mockMessages[0], mockMessages[1]]);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = loadSignedMessages();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearSignedMessages', () => {
    it('should remove messages from localStorage', () => {
      clearSignedMessages();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('web3-signed-messages');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearSignedMessages()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
