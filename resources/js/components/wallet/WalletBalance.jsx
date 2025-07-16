// WalletBalance.jsx
import { useRootStore } from '@/stores/RootStore';
import { observer } from "mobx-react-lite";
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export const WalletBalance = observer(() => {
  const rootStore = useRootStore();
  const { address, isConnected } = useAccount();

  const { data: balance, refetch } = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return null;
      // Replace with actual balance fetching logic
      const response = await fetch(`/api/balance/${address}`);
      return response.json();
    },
    enabled: isConnected && !!address,
  });

  useEffect(() => {
    if (isConnected && address) {
      rootStore.setWalletAddress(address);
      refetch();
    }
  }, [isConnected, address, rootStore, refetch]);

  return (
    <div>
      <h2>Wallet Balance</h2>
      {isConnected ? (
        <p>Balance: {balance !== undefined ? `${balance} ETH` : 'Loading...'}</p>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
});
