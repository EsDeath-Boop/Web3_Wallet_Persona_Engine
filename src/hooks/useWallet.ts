'use client'
import { useState, useEffect } from 'react'
import {
  getTokenBalances,
  getNFTBalances,
  getTransactionHistory,
  getEthBalance,
  TokenBalance,
  NFTBalance,
  TransactionData
} from '@/services/blockchain'

interface WalletData {
  address: string
  ethBalance: string
  tokenBalances: TokenBalance[]
  nftBalances: NFTBalance[]
  transactions: TransactionData[]
  isLoading: boolean
  error: string | null
}

export const useWallet = (walletAddress: string | null) => {
  const [walletData, setWalletData] = useState<WalletData>({
    address: '',
    ethBalance: '0',
    tokenBalances: [],
    nftBalances: [],
    transactions: [],
    isLoading: false,
    error: null
  })

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!walletAddress) return

      setWalletData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const [ethBalance, tokenBalances, nftBalances, transactions] = await Promise.all([
          getEthBalance(walletAddress),
          getTokenBalances(walletAddress),
          getNFTBalances(walletAddress),
          getTransactionHistory(walletAddress)
        ])

        setWalletData({
          address: walletAddress,
          ethBalance,
          tokenBalances,
          nftBalances,
          transactions,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        setWalletData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch wallet data. Please try again.'
        }))
      }
    }

    fetchWalletData()
  }, [walletAddress])

  return walletData
}