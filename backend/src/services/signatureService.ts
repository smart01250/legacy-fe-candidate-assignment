import { ethers } from 'ethers';

export class SignatureService {
  /**
   * Verifies an Ethereum signature and recovers the signer address
   * @param message - The original message that was signed
   * @param signature - The signature to verify
   * @returns Object containing validation result and signer address
   */
  static async verifySignature(message: string, signature: string): Promise<{
    isValid: boolean;
    signer: string | null;
  }> {
    try {
      // Validate inputs
      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message: must be a non-empty string');
      }

      if (!signature || typeof signature !== 'string') {
        throw new Error('Invalid signature: must be a non-empty string');
      }

      // Ensure signature is properly formatted
      if (!signature.startsWith('0x')) {
        signature = '0x' + signature;
      }

      // Validate signature format (should be 132 characters: 0x + 130 hex chars)
      if (!/^0x[0-9a-fA-F]{130}$/.test(signature)) {
        throw new Error('Invalid signature format');
      }

      // Recover the signer address from the signature
      // ethers.js automatically handles the message hashing and prefixing
      const recoveredAddress = ethers.verifyMessage(message, signature);

      return {
        isValid: true,
        signer: recoveredAddress.toLowerCase(),
      };
    } catch (error) {
      console.error('Signature verification failed:', error);
      
      return {
        isValid: false,
        signer: null,
      };
    }
  }

  /**
   * Validates if an address is a valid Ethereum address
   * @param address - The address to validate
   * @returns boolean indicating if the address is valid
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }
}
