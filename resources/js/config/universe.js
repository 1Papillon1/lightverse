// resources/js/config/universe.js

export const universeConfig = {
  center: {
    id: "lightverse-core",
    label: "LIGHTVERSE",
    position: [0, 0, 0],
    description: "Where Light becomes reality"
  },
  
  galaxies: [
   /*  // ==========================================
    // 🌌 GALAXY 1: CORE SYSTEMS (Crypto/Tools)
    // ==========================================
    {
      id: "core-systems",
      label: "Core Systems",
      description: "Your blockchain toolkit",
      position: [-150, 0, 0],
      color: "#00ffff", // Cyan
      route: "/galaxy/core-systems",
      starSystems: [
        {
          id: "wallet",
          label: "Wallet",
          position: [-40, 2, 105],
          orbitRadius: 8,
          color: "#00ffaa", // Teal-green
          route: "/galaxy/core-systems/wallet",
          nodes: [
            { id: "portfolio", label: "Portfolio", color: "#00ff88", route: "/galaxy/core-systems/wallet/portfolio" },
            { id: "transactions", label: "Transactions", color: "#00ddaa", route: "/galaxy/core-systems/wallet/transactions" },
            { id: "settings", label: "Settings", color: "#00bbcc", route: "/galaxy/core-systems/wallet/settings" },
          ]
        },
        {
          id: "markets",
          label: "Markets",
          position: [59, 15, 85],
          orbitRadius: 9,
          color: "#00ccff", // Bright cyan
          route: "/galaxy/core-systems/markets",
          nodes: [
            { id: "trading", label: "Trading", color: "#00aaff", route: "/galaxy/core-systems/markets/trading" },
            { id: "analytics", label: "Analytics", color: "#0088ff", route: "/galaxy/core-systems/markets/analytics" },
            { id: "news", label: "News", color: "#0066ff", route: "/galaxy/core-systems/markets/news" },
          ]
        },
        {
          id: "contracts",
          label: "Contracts",
          position: [85, -35, -17],
          orbitRadius: 7,
          color: "#44ffff", // Light cyan
          route: "/galaxy/core-systems/contracts",
          nodes: [
            { id: "deploy", label: "Deploy", color: "#22ffff", route: "/galaxy/core-systems/contracts/deploy" },
            { id: "manage", label: "Manage", color: "#66ffff", route: "/galaxy/core-systems/contracts/manage" },
          ]
        },
        {
          id: "ai",
          label: "Wzkr AI",
          position: [25, 15, -60],
          orbitRadius: 10,
          color: "#88ffff", // Pale cyan
          route: "/galaxy/core-systems/ai",
          nodes: [
            { id: "chat", label: "AI Chat", color: "#aaffff", route: "/galaxy/core-systems/ai/chat" },
            { id: "analysis", label: "Analysis", color: "#66ddff", route: "/galaxy/core-systems/ai/analysis" },
          ]
        },
      ]
    }, */

    // ==========================================
    // 📚 GALAXY 1: LUMINA ARCHIVES (What You Learn)
    // ==========================================
    {
      id: "lumina-archives",
      label: "Lumina Archives",
      description: "The cosmic library",
      position: [20, -90, 0],
      color: "#9966ff", // Purple/violet
      route: "/galaxy/lumina-archives",
      starSystems: [
        {
          id: "light-codex",
          label: "Light Codex",
          position: [0, 20, 80],
          orbitRadius: 3,
          color: "#aa77ff",
          route: "/galaxy/lumina-archives/light-codex",
          nodes: [
            { id: "what-is-light", label: "What is Light?", color: "#bb88ff", route: "/galaxy/lumina-archives/light-codex/what-is-light" },
            { id: "earning-light", label: "Earning Light",  color: "#9966ff", route: "/galaxy/lumina-archives/light-codex/earning" },
            { id: "light-economy", label: "Light Economy",  color: "#8855ee", route: "/galaxy/lumina-archives/light-codex/economy" },
          ]
        },
        {
          id: "verse-lore",
          label: "Verse Lore",
          position: [30, 10, 40],
          orbitRadius: 3.5,
          color: "#cc88ff",
          route: "/galaxy/lumina-archives/verse-lore",
          nodes: [
            { id: "origin",   label: "The Beginning", color: "#dd99ff", route: "/galaxy/lumina-archives/verse-lore/origin" },
            { id: "galaxies", label: "The Galaxies",  color: "#bb77ff", route: "/galaxy/lumina-archives/verse-lore/galaxies" },
            { id: "guide",    label: "Cosmic Guide",  color: "#aa66ff", route: "/galaxy/lumina-archives/verse-lore/guide" },
          ]
        },
        {
          id: "proving-grounds",
          label: "Proving Grounds",
          position: [-30, -10, 40],
          orbitRadius: 3,
          color: "#00ccaa",
          route: "/galaxy/lumina-archives/proving-grounds",
          nodes: [
            { id: "light-trials", label: "Light Trials", color: "#00ddbb", route: "/galaxy/lumina-archives/proving-grounds/light-trials" },
            { id: "signal-scan",  label: "Signal Scan",  color: "#00bbaa", route: "/galaxy/lumina-archives/proving-grounds/signal-scan" },
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
      position: [150, 0, 0], 
      color: "#ff9900", 
      route: "/galaxy/identity",
      starSystems: [
       

        {
          id: "light-signature",
          label: "Light Signature",
          position: [0, 20, 80],
          orbitRadius: 3,
          color: "#ffaa00",
          route: "/galaxy/identity/light-signature",
          nodes: [
            { id: "profile", label: "Profile", color: "#ffbb00", route: "/galaxy/identity/light-signature/profile" },
            { id: "verifications", label: "Verifications & Connections", color: "#ff9900", route: "/galaxy/identity/light-signature/verifications" },
            { id: "notifications", label: "Notifications", color: "#ffaa33", route: "/galaxy/identity/light-signature/notifications"   },
          ]
        },
        {
          id: "milestones",
          label: "Milestones",
          position: [30, 10, 40],
          orbitRadius: 3.5,
          color: "#ffcc44", 
          route: "/galaxy/identity/milestones",
          nodes: [
            { id: "achievements", label: "Achievements", color: "#ffdd44", route: "/galaxy/identity/milestones/achievements" },
            { id: "badges", label: "Badges", color: "#ffbb22", route: "/galaxy/identity/milestones/badges" },
          ]
        },
        {
          id: "luminance",
          label: "Luminance",
          position: [-30, -10, 40],
          orbitRadius: 3,
          color: "#ff8800",
          route: "/galaxy/identity/luminance",
          nodes: [
            { id: "score", label: "Light Score", color: "#ff7700", route: "/galaxy/identity/luminance/score" },
            { id: "ranking", label: "Ranking", color: "#ff9933", route: "/galaxy/identity/luminance/ranking" },
          ]
        }, 


      ]

    },
      // ==========================================
    // 🔥 GALAXY 3: THE FORGE (Build & Create)
    // ==========================================
    {
      id: "forge",
      label: "The Forge",
      description: "Where Light takes form",
      position: [20, 70, -40],   // depth axis — in front of the Light Core
      color: "#ff8800",         // Amber/orange
      route: "/galaxy/forge",
      starSystems: [
        {
          id: "light-generator",
          label: "Light Generator",
          position: [0, 0, 0],  // focal point of the galaxy
          orbitRadius: 4,
          color: "#ffaa33",
          route: "/galaxy/forge/light-generator",
          nodes: [
             { 
              id: "generator-guide", 
              label: "Forge Manual", 
              color: "#ffcc66", 
              route: "/galaxy/forge/light-generator/generator-guide" 
              },
              { 
                id: "build-area", 
                label: "Build Area", 
                color: "#ff8800", 
                route: "/galaxy/forge/light-generator/build-area" 
              },
          ]
        },
      ]
    },


  // ==========================================
  // 📡 GALAXY 4: THE SIGNAL (Observatory)
  // ==========================================
  {
    id: "signal",
    label: "The Signal",
    description: "Transparent information from the world",
    position: [0, 0, -150], // behind Genesis core
    color: "#00ffcc", // cyan/teal
    route: "/galaxy/signal",
    starSystems: [
      {
        id: "live-feed",
        label: "Live Feed",
        position: [0, 20, 80],
        orbitRadius: 3,
        color: "#00ffcc",
        route: "/galaxy/signal/live-feed",
        nodes: [
          { 
            id: "all-signals", 
            label: "All Signals", 
            color: "#00ddbb", 
            route: "/galaxy/signal/live-feed/all-signals" 
          },
          { 
            id: "by-source", 
            label: "By Source", 
            color: "#00bbaa", 
            route: "/galaxy/signal/live-feed/by-source" 
          },
        ]
      },
      {
        id: "economics-pulse",
        label: "Economics Pulse",
        position: [30, 10, 40],
        orbitRadius: 3.5,
        color: "#00ccaa",
        route: "/galaxy/signal/economics-pulse",
        nodes: [
          { 
            id: "markets-crypto", 
            label: "Markets & Crypto", 
            color: "#00bb99", 
            route: "/galaxy/signal/economics-pulse/markets-crypto" 
          },
        ]
      },
      {
        id: "knowledge-stream",
        label: "Knowledge Stream",
        position: [-30, -10, 40],
        orbitRadius: 3,
        color: "#00aabb",
        route: "/galaxy/signal/knowledge-stream",
        nodes: [
          { 
            id: "science-tech", 
            label: "Science & Tech", 
            color: "#0099bb", 
            route: "/galaxy/signal/knowledge-stream/science-tech" 
          },
        ]
      },
      {
        id: "world-events",
        label: "World Events",
        position: [0, -20, -40],
        orbitRadius: 3,
        color: "#0088cc",
        route: "/galaxy/signal/world-events",
        nodes: [
          { 
            id: "politics-conflict", 
            label: "Politics & World", 
            color: "#0077bb", 
            route: "/galaxy/signal/world-events/politics-conflict" 
          },
        ]
      },
    ]
  },

  // ==========================================
  // 💰 GALAXY 5: THE EXCHANGE (Financial Literacy)
  // ==========================================
  {
    id: "exchange",
    label: "The Exchange",
    description: "Where money becomes understood",
    position: [-150, 60, 0],
    color: "#22dd88",
    route: "/galaxy/exchange",
    starSystems: [
      {
        id: "money-reality",
        label: "Money Reality",
        position: [0, 20, 80],
        orbitRadius: 3,
        color: "#33ee99",
        route: "/galaxy/exchange/money-reality",
        nodes: [
          { id: "what-is-money",  label: "What is Money?",  color: "#44ffaa", route: "/galaxy/exchange/money-reality/what-is-money"  },
          { id: "how-banks-work", label: "How Banks Work",  color: "#33dd88", route: "/galaxy/exchange/money-reality/how-banks-work" },
          { id: "inflation",      label: "Inflation",       color: "#22cc77", route: "/galaxy/exchange/money-reality/inflation"       },
        ]
      },
      {
        id: "financial-freedom",
        label: "Financial Freedom",
        position: [-30, -10, 40],
        orbitRadius: 3,
        color: "#00aa55",
        route: "/galaxy/exchange/financial-freedom",
        nodes: [
          { id: "budgeting",        label: "Budgeting",             color: "#11bb66", route: "/galaxy/exchange/financial-freedom/budgeting"        },
          { id: "compound-interest", label: "Compound Interest",    color: "#00aa55", route: "/galaxy/exchange/financial-freedom/compound-interest" },
          { id: "why-not-taught",   label: "Why This Isn't Taught", color: "#008833", route: "/galaxy/exchange/financial-freedom/why-not-taught"   },
        ]
      },
    ]
  },

  ]
};