// ─────────────────────────────────────────────────────────────────
// Budgeting.jsx
// resources/js/Pages/Galaxy/Exchange/FinancialFreedom/Budgeting.jsx
// ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import ExchangeSlides from '@/components/ui/ExchangeSlides';
 
const slides = [
  {
    icon: '📋',
    title: "Why Most People Don't Budget",
    content: "Budgeting has a reputation for being restrictive and joyless. Most people avoid it for the same reason they avoid scales — they're afraid of what they'll see. But a budget isn't a punishment. It's the only way to know where you actually stand.",
    note: 'Not knowing is more dangerous than knowing.'
  },
  {
    icon: '📊',
    title: 'The 50/30/20 Rule',
    content: '50% of income to needs (housing, food, transport), 30% to wants (entertainment, eating out), 20% to saving and debt repayment. Simple. Not perfect for every situation but a reliable starting point that most people have never applied.',
    note: 'Adjust the percentages to your reality — but always pay yourself first with the 20%.'
  },
  {
    icon: '🔍',
    title: 'Track Before You Cut',
    content: "Before changing anything, spend one month tracking every expense. Most people are shocked — subscriptions they forgot, food costs underestimated, small purchases that add up to hundreds. You can't manage what you don't measure.",
    note: 'A simple spreadsheet is enough. No app required.'
  },
  {
    icon: '🎯',
    title: 'Fixed vs Variable Expenses',
    content: "Fixed expenses stay the same monthly: rent, loan repayments, insurance. Variable expenses change: groceries, utilities, entertainment. Variable expenses are where most budgeting wins are found — they're controllable in ways fixed costs aren't.",
    note: 'Reducing fixed costs creates permanent savings. Reducing variable costs requires ongoing discipline.'
  },
  {
    icon: '⚡',
    title: 'The Subscription Audit',
    content: 'List every subscription you pay. Every streaming service, app, gym membership, software. Most people find 3-5 they have forgotten or barely use. Cancel everything non-essential for 30 days. Add back only what you genuinely missed.',
    note: 'The average person pays for 4-5 subscriptions they barely use.'
  },
  {
    icon: '🔄',
    title: 'Budget as a Living Document',
    content: "A budget isn't set once and forgotten. Income changes, expenses change, life changes. Review yours monthly. The goal isn't perfection, it's awareness. Consistent awareness beats occasional perfection every time.",
    note: 'Annual income reviews are a minimum. Monthly is better.'
  },
];
 
const Budgeting = () => (
  <>
    <Head><title>Budgeting — The Exchange</title></Head>
    <UniverseBackdrop />
    <ExchangeSlides slides={slides} color="#9966ff" />
  </>
);
 
Budgeting.layout = page => <MainLayout>{page}</MainLayout>;
export default Budgeting;
