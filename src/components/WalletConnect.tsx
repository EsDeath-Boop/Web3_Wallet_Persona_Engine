'use client'
import { useState } from 'react'
import { Button, Input, Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

interface WalletConnectProps {
  onWalletConnected: (address: string) => void
}

const WalletConnect = ({ onWalletConnected }: WalletConnectProps) => {
  const [manualAddress, setManualAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const toast = useToast()

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask not detected',
        description: 'Please install MetaMask to connect your wallet.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      setIsConnecting(true)
      
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      })
      
      const [address] = await walletClient.requestAddresses()
      
      onWalletConnected(address)
      
      toast({
        title: 'Wallet connected',
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection failed',
        description: 'Failed to connect wallet. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const analyzeManualAddress = () => {
    // Simple validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid Ethereum address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    onWalletConnected(manualAddress)
  }

  return (
    <VStack spacing={6} w="100%" p={4}>
      <Box w="100%">
        <Button 
          colorScheme="blue" 
          onClick={connectWallet} 
          isLoading={isConnecting}
          size="lg"
          width="100%"
        >
          Connect MetaMask
        </Button>
      </Box>
      
      <Text align="center">OR</Text>
      
      <Box w="100%">
        <HStack>
          <Input 
            placeholder="Enter wallet address" 
            value={manualAddress} 
            onChange={(e) => setManualAddress(e.target.value)}
          />
          <Button onClick={analyzeManualAddress} colorScheme="blue">
            Analyze
          </Button>
        </HStack>
      </Box>
    </VStack>
  )
}

export default WalletConnect