// Hypothetical sensitivity only; no traffic data, no network/service calls.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const assumptions = {
  daysPerMonth: 30, sessionsPerDailyActivePlayer: 2, paidImpressionsPerSession: 1,
  creatorECPMsUSD: [0.5, 2, 5], dailyActivePlayers: [500, 5000, 50000],
  illustrativeMonthlyOperatingCostUSD: 100, illustrativeLifetimeActiveDays: 10,
  illustrativeColdVisitsPerDay: 50000, illustrativeMegabytesPerColdVisit: 5,
  note: 'No market rates or measured traffic. Creator eCPM includes platform/network share; excludes costs, fees and tax. Paid impressions already reflect opt-in, fill, blockers and caps.'
};
const revenue = (dau, ecpm) => dau * assumptions.sessionsPerDailyActivePlayer *
  assumptions.paidImpressionsPerSession * assumptions.daysPerMonth * ecpm / 1000;
const rows = assumptions.dailyActivePlayers.map(dau => ({
  averageDAU: dau, monthlyPaidImpressions: dau * 2 * 30,
  monthlyCreatorAdRevenueUSD: Object.fromEntries(assumptions.creatorECPMsUSD.map(e => [String(e), revenue(dau, e)]))
}));
assert.deepEqual(rows.map(r => r.monthlyCreatorAdRevenueUSD['2']), [60, 600, 6000]);
assert.deepEqual(rows.map(r => r.monthlyCreatorAdRevenueUSD['0.5']), [15, 150, 1500]);
assert.deepEqual(rows.map(r => r.monthlyCreatorAdRevenueUSD['5']), [150, 1500, 15000]);
const dauForTarget = amount => Math.ceil(amount * 1000 / (2 * 1 * 30 * 2));
assert.equal(dauForTarget(1000), 8334);
assert.equal(dauForTarget(100), 834);
const lifetimeRevenue = 10 * 2 * 1 * 2 / 1000;
assert.equal(lifetimeRevenue, 0.04);
const coldTransferGBPerMonth = 50000 * 5 * 30 / 1000;
assert.equal(coldTransferGBPerMonth, 7500);
const result = {
  status: 'scenario_math_passed', assumptions, rows,
  averageDAUFor1000USDMonthlyAt2CreatorECPM: dauForTarget(1000),
  averageDAUFor100USDIllustrativeOperatingCost: dauForTarget(100),
  illustrativeCreatorAdRevenuePerAcquiredPlayerBeforeServingCostUSD: lifetimeRevenue,
  illustrativeColdTransferDecimalGBPerMonth: coldTransferGBPerMonth,
  limitations: [
    'Not an earnings/audience forecast or country-specific eCPM.',
    'No paid ads means no ad revenue, including non-monetized Basic Launch.',
    'Creator-attributed ad income is not profit or guaranteed bank cash.',
    'Do not subtract platform share again from creator-net eCPM.',
    'Cold visits are new downloads, not DAU; cached sessions differ.',
    'Actual costs/labor/marketing/bank/FX/tax inputs are unknown.'
  ]
};
writeFileSync(new URL('./revenue_scenarios.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log('PASS: 9 revenue cases, target/breakeven math, acquisition example and transfer sensitivity.');
