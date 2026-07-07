// ─────────────────────────────────────────────────────────────────
// HowBanksWork.jsx
// resources/js/Pages/Galaxy/Exchange/MoneyReality/HowBanksWork.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '🏦',
    title: "Banks Don't Hold Your Money",
    content: "When you deposit €1,000 in a bank, the bank doesn't store it in a vault with your name on it. It lends most of it out to other people. Your deposit becomes someone else's loan.",
    note: 'This is called fractional reserve banking.'
  },
  {
    icon: '✖️',
    title: 'The Money Multiplier',
    content: 'Banks are required to keep only a fraction of deposits as reserves. Your €1,000 deposit allows the bank to lend out €900. That €900 gets deposited elsewhere, and that bank lends out €810. One deposit creates multiple times its value in new money.',
    note: 'This is how banks literally create money.'
  },
  {
    icon: '💻',
    title: 'Money Creation From Nothing',
    content: "When a bank approves your loan for €10,000, it doesn't move existing money to your account. It types the number into a computer. That €10,000 didn't exist before.",
    note: 'The Bank of England confirmed this in a 2014 bulletin: "Banks create money in the form of bank deposits by making new loans."'
  },
  {
    icon: '📈',
    title: 'How Banks Make Money',
    content: 'Banks borrow at low interest rates and lend at higher ones. The difference — the spread — is their profit. A bank paying 1% on savings and charging 5% on loans keeps 4% on every euro that passes through.',
    note: 'Central bank interest rate decisions directly affect this spread.'
  },
  {
    icon: '🏛️',
    title: 'Central Banks vs Commercial Banks',
    content: 'Your everyday bank is a commercial bank. Above them sit central banks (ECB, Federal Reserve) which set the rules, control base interest rates, and act as lender of last resort when commercial banks fail.',
    note: 'Central banks are not government departments in most countries — they operate independently.'
  },
  {
    icon: '⚠️',
    title: 'The Risk',
    content: "If everyone tried to withdraw their money at the same time, banks couldn't pay. This is called a bank run, and it's why deposit insurance exists — to prevent panic that could collapse the entire system.",
    note: 'It happened in 1929. It almost happened in 2008.'
  },
];
 
const HowBanksWork = () => (
  <>
    <Head><title>How Banks Work — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#00ccff" />
  </>
);
 
HowBanksWork.layout = page => <MainLayout>{page}</MainLayout>;
export default HowBanksWork;
 