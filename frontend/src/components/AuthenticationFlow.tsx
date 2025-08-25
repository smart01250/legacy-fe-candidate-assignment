import React, { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Mail, Loader2, Shield, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthenticationFlow: React.FC = () => {
  const {
    auth,
    user,
    primaryWallet,
    isAuthenticated,
    handleLogOut
  } = useDynamicContext();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'authenticated'>('email');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting headless Dynamic.xyz email authentication for:', email);

      await auth.email.sendOTP({ email: email.trim() });

      setStep('otp');
      toast.success('✅ OTP sent to your email! Check your inbox.');

    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Verifying OTP for headless authentication...');

      await auth.email.verifyOTP({
        email: email.trim(),
        otp: otp.trim()
      });

      setStep('authenticated');
      toast.success('✅ Authentication successful! Embedded wallet created.');

    } catch (error: any) {
      console.error('OTP verification failed:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await handleLogOut();
      setStep('email');
      setEmail('');
      setOtp('');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  if (isAuthenticated && user && primaryWallet) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ✅ Wallet Connected
          </h2>
          <p className="text-gray-600">
            Your embedded wallet is ready to use
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-sm mb-1">Email</p>
            <p className="text-gray-900 font-mono text-sm">{user.email}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-sm mb-1">Wallet Address</p>
            <p className="text-gray-900 font-mono text-sm break-all">{primaryWallet.address}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔐 Headless Authentication
        </h2>
        <p className="text-gray-600">
          {step === 'email' ? 'Enter your email for OTP authentication' : 'Enter the OTP sent to your email'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Send OTP</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              required
            />
            <p className="text-gray-500 text-sm mt-2 text-center">
              Check your email inbox for the 6-digit code
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
              }}
              className="flex-1 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Powered by Dynamic.xyz • Headless Email Authentication
        </p>
      </div>
    </div>
  );
};
