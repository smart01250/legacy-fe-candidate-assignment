import { SignatureService } from '../services/signatureService';
import { ethers } from 'ethers';

describe('SignatureService', () => {
  let wallet: ethers.Wallet;
  let testMessage: string;
  let validSignature: string;

  beforeAll(async () => {
    // Create a test wallet
    wallet = ethers.Wallet.createRandom();
    testMessage = 'Hello, Web3 World!';
    
    // Sign the test message
    validSignature = await wallet.signMessage(testMessage);
  });

  describe('verifySignature', () => {
    it('should verify a valid signature correctly', async () => {
      const result = await SignatureService.verifySignature(testMessage, validSignature);
      
      expect(result.isValid).toBe(true);
      expect(result.signer).toBe(wallet.address.toLowerCase());
    });

    it('should reject an invalid signature', async () => {
      const invalidSignature = '0x' + '0'.repeat(130);
      const result = await SignatureService.verifySignature(testMessage, invalidSignature);
      
      expect(result.isValid).toBe(false);
      expect(result.signer).toBe(null);
    });

    it('should reject when message is tampered', async () => {
      const tamperedMessage = 'Hello, Web3 World! (tampered)';
      const result = await SignatureService.verifySignature(tamperedMessage, validSignature);
      
      expect(result.isValid).toBe(false);
      expect(result.signer).toBe(null);
    });

    it('should handle empty message', async () => {
      const result = await SignatureService.verifySignature('', validSignature);
      
      expect(result.isValid).toBe(false);
      expect(result.signer).toBe(null);
    });

    it('should handle empty signature', async () => {
      const result = await SignatureService.verifySignature(testMessage, '');
      
      expect(result.isValid).toBe(false);
      expect(result.signer).toBe(null);
    });

    it('should handle signature without 0x prefix', async () => {
      const signatureWithoutPrefix = validSignature.slice(2);
      const result = await SignatureService.verifySignature(testMessage, signatureWithoutPrefix);
      
      expect(result.isValid).toBe(true);
      expect(result.signer).toBe(wallet.address.toLowerCase());
    });
  });

  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(SignatureService.isValidAddress(wallet.address)).toBe(true);
      expect(SignatureService.isValidAddress('0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(SignatureService.isValidAddress('invalid')).toBe(false);
      expect(SignatureService.isValidAddress('0x123')).toBe(false);
      expect(SignatureService.isValidAddress('')).toBe(false);
    });
  });
});
