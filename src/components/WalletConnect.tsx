'use client'
import { useState } from 'react'
import { css } from '@/styled-system/css'
import { flex, vstack, hstack } from '@/styled-system/patterns'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

interface WalletConnectProps {
  onWalletConnected: (address: string) => void
}

const WalletConnect = ({ onWalletConnected }: WalletConnectProps) => {
  const [manualAddress, setManualAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  
  const connectWallet = async () => {
    if (typeof (window as any).ethereum === 'undefined') {
      console.error('MetaMask not detected. Please install MetaMask to connect your wallet.')
      return
    }

    try {
      setIsConnecting(true)
      
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum)
      })
      
      const [address] = await walletClient.requestAddresses()
      
      onWalletConnected(address)
      
      console.log(`Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      console.error('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }
  
  const analyzeManualAddress = () => {
    // Simple validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
      console.error('Invalid address. Please enter a valid Ethereum address')
      return
    }

    onWalletConnected(manualAddress)
  }

  return (
    <div className={vstack({ gap: '6', w: '100%', p: '4' })}>
      <div className={css({ w: '100%' })}>
        <button 
          className={css({
            bg: 'blue.500',
            color: 'white',
            fontWeight: 'bold',
            px: '4',
            py: '2',
            borderRadius: 'md',
            w: '100%',
            h: '12',
            _hover: { bg: 'blue.600' },
            _disabled: { opacity: 0.6, cursor: 'not-allowed' }
          })}
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      </div>
      
      <p className={css({ textAlign: 'center' })}>OR</p>
      
      <div className={css({ w: '100%' })}>
        <div className={hstack({ gap: '2', w: '100%' })}>
          <input 
            className={css({
              flex: '1',
              p: '2',
              borderWidth: '1px',
              borderColor: 'gray.300',
              borderRadius: 'md',
              _focus: { borderColor: 'blue.500', outline: 'none' }
            })}
            placeholder="Enter wallet address" 
            value={manualAddress} 
            onChange={(e) => setManualAddress(e.target.value)}
          />
          <button 
            className={css({
              bg: 'blue.500',
              color: 'white',
              fontWeight: 'bold',
              px: '4',
              py: '2',
              borderRadius: 'md',
              _hover: { bg: 'blue.600' }
            })}
            onClick={analyzeManualAddress}
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletConnect