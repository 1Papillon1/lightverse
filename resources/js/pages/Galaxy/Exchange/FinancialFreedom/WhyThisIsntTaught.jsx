// ─────────────────────────────────────────────────────────────────
// WhyThisIsntTaught.jsx
// resources/js/Pages/Galaxy/Exchange/FinancialFreedom/WhyThisIsntTaught.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '❓',
    title: 'The Question Nobody Asks',
    content: 'You spent 12-17 years in formal education. You learned algebra, the dates of wars, literary analysis. You were not taught how money works, how banks create currency, how compound interest builds or destroys wealth, or how to invest. Why?',
    note: "This isn't a conspiracy. It's a system with incentives."
  },
  {
    icon: '🏭',
    title: 'The Worker Pipeline',
    content: 'Mass public education was designed during the industrial revolution to produce reliable workers — punctual, literate enough to follow instructions, disciplined. The goal was not financial independence. It was a workforce.',
    note: 'Horace Mann, a key architect of US public education, explicitly modelled it on Prussian military schooling.'
  },
  {
    icon: '💳',
    title: 'Who Benefits From Financial Ignorance',
    content: 'Financial illiteracy is profitable. Banks earn billions from overdraft fees. Credit card companies rely on minimum payment behaviour. Payday lenders charge 400% APR. An educated population would use these products differently — or not at all.',
    note: 'This is not a conspiracy. It is just incentives pointing in a consistent direction.'
  },
  {
    icon: '🌍',
    title: 'What Other Countries Do',
    content: 'Finland integrates personal finance into secondary education. Singapore teaches investing from age 15. Australia has mandatory financial literacy standards. Countries that teach financial literacy have lower household debt and higher savings rates.',
    note: 'Education changes outcomes.'
  },
  {
    icon: '🔄',
    title: 'The Cycle',
    content: "People who don't understand money make predictable decisions: overspend on liabilities, under-save, avoid investing, take on expensive debt. This keeps them dependent on employment. Financial ignorance perpetuates economic dependence.",
    note: 'This is structural, not intentional. The outcome is the same either way.'
  },
  {
    icon: '✦',
    title: 'The Exit',
    content: 'The exit from this system is the same for everyone: understand money, spend less than you earn, eliminate bad debt, build assets, let compound interest work. None of this requires wealth to start. It requires knowledge.',
    note: "You're in The Exchange. This is the beginning of something different."
  },
];
 
const WhyThisIsntTaught = () => (
  <>
    <Head><title>Why This Isn't Taught — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#ff4466" />
  </>
);
 
WhyThisIsntTaught.layout = page => <MainLayout>{page}</MainLayout>;
export default WhyThisIsntTaught;