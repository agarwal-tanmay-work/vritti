import { TRENDING_DATES } from '../data/sampleTrades';
import { LONG_WEEKEND_EVES, MAJOR_EVENT_DATES, TRENDING_TIMELINE } from '../data/calendarEvents';
import { IDEAL_BIAS_PROFILE, TOP_TRADER_PROFILE, AVERAGE_30D_RETURN } from '../data/marketBenchmarks';
import { getPriceOnOrBefore, getMonthKey, PRICE_HISTORY } from '../data/priceHistory';
import { NIFTY_SECTOR_WEIGHTS, SECTOR_MAP } from '../data/sectorMap';
import { buildNiftyStressNudge } from '../data/niftyBenchmark';
import { computeCounterfactual } from './counterfactual';

function isDipContextExit(sell, pricesByStock) {
  const pts = pricesByStock[sell.symbol] || [];
  const sellT = new Date(sell.date);
  const windowStart = new Date(sellT);
  windowStart.setDate(windowStart.getDate() - 22);
  const windowPts = pts.filter((p) => {
    const pd = new Date(p.date);
    return pd >= windowStart && pd <= sellT;
  });
  if (windowPts.length < 2) return true;
  const hi = Math.max(...windowPts.map((p) => p.price));
  if (hi <= 0) return false;
  const drawdown = (hi - sell.price) / hi;
  return drawdown >= 0.015;
}

