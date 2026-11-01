// resources/js/Pages/Galaxy/OnchainReach/RobinhoodChain/ChainOverview.jsx
import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';


const slides = [
  {
    title: 'What is Robinhood Chain?',
    content: 'Robinhood Chain gives developers a network for building applications involving financial assets, including tokenized stocks, ETFs, and other real-world assets.',
    notes: 'Robinhood Chain is a layer-2 network built on Ethereum, using ETH as its native gas token and supporting the Ethereum Virtual Machine (EVM).'
  },
    {
        title:"What are Robinhood Stock Tokens?",
        content: "Stock Tokens are blockchain-based assets issued by Robinhood that provide exposure to real-world assets (RWAs), including stocks and exchange-traded funds (ETFs). RWAs are tokens connected to assets outside crypto, such as stocks, bonds, commodities, or real estate. Because they exist on-chain, they can interact with applications including trading platforms, lending protocols, and other smart contract-based tools.",
        notes: "Stock Tokens are not the same as owning company shares. They provide exposure to an underlying asset without conveying legal ownership rights, including shareholder voting rights, and they are unavailable to U.S. users. Robinhood says the tokens are not registered under U.S. securities laws and may not be offered or sold to U.S. persons, with further restrictions in jurisdictions including Canada, the United Kingdom, and Switzerland."
    },
    { 
        title: "Applications and Infrastructure on Robinhood Chain",
        content: "Robinhood Chain works with decentralized exchanges, lending protocols, launchpads, oracle services, and infrastructure providers. Decentralized exchanges, or DEXs, allow users to trade blockchain assets through smart contracts instead of traditional intermediaries. Uniswap is the network's default exchange, running both V3 and V4 deployments. Lending protocol Morpho supports Robinhood's DeFi products, and Lighter provides perpetual futures. The chain's busiest application is Pons, a meme coin launchpad that lets anyone deploy a token with a fixed one billion supply straight into a trading pool. Pons went live within days of mainnet and absorbed most of the activity after an early rival, Noxa, stopped accepting new launches on July 11. Uniswap launched a competing zero-fee launchpad, Pools.trade, in early August. Oracles connect blockchains to external information, such as asset prices. Robinhood Chain uses Chainlink price feeds to provide market data to applications. Other infrastructure providers include Alchemy for developer tools, BitGo for institutional custody, and Paxos for USDG stablecoin support.",
        notes: "Robinhood Chain is a layer-2 network built on Ethereum, using ETH as its native gas token and supporting the Ethereum Virtual Machine (EVM)."
    },
    {
        title: "Robinhood Chain Usage and Growth",
        content: "In its first week, Robinhood Chain recorded more than 17 million transactions, nearly 350,000 addresses, and more than $1 billion in DEX volume. Internal company metrics put total value locked (TVL) at $250 million at the time, while DefiLlama tracked core protocol TVL at roughly $94 million. By September 4, DefiLlama recorded $1.878 billion in 24-hour DEX volume, up from $989 million on August 28. DeFi deposits stood at $834.5 million, stablecoin market capitalization at $921.54 million, daily perpetual futures volume at $420.71 million, and bridged assets at $3.092 billion. Kerbrat said in an August interview that the chain had processed more than 200 million transactions.",
        notes: "The network has become a substantial fee generator. Over the 30 days to August 31 it collected $3.13 million"
    }

];

const ChainOverview = () => {
   
     return (
        <>
          <Head><title>Chain Overview</title></Head>
          <UniverseBackdrop />

        <ExchangeSlides slides={slides} color="#00C805" />

        </>
     );
};

ChainOverview.layout = page => <MainLayout children={page} />;

export default ChainOverview;

