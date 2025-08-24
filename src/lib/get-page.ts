import type { Data } from "@measured/puck";
import { publicClient, CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract";
import { isAddress, getAddress } from "viem";

const resolveENS = async (ensName: string): Promise<string | null> => {
  try {
    const resolvedAddress = await publicClient.getEnsAddress({
      name: ensName,
    });
    return resolvedAddress;
  } catch (error) {
    console.error("Error resolving ENS:", error);
    return null;
  }
};

export const getPageFromContract = async (
  addressOrENS: string,
  identifier: string
): Promise<Data | null> => {
  try {
    let resolvedAddress: string;

    if (isAddress(addressOrENS)) {
      resolvedAddress = getAddress(addressOrENS);
    } else {
      // Try to resolve as ENS name
      const ensAddress = await resolveENS(addressOrENS);
      if (!ensAddress) {
        return null;
      }
      resolvedAddress = getAddress(ensAddress);
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "retrieve",
      args: [resolvedAddress as `0x${string}`, identifier],
    });

    if (!result || result === "") {
      return null;
    }

    return JSON.parse(result) as Data;
  } catch (error) {
    console.error("Error fetching data from contract:", error);
    return null;
  }
};
