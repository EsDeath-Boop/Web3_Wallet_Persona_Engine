// src/components/PersonaDisplay.tsx
import React from "react";
import { css, cx } from "@/styled-system/css"
import { WalletPersona } from "../services/analytics";

interface PersonaDisplayProps {
  persona: WalletPersona | null;
  loading: boolean;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, loading }) => {
  if (loading) {
    return <div className={css({ p: 4 })}>Loading wallet persona...</div>;
  }

  if (!persona) {
    return <div className={css({ p: 4 })}>No persona data available.</div>;
  }

  const getRiskColor = (score: number) => {
    if (score > 75) return "red.400";
    if (score > 50) return "yellow.400";
    return "green.400";
  };

  return (
    <div className={css({ p: 4, borderWidth: "1px", borderRadius: "lg", boxShadow: "md" })}>
      {/* Heading */}
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", mb: 4 })}>Wallet Persona</h2>

      {/* Summary */}
      <p className={css({ fontSize: "md", mb: 6 })}>
        {persona.summary || "No summary available."}
      </p>

      {/* Category & Tags */}
      <div className={css({ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 })}>
        <span
          className={css({
            bg: "purple.100",
            color: "purple.800",
            px: 2,
            py: 1,
            borderRadius: "md",
            fontWeight: "medium",
            fontSize: "sm",
          })}
        >
          {persona.category || "Unknown Category"}
        </span>
        {persona.tags?.map((tag, i) => (
          <span
            key={i}
            className={css({
              bg: "blue.100",
              color: "blue.800",
              px: 2,
              py: 1,
              borderRadius: "md",
              fontSize: "sm",
            })}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Risk Score */}
      <div className={css({ mb: 6 })}>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p className={css({ fontWeight: "bold" })}>Risk Score</p>
          <p>{persona.riskScore || 0}/100</p>
        </div>
        <div
          className={css({
            w: "full",
            bg: "gray.200",
            rounded: "full",
            h: "2",
            mt: 2,
            overflow: "hidden",
          })}
        >
          <div
            className={css({
              bg: getRiskColor(persona.riskScore || 0),
              w: `${persona.riskScore || 0}%`,
              h: "full",
              transition: "width 0.3s ease",
            })}
          />
        </div>
      </div>

      {/* Traits */}
      <h3 className={css({ fontSize: "xl", fontWeight: "semibold", mb: 3 })}>Key Traits</h3>
      <div className={css({ display: "flex", flexDirection: "column", gap: 3, mb: 6 })}>
        {persona.traits?.map((trait, i) => (
          <div
            key={i}
            className={css({ p: 3, borderWidth: "1px", borderRadius: "md" })}
          >
            <div
              className={css({ display: "flex", justifyContent: "space-between", alignItems: "center" })}
            >
              <p className={css({ fontWeight: "bold" })}>{trait.name}</p>
              <span
                className={css({
                  bg: "gray.100",
                  px: 2,
                  py: 1,
                  fontSize: "sm",
                  borderRadius: "md",
                })}
              >
                {trait.score || 0}/100
              </span>
            </div>
            <p className={css({ fontSize: "sm", mt: 1 })}>{trait.description}</p>
          </div>
        ))}
      </div>

      {/* Wallet Metrics */}
      <h3 className={css({ fontSize: "xl", fontWeight: "semibold", mb: 3 })}>Wallet Metrics</h3>
      <div className={css({ display: "flex", flexDirection: "column", gap: 2 })}>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p>Total Value</p>
          <p>${persona.metrics?.totalValueUSD?.toLocaleString() || 0}</p>
        </div>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p>Token Diversity</p>
          <p>{persona.metrics?.tokenDiversity || 0} tokens</p>
        </div>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p>NFT Diversity</p>
          <p>{persona.metrics?.nftDiversity || 0} NFTs</p>
        </div>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p>Activity Level</p>
          <p>{persona.activityLevel || "Unknown"}</p>
        </div>
        <div className={css({ display: "flex", justifyContent: "space-between" })}>
          <p>Wallet Age</p>
          <p>{Math.floor(persona.metrics?.oldestTransactionDays || 0)} days</p>
        </div>
      </div>
    </div>
  );
};

export default PersonaDisplay;
