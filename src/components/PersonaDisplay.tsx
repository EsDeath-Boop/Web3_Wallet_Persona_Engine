import React from 'react';
import { useWalletPersona } from '../hooks/useWalletPersona';
import { WalletPersona, WalletTrait } from '../services/analytics';

interface PersonaDisplayProps {
  address?: string;
  className?: string;
  persona?: WalletPersona | null;
  loading?: boolean;
  error?: string | null;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ address, className = '' , persona, loading, error}) => {
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-100 rounded-lg shadow ${className}`}>
        <div className="animate-pulse text-center">
          <div className="h-16 w-16 mx-auto bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-1/2 mx-auto"></div>
          <p className="mt-4 text-blue-500">Analyzing on-chain activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <h3 className="text-red-600 font-medium mb-2">Unable to analyze wallet</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <p className="text-gray-500">Connect your wallet to view your on-chain persona</p>
      </div>
    );
  }

  return (
    <div className={`persona-container bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header with category/profile type and address */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-white/20 h-16 w-16 flex items-center justify-center text-white text-2xl font-bold">
            {persona.walletAddress ? persona.walletAddress.substring(0, 2) : '??'}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">{persona.category || "Crypto Explorer"}</h2>
            <p className="text-white/70 text-sm">
              {persona.walletAddress ?
                `${persona.walletAddress.substring(0, 6)}...${persona.walletAddress.substring(persona.walletAddress.length - 4)}` :
                'No address connected'}
            </p>
          </div>
        </div>

        {persona.summary && (
          <div className="text-white/90 text-sm italic">
            &quot;{persona.summary}&quot;
          </div>
        )}
      </div>

      {/* Stats and metrics */}
      <div className="p-6">
        {/* Activity level */}
        {persona.activityLevel && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Activity Level</h3>
            <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full ${getActivityColorClass(persona.activityLevel)}`}
                style={{ width: `${getActivityPercentage(persona.activityLevel)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Dormant</span>
              <span className="font-medium">{persona.activityLevel}</span>
              <span>Very High</span>
            </div>
          </div>
        )}

        {/* Key metrics */}
        {persona.metrics && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Portfolio Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 uppercase">Portfolio Value</h4>
                <p className="text-lg font-medium">${formatNumber(persona.metrics.totalValueUSD)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 uppercase">Token Types</h4>
                <p className="text-lg font-medium">{persona.metrics.tokenDiversity}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 uppercase">NFT Count</h4>
                <p className="text-lg font-medium">{persona.metrics.nftDiversity}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs text-gray-500 uppercase">Contracts Interacted</h4>
                <p className="text-lg font-medium">{persona.metrics.uniqueContractsInteracted}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top traits */}
        {persona.traits && persona.traits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Key Traits</h3>
            <div className="space-y-3">
              {persona.traits.slice(0, 3).map((trait, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{trait.name}</h4>
                    <span className="text-sm text-gray-500">{trait.score}/100</span>
                  </div>
                  <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-indigo-500"
                      style={{ width: `${trait.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {persona.tags && persona.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Behavior Tags</h3>
            <div className="flex flex-wrap gap-2">
              {persona.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Protocol usage */}
        {persona.metrics && persona.metrics.protocolsUsed && Object.keys(persona.metrics.protocolsUsed).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Protocol Usage</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {Object.entries(persona.metrics.protocolsUsed)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([protocol, count], index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-200">
                    <span className="font-medium">{protocol}</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full">{count} interactions</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Risk assessment */}
        {persona.riskScore !== undefined && (
          <div className="p-4 border rounded-lg border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm uppercase text-gray-500 font-medium">Risk Assessment</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelClass(persona.riskScore)}`}>
                {getRiskLevel(persona.riskScore)}
              </span>
            </div>
            <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className={`absolute top-0 left-0 h-full ${getRiskColorClass(persona.riskScore)}`}
                style={{ width: `${persona.riskScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getRiskDescription(persona.riskScore)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getActivityColorClass = (level: string): string => {
  switch (level) {
    case 'Very High': return 'bg-green-500';
    case 'High': return 'bg-green-400';
    case 'Medium': return 'bg-yellow-500';
    case 'Low': return 'bg-orange-500';
    case 'Dormant': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

const getActivityPercentage = (level: string): number => {
  switch (level) {
    case 'Very High': return 90;
    case 'High': return 70;
    case 'Medium': return 50;
    case 'Low': return 30;
    case 'Dormant': return 10;
    default: return 50;
  }
};

const getRiskLevel = (score: number): string => {
  if (score < 20) return 'Very Low';
  if (score < 40) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'High';
  return 'Very High';
};

const getRiskLevelClass = (score: number): string => {
  if (score < 20) return 'bg-green-100 text-green-800';
  if (score < 40) return 'bg-blue-100 text-blue-800';
  if (score < 60) return 'bg-yellow-100 text-yellow-800';
  if (score < 80) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getRiskColorClass = (score: number): string => {
  if (score < 20) return 'bg-green-500';
  if (score < 40) return 'bg-blue-500';
  if (score < 60) return 'bg-yellow-500';
  if (score < 80) return 'bg-orange-500';
  return 'bg-red-500';
};

const getRiskDescription = (score: number): string => {
  if (score < 20) return 'This wallet demonstrates very conservative behavior with diversified assets and established history.';
  if (score < 40) return 'This wallet shows prudent management with reasonable diversification and moderate activity.';
  if (score < 60) return 'This wallet has a balanced risk profile with some concentration and moderate activity levels.';
  if (score < 80) return 'This wallet shows higher risk patterns with concentrated positions or elevated activity.';
  return 'This wallet exhibits high risk behaviors such as high concentration, excessive trading, or interaction with many contracts.';
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default PersonaDisplay;
