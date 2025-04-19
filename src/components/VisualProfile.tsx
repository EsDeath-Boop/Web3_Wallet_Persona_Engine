import React from 'react';
import { Box, Heading, Text, Badge, Stack, Flex, Progress } from '@chakra-ui/react';
import { WalletPersona } from '../services/analytics';

interface PersonaDisplayProps {
  persona: WalletPersona | null;
  loading: boolean;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, loading }) => {
  if (loading) {
    return <Box p={4}>Loading wallet persona...</Box>;
  }

  if (!persona) {
    return <Box p={4}>No persona data available.</Box>;
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4}>Wallet Persona</Heading>
      
      {/* Summary */}
      <Text fontSize="md" mb={6}>
        {persona.summary || "No summary available."}
      </Text>
      
      {/* Category and Tags */}
      <Stack direction="row" mb={4} flexWrap="wrap">
        <Badge colorScheme="purple" fontSize="md" p={2}>
          {persona.category || "Unknown Category"}
        </Badge>
        {persona.tags?.map((tag, i) => (
          <Badge key={i} colorScheme="blue" m={1}>
            {tag}
          </Badge>
        ))}
      </Stack>
      
      {/* Risk Score */}
      <Box mb={6}>
        <Flex justify="space-between">
          <Text fontWeight="bold">Risk Score</Text>
          <Text>{persona.riskScore || 0}/100</Text>
        </Flex>
        <Progress 
          value={persona.riskScore || 0} 
          colorScheme={persona.riskScore > 75 ? "red" : persona.riskScore > 50 ? "yellow" : "green"} 
          size="sm" 
          mt={2}
        />
      </Box>
      
      {/* Traits */}
      <Heading size="md" mb={3}>Key Traits</Heading>
      <Stack spacing={3} mb={6}>
        {persona.traits?.map((trait, i) => (
          <Box key={i} p={3} borderWidth="1px" borderRadius="md">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">{trait.name}</Text>
              <Badge>{trait.score || 0}/100</Badge>
            </Flex>
            <Text fontSize="sm" mt={1}>{trait.description}</Text>
          </Box>
        ))}
      </Stack>
      
      {/* Metrics */}
      <Heading size="md" mb={3}>Wallet Metrics</Heading>
      <Stack spacing={2}>
        <Flex justify="space-between">
          <Text>Total Value</Text>
          <Text>${persona.metrics?.totalValueUSD?.toLocaleString() || 0}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>Token Diversity</Text>
          <Text>{persona.metrics?.tokenDiversity || 0} tokens</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>NFT Diversity</Text>
          <Text>{persona.metrics?.nftDiversity || 0} NFTs</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>Activity Level</Text>
          <Text>{persona.activityLevel || "Unknown"}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text>Wallet Age</Text>
          <Text>{Math.floor(persona.metrics?.oldestTransactionDays || 0)} days</Text>
        </Flex>
      </Stack>
    </Box>
  );
};

export default PersonaDisplay;
