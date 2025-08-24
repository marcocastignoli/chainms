import { createConfig, http } from "wagmi";
import { mainnet, optimism, arbitrum, polygon, base } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [optimism, mainnet, arbitrum, polygon, base],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: "ChainMS",
    }),
  ],
  transports: {
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});
