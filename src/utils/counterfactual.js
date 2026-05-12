import { AVERAGE_30D_RETURN } from '../data/marketBenchmarks';

function round(value) {
  return Math.round(value);
}

export function computeCounterfactual({
  trades,
  panicSells,
  revengeInstances,
  losers,
  sectorMap,
  fomoBuys = [],
}) {
  const realisedPnl = trades.filter((t) => t.type === 'SELL').reduce((sum, t) => sum + (t.pnl || 0), 0);

  const panicDelta = panicSells.reduce((sum, sell) => {
    const sector = sectorMap[sell.symbol] || 'Other';
    const gain = (sell.price * (AVERAGE_30D_RETURN[sector] ?? 0.015)) * sell.qty;
    return sum + gain;
  }, 0);

  const revengeLossAvoided = revengeInstances.reduce((sum, r) => {
    const revengeSell = trades.find(
      (t) => t.type === 'SELL' && t.symbol === r.revengeBuy.symbol && new Date(t.date) > new Date(r.revengeBuy.date)
    );
    if (!revengeSell) return sum;
    return sum + Math.max(0, -1 * (revengeSell.pnl || 0));
  }, 0);

  const disciplinedLossDelta = losers.reduce((sum, loss) => {
    const extraDays = Math.max(0, (loss.holdingDays || 0) - 15);
    if (extraDays === 0) return sum;
    return sum + Math.abs(loss.pnl || 0) * 0.2;
  }, 0);

  const fomoDelta = fomoBuys.reduce((sum, buy) => {
    const sell = trades.find(
      (t) => t.type === 'SELL' && t.symbol === buy.symbol && new Date(t.date) > new Date(buy.date)
    );
    if (!sell || (sell.pnl ?? 0) >= 0) return sum;
    return sum + Math.abs(sell.pnl || 0) * 0.35;
  }, 0);

  const improvement = round(panicDelta + revengeLossAvoided + disciplinedLossDelta + fomoDelta);
  const adjustedPnl = round(realisedPnl + improvement);

  return {
    realisedPnl: round(realisedPnl),
    adjustedPnl,
    improvement,
    narrative: `Re-running history without panic exits (held ~30 extra days), without late FOMO entries that led to losses, without revenge cycles, and with long losers cut earlier suggests an outcome roughly ₹${improvement.toLocaleString('en-IN')} better. This is a model, not a forecast.`,
    components: {
      panicDelta: round(panicDelta),
      revengeLossAvoided: round(revengeLossAvoided),
      disciplinedLossDelta: round(disciplinedLossDelta),
      fomoDelta: round(fomoDelta),
    },
  };
}
