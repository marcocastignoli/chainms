"use client";

import { useAccount, useDisconnect, useEnsName } from 'wagmi';

export function WalletStatus() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  if (!isConnected || !address) return null;

  const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="wallet-connected">
      <p>
        <strong>✅ Connected:</strong> {displayName}
        {connector && <span> via {connector.name}</span>}
      </p>
      <button 
        onClick={() => disconnect()}
        className="wallet-button disconnect"
      >
        Disconnect
      </button>
    </div>
  );
}