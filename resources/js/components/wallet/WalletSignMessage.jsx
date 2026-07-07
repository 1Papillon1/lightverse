// WalletSignMessage.jsx
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';   

export const WalletSignMessage = observer(() => {
    const rootStore = useRootStore();
    const { address, isConnected } = useAccount();

    const { data: message, refetch } = useQuery({
        queryKey: ['message', address],
        queryFn: async () => {
            if (!address) return null;
            // Replace with actual message fetching logic
            const response = await fetch(`/api/message/${address}`);
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
            <h2>Sign Message</h2>
            {isConnected ? (
                <p>Message: {message ? message.text : 'Loading...'}</p>
            ) : (
                <p>Please connect your wallet.</p>
            )}
        </div>
    );
});
