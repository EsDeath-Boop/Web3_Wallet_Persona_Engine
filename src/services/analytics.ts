// services/analytics.ts
import { TokenBalance, NFTBalance, TransactionData } from './blockchain';

// Define persona types
export interface WalletPersona {
  walletAddress: string;
  category: WalletCategory;
  traits: WalletTrait[];
  metrics: WalletMetrics;
  summary: string;
  tags: string[];
  riskScore: number;
  activityLevel: ActivityLevel;
}

export type WalletCategory = 'Trader' | 'Collector' | 'Hodler' | 'DeFi User' | 'DAO Participant' | 'Developer' | 'Whale' | 'Newbie';
export type ActivityLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Dormant';

export interface WalletTrait {
  name: string;
  score: number; // 0-100
  description: string;
}

export interface WalletMetrics {
  totalValueUSD: number;
  tokenDiversity: number;
  nftDiversity: number;
  transactionFrequency: number; // Avg txs per day
  avgTransactionValue: number;
  oldestTransactionDays: number;
  uniqueContractsInteracted: number;
  protocolsUsed: Record<string, number>; // Protocol name -> interaction count
}

// Main function to analyze wallet data and generate a persona
export async function generateWalletPersona(
  address: string,
  ethBalance: string,
  tokenBalances: TokenBalance[],
  nftBalances: NFTBalance[],
  txHistory: TransactionData[],
  covalentTxs: any[],
  alchemyTransfers: any[]
): Promise<WalletPersona> {
  // Calculate metrics
  const metrics = calculateWalletMetrics(
    ethBalance,
    tokenBalances,
    nftBalances,
    txHistory,
    covalentTxs
  );
  
  // Determine primary category
  const category = determineWalletCategory(metrics, nftBalances.length, txHistory);
  
  // Extract traits
  const traits = extractWalletTraits(
    metrics,
    tokenBalances,
    nftBalances,
    txHistory,
    alchemyTransfers
  );
  
  // Calculate risk score
  const riskScore = calculateRiskScore(metrics, tokenBalances, txHistory);
  
  // Determine activity level
  const activityLevel = determineActivityLevel(txHistory);
  
  // Generate tags
  const tags = generateTags(category, traits, metrics, nftBalances);
  
  // Generate summary
  const summary = generatePersonaSummary(
    address,
    category,
    traits,
    metrics,
    activityLevel,
    riskScore
  );
  
  return {
    walletAddress: address,
    category,
    traits,
    metrics,
    summary,
    tags,
    riskScore,
    activityLevel
  };
}

