// ─────────────────────────────────────────────────────────────────
// CompoundInterest.jsx
// resources/js/Pages/Galaxy/Exchange/FinancialFreedom/CompoundInterest.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '✦',
    title: 'The 8th Wonder of the World',
    content: 'Compound interest means earning interest on your interest — your money grows on itself, exponentially, given enough time. The math is extraordinary.',
    note: '"He who understands it, earns it. He who doesn\'t, pays it."'
  },
  {
    icon: '📈',
    title: 'The Numbers',
    content: '€1,000 invested at 8% annual return: after 10 years → €2,159. After 20 years → €4,661. After 30 years → €10,063. After 40 years → €21,725. The last decade alone adds more than the first three combined.',
    note: 'This is why starting at 25 is dramatically better than starting at 35.'
  },
  {
    icon: '⏰',
    title: 'Time is the Variable That Matters Most',
    content: 'Person A invests €200/month from age 25-35 then stops. Person B invests €200/month from age 35-65. At 65, Person A has more money. Starting a decade earlier, then stopping, beats contributing for three decades later.',
    note: 'This is the most counterintuitive fact in personal finance.'
  },
  {
    icon: '🔄',
    title: 'Compounding Frequency',
    content: 'Interest compounds at different frequencies: annually, monthly, daily. Daily compounding produces slightly more than annual. Focus on the rate and the time horizon — not the compounding frequency.',
    note: 'The frequency matters less than the rate and the time.'
  },
  {
    icon: '💸',
    title: 'Compound Interest Works Against You Too',
    content: 'Credit card debt compounds daily. A €3,000 balance at 20% annual interest costs €665 in year one alone. The same force that builds wealth silently destroys it when you are on the wrong side of it.',
    note: 'This is why eliminating high-interest debt before investing is mathematically correct.'
  },
  {
    icon: '🌱',
    title: 'Starting Now',
    content: 'Even €50/month invested consistently at a modest 7% return becomes over €60,000 in 30 years — from €18,000 contributed. You did not earn the rest. Compound interest did.',
    note: 'Perfect amounts do not matter. Starting matters.'
  },
];
 
const CompoundInterest = () => (
  <>
    <Head><title>Compound Interest — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#ffcc00" />
  </>
);
 
CompoundInterest.layout = page => <MainLayout>{page}</MainLayout>;
export default CompoundInterest;