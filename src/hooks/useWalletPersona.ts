// hooks/useWalletPersona.ts
import { useState, useEffect } from 'react';
import { getAllWalletData } from '../services/blockchain';
import { generateWalletPersona, WalletPersona } from '../services/analytics';

export function useWalletPersona(address: string | null) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any | null>(null);
  const [persona, setPersona] = useState<WalletPersona | null>(null);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all wallet data
        const data = await getAllWalletData(address);
        setWalletData(data);
        
        if (data) {
          // Generate persona
          const personaData = await generateWalletPersona(
            address,
            data.ethBalance,
            data.tokenBalances,
            data.nftBalances,
            data.txHistory,
            data.covalentTxs,
            data.alchemyTransfers
          );
          
          setPersona(personaData);
        }
      } catch (err) {
        console.error("Error in useWalletPersona:", err);
        setError("Failed to analyze wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return { walletData, persona, loading, error };
}