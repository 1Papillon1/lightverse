// resources/js/pages/Galaxy/OnchainReach/RobinhoodChain/Snair.jsx
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { createPublicClient, defineChain, http } from 'viem';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';

// Values from the Snair quickstart ("Network constants"). Testnet only
// for now - the docs say to use testnet before mainnet.
// The public RPC is rate-limited, so the RPC URL can be overridden with
// VITE_ROBINHOOD_TESTNET_RPC_URL in .env (e.g. an Alchemy endpoint).
const robinhoodChainTestnet = defineChain({
    id: 46630,
    name: 'Robinhood Chain Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: [
                import.meta.env.VITE_ROBINHOOD_TESTNET_RPC_URL ??
                    'https://rpc.testnet.chain.robinhood.com',
            ],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://explorer.testnet.chain.robinhood.com',
        },
    },
});

const client = createPublicClient({
    chain: robinhoodChainTestnet,
    transport: http(),
});

const POLL_MS = 10000; // keep this slow, the public RPC is rate-limited

const Snair = () => {
    const [blockNumber, setBlockNumber] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const read = async () => {
            try {
                const n = await client.getBlockNumber();
                if (!cancelled) {
                    setBlockNumber(n);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err.shortMessage ?? err.message);
            }
        };

        read();
        const id = setInterval(read, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    const status = error ? 'offline' : blockNumber === null ? 'connecting' : 'live';

    return (
        <>
            <Head><title>Snair</title></Head>
            <UniverseBackdrop />

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 560,
                    margin: '0 auto 0',
                    padding: 24,
                    paddingTop: '30vh',
                    borderRadius: 12,
                    background: 'rgba(10, 10, 31, 0.7)',
                    color: '#fff',
                    fontFamily: 'monospace',
                }}
            >
                <h1 style={{ margin: 0 }}>Snair</h1>
                <p style={{ opacity: 0.7 }}>
                    {robinhoodChainTestnet.name} (chain {robinhoodChainTestnet.id})
                </p>

                <p>
                    Status: <strong>{status}</strong>
                </p>
                {blockNumber !== null && <p>Latest block: {blockNumber.toString()}</p>}
                {error && <p style={{ color: '#ff8a8a' }}>{error}</p>}
            </div>
        </>
    );
};

Snair.layout = (page) => <MainLayout children={page} />;

export default Snair;