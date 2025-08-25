import axios from 'axios';
import { verifySignature } from '../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySignature', () => {
    it('should verify signature successfully', async () => {
      const mockResponse = {
        data: {
          isValid: true,
          signer: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2',
          originalMessage: 'Test message',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await verifySignature('Test message', '0x123signature');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/verify-signature', {
        message: 'Test message',
        signature: '0x123signature',
      });
    });

    it('should handle API errors', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid signature format',
          },
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(verifySignature('Test message', 'invalid')).rejects.toThrow(
        'Invalid signature format'
      );
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(verifySignature('Test message', '0x123')).rejects.toThrow(
        'Unknown error occurred'
      );
    });

    it('should handle API errors without response data', async () => {
      const mockError = {
        response: undefined,
      };

      mockedAxios.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(verifySignature('Test message', '0x123')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
