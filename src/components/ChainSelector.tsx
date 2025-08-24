"use client";

import { useSwitchChain, useChainId } from 'wagmi';

export function ChainSelector() {
  const chainId = useChainId();
  const { chains, switchChain, isPending } = useSwitchChain();

  return (
    <div className="chain-selector">
      <h3>Select Network</h3>
      <div className="chain-buttons">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
            disabled={isPending}
            className={`chain-button ${chainId === chain.id ? 'active' : ''}`}
          >
            {chain.name}
          </button>
        ))}
      </div>
      {isPending && <p>Switching network...</p>}
    </div>
  );
}