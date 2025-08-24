import { createPublicClient, http, Address } from "viem";
import { optimism } from "viem/chains";

export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "addressesData",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "string",
        name: "identifier",
        type: "string",
      },
    ],
    name: "retrieve",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "identifier",
        type: "string",
      },
      {
        internalType: "string",
        name: "data",
        type: "string",
      },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const CONTRACT_ADDRESS =
  "0x66F01B8aCF9850774946CeA885f607BA8Af995e6" as Address; // Replace with actual contract address

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});
