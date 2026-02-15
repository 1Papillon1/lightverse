// resources/js/config/universe.js

export const universeConfig = {
  center: {
    id: "lightverse-core",
    label: "LIGHTVERSE",
    position: [0, 0, 0],
    description: "Where Light becomes reality"
  },
  
  galaxies: [
    // ==========================================
    // 🌌 GALAXY 1: CORE SYSTEMS (Crypto/Tools)
    // ==========================================
    {
      id: "core-systems",
      label: "Core Systems",
      description: "Your blockchain toolkit",
      position: [-150, 0, 0], // Left side
      color: "#00ffff", // Cyan
      route: "/galaxy/core-systems",
      starSystems: [
        {
          id: "wallet",
          label: "Wallet",
          position: [-40, 2, 105],
          orbitRadius: 3.5,
          route: "/galaxy/core-systems/wallet",
          nodes: [
            { id: "portfolio", label: "Portfolio", route: "/galaxy/core-systems/wallet/portfolio" },
            { id: "transactions", label: "Transactions", route: "/galaxy/core-systems/wallet/transactions" },
            { id: "settings", label: "Settings", route: "/galaxy/core-systems/wallet/settings" },
          ]
        },
        {
          id: "markets",
          label: "Markets",
          position: [59, 15, 85],
          orbitRadius: 4,
          route: "/galaxy/core-systems/markets",
          nodes: [
            { id: "trading", label: "Trading", route: "/galaxy/core-systems/markets/trading" },
            { id: "analytics", label: "Analytics", route: "/galaxy/core-systems/markets/analytics" },
            { id: "news", label: "News", route: "/galaxy/core-systems/markets/news" },
          ]
        },
        {
          id: "contracts",
          label: "Contracts",
          position: [85, -35, -17],
          orbitRadius: 3,
          route: "/galaxy/core-systems/contracts",
          nodes: [
            { id: "deploy", label: "Deploy", route: "/galaxy/core-systems/contracts/deploy" },
            { id: "manage", label: "Manage", route: "/galaxy/core-systems/contracts/manage" },
          ]
        },
        {
          id: "ai",
          label: "Wzkr AI",
          position: [25, 15, -60],
          orbitRadius: 4.5,
          route: "/galaxy/core-systems/ai",
          nodes: [
            { id: "chat", label: "AI Chat", route: "/galaxy/core-systems/ai/chat" },
            { id: "analysis", label: "Analysis", route: "/galaxy/core-systems/ai/analysis" },
          ]
        },
      ]
    },

    // ==========================================
    // 🌌 GALAXY 2: IDENTITY NEBULA (Light/Identity)
    // ==========================================
    {
      id: "identity",
      label: "Identity Nebula",
      description: "Your Light signature",
      position: [150, 0, 0], // Right side
      color: "#ff9900", // Orange/gold
      route: "/galaxy/identity",
      starSystems: [
        {
          id: "profile",
          label: "Light Signature",
          position: [0, 20, 80],
          orbitRadius: 3,
          route: "/galaxy/identity/profile",
          nodes: [
            { id: "view", label: "View Profile", route: "/galaxy/identity/profile/view" },
            { id: "edit", label: "Edit Profile", route: "/galaxy/identity/profile/edit" },
          ]
        },
        {
          id: "achievements",
          label: "Milestones",
          position: [30, 10, 40],
          orbitRadius: 3.5,
          route: "/galaxy/identity/achievements",
          nodes: [
            { id: "list", label: "Achievements", route: "/galaxy/identity/achievements/list" },
            { id: "badges", label: "Badges", route: "/galaxy/identity/achievements/badges" },
          ]
        },
        {
          id: "reputation",
          label: "Luminance",
          position: [-30, -10, 40],
          orbitRadius: 3,
          route: "/galaxy/identity/reputation",
          nodes: [
            { id: "score", label: "Light Score", route: "/galaxy/identity/reputation/score" },
            { id: "ranking", label: "Ranking", route: "/galaxy/identity/reputation/ranking" },
          ]
        },
      ]
    },
  ]
};