import React from "react";
import CoinPickupAnimator from "@/components/visuals/CoinPickupAnimator";

export default function CoinPickupOrchestrator() {
  // Animator listens directly to store.activePickup
  return <CoinPickupAnimator />;
}
