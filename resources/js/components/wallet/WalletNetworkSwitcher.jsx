// WalletNetworkSwitcher.jsx
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const WalletNetworkSwitcher = observer(() => {
    const rootStore = useRootStore();
    const { address, isConnected } = useAccount();
    
    const { data: network, refetch } = useQuery({
        queryKey: ['network', address],
        queryFn: async () => {
        if (!address) return null;
        // Replace with actual network fetching logic
        const response = await fetch(`/api/network/${address}`);
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
        <h2>Wallet Network</h2>
        {isConnected ? (
            <p>Network: {network ? network.name : 'Loading...'}</p>
        ) : (
            <p>Please connect your wallet.</p>
        )}
        </div>
    );
    }
);