/* ── ① DATA MANAGEMENT: CALCULATION & FILTERING ── */
// 데이터 계산 및 필터링 함수 (차트/리포트 데이터 생성)
// - calcKpi(): 수익/지출 KPI 계산 (비활성 제외)
// - calcCategoryBreakdown(): 카테고리별 집계
// - filterByPeriod(): 연월별 거래 필터링
// - getYears(): 연도 추출
// - getMonthsWithData(): 월 추출
// - buildMonthlyChartData(): 월별 차트 데이터 생성

function calcKpi(txs) {
  let income = 0, expense = 0;
  txs.forEach(tx => {
    // 카테고리 규칙의 type으로 판단
    const rule = state.rules.find(r => r.category === tx.category);
    const isIncome = rule && rule.type === 'income';

    const amount = Math.abs(tx.amount);
    if (isIncome) {
      income += amount;
    } else {
      expense += amount;
    }
  });
  return { income, expense, net: income - expense };
}

function calcCategoryBreakdown(txs) {
  const map = {};
  CATEGORIES.forEach(c => { map[c] = { total: 0, count: 0 }; });
  // 분류된 거래만 처리 (미분류는 제외)
  txs.filter(tx => tx.category !== null).forEach(tx => {
    if (map[tx.category]) {
      map[tx.category].total += tx.amount;
      map[tx.category].count++;
    }
  });
  const grandTotal = Object.values(map).reduce((s, v) => s + Math.abs(v.total), 0);
  return CATEGORIES.map(c => ({
    category: c,
    total: map[c].total,
    count: map[c].count,
    pct: grandTotal ? Math.round(Math.abs(map[c].total) / grandTotal * 100) : 0
  })).filter(r => r.count > 0);
}

function getYears(txs) {
  // tx.date는 이미 YYYY-MM-DD 형식으로 정규화됨 (buildTransactions에서)
  const years = new Set(txs.map(tx => tx.date.split('-')[0]));
  return [...years].sort();
}

function filterByPeriod(txs, year, month) {
  // tx.date는 이미 YYYY-MM-DD 형식으로 정규화됨 (buildTransactions에서)
  return txs.filter(tx => {
    const [y, m] = tx.date.split('-');
    if (y !== year) return false;
    if (month && m !== month) return false;
    return true;
  });
}

function buildMonthlyChartData(txs, year) {
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const labels = months.map(m => `${parseInt(m)}월`);
  const income  = months.map(m => {
    const filtered = filterByPeriod(txs, year, m);
    return filtered.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  });
  const expense = months.map(m => {
    const filtered = filterByPeriod(txs, year, m);
    return filtered.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  });
  return { labels, income, expense };
}

function getMonthsWithData(txs, year) {
  const months = new Set(filterByPeriod(txs, year, null).map(tx => tx.date.slice(5, 7)));
  return [...months].sort();
}
