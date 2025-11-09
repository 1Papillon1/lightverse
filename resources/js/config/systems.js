// systems.js

export const systems = {
  galaxy: [
    { id: "wallet", name: "Wallet", route: "/wallet" },
    { id: "markets", name: "Markets", route: "/markets" },
    { id: "contracts", name: "Contracts", route: "/contracts" },
    { id: "overview", name: "Overview", route: "/overview" },
    { id: "ai", name: "Wzkr AI", route: "/ai" },
  ],
  markets: [
    { id: "overview", name: "Overview", route: "/markets/overview" },
    { id: "compare", name: "Compare", route: "/markets/compare" },
    { id: "watchlist", name: "Watchlist", route: "/markets/watchlist" },
  ],
  overview: [
    { id: "about", name: "About", route: "/overview/about" },
    { id: "roadmap", name: "Roadmap", route: "/overview/roadmap" },
    { id: "news", name: "News", route: "/overview/news" },
    { id: "social", name: "Social", route: "/overview/social" },
  ],
  ai: [
    { id: "assistant", name: "Assistant", route: "/ai/assistant" },
    { id: "trainer", name: "Trainer", route: "/ai/trainer" },
    { id: "chat", name: "Chat", route: "/ai/chat" },
  ],
};