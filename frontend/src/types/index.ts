export interface SignedMessage {
  id: string;
  message: string;
  signature: string;
  timestamp: number;
  signer?: string;
  isVerified?: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  signer: string | null;
  originalMessage: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}