// Calculate metrics from wallet data
function calculateWalletMetrics(
  ethBalance: string,
  tokenBalances: TokenBalance[],
  nftBalances: NFTBalance[],
  txHistory: TransactionData[],
  covalentTxs: any[]
): WalletMetrics {
  // Calculate total value in USD
  const ethValueUSD = parseFloat(ethBalance) * 3500; // Example ETH price - would need real price feed
  const tokenValueUSD = tokenBalances.reduce((sum, token) => sum + (token.balance_usd || 0), 0);
  const totalValueUSD = ethValueUSD + tokenValueUSD;
  
  // Calculate token diversity (Shannon entropy would be ideal)
  const tokenDiversity = tokenBalances.length;
  
  // Calculate NFT diversity
  const nftDiversity = nftBalances.length;
  
  // Calculate transaction frequency (txs per day)
  let transactionFrequency = 0;
  if (txHistory.length > 1) {
    const oldestTxTimestamp = txHistory[txHistory.length - 1].timestamp;
    const newestTxTimestamp = txHistory[0].timestamp;
    const timeSpanDays = (newestTxTimestamp - oldestTxTimestamp) / 86400;
    transactionFrequency = timeSpanDays > 0 ? txHistory.length / timeSpanDays : 0;
  }
  
  // Calculate average transaction value
  const txValues = txHistory.map(tx => parseFloat(tx.value) / 10**18); // Convert from Wei to ETH
  const avgTransactionValue = txValues.length > 0 
    ? txValues.reduce((sum, val) => sum + val, 0) / txValues.length 
    : 0;
  
  // Calculate days since oldest transaction
  const oldestTxTimestamp = txHistory.length > 0 ? txHistory[txHistory.length - 1].timestamp : Date.now() / 1000;
  const oldestTransactionDays = (Date.now() / 1000 - oldestTxTimestamp) / 86400;
  
  // Calculate unique contracts interacted with
  const uniqueContracts = new Set();
  txHistory.forEach(tx => {
    if (tx.to_address) uniqueContracts.add(tx.to_address.toLowerCase());
  });
  const uniqueContractsInteracted = uniqueContracts.size;
  
  // Analyze protocol usage (would need a database of known protocol contracts)
  const protocolAddresses: Record<string, string> = {
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2',
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3',
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff': 'OpenSea',
    '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea Seaport',
    '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41': 'Ethereum Name Service',
    // Add more known protocol addresses
  };
  
  const protocolsUsed: Record<string, number> = {};
  txHistory.forEach(tx => {
    if (!tx.to_address) return;
    
    const toAddressLower = tx.to_address.toLowerCase();
    const protocol = protocolAddresses[toAddressLower];
    if (protocol) {
      protocolsUsed[protocol] = (protocolsUsed[protocol] || 0) + 1;
    }
  });
  
  return {
    totalValueUSD,
    tokenDiversity,
    nftDiversity,
    transactionFrequency,
    avgTransactionValue,
    oldestTransactionDays,
    uniqueContractsInteracted,
    protocolsUsed
  };
}

// Determine the primary wallet category
function determineWalletCategory(
  metrics: WalletMetrics,
  nftCount: number,
  txHistory: TransactionData[]
): WalletCategory {
  // Calculate scores for each category
  let scores: Record<WalletCategory, number> = {
    'Trader': 0,
    'Collector': 0,
    'Hodler': 0,
    'DeFi User': 0,
    'DAO Participant': 0, 
    'Developer': 0,
    'Whale': 0,
    'Newbie': 0
  };
  
  // Default to Newbie if very little activity
  if (txHistory.length < 5) {
    return 'Newbie';
  }
  
  // Check for Whale status first (high value)
  if (metrics.totalValueUSD > 1000000) {
    scores['Whale'] += 50;
  } else if (metrics.totalValueUSD > 100000) {
    scores['Whale'] += 20;
  }
  
  // Trader characteristics
  if (metrics.transactionFrequency > 5) scores['Trader'] += 30;
  if (metrics.transactionFrequency > 2) scores['Trader'] += 15;
  if (metrics.tokenDiversity > 20) scores['Trader'] += 20;
  
  // Collector characteristics
  if (nftCount > 50) scores['Collector'] += 40;
  if (nftCount > 10) scores['Collector'] += 20;
  
  // Hodler characteristics
  if (metrics.oldestTransactionDays > 365 && metrics.transactionFrequency < 0.5) {
    scores['Hodler'] += 30;
  }
  
  // DeFi User characteristics
  const defiProtocols = ['Uniswap', 'Aave', 'Compound', 'Curve', 'Balancer'];
  let defiInteractions = 0;
  Object.entries(metrics.protocolsUsed).forEach(([protocol, count]) => {
    if (defiProtocols.some(p => protocol.includes(p))) {
      defiInteractions += count;
    }
  });
  
  if (defiInteractions > 50) scores['DeFi User'] += 40;
  if (defiInteractions > 10) scores['DeFi User'] += 20;
  
  // Developer characteristics - look for contract deployments
  const contractDeployments = txHistory.filter(tx => 
    tx.to_address === '0x0000000000000000000000000000000000000000' && 
    parseFloat(tx.value) === 0
  );
  if (contractDeployments.length > 0) scores['Developer'] += 40;
  
  // Find highest score
  let highestCategory: WalletCategory = 'Newbie';
  let highestScore = 0;
  
  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score;
      highestCategory = category as WalletCategory;
    }
  });
  
  return highestCategory;
}

