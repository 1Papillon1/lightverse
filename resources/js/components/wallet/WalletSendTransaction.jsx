// WalletSendTransaction.jsx
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';   

export const WalletSendTransaction = observer(() => {
    const rootStore = useRootStore();
    const { address, isConnected } = useAccount();

    const { data: transactions, refetch } = useQuery({
        queryKey: ['transactions', address],
        queryFn: async () => {
            if (!address) return [];
            // Replace with actual transaction fetching logic
            const response = await fetch(`/api/transactions/${address}`);
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
            <h2>Wallet Transactions</h2>
            {isConnected ? (
                <ul>
                    {transactions && transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <li key={tx.id}>
                                {tx.description} - {tx.amount} ETH
                            </li>
                        ))
                    ) : (
                        <p>No transactions found.</p>
                    )}
                </ul>
            ) : (
                <p>Please connect your wallet to view transactions.</p>
            )}
        </div>
    );
});
