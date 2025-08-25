import React, { useState } from 'react';
import { History, Trash2, Send, CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { SignedMessage } from '../types';
import { verifySignature } from '../services/api';

interface MessageHistoryProps {
  messages: SignedMessage[];
  isLoading: boolean;
  onClearHistory: () => void;
  onVerifyMessage: (id: string, updates: Partial<SignedMessage>) => void;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({
  messages,
  isLoading,
  onClearHistory,
  onVerifyMessage,
}) => {
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const handleVerifyMessage = async (message: SignedMessage) => {
    if (verifyingIds.has(message.id)) return;

    setVerifyingIds(prev => new Set(prev).add(message.id));

    try {
      const result = await verifySignature(message.message, message.signature);

      const updates: Partial<SignedMessage> = {
        isVerified: result.isValid,
        signer: result.signer || undefined,
      };

      onVerifyMessage(message.id, updates);

      if (result.isValid) {
        toast.success('Signature verified successfully!');
      } else {
        toast.error('Signature verification failed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Failed to verify signature');
    } finally {
      setVerifyingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all message history? This action cannot be undone.')) {
      onClearHistory();
      toast.success('Message history cleared');
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Message History</h2>
          <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
            {messages.length}
          </span>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No signed messages yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Sign your first message to see it appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4 message-history-container h-96 overflow-y-auto overflow-x-hidden min-h-0 pr-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimestamp(message.timestamp)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {message.isVerified === true && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                  {message.isVerified === false && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Invalid</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">Message:</p>
                    <button
                      onClick={() => handleCopyToClipboard(message.message, 'Message')}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                    {message.message}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">Signature:</p>
                    <button
                      onClick={() => handleCopyToClipboard(message.signature, 'Signature')}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy signature"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 bg-white p-2 rounded border font-mono break-all">
                    {message.signature}
                  </p>
                </div>

                {message.signer && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">Signer:</p>
                      <button
                        onClick={() => handleCopyToClipboard(message.signer!, 'Signer address')}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy signer address"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 bg-white p-2 rounded border font-mono">
                      {message.signer}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleVerifyMessage(message)}
                  disabled={verifyingIds.has(message.id)}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  {verifyingIds.has(message.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