// Extract key traits from wallet data
function extractWalletTraits(
  metrics: WalletMetrics,
  tokenBalances: TokenBalance[],
  nftBalances: NFTBalance[],
  txHistory: TransactionData[],
  alchemyTransfers: any[]
): WalletTrait[] {
  const traits: WalletTrait[] = [];
  
  // Early adopter trait
  if (metrics.oldestTransactionDays > 1825) { // > 5 years
    traits.push({
      name: 'Early Adopter',
      score: 100,
      description: 'Has been in crypto for over 5 years'
    });
  } else if (metrics.oldestTransactionDays > 1095) { // > 3 years
    traits.push({
      name: 'Early Adopter',
      score: 80,
      description: 'Has been in crypto for over 3 years'
    });
  }
  
  // Diamond hands
  if (metrics.oldestTransactionDays > 365 && metrics.transactionFrequency < 0.5) {
    traits.push({
      name: 'Diamond Hands',
      score: 90,
      description: 'Holds assets for long periods without frequent trading'
    });
  }
  
  // NFT enthusiast
  if (nftBalances.length > 20) {
    traits.push({
      name: 'NFT Enthusiast',
      score: 85,
      description: 'Collects and holds multiple NFTs'
    });
  }
  
  // Diversified portfolio
  if (tokenBalances.length > 15) {
    traits.push({
      name: 'Diversified',
      score: 75,
      description: 'Maintains a diverse token portfolio'
    });
  }
  
  // High volume trader
  if (metrics.transactionFrequency > 5) {
    traits.push({
      name: 'Active Trader',
      score: 80,
      description: 'Frequently trades assets on-chain'
    });
  }
  
  // DeFi power user
  const defiProtocols = ['Uniswap', 'Aave', 'Compound', 'Curve', 'Balancer'];
  let defiInteractions = 0;
  Object.entries(metrics.protocolsUsed).forEach(([protocol, count]) => {
    if (defiProtocols.some(p => protocol.includes(p))) {
      defiInteractions += count;
    }
  });
  
  if (defiInteractions > 50) {
    traits.push({
      name: 'DeFi Power User',
      score: 90,
      description: 'Highly active in decentralized finance protocols'
    });
  }
  
  // Gas optimizer trait (checks if they use low gas prices consistently)
  // Would need more sophisticated analysis
  
  return traits;
}

// Calculate risk score
function calculateRiskScore(
  metrics: WalletMetrics,
  tokenBalances: TokenBalance[],
  txHistory: TransactionData[]
): number {
  let riskScore = 50; // Start with medium risk
  
  // Less diversity = higher risk
  if (metrics.tokenDiversity < 3) riskScore += 10;
  if (metrics.tokenDiversity > 10) riskScore -= 10;
  
  // High concentration in one token = higher risk
  if (tokenBalances.length > 0) {
    const highestBalance = Math.max(...tokenBalances.map(t => t.balance_usd || 0));
    const totalValue = tokenBalances.reduce((sum, t) => sum + (t.balance_usd || 0), 0);
    
    if (highestBalance / totalValue > 0.8 && totalValue > 1000) {
      riskScore += 15;
    }
  }
  
  // Interacting with many contracts = potentially higher risk
  if (metrics.uniqueContractsInteracted > 50) riskScore += 10;
  
  // Very high transaction frequency might indicate higher risk behavior
  if (metrics.transactionFrequency > 10) riskScore += 5;
  
  // Newer wallets are higher risk
  if (metrics.oldestTransactionDays < 90) riskScore += 15;
  if (metrics.oldestTransactionDays > 730) riskScore -= 10;
  
  // Cap at 0-100
  return Math.max(0, Math.min(100, riskScore));
}

