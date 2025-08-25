import React, { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { PenTool, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SignedMessage } from '../types';
import { verifySignature } from '../services/api';

interface MessageSignerProps {
  onMessageSigned: (message: SignedMessage) => void;
  onMessageVerified: (id: string, updates: Partial<SignedMessage>) => void;
}

export const MessageSigner: React.FC<MessageSignerProps> = ({
  onMessageSigned,
  onMessageVerified,
}) => {
  const { primaryWallet, user } = useDynamicContext();
  const [message, setMessage] = useState('');
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastSignedMessage, setLastSignedMessage] = useState<SignedMessage | null>(null);

  const handleSignMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message to sign');
      return;
    }

    if (!primaryWallet) {
      toast.error('No wallet connected');
      return;
    }

    setIsSigningMessage(true);

    try {
      const signer = await primaryWallet.connector.getSigner();
      
      const signature = await signer.signMessage(message.trim());
      
      const signedMessage: SignedMessage = {
        id: crypto.randomUUID(),
        message: message.trim(),
        signature,
        timestamp: Date.now(),
        signer: user?.walletPublicKey || null,
      };

      onMessageSigned(signedMessage);
      setLastSignedMessage(signedMessage);
      
      setMessage('');
      
      toast.success('Message signed successfully!');
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('Failed to sign message. Please try again.');
    } finally {
      setIsSigningMessage(false);
    }
  };

  const handleVerifyLastMessage = async () => {
    if (!lastSignedMessage) return;

    setIsVerifying(true);

    try {
      const result = await verifySignature(
        lastSignedMessage.message,
        lastSignedMessage.signature
      );

      const updates: Partial<SignedMessage> = {
        isVerified: result.isValid,
        signer: result.signer,
      };

      onMessageVerified(lastSignedMessage.id, updates);

      if (result.isValid) {
        toast.success('Signature verified successfully!');
      } else {
        toast.error('Signature verification failed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Failed to verify signature');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <PenTool className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Sign Message</h2>
        </div>

        <form onSubmit={handleSignMessage} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message you want to sign..."
              rows={4}
              className="input-field resize-none"
              disabled={isSigningMessage}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be cryptographically signed with your wallet
            </p>
          </div>

          <button
            type="submit"
            disabled={isSigningMessage || !message.trim()}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isSigningMessage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing...</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4" />
                <span>Sign Message</span>
              </>
            )}
          </button>
        </form>
      </div>

      {lastSignedMessage && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Last Signed Message</h3>
            <div className="flex items-center space-x-2">
              {lastSignedMessage.isVerified === true && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Verified</span>
                </div>
              )}
              {lastSignedMessage.isVerified === false && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Invalid</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Message:</p>
              <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                {lastSignedMessage.message}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Signature:</p>
              <p className="text-xs text-gray-600 bg-white p-2 rounded border font-mono break-all">
                {lastSignedMessage.signature}
              </p>
            </div>

            <button
              onClick={handleVerifyLastMessage}
              disabled={isVerifying}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Verify with Backend</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
