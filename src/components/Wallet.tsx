"use client";

import { WalletStatus } from './WalletStatus';
import { WalletConnector } from './WalletConnector';
import { ChainSelector } from './ChainSelector';
import { useAccount } from 'wagmi';

export function Wallet() {
  const { isConnected } = useAccount();

  return (
    <div className="wallet-container">
      <WalletStatus />
      <WalletConnector />
      {isConnected && <ChainSelector />}
      
      <div className="help-section">
        <details className="help-details">
          <summary>Need help connecting?</summary>
          <div className="help-content">
            <p><strong>Supported wallets:</strong></p>
            <ul>
              <li><strong>Browser Extensions:</strong> MetaMask, Rabby, Rainbow, Phantom, etc.</li>
              <li><strong>Coinbase Wallet:</strong> Browser extension and mobile app via QR code</li>
              <li><strong>Any EIP-6963 compatible wallet</strong> installed in your browser</li>
            </ul>
            <p><strong>Troubleshooting:</strong></p>
            <ul>
              <li>Make sure your wallet is unlocked and has at least one account</li>
              <li>Try refreshing the page if connection fails</li>
              <li>Check that you&apos;re on the correct network</li>
              <li>Disable other wallet extensions if you have conflicts</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}