// Determine activity level
function determineActivityLevel(txHistory: TransactionData[]): ActivityLevel {
  if (txHistory.length === 0) return 'Dormant';
  
  const latestTx = txHistory[0];
  const now = Date.now() / 1000;
  const daysSinceLastTx = (now - latestTx.timestamp) / 86400;
  
  if (daysSinceLastTx > 180) return 'Dormant';
  if (daysSinceLastTx > 30) return 'Low';
  
  // For active wallets, check frequency
  if (txHistory.length >= 2) {
    const oldestTx = txHistory[txHistory.length - 1];
    const daysActive = (latestTx.timestamp - oldestTx.timestamp) / 86400;
    
    if (daysActive > 0) {
      const txPerDay = txHistory.length / daysActive;
      
      if (txPerDay > 5) return 'Very High';
      if (txPerDay > 1) return 'High';
      if (txPerDay > 0.2) return 'Medium';
    }
  }
  
  return 'Low';
}

// Generate tags for the wallet
function generateTags(
  category: WalletCategory,
  traits: WalletTrait[],
  metrics: WalletMetrics,
  nftBalances: NFTBalance[]
): string[] {
  const tags: string[] = [category];
  
  // Add trait-based tags
  traits.forEach(trait => {
    if (trait.score > 70) {
      tags.push(trait.name);
    }
  });
  
  // Add value-based tags
  if (metrics.totalValueUSD > 1000000) tags.push('Whale');
  else if (metrics.totalValueUSD > 100000) tags.push('High Value');
  
  // Add activity-based tags
  if (metrics.transactionFrequency > 5) tags.push('Highly Active');
  if (metrics.oldestTransactionDays > 1095) tags.push('Long-term User'); // > 3 years
  
  // Add NFT-based tags
  if (nftBalances.length > 0) {
    tags.push('NFT Owner');
    if (nftBalances.length > 20) tags.push('NFT Collector');
  }
  
  // Add protocol-specific tags
  Object.entries(metrics.protocolsUsed).forEach(([protocol, count]) => {
    if (count > 10) {
      tags.push(`${protocol} User`);
    }
  });
  
  return [...new Set(tags)]; // Remove duplicates
}

// Generate a summary description
function generatePersonaSummary(
  address: string,
  category: WalletCategory,
  traits: WalletTrait[],
  metrics: WalletMetrics,
  activityLevel: ActivityLevel,
  riskScore: number
): string {
  // Create intro based on category
  let summary = `This wallet is primarily a ${category} with ${activityLevel.toLowerCase()} activity levels. `;
  
  // Add portfolio size
  if (metrics.totalValueUSD > 1000000) {
    summary += 'It holds a substantial portfolio worth over $1M. ';
  } else if (metrics.totalValueUSD > 100000) {
    summary += 'It holds a significant portfolio worth over $100K. ';
  } else if (metrics.totalValueUSD > 10000) {
    summary += 'It holds a moderate portfolio worth over $10K. ';
  } else {
    summary += 'It holds a smaller portfolio under $10K. ';
  }
  
  // Add experience
  if (metrics.oldestTransactionDays > 1825) { // > 5 years
    summary += 'The wallet has been active for over 5 years, indicating an early crypto adopter. ';
  } else if (metrics.oldestTransactionDays > 1095) { // > 3 years
    summary += 'The wallet has been active for over 3 years, showing considerable experience. ';
  } else if (metrics.oldestTransactionDays > 365) { // > 1 year
    summary += 'The wallet has been active for over a year. ';
  } else {
    summary += 'The wallet is relatively new to the ecosystem. ';
  }
  
  // Add key traits
  if (traits.length > 0) {
    const topTraits = traits
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(t => t.name.toLowerCase());
      
    if (topTraits.length === 2) {
      summary += `Notable characteristics include being ${topTraits[0]} and ${topTraits[1]}. `;
    } else if (topTraits.length === 1) {
      summary += `A notable characteristic is being ${topTraits[0]}. `;
    }
  }
  
  // Add risk assessment
  if (riskScore > 75) {
    summary += 'The wallet exhibits high-risk behavior. ';
  } else if (riskScore < 25) {
    summary += 'The wallet exhibits conservative, low-risk behavior. ';
  }
  
  // Add protocol usage
  const topProtocols = Object.entries(metrics.protocolsUsed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
    
  if (topProtocols.length > 0) {
    summary += `Frequently interacts with ${topProtocols.join(', ')}. `;
  }
  
  return summary.trim();
}