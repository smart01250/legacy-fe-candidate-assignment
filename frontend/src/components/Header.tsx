import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { LogOut, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, handleLogOut } = useDynamicContext();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Web3 Message Signer
            </h1>
          </div>

          {isAuthenticated && user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Connected</span>
              </div>
              
              <button
                onClick={handleLogOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
