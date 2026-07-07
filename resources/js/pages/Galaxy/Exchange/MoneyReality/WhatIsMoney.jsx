// ─────────────────────────────────────────────────────────────────
// WhatIsMoney.jsx
// resources/js/Pages/Galaxy/Exchange/MoneyReality/WhatIsMoney.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '💵',
    title: 'Money is a Story',
    content: 'Money has no intrinsic value. A banknote is paper. A coin is metal. What makes it valuable is that everyone agrees it is. Money is the most successful shared fiction in human history.',
    note: 'The moment people stop believing in it, it collapses. See: Zimbabwe 2008, Venezuela 2018.'
  },
  {
    icon: '🏛️',
    title: 'Before Money: Barter',
    content: "Before money, people traded directly — grain for tools, labour for food. The problem: what if the farmer needs shoes but the cobbler doesn't need grain? Money solved this by becoming a universal medium of exchange.",
    note: 'Barter still happens — just not at scale.'
  },
  {
    icon: '🥇',
    title: 'The Gold Standard',
    content: 'For centuries, money was backed by gold. You could theoretically walk into a bank and exchange your notes for physical gold. This limited how much money governments could create.',
    note: 'The US left the gold standard in 1971. No major currency is backed by gold today.'
  },
  {
    icon: '🖨️',
    title: 'Fiat Money',
    content: "Today's money is \"fiat\" — it exists because governments declare it legal tender. It's backed by nothing except trust in the issuing government. This gives governments the ability to create money, which is both powerful and dangerous.",
    note: 'Fiat comes from Latin: "let it be done."'
  },
  {
    icon: '🔢',
    title: 'Money as Numbers',
    content: "Most money today doesn't physically exist. Around 97% of money in circulation is digital — entries in bank databases. When you get paid, no physical notes move anywhere. Numbers change in a spreadsheet.",
    note: 'Physical cash is becoming a minority of all money in existence.'
  },
  {
    icon: '🌐',
    title: 'Three Functions of Money',
    content: 'Money serves three roles: medium of exchange (we trade with it), store of value (we save it), unit of account (we measure prices with it). When inflation is high, money fails at the second function.',
    note: 'Understanding these three functions helps you understand when a currency is failing.'
  },
];
 
const WhatIsMoney = () => (
  <>
    <Head><title>What is Money? — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#00ffcc" />
  </>
);
 
WhatIsMoney.layout = page => <MainLayout>{page}</MainLayout>;
export default WhatIsMoney;