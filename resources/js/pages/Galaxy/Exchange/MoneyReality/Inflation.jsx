// ─────────────────────────────────────────────────────────────────
// Inflation.jsx
// resources/js/Pages/Galaxy/Exchange/MoneyReality/Inflation.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '📉',
    title: 'What Inflation Actually Is',
    content: "Inflation is the rate at which the purchasing power of money decreases. If inflation is 5%, €100 today buys what €95 bought last year. Your money is worth less without anything changing in your bank account.",
    note: "Prices don't go up. The value of money goes down."
  },
  {
    icon: '🖨️',
    title: 'Why Inflation Happens',
    content: 'The most common cause: too much money chasing too few goods. When central banks create more money, more money competes for the same amount of products. Prices rise.',
    note: 'Supply shocks (war, pandemics) also cause inflation by reducing goods, not increasing money.'
  },
  {
    icon: '💸',
    title: 'Who Inflation Hurts Most',
    content: 'Inflation is a hidden tax on savers. If your savings earn 1% interest and inflation is 4%, you lose 3% of purchasing power every year. The wealthy hold assets that rise with inflation. Cash savers get poorer.',
    note: 'This is one reason financial literacy matters.'
  },
  {
    icon: '✅',
    title: 'Why Governments Want Some Inflation',
    content: 'A small amount of inflation (2%) is considered healthy. It encourages spending rather than hoarding cash. Deflation — falling prices — sounds good but is economically dangerous: people delay purchases expecting prices to fall further.',
    note: "Japan spent decades fighting deflation after its 1990s asset bubble collapsed."
  },
  {
    icon: '🔥',
    title: 'Hyperinflation',
    content: 'When inflation spirals out of control: Zimbabwe in 2008 saw prices double every 24 hours. People were paid daily and spent immediately before their wages became worthless. The currency was abandoned.',
    note: "Germany's 1923 hyperinflation saw people burning banknotes for warmth — they were cheaper than firewood."
  },
  {
    icon: '🛡️',
    title: 'Protecting Yourself',
    content: 'Cash savings lose value in inflation. Assets that tend to hold value: property, stocks, commodities. Even a low-cost index fund historically beats inflation over long periods.',
    note: 'This is why investing basics matter — covered in the Financial Freedom system.'
  },
];
 
const Inflation = () => (
  <>
    <Head><title>Inflation — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#ff6622" />
  </>
);
 
Inflation.layout = page => <MainLayout>{page}</MainLayout>;
export default Inflation;