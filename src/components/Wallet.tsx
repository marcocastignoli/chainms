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
      
    </div>
  );
}