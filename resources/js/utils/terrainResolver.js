// terrainResolver.js

// resources/js/utils/terrainResolver.js
// 🔮 Utility to determine which terrain texture to load based on system or route.

import { systems } from "@/config/systems";

// Get a flat map of all node → parent system relationships
const nodeToParent = {};
Object.entries(systems).forEach(([systemKey, nodes]) => {
  if (systemKey === "galaxy") return; // skip galaxy
  nodes.forEach((node) => {
    nodeToParent[node.id] = systemKey;
  });
});

/**
 * Resolves the correct terrain type for a given system/node ID or path.
 * @param {string} type - The current system or node (e.g. "wallet", "compare", "overview/news")
 * @returns {string} - The terrain type (matches texture key)
 */
export function resolveTerrainType(type = "token") {
  if (!type) return "token";

  // Normalize input
  const normalized = type.replace("/", "").toLowerCase();

  // Direct terrain (system)
  if (systems[normalized]) return normalized;

  // Node → parent terrain
  if (nodeToParent[normalized]) return nodeToParent[normalized];

  // If not found, try partial match (for deep URLs)
  const possibleParent = Object.keys(nodeToParent).find((key) => normalized.includes(key));
  if (possibleParent) return nodeToParent[possibleParent];

  // Fallback
  return "token";
}
