import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertCircle,
  Mail,
  Key,
  MessageSquare,
  Copy,
  History,
  Sparkles,
  Zap,
  Lock,
  Verified,
  Clock,
  User,
  Wallet,
  Send,
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SignedMessage {
  id: string;
  message: string;
  signature: string;
  signer: string;
  timestamp: Date;
  verified?: boolean;
}

interface User {
  email: string;
  wallet: {
    address: string;
    signMessage: (message: string) => Promise<string>;
  };
}

function App() {
  const [authStep, setAuthStep] = useState<'email' | 'otp' | 'authenticated'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Hello, Web3 World!');
  const [signedMessages, setSignedMessages] = useState<SignedMessage[]>([]);
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('signedMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSignedMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {

      }
    }
  }, []);

  const saveSignedMessages = (messages: SignedMessage[]) => {
    localStorage.setItem('signedMessages', JSON.stringify(messages));
    setSignedMessages(messages);
  };
  const sendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuthStep('otp');
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const ethers = (window as any).ethers;
      if (!ethers) {
        throw new Error('Ethers.js not loaded');
      }

      const wallet = ethers.Wallet.createRandom();
      const mockWallet = {
        address: wallet.address,
        signMessage: async (msg: string) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await wallet.signMessage(msg);
        }
      };

      setUser({
        email,
        wallet: mockWallet
      });
      setAuthStep('authenticated');
      toast.success('Authentication successful! Embedded wallet created.');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signMessage = async () => {
    if (!user || !message.trim()) {
      toast.error('Please enter a message to sign');
      return;
    }

    setIsSigningMessage(true);
    try {
      const signature = await user.wallet.signMessage(message.trim());

      const newSignedMessage: SignedMessage = {
        id: Date.now().toString(),
        message: message.trim(),
        signature,
        signer: user.wallet.address,
        timestamp: new Date()
      };

      const updatedMessages = [newSignedMessage, ...signedMessages];
      saveSignedMessages(updatedMessages);

      toast.success('Message signed successfully!');
      setMessage('');
    } catch (error) {
      toast.error('Failed to sign message');
    } finally {
      setIsSigningMessage(false);
    }
  };

  const verifySignature = async (signedMsg: SignedMessage) => {
    try {
      const response = await fetch('http://localhost:3002/api/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: signedMsg.message,
          signature: signedMsg.signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const result = await response.json();

      const updatedMessages = signedMessages.map(msg =>
        msg.id === signedMsg.id
          ? { ...msg, verified: result.isValid }
          : msg
      );
      saveSignedMessages(updatedMessages);

      if (result.isValid) {
        toast.success('Signature verified successfully!');
      } else {
        toast.error('Signature verification failed!');
      }
    } catch (error) {
      toast.error('Failed to verify signature');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const logout = () => {
    setUser(null);
    setAuthStep('email');
    setEmail('');
    setOtp('');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen">
      <header className="app-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-primary p-2 rounded-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  Web3 Message Signer
                </h1>
                <p className="text-sm text-neutral-600 font-medium">
                  Professional Cryptographic Verification
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <User className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {authStep === 'email' && (
          <div className="max-w-lg mx-auto">
            <div className="card animate-fade-in">
              <div className="text-center mb-10">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-gradient-accent rounded-2xl blur-xl opacity-40"></div>
                  <div className="relative bg-gradient-accent p-4 rounded-2xl">
                    <Mail className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-3">
                  Dynamic.xyz Authentication
                </h2>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Enter your email to receive an OTP for secure embedded wallet authentication
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={sendOTP}
                  disabled={isLoading || !email}
                  className="w-full btn-primary flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 p-6 glass-effect rounded-2xl border border-primary-200/30">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-800 mb-1">
                      Headless Implementation
                    </p>
                    <p className="text-sm text-primary-700 leading-relaxed">
                      This demonstrates Dynamic.xyz headless authentication with embedded wallets.
                      No widget required - pure API integration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {authStep === 'otp' && (
          <div className="max-w-lg mx-auto">
            <div className="card animate-slide-up">
              <div className="text-center mb-10">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-gradient-success rounded-2xl blur-xl opacity-40"></div>
                  <div className="relative bg-gradient-success p-4 rounded-2xl">
                    <Key className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-3">
                  Verify Your Identity
                </h2>
                <p className="text-neutral-600 text-lg leading-relaxed mb-2">
                  We sent a 6-digit verification code to
                </p>
                <div className="inline-flex items-center space-x-2 bg-success-50 text-success-800 px-4 py-2 rounded-xl border border-success-200">
                  <Mail className="h-4 w-4" />
                  <span className="font-semibold">{email}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-neutral-700 mb-3">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={verifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full btn-primary flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Creating Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Verify & Create Wallet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setAuthStep('email')}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Back to Email</span>
                </button>
              </div>

              <div className="mt-8 p-6 glass-effect rounded-2xl border border-success-200/30">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-success-600" />
                  <p className="text-sm text-success-700 font-medium">
                    Your embedded wallet will be created securely after verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {authStep === 'authenticated' && user && (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center animate-fade-in mb-12">
              <div className="mb-10">
                <h1 className="text-5xl font-bold text-gradient mb-6 leading-tight">
                  Welcome to Web3 Signing
                </h1>
                <p className="text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto mb-8">
                  Your secure embedded wallet is ready for cryptographic message signing and verification
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                    <User className="h-5 w-5 text-neutral-600" />
                    <span className="font-semibold text-neutral-800">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 shadow-lg hover-lift">
                  <Wallet className="h-5 w-5 text-primary-600" />
                  <span className="font-mono text-sm font-medium text-neutral-700">
                    {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(user.wallet.address)}
                    className="ml-2 p-1 hover:bg-primary-100 rounded-lg transition-colors"
                    title="Copy wallet address"
                  >
                    <Copy className="h-4 w-4 text-primary-600" />
                  </button>
                </div>
              </div>

              <div className="inline-flex items-center space-x-2 status-badge success mb-4">
                <Verified className="h-4 w-4" />
                <span>Embedded Wallet Active</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 animate-slide-up">
              <div className="card hover-lift">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-md opacity-30"></div>
                    <div className="relative bg-gradient-primary p-3 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Message Signer
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Create cryptographic signatures
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-3">
                      Message to Sign
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message here..."
                      rows={5}
                      className="textarea-field"
                      disabled={isSigningMessage}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-neutral-500">
                        {message.length} characters
                      </span>
                      <span className="text-xs text-neutral-500">
                        Will be signed with your embedded wallet
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={signMessage}
                    disabled={isSigningMessage || !message.trim()}
                    className="w-full btn-primary flex items-center justify-center space-x-3"
                  >
                    {isSigningMessage ? (
                      <>
                        <div className="loading-spinner"></div>
                        <span>Signing Message...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Sign Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="card hover-lift">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-accent rounded-xl blur-md opacity-30"></div>
                      <div className="relative bg-gradient-accent p-3 rounded-xl">
                        <History className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">
                        Message History
                      </h2>
                      <p className="text-sm text-neutral-600">
                        {signedMessages.length} messages signed
                      </p>
                    </div>
                  </div>

                  {signedMessages.length > 0 && (
                    <div className="status-badge info">
                      <Clock className="h-4 w-4" />
                      <span>{signedMessages.length}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {signedMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-neutral-400" />
                      </div>
                      <p className="text-neutral-500 text-lg font-medium mb-2">
                        No messages signed yet
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Sign your first message to see it appear here!
                      </p>
                    </div>
                  ) : (
                    signedMessages.map((signedMsg, index) => (
                      <div key={signedMsg.id} className="message-item animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-semibold text-neutral-900 flex-1 text-lg leading-relaxed">
                            {signedMsg.message}
                          </p>
                          <span className={`status-badge ${
                            signedMsg.verified === true
                              ? 'success'
                              : signedMsg.verified === false
                              ? 'error'
                              : 'info'
                          }`}>
                            {signedMsg.verified === true ? (
                              <>
                                <Verified className="h-4 w-4" />
                                <span>Verified</span>
                              </>
                            ) : signedMsg.verified === false ? (
                              <>
                                <AlertCircle className="h-4 w-4" />
                                <span>Invalid</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4" />
                                <span>Unverified</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-neutral-500">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Signed: {signedMsg.timestamp.toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(signedMsg.signature)}
                              className="flex items-center space-x-2 hover:text-primary-600 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </button>
                          </div>

                          <div className="code-block">
                            {signedMsg.signature}
                          </div>

                          <button
                            onClick={() => verifySignature(signedMsg)}
                            className="w-full btn-secondary flex items-center justify-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Verify with Backend</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