function getISOWeek(dateStr) {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function daysBetween(d1, d2) {
  return Math.abs(Math.round((new Date(d2) - new Date(d1)) / 86400000));
}

function hoursBetween(d1, d2) {
  return Math.abs((new Date(d2) - new Date(d1)) / 3600000);
}

function formatInr(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function groupBy(array, keyFn) {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function getSeverityLabel(score) {
  if (score <= 30) return { label: 'Healthy', className: 'severity-healthy' };
  if (score <= 60) return { label: 'Moderate', className: 'severity-moderate' };
  if (score <= 80) return { label: 'High', className: 'severity-high' };
  return { label: 'Severe', className: 'severity-severe' };
}

function getSeverityColor(score) {
  if (score <= 30) return '#00b386';
  if (score <= 60) return '#F0B429';
  if (score <= 80) return '#e67e22';
  return '#E74C3C';
}

export function analyseTrader(trades) {
  const sortedTrades = trades
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const sellTrades = sortedTrades.filter((t) => t.type === 'SELL' && t.pnl !== null);
  const buyTrades = sortedTrades.filter((t) => t.type === 'BUY');
  const openPositions = buyTrades.filter((t) => !sellTrades.some((s) => s.symbol === t.symbol && new Date(s.date) > new Date(t.date)));
  const totalSells = sellTrades.length;
  const totalBuys = buyTrades.length;
  const totalTrades = sortedTrades.length;
  const lowDataWarning = totalTrades < 5;
  const noCompletedTrades = totalSells === 0;

  const pricesByStock = {};
  sortedTrades.forEach((t) => {
    if (!pricesByStock[t.symbol]) pricesByStock[t.symbol] = [];
    pricesByStock[t.symbol].push({ date: t.date, price: t.price });
  });
  Object.keys(pricesByStock).forEach((sym) => {
    pricesByStock[sym].sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  const panicSells = sellTrades.filter(
    (t) =>
      t.pnl < 0 &&
      t.holdingDays !== null &&
      t.holdingDays <= 3 &&
      isDipContextExit(t, pricesByStock)
  );
  const panicScore = Math.min(100, Math.round((panicSells.length / Math.max(totalSells, 1)) * 100));
  const panicRecoveryRows = panicSells.map((t) => {
    const sector = SECTOR_MAP[t.symbol] || 'Other';
    const assumedRecovery = t.price * (1 + (AVERAGE_30D_RETURN[sector] ?? 0.015));
    const whatIf = (assumedRecovery - t.price) * t.qty;
    return {
      ...t,
      projected30dPrice: Math.round(assumedRecovery * 100) / 100,
      whatIfPnl: Math.round(whatIf),
      text: `You sold at ${formatInr(t.price)} on ${t.date.slice(0, 10)}. 30 days later estimated price: ${formatInr(assumedRecovery)}.`,
    };
  });
  const panicSellCost = panicRecoveryRows.reduce((s, r) => s + r.whatIfPnl, 0);

  const fomoBuys = buyTrades.filter((t) => {
    const stockPrices = pricesByStock[t.symbol] || [];
    const buyDate = new Date(t.date);
    const thirtyDaysAgo = new Date(buyDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPrices = stockPrices
      .filter((p) => {
        const d = new Date(p.date);
        return d >= thirtyDaysAgo && d < buyDate;
      })
      .map((p) => p.price);
    if (recentPrices.length === 0) return false;
    const thirtyDayHigh = Math.max(...recentPrices);
    return t.price >= thirtyDayHigh * 0.95;
  });
  const fomoEntryAnalysis = fomoBuys.map((b) => {
    const stockPrices = pricesByStock[b.symbol] || [];
    const buyDate = new Date(b.date);
    const lookback = new Date(buyDate);
    lookback.setDate(lookback.getDate() - 30);
    const rangePrices = stockPrices
      .filter((p) => new Date(p.date) >= lookback && new Date(p.date) <= buyDate)
      .map((p) => p.price);
    const low = Math.min(...rangePrices);
    const high = Math.max(...rangePrices);
    const percentile = high === low ? 50 : Math.round(((b.price - low) / (high - low)) * 100);
    return { ...b, low, high, percentile };
  });
  const fomoScore = Math.min(100, Math.round((fomoBuys.length / Math.max(totalBuys, 1)) * 100));

  const winners = sellTrades.filter((t) => t.pnl > 0 && t.holdingDays !== null);
  const losers = sellTrades.filter((t) => t.pnl < 0 && t.holdingDays !== null);

  const avgWinnerHold = winners.length > 0
    ? Math.round(winners.reduce((s, t) => s + t.holdingDays, 0) / winners.length)
    : 1;
  const avgLoserHold = losers.length > 0
    ? Math.round(losers.reduce((s, t) => s + t.holdingDays, 0) / losers.length)
    : 0;

  const holdRatio = avgWinnerHold > 0 ? avgLoserHold / avgWinnerHold : 0;
  let lossAversionScore;
  if (holdRatio >= 3) lossAversionScore = Math.min(100, 90 + Math.round((holdRatio - 3) * 5));
  else if (holdRatio >= 2) lossAversionScore = 60 + Math.round((holdRatio - 2) * 29);
  else if (holdRatio >= 1) lossAversionScore = 30 + Math.round((holdRatio - 1) * 29);
  else lossAversionScore = Math.round(holdRatio * 29);

  const weekMap = {};
  sortedTrades.forEach((t) => {
    const week = getISOWeek(t.date);
    if (!weekMap[week]) weekMap[week] = [];
    weekMap[week].push(t);
  });
  const totalWeeks = Object.keys(weekMap).length;
  const overtradedWeeks = Object.entries(weekMap).filter(([, tds]) => tds.length > 5);
  const overtradingScore = Math.min(100, Math.round((overtradedWeeks.length / Math.max(totalWeeks, 1)) * 100));
  const weeklyHeatmapData = Object.entries(weekMap).map(([week, tds]) => {
    const netPnl = tds.filter((t) => t.type === 'SELL').reduce((s, t) => s + (t.pnl || 0), 0);
    return { week, trades: tds.length, netPnl, profitable: netPnl >= 0 };
  });

  const herdStocks = ['ADANIENT', 'ZOMATO'];
  const herdTrades = buyTrades.filter((t) => {
    if (!herdStocks.includes(t.symbol)) return false;
    const trendingDates = TRENDING_DATES[t.symbol] || [];
    return trendingDates.some((td) => {
      const diff = daysBetween(td, t.date);
      return diff <= 5;
    });
  });
  let herdScore;
  if (herdTrades.length >= 3) herdScore = 80;
  else if (herdTrades.length >= 1) herdScore = 40;
  else herdScore = 0;
  const herdTimeline = herdTrades.map((t) => {
    const trend = (TRENDING_TIMELINE[t.symbol] || []).find((x) => daysBetween(x.trendDate, t.date) <= 5);
    if (!trend) return { ...t, lagDays: null, trendDate: null, peakDate: null };
    return {
      ...t,
      trendDate: trend.trendDate,
      peakDate: trend.peakDate,
      lagDays: daysBetween(trend.trendDate, t.date),
    };
  });
  const herdOutcomeSummary = (() => {
    let losses = 0;
    let wins = 0;
    let pending = 0;
    herdTrades.forEach((t) => {
      const sell = sellTrades.find((s) => s.symbol === t.symbol && new Date(s.date) > new Date(t.date));
      if (!sell) pending += 1;
      else if ((sell.pnl || 0) < 0) losses += 1;
      else if ((sell.pnl || 0) > 0) wins += 1;
    });
    return { losses, wins, pending };
  })();

  // 6) Revenge trading
  const losingSells = sellTrades.filter((t) => t.pnl < 0);
  const revengeInstances = losingSells
    .map((lossTrade) => {
      const revengeBuy = buyTrades.find(
        (b) =>
          new Date(b.date) > new Date(lossTrade.date) &&
          hoursBetween(lossTrade.date, b.date) <= 48
      );
      if (!revengeBuy) return null;
      const revengeOutcome = sellTrades.find((s) => s.symbol === revengeBuy.symbol && new Date(s.date) > new Date(revengeBuy.date));
      return {
        lossTrade,
        revengeBuy,
        delayHours: Math.round(hoursBetween(lossTrade.date, revengeBuy.date)),
        revengeOutcome,
      };
    })
    .filter(Boolean);
  const revengeScore = Math.round((revengeInstances.length / Math.max(1, losingSells.length)) * 100);
  const avgRevengeDelay = revengeInstances.length
    ? Math.round(revengeInstances.reduce((s, x) => s + x.delayHours, 0) / revengeInstances.length)
    : 0;

  // 7) Recency bias
  const recencyBuys = buyTrades.filter((b) => {
    const symbolMonths = PRICE_HISTORY[b.symbol];
    if (!symbolMonths) return false;
    const monthKey = getMonthKey(b.date);
    const months = Object.keys(symbolMonths).sort();
    const idx = months.indexOf(monthKey);
    if (idx < 1) return false;
    const prevIdx = Math.max(0, idx - 1);
    const oldP = symbolMonths[months[prevIdx]];
    const newP = symbolMonths[monthKey];
    const change = ((newP - oldP) / oldP) * 100;
    return change > 12;
  });
  const recencyLossSells = losers.filter((s) => {
    const symbolMonths = PRICE_HISTORY[s.symbol];
    if (!symbolMonths) return false;
    const monthKey = getMonthKey(s.date);
    const months = Object.keys(symbolMonths).sort();
    const idx = months.indexOf(monthKey);
    if (idx < 1) return false;
    const prev = symbolMonths[months[Math.max(0, idx - 1)]];
    const now = symbolMonths[monthKey];
    return ((now - prev) / prev) * 100 < -10;
  });
  const recencyScore = Math.round(((recencyBuys.length + recencyLossSells.length) / Math.max(1, totalTrades)) * 100);

  // 8) Overconfidence after wins
  const streaks = [];
  let streak = [];
  sellTrades.forEach((s) => {
    if (s.pnl > 0) streak.push(s);
    else {
      if (streak.length >= 3) streaks.push(streak);
      streak = [];
    }
  });
  if (streak.length >= 3) streaks.push(streak);
  const overconfidenceInstances = streaks
    .map((st) => {
      const lastWin = st[st.length - 1];
      const after = buyTrades.find((b) => new Date(b.date) > new Date(lastWin.date));
      if (!after) return null;
      const beforeAvgQty = Math.max(1, Math.round(st.reduce((sum, x) => sum + x.qty, 0) / st.length));
      const increased = after.qty > beforeAvgQty * 1.3;
      const afterSell = sellTrades.find((s) => s.symbol === after.symbol && new Date(s.date) > new Date(after.date));
      if (!increased) return null;
      return { streak: st, after, afterSell, beforeAvgQty };
    })
    .filter(Boolean);
  const overconfidenceScore = Math.round((overconfidenceInstances.length / Math.max(1, streaks.length)) * 100);
  const streakTimeline = overconfidenceInstances.map((inst) => ({
    wins: inst.streak.length,
    followLoss: inst.afterSell?.pnl || 0,
    symbol: inst.after.symbol,
  }));

  // 9) Sector concentration
  const sectorValueMap = {};
  sortedTrades.forEach((t) => {
    const sector = SECTOR_MAP[t.symbol] || 'Other';
    const value = t.qty * t.price;
    sectorValueMap[sector] = (sectorValueMap[sector] || 0) + value;
  });
  const totalValue = Object.values(sectorValueMap).reduce((s, v) => s + v, 0);
  const sectorBreakdown = Object.entries(sectorValueMap).map(([sector, value]) => ({
    sector,
    value,
    pct: totalValue ? Math.round((value / totalValue) * 100) : 0,
    benchmarkPct: NIFTY_SECTOR_WEIGHTS[sector] || 0,
  }));
  sectorBreakdown.sort((a, b) => b.value - a.value);
  const topSector = sectorBreakdown[0];
  const sectorConcentrationScore = topSector?.pct || 0;
  const topThreeSectorPct = sectorBreakdown.slice(0, 3).reduce((sum, row) => sum + (row?.pct || 0), 0);

  // 10) Sunk cost
  const buysBySymbol = groupBy(buyTrades, (b) => b.symbol);
  const sunkInstances = Object.entries(buysBySymbol)
    .map(([symbol, buys]) => {
      const sortedBuys = buys.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      if (sortedBuys.length < 2) return null;
      const downBuys = [];
      for (let i = 1; i < sortedBuys.length; i += 1) {
        if (sortedBuys[i].price < sortedBuys[i - 1].price) downBuys.push(sortedBuys[i]);
      }
      if (!downBuys.length) return null;
      return { symbol, buys: sortedBuys, severe: downBuys.length >= 2 };
    })
    .filter(Boolean);
  const sunkCostScore = Math.round((sunkInstances.length / Math.max(1, Object.keys(buysBySymbol).length)) * 100);
  const sunkCapital = sunkInstances.reduce((sum, inst) => sum + inst.buys.reduce((s, b) => s + b.qty * b.price, 0), 0);

  // 11) Calendar effect
  const calendarSensitiveTrades = sortedTrades.filter((t) => {
    const d = new Date(t.date);
    const day = d.getDate();
    const md = t.date.slice(0, 10);
    const isLongWeekendEve = LONG_WEEKEND_EVES.includes(md);
    const isMonthEnd = day >= 28;
    const isJanFirstWeek = d.getMonth() === 0 && day <= 5;
    const isMajorEvent = MAJOR_EVENT_DATES.includes(md);
    return isLongWeekendEve || isMonthEnd || isJanFirstWeek || isMajorEvent;
  });
  const calendarEffectScore = Math.round((calendarSensitiveTrades.length / Math.max(1, totalTrades)) * 100);

  // 12) Information overload
  const monthSymbolMap = {};
  const monthSymbolTradesMap = {};
  buyTrades.forEach((b) => {
    const mk = getMonthKey(b.date);
    if (!monthSymbolMap[mk]) monthSymbolMap[mk] = new Set();
    if (!monthSymbolTradesMap[mk]) monthSymbolTradesMap[mk] = [];
    monthSymbolMap[mk].add(b.symbol);
    monthSymbolTradesMap[mk].push(b);
  });
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthScatterData = Object.entries(monthSymbolMap)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([mk, set]) => {
      const [year, mon] = mk.split('-');
      const label = `${monthNames[Number(mon) - 1]} ${year}`;
      return { month: label, uniqueSymbols: set.size };
    });
  const flaggedScatterMonths = monthScatterData.filter((m) => m.uniqueSymbols > 8);
  const informationOverloadScore = Math.round((flaggedScatterMonths.length / Math.max(1, monthScatterData.length)) * 100);
  const flaggedMonthKeys = Object.entries(monthSymbolMap)
    .filter(([, set]) => set.size > 8)
    .map(([mk]) => mk);
  const infoOverloadInstances = flaggedMonthKeys.flatMap((mk) => monthSymbolTradesMap[mk] || []);

  // 13) Disposition effect
  const paperGains = openPositions.filter((p) => {
    const current = getPriceOnOrBefore(p.symbol, '2024-06-30');
    return current && current > p.price;
  }).length;
  const paperLosses = openPositions.filter((p) => {
    const current = getPriceOnOrBefore(p.symbol, '2024-06-30');
    return current && current <= p.price;
  }).length;
  const gainsRealised = winners.length;
  const lossesRealised = losers.length;
  const pgr = gainsRealised / Math.max(1, gainsRealised + paperGains);
  const plr = lossesRealised / Math.max(1, lossesRealised + paperLosses);
  const dispositionRaw = pgr - plr;
  const dispositionScore = Math.max(0, Math.min(100, Math.round((dispositionRaw + 0.5) * 100)));

  const rawScore = 100 - (
    panicScore * 0.12 +
    fomoScore * 0.1 +
    lossAversionScore * 0.12 +
    overtradingScore * 0.08 +
    herdScore * 0.06 +
    revengeScore * 0.1 +
    recencyScore * 0.08 +
    overconfidenceScore * 0.08 +
    sectorConcentrationScore * 0.1 +
    sunkCostScore * 0.08 +
    calendarEffectScore * 0.04 +
    informationOverloadScore * 0.04 +
    dispositionScore * 0.1
  );
  const behaviourScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const sortedDates = sortedTrades.map((t) => new Date(t.date)).sort((a, b) => a - b);
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const analysisPeriod = `${months[firstDate.getMonth()]} ${firstDate.getFullYear()} – ${months[lastDate.getMonth()]} ${lastDate.getFullYear()}`;
  const nudges = [];
  if (panicSells.length > 0) {
    nudges.push({
      title: 'Panic exits are costing recoveries.',
      evidence: `Estimated panic sell cost: ${formatInr(panicSellCost)} across ${panicSells.length} trades.`,
    });
  }
  if (revengeInstances.length > 0) {
    const furtherLosses = revengeInstances.filter((r) => (r.revengeOutcome?.pnl ?? 0) < 0).length;
    const closed = revengeInstances.filter((r) => r.revengeOutcome).length;
    nudges.push({
      title: `${revengeInstances.length} buy(s) within 48h of a losing sell (revenge pattern).`,
      evidence: closed
        ? `${furtherLosses} of ${closed} closed revenge cycle(s) ended in a further loss.`
        : 'Close out revenge positions to measure full outcomes in the next export.',
    });
  }
  if (fomoBuys.length > 0) {
    const fomoStocks = [...new Set(fomoBuys.map((t) => t.symbol))].join(', ');
    nudges.push({
      title: `Late entries detected in ${fomoStocks}.`,
      evidence: `Most FOMO buys landed in the top ${Math.round(fomoEntryAnalysis.reduce((s, x) => s + x.percentile, 0) / Math.max(1, fomoEntryAnalysis.length))}% of the prior 30-day range.`,
    });
  }
  const niftyNudge = buildNiftyStressNudge(sellTrades);
  if (niftyNudge) nudges.unshift(niftyNudge);
  if (holdRatio > 2) {
    nudges.push({
      title: `Loss aversion is elevated: ${Math.round(holdRatio)}x holding-time asymmetry.`,
      evidence: `Average winning hold: ${avgWinnerHold} days, average losing hold: ${avgLoserHold} days.`,
    });
  }
  if (overtradedWeeks.length > 0) {
    nudges.push({
      title: 'High activity clusters correlate with weak outcomes.',
      evidence: `${overtradedWeeks.length} heavy weeks (>5 trades) were detected.`,
    });
  }
  if (herdTrades.length > 0) {
    const herdSymbols = [...new Set(herdTrades.map((t) => t.symbol))].join(' and ');
    nudges.push({
      title: `Crowd-chasing detected in ${herdSymbols}.`,
      evidence: 'Entries happened within days of trend spikes, usually after the easy move.',
    });
  }
  const biasScores = {
    panicSelling: panicScore,
    fomoBuying: fomoScore,
    lossAversion: lossAversionScore,
    overtrading: overtradingScore,
    herdBehaviour: herdScore,
    revengeTrading: revengeScore,
    recencyBias: recencyScore,
    overconfidenceAfterWins: overconfidenceScore,
    sectorConcentration: sectorConcentrationScore,
    sunkCostFallacy: sunkCostScore,
    calendarEffectBias: calendarEffectScore,
    informationOverload: informationOverloadScore,
    dispositionEffect: dispositionScore,
  };
  const worstBias = Object.entries(biasScores).sort((a, b) => b[1] - a[1])[0][0];
  const monthlyStats = {};
  const monthlyWaterfall = [];
  sellTrades.forEach((t) => {
    const d = new Date(t.date);
    const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
    if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { month: months[d.getMonth()], wins: 0, losses: 0 };
    if (t.pnl > 0) monthlyStats[monthKey].wins++;
    else if (t.pnl < 0) monthlyStats[monthKey].losses++;
  });
  const timelineData = Object.values(monthlyStats);
  const groupedByMonth = groupBy(sellTrades, (s) => `${new Date(s.date).getFullYear()}-${String(new Date(s.date).getMonth() + 1).padStart(2, '0')}`);
  let runningTotal = 0;
  Object.entries(groupedByMonth)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .forEach(([month, rows]) => {
      const pnl = rows.reduce((sum, r) => sum + r.pnl, 0);
      runningTotal += pnl;
      monthlyWaterfall.push({ month, pnl: Math.round(pnl), cumulative: Math.round(runningTotal) });
    });

  const matrixPoints = sellTrades.map((s) => ({
    x: s.holdingDays || 0,
    y: s.pnl || 0,
    symbol: s.symbol,
    date: s.date.slice(0, 10),
    pnl: s.pnl,
    holdingDays: s.holdingDays,
    quadrant:
      s.pnl >= 0 && (s.holdingDays || 0) <= 15
        ? 'quickWins'
        : s.pnl >= 0
          ? 'patientWins'
          : (s.holdingDays || 0) <= 15
            ? 'panicSells'
            : 'bagholding',
  }));
  const quadrantCounts = matrixPoints.reduce((acc, p) => {
    acc[p.quadrant] = (acc[p.quadrant] || 0) + 1;
    return acc;
  }, { quickWins: 0, patientWins: 0, panicSells: 0, bagholding: 0 });

  const bestTrades = sellTrades.slice().sort((a, b) => b.pnl - a.pnl).slice(0, 3);
  const worstTrades = sellTrades.slice().sort((a, b) => a.pnl - b.pnl).slice(0, 3);

  const dayPnlMap = {};
  sellTrades.forEach((s) => {
    const day = s.date.slice(0, 10);
    if (!dayPnlMap[day]) dayPnlMap[day] = { date: day, pnl: 0, trades: 0 };
    dayPnlMap[day].pnl += s.pnl;
    dayPnlMap[day].trades += 1;
  });
  const dayRows = Object.values(dayPnlMap);
  const worstDay = dayRows.slice().sort((a, b) => a.pnl - b.pnl)[0] || null;
  const bestDay = dayRows.slice().sort((a, b) => b.pnl - a.pnl)[0] || null;

  const radarData = Object.keys(biasScores).map((bias) => ({
    bias,
    mine: biasScores[bias],
    ideal: IDEAL_BIAS_PROFILE[bias] ?? 10,
    top10: TOP_TRADER_PROFILE[bias] ?? 20,
  }));

  const biasInteractions = [
    {
      from: 'panicSelling',
      to: 'revengeTrading',
      text: `${revengeInstances.filter((x) => x.lossTrade.holdingDays <= 3).length} revenge trades followed panic sells.`,
    },
    {
      from: 'fomoBuying',
      to: 'lossAversion',
      text: 'FOMO entries are frequently followed by longer losing holds.',
    },
  ];

  const counterfactual = computeCounterfactual({
    trades: sortedTrades,
    panicSells,
    revengeInstances,
    losers,
    sectorMap: SECTOR_MAP,
    fomoBuys,
  });

  return {
    behaviourScore,
    totalTrades: sortedTrades.length,
    analysisPeriod,
    timelineData,
    monthlyWaterfall,
    avgWinnerHold,
    avgLoserHold,
    holdRatio: Math.round(holdRatio * 10) / 10,
    lowDataWarning,
    noCompletedTrades,
    warnings: {
      lowDataWarning,
      noCompletedTrades,
      allOpenPositions: totalSells === 0,
    },
    openPositions,
    panicSellCost,
    panicRecoveryRows,
    fomoEntryAnalysis,
    weeklyHeatmapData,
    herdTimeline,
    streakTimeline,
    sectorBreakdown,
    topThreeSectorPct,
    matrixPoints,
    quadrantCounts,
    bestTrades,
    worstTrades,
    worstDay,
    bestDay,
    monthScatterData,
    radarData,
    benchmarkProfiles: { ideal: IDEAL_BIAS_PROFILE, top10: TOP_TRADER_PROFILE },
    biasInteractions,
    counterfactual,
    biases: {
      panicSelling: {
        score: panicScore,
        ...getSeverityLabel(panicScore),
        color: getSeverityColor(panicScore),
        instances: panicSells,
        description: `You had ${panicSells.length} quick loss-making exits after a local dip (from your own price path) within 3 days of entry. Missed-recovery estimate: ${formatInr(panicSellCost)}.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Selling too quickly after fear-driven drawdowns.',
      },
      fomoBuying: {
        score: fomoScore,
        ...getSeverityLabel(fomoScore),
        color: getSeverityColor(fomoScore),
        instances: fomoBuys,
        description: `You made ${fomoBuys.length} late entries near 30-day highs; percentile shows where you bought inside that window.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Buying because price already ran up and feels urgent.',
      },
      lossAversion: {
        score: lossAversionScore,
        ...getSeverityLabel(lossAversionScore),
        color: getSeverityColor(lossAversionScore),
        instances: losers.filter(t => t.holdingDays > 30),
        description: `You held losers ${Math.round(holdRatio)}x longer than winners.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Holding losses too long while booking gains too early.',
      },
      overtrading: {
        score: overtradingScore,
        ...getSeverityLabel(overtradingScore),
        color: getSeverityColor(overtradingScore),
        instances: overtradedWeeks.flatMap(([, tds]) => tds),
        description: `${overtradedWeeks.length} out of ${totalWeeks} weeks had more than 5 trades. You tend to overtrade during volatile periods, increasing transaction costs and emotional exposure.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Trading too frequently without better expected edge.',
      },
      herdBehaviour: {
        score: herdScore,
        ...getSeverityLabel(herdScore),
        color: getSeverityColor(herdScore),
        instances: herdTrades,
        description: herdTrades.length === 0
          ? 'No crowd-chasing entries detected in the tracked hype windows.'
          : `You bought ${herdTrades.length} time(s) into high-attention names near modelled hype windows (${[...new Set(herdTrades.map((t) => t.symbol))].join(', ')}). Outcomes on matched exits: ${herdOutcomeSummary.losses} loss, ${herdOutcomeSummary.wins} win${herdOutcomeSummary.pending ? `, ${herdOutcomeSummary.pending} open/unmatched` : ''}.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Following social momentum instead of independent thesis.',
      },
      revengeTrading: {
        score: revengeScore,
        ...getSeverityLabel(revengeScore),
        color: getSeverityColor(revengeScore),
        instances: revengeInstances.map((r) => r.revengeBuy),
        description: `${revengeInstances.length} revenge buys followed losses. Avg delay: ${avgRevengeDelay}h.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Jumping back in right after a loss to recover quickly.',
      },
      recencyBias: {
        score: recencyScore,
        ...getSeverityLabel(recencyScore),
        color: getSeverityColor(recencyScore),
        instances: [...recencyBuys, ...recencyLossSells],
        description: `${recencyBuys.length} buys chased recent winners and ${recencyLossSells.length} loss exits followed recent downtrends.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Assuming recent trend will continue indefinitely.',
      },
      overconfidenceAfterWins: {
        score: overconfidenceScore,
        ...getSeverityLabel(overconfidenceScore),
        color: getSeverityColor(overconfidenceScore),
        instances: overconfidenceInstances.map((i) => i.after),
        description: `${overconfidenceInstances.length} post-streak size jumps (>30%) were detected.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Increasing risk aggressively after winning streaks.',
      },
      sectorConcentration: {
        score: sectorConcentrationScore,
        ...getSeverityLabel(sectorConcentrationScore),
        color: getSeverityColor(sectorConcentrationScore),
        instances: sortedTrades.filter((t) => (SECTOR_MAP[t.symbol] || 'Other') === topSector?.sector),
        description: `${topThreeSectorPct}% of traded value sits in your top three sectors (${sectorBreakdown.slice(0, 3).map((s) => s.sector).join(', ') || 'N/A'}).`,
        varsityLink: 'https://zerodha.com/varsity/module/introduction-to-stock-markets/chapter/diversification-need-of-the-hour/',
        glossary: 'Concentrating risk in few correlated sectors.',
      },
      sunkCostFallacy: {
        score: sunkCostScore,
        ...getSeverityLabel(sunkCostScore),
        color: getSeverityColor(sunkCostScore),
        instances: sunkInstances.flatMap((i) => i.buys),
        description: `${sunkInstances.length} averaging-down patterns detected. Capital trapped: ${formatInr(sunkCapital)}.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Adding to losers only to reduce average price psychologically.',
      },
      calendarEffectBias: {
        score: calendarEffectScore,
        ...getSeverityLabel(calendarEffectScore),
        color: getSeverityColor(calendarEffectScore),
        instances: calendarSensitiveTrades,
        description: `${calendarSensitiveTrades.length} trades clustered around high-anxiety calendar windows.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Trading patterns driven by date events, not setup quality.',
      },
      informationOverload: {
        score: informationOverloadScore,
        ...getSeverityLabel(informationOverloadScore),
        color: getSeverityColor(informationOverloadScore),
        instances: infoOverloadInstances,
        description: flaggedScatterMonths.length === 0
          ? `No months exceeded 8 unique symbols. Your trading is reasonably focused across the analysis period.`
          : `${flaggedScatterMonths.length} month(s) had more than 8 unique symbols traded — spreading attention too thin increases emotional and execution risk.`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Spreading attention across too many symbols at once.',
      },
      dispositionEffect: {
        score: dispositionScore,
        ...getSeverityLabel(dispositionScore),
        color: getSeverityColor(dispositionScore),
        instances: [...winners.slice(0, 5), ...openPositions.slice(0, 5)],
        description: `PGR ${pgr.toFixed(2)} vs PLR ${plr.toFixed(2)} (score ${dispositionRaw.toFixed(2)}).`,
        varsityLink: 'https://zerodha.com/varsity/module/trading-psychology/',
        glossary: 'Realising gains faster than losses in a systematic pattern.',
        researchBadge: true,
      },
    },
    nudges,
    worstBias,
  };
}
