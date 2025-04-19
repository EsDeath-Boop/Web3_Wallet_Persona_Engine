import { createPublicClient, http, Address, formatEther, Block } from "viem";
import { mainnet } from "viem/chains";
import axios from "axios";

// Initialize Viem client
const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"),
});

// Interfaces
export interface TokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  balance: string;
  decimals: number;
  balance_usd?: number;
}

export interface NFTBalance {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  contract_type: string;
  token_uri?: string;
  metadata?: any;
  image?: string;
}

export interface TransactionData {
  hash: string;
  timestamp: number;
  from_address: string;
  to_address: string;
  value: string;
  gas_price: string;
  gas_used: string;
  method?: string;
  success: boolean;
}

// ETH Balance (Viem)
export const getEthBalance = async (address: string): Promise<string> => {
  try {
    const balance = await client.getBalance({ address: address as Address });
    return formatEther(balance);
  } catch (error) {
    console.error("Error fetching ETH balance:", error);
    return "0";
  }
};

// ERC20 Token Balances (Moralis)
export const getTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/${address}/erc20`,
      {
        headers: { "X-API-Key": moralisApiKey },
        params: { chain: "eth" },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return [];
  }
};

// NFT Balances (Moralis)
export const getNFTBalances = async (address: string): Promise<NFTBalance[]> => {
  const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/${address}/nft`,
      {
        headers: { "X-API-Key": moralisApiKey },
        params: { chain: "eth", format: "decimal" },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching NFT balances:", error);
    return [];
  }
};

// Tx History (Moralis)
export const getTransactionHistory = async (address: string, limit = 100): Promise<TransactionData[]> => {
  const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
  try {
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2/${address}`,
      {
        headers: { "X-API-Key": moralisApiKey },
        params: { chain: "eth", limit },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};

// Block Data (Viem)
export const getBlock = async (blockNumber: bigint): Promise<Block> => {
  try {
    return await client.getBlock({ blockNumber });
  } catch (error) {
    console.error("Error fetching block:", error);
    throw error;
  }
};

// Covalent Transactions
export const getCovalentTransactions = async (address: string): Promise<any[]> => {
  const covalentApiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
  try {
    const response = await axios.get(
      `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/`,
      {
        params: { key: covalentApiKey },
      }
    );
    return response.data.data.items;
  } catch (error) {
    console.error("Error fetching Covalent transactions:", error);
    return [];
  }
};

// Alchemy Transfers
export const getAlchemyTransfers = async (address: string): Promise<any[]> => {
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  try {
    const response = await axios.post(
      `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock: "0x0",
            toAddress: address,
            category: ["external", "erc20", "erc721", "erc1155"],
            withMetadata: true,
          },
        ],
      }
    );
    return response.data.result.transfers;
  } catch (error) {
    console.error("Error fetching Alchemy transfers:", error);
    return [];
  }
};

// 💡 Unified Fetcher
export const getAllWalletData = async (address: string) => {
  try {
    const [
      ethBalance,
      tokenBalances,
      nftBalances,
      txHistory,
      covalentTxs,
      alchemyTransfers
    ] = await Promise.all([
      getEthBalance(address),
      getTokenBalances(address),
      getNFTBalances(address),
      getTransactionHistory(address),
      getCovalentTransactions(address),
      getAlchemyTransfers(address)
    ]);

    return {
      ethBalance,
      tokenBalances,
      nftBalances,
      txHistory,
      covalentTxs,
      alchemyTransfers
    };
  } catch (err) {
    console.error("Error fetching unified wallet data:", err);
    return null;
  }
};
