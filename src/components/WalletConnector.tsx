"use client";

import { useAccount, useConnect, useConnectors } from 'wagmi';

export function WalletConnector() {
  const { connect, isPending, error } = useConnect();
  const { isConnected } = useAccount();
  const connectors = useConnectors();

  if (isConnected) return null;

  const getConnectorIcon = (connectorName: string) => {
    if (connectorName.toLowerCase().includes('metamask')) return '🦊';
    if (connectorName.toLowerCase().includes('rabby')) return '🐰';
    if (connectorName.toLowerCase().includes('coinbase')) return '🔵';
    return '💳';
  };

  const getConnectorClass = (connectorName: string) => {
    if (connectorName.toLowerCase().includes('metamask')) return 'metamask';
    if (connectorName.toLowerCase().includes('rabby')) return 'rabby';
    if (connectorName.toLowerCase().includes('coinbase')) return 'coinbase';
    return 'primary';
  };

  return (
    <div>
      <p>Connect your wallet to access blockchain features:</p>
      
      {error && (
        <div className="error-message">
          Connection failed: {error.message}
        </div>
      )}
      
      <div className="wallet-connectors">
        {connectors.filter(c => c.name !== 'Injected').map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className={`wallet-button ${getConnectorClass(connector.name)}`}
          >
            <span>{getConnectorIcon(connector.name)}</span>
            {isPending ? 'Connecting...' : `Connect ${connector.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}