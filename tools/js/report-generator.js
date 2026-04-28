/* ── ⑥ REPORT GENERATION & ⑧ DATA EXPORT ── */
// 리포트 생성 및 내보내기 함수
// - completeStep4(): Step 4 완료 핸들러 (리포트 생성)
// - getActiveTransactions(): 제외되지 않은 거래 필터링
// - renderReport(): 리포트 진입점 (연월 섹션 생성)
// - buildYearSection(): 연도 섹션 빌드
// - buildMonthSection(): 월 섹션 빌드
// - renderSummaryBar(): 수입/지출 비율 바 렌더링
// - renderUnclassifiedBanner(): 미분류 거래 배너
// - renderInsights(): 인사이트 배지 렌더링
// - renderPeriodBar(): 기간 선택 바 (네비게이션)
// - renderKpiCards(): KPI 카드 렌더링
// - renderCategoryDetails(): 카테고리 상세 정보 토글
// - toggleCategoryDetail(): 카테고리 상세 토글
// - scrollToSection(): 섹션으로 부드러운 스크롤
// - initScrollSpy(): Scroll Spy 초기화 (활성 섹션 표시)
// - copyReportText(): 리포트 마크다운 형식으로 복사
// - exportReviewData(): 거래 데이터 TSV 형식으로 복사

// 전역 변수 참조: state, reportChartInstances
// 함수 참조: calcKpi(), calcCategoryBreakdown(), getYears(), getMonthsWithData(), filterByPeriod() (data-calculator.js)
//           getCategoryColor(), esc(), fmtN(), toast() (utils.js)
//           renderMonthlyLineChart(), renderDoughnutChart() (chart-renderer.js)
//           switchStep() (main HTML)

let reportChartInstances = [];  // 모든 차트 인스턴스 관리

function completeStep4() {
  switchStep(4);
  renderReport();  // renderReport() 내에서 renderPeriodBar() 호출됨
}

function getActiveTransactions() {
  return state.transactions.filter(tx => !tx.excluded);
}

function renderSummaryBar(kpi) {
  const container = document.getElementById('reportSummaryBar');
  if (!container) return;
  const income = Number(kpi.income) || 0;
  const expense = Number(kpi.expense) || 0;
  const total = income + expense;
  if (total === 0) {
    container.innerHTML = '';
    return;
  }
  const incomePct = Math.round((income / total) * 100);
  const expensePct = 100 - incomePct;
  container.innerHTML = `
    <div class="summary-bar-label">
      <span>수입 · 지출 비율</span>
      <span style="color:var(--t1);font-weight:600">${incomePct}% · ${expensePct}%</span>
    </div>
    <div class="summary-bar-track">
      <div class="summary-bar-fill" style="width:${incomePct}%;background:var(--gr)">${incomePct}%</div>
      <div class="summary-bar-fill" style="width:${expensePct}%;background:var(--rd)">${expensePct}%</div>
    </div>
  `;
}

function renderUnclassifiedBanner(allTxs) {
  const container = document.getElementById('reportUnclassifiedBanner');
  if (!container) return;
  const unclassified = allTxs.filter(tx => !tx.excluded && tx.category === null);
  if (unclassified.length === 0) {
    container.classList.remove('show');
    return;
  }
  container.innerHTML = `
    <div class="banner-text">⚠️ ${unclassified.length}건의 거래가 미분류됩니다</div>
    <button class="banner-btn" onclick="switchStep(1)">규칙 탭으로</button>
  `;
  container.classList.add('show');
}

function renderInsights(kpi, breakdown, allTxs, year, month) {
  const container = document.getElementById('reportInsightRow');
  if (!container) return;
  const income = Number(kpi.income) || 0;
  const net = Number(kpi.net) || 0;

  let badges = [];

  // 카테고리별 차지하는 비율과 금액
  breakdown.forEach(cat => {
    const colorInfo = getCategoryColor(cat.category);
    const colorFg = colorInfo.fg || colorInfo;
    badges.push({
      label: cat.category,
      value: `₩${fmtN(Math.abs(cat.total))}`,
      sub: `${cat.pct}%`,
      color: colorFg
    });
  });

  // 수익률
  if (income > 0) {
    const profitMargin = Math.round((net / income) * 100);
    badges.push({
      label: '수익률',
      value: `${profitMargin}%`,
      color: net >= 0 ? 'var(--gr)' : 'var(--rd)'
    });
  }

  if (badges.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = badges.map(b => `
    <div class="insight-badge" style="border-left:3px solid ${b.color}">
      <div class="insight-badge-label">${b.label}</div>
      <div class="insight-badge-value" style="color:${b.color || 'var(--t1)'}">${b.value}</div>
      ${b.sub ? `<div style="font-size:11px;color:var(--t3)">${b.sub}</div>` : ''}
    </div>
  `).join('');
}

function renderReport() {
  const all = getActiveTransactions();
  if (!all.length) {
    toast('제외되지 않은 거래가 없습니다');
    return;
  }

  const years = getYears(all);
  renderPeriodBar(years);
  renderUnclassifiedBanner(all);

  // 기존 차트 인스턴스 모두 destroy
  reportChartInstances.forEach(c => c?.destroy());
  reportChartInstances = [];

  // 모든 연도·월 섹션 렌더링
  const container = document.getElementById('reportAllSections');
  container.innerHTML = '';

  years.forEach(year => {
    container.appendChild(buildYearSection(year, all));
    getMonthsWithData(all, year).sort().forEach(month => {
      container.appendChild(buildMonthSection(year, month, all));
    });
  });

  // Scroll Spy 초기화
  initScrollSpy();
}

/**
 * 연도 섹션 빌드
 */
function buildYearSection(year, allTxs) {
  const wrapper = document.createElement('div');
  wrapper.id = `report-${year}`;
  wrapper.className = 'report-section';

  const yearTxs = filterByPeriod(allTxs, year, null);
  const classifiedTxs = yearTxs.filter(tx => tx.category !== null && !tx.inactiveRule);
  const kpi = calcKpi(classifiedTxs);
  const breakdown = calcCategoryBreakdown(classifiedTxs);
  const monthsWithData = getMonthsWithData(allTxs, year);

  let html = `<div class="report-section-title">${year}년</div>`;

  // KPI 카드
  const incomeStr = fmtN(Math.abs(kpi.income));
  const expenseStr = fmtN(Math.abs(kpi.expense));
  const netStr = fmtN(Math.abs(kpi.net));
  html += `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">총 수입</div><div class="kpi-value" style="color:var(--gr)">₩${incomeStr}</div></div>
      <div class="kpi-card"><div class="kpi-label">총 지출</div><div class="kpi-value" style="color:var(--rd)">₩${expenseStr}</div></div>
      <div class="kpi-card"><div class="kpi-label">순이익</div><div class="kpi-value" style="color:${kpi.net >= 0 ? 'var(--gr)' : 'var(--rd)'}">₩${netStr}</div></div>
    </div>
  `;

  // 비율 바
  renderSummaryBar(kpi);
  const summaryBarHtml = document.getElementById('reportSummaryBar').innerHTML;
  html += `<div id="temp-summary" style="margin-bottom:20px">${summaryBarHtml}</div>`;

  // 라인 차트 (월 2개 이상이면)
  if (monthsWithData.length > 1) {
    const canvasId = `line-${year}`;
    html += `
      <div class="card" style="padding:16px;display:flex;flex-direction:column;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:12px">월별 추이</div>
        <canvas id="${canvasId}" height="300"></canvas>
      </div>
    `;
  }

  // 인사이트
  renderInsights(kpi, breakdown, allTxs, year, null);
  const insightHtml = document.getElementById('reportInsightRow').innerHTML;
  html += `<div style="margin-bottom:20px">${insightHtml}</div>`;

  // 카테고리 상세 (년도 섹션 ID 포함)
  renderCategoryDetails(breakdown, classifiedTxs, `report-${year}`);
  const catDetailsHtml = document.getElementById('reportCatDetailsContainer').innerHTML;
  html += `<div style="margin-bottom:20px"><div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:10px">카테고리별 상세</div>${catDetailsHtml}</div>`;

  wrapper.innerHTML = html;

  // 라인 차트 렌더링 (wrapper 반환 전에 차트 생성)
  if (monthsWithData.length > 1) {
    const canvasId = `line-${year}`;
    // setTimeout으로 DOM 레이아웃 완료 후 차트 렌더링
    setTimeout(() => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const chartInstance = renderMonthlyLineChart(allTxs, year, canvasId);
        if (chartInstance) reportChartInstances.push(chartInstance);
      }
    }, 0);
  }

  return wrapper;
}

/**
 * 월 섹션 빌드
 */
function buildMonthSection(year, month, allTxs) {
  const wrapper = document.createElement('div');
  wrapper.id = `report-${year}-${month}`;
  wrapper.className = 'report-section';

  const monthTxs = filterByPeriod(allTxs, year, month);
  const classifiedTxs = monthTxs.filter(tx => tx.category !== null && !tx.inactiveRule);
  const kpi = calcKpi(classifiedTxs);
  const breakdown = calcCategoryBreakdown(classifiedTxs);
  const monthName = parseInt(month) + '월';

  let html = `<div class="report-section-title">${year}년 ${monthName}</div>`;

  // KPI 카드
  const incomeStr = fmtN(Math.abs(kpi.income));
  const expenseStr = fmtN(Math.abs(kpi.expense));
  const netStr = fmtN(Math.abs(kpi.net));
  html += `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">총 수입</div><div class="kpi-value" style="color:var(--gr)">₩${incomeStr}</div></div>
      <div class="kpi-card"><div class="kpi-label">총 지출</div><div class="kpi-value" style="color:var(--rd)">₩${expenseStr}</div></div>
      <div class="kpi-card"><div class="kpi-label">순이익</div><div class="kpi-value" style="color:${kpi.net >= 0 ? 'var(--gr)' : 'var(--rd)'}">₩${netStr}</div></div>
    </div>
  `;

  // 비율 바
  renderSummaryBar(kpi);
  const summaryBarHtml = document.getElementById('reportSummaryBar').innerHTML;
  html += `<div style="margin-bottom:20px">${summaryBarHtml}</div>`;

  // 도넛 차트
  const canvasId = `doughnut-${year}-${month}`;
  html += `
    <div class="card" style="padding:16px;display:flex;flex-direction:column;align-items:center;margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:12px">카테고리 비율</div>
      <canvas id="${canvasId}" height="300" width="300"></canvas>
    </div>
  `;

  // 인사이트
  renderInsights(kpi, breakdown, allTxs, year, month);
  const insightHtml = document.getElementById('reportInsightRow').innerHTML;
  html += `<div style="margin-bottom:20px">${insightHtml}</div>`;

  // 카테고리 상세 (월 섹션 ID 포함)
  renderCategoryDetails(breakdown, classifiedTxs, `report-${year}-${month}`);
  const catDetailsHtml = document.getElementById('reportCatDetailsContainer').innerHTML;
  html += `<div><div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:10px">카테고리별 상세</div>${catDetailsHtml}</div>`;

  wrapper.innerHTML = html;

  // 도넛 차트 렌더링 (wrapper 반환 전에 차트 생성)
  if (breakdown.length > 0) {
    // setTimeout으로 DOM 레이아웃 완료 후 차트 렌더링
    setTimeout(() => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const chartInstance = renderDoughnutChart(breakdown, canvasId);
        if (chartInstance) reportChartInstances.push(chartInstance);
      }
    }, 0);
  }

  return wrapper;
}

function renderPeriodBar(years) {
  const bar = document.getElementById('reportPeriodBar');
  if (!bar) return;

  let html = '';

  // 모든 연도와 월의 라벨 렌더링
  years.forEach(year => {
    // 연도 라벨
    html += `<button class="period-chip" data-target="report-${year}" onclick="scrollToSection('report-${year}')">${year}년</button>`;

    // 해당 연도의 월 라벨들
    const all = getActiveTransactions();
    const months = getMonthsWithData(all, year).sort();
    months.forEach(month => {
      html += `<button class="period-chip" data-target="report-${year}-${month}" onclick="scrollToSection('report-${year}-${month}')">${parseInt(month)}월</button>`;
    });
  });

  bar.innerHTML = html;
}

/**
 * 해당 섹션으로 부드럽게 스크롤 이동
 */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Scroll Spy: 현재 화면에 보이는 섹션에 따라 라벨 활성화
 */
function initScrollSpy() {
  if (window._reportSpyObserver) window._reportSpyObserver.disconnect();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // 모든 라벨 비활성화
      document.querySelectorAll('.period-chip').forEach(c => c.classList.remove('active'));

      // 현재 섹션에 해당하는 라벨 활성화
      const chip = document.querySelector(`.period-chip[data-target="${entry.target.id}"]`);
      if (chip) chip.classList.add('active');
    });
  }, { threshold: 0.15, rootMargin: '-10% 0px -70% 0px' });

  // 모든 섹션에 observer 등록
  document.querySelectorAll('.report-section').forEach(el => observer.observe(el));
  window._reportSpyObserver = observer;
}

function renderKpiCards(kpi) {
  const row = document.getElementById('kpiRow');
  if (!row || !kpi) return;
  const income = Number(kpi.income) || 0;
  const expense = Number(kpi.expense) || 0;
  const net = Number(kpi.net) || 0;
  const cards = [
    { label: '총 수입', value: income, color: 'var(--gr)', sub: '(+) 합계' },
    { label: '총 지출', value: expense, color: 'var(--rd)', sub: '(-) 합계' },
    { label: '순이익',  value: net,     color: net >= 0 ? 'var(--gr)' : 'var(--rd)', sub: '수입 - 지출' }
  ];
  row.innerHTML = cards.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="color:${c.color}">₩${fmtN(Math.abs(c.value))}</div>
      <div class="kpi-sub">${c.sub}</div>
    </div>
  `).join('');
  console.log('[Report] KPI:', { income, expense, net });
}

function renderCategoryDetails(breakdown, periodTxs, sectionId) {
  // sectionId를 사용하여 고유한 ID 생성 (예: section-id가 'report-2026-4'면 'detail-report-2026-4-0')
  // sectionId가 없으면 임시 고유값 생성
  const uniquePrefix = sectionId || `temp-${Date.now()}-${Math.random()}`;

  const html = breakdown.map((r, idx) => {
    const colorInfo = getCategoryColor(r.category);
    const colorFg = colorInfo.fg || colorInfo;
    const detailId = `detail-${uniquePrefix}-${idx}`;
    const iconId = `icon-${uniquePrefix}-${idx}`;
    const txsContainerId = `catTxs-${uniquePrefix}-${idx}`;
    return `
    <div style="margin-bottom:12px;border:1px solid var(--b1);border-radius:var(--r8);overflow:hidden">
      <!-- 토글 헤더 -->
      <div style="padding:14px 16px;background:var(--s2);cursor:pointer;display:flex;align-items:center;gap:12px" onclick="toggleCategoryDetail('${detailId}', this)">
        <span id="${iconId}" style="font-size:14px">▼</span>
        <div style="width:8px;height:8px;border-radius:50%;background:${colorFg};flex-shrink:0"></div>
        <span style="flex:1;font-size:13px;font-weight:600;color:var(--t1)">${esc(r.category)}</span>
        <span style="font-size:13px;font-weight:600;color:var(--t2)">₩${fmtN(Math.abs(r.total))}</span>
        <span style="font-size:12px;color:var(--t3);min-width:40px;text-align:right">${r.pct}%</span>
        <span style="font-size:12px;color:var(--t3);min-width:40px;text-align:right">${r.count}건</span>
      </div>
      <!-- 토글 콘텐츠 (거래 내역) -->
      <div id="${detailId}" style="display:none;padding:16px;background:var(--s1);max-height:400px;overflow-y:auto">
        <div style="font-size:12px;color:var(--t3);margin-bottom:10px">해당 카테고리의 거래 내역</div>
        <div id="${txsContainerId}"></div>
      </div>
    </div>
  `;
  }).join('');

  // 임시 컨테이너에 렌더링
  const container = document.getElementById('reportCatDetailsContainer');
  if (container) container.innerHTML = html;

  // 각 카테고리의 거래 내역 렌더링 (선택한 기간에서만)
  breakdown.forEach((r, idx) => {
    const catTxs = periodTxs.filter(tx => tx.category === r.category);
    const txsHtml = catTxs.map(tx => `
      <div style="padding:8px;border-bottom:1px solid var(--b2);font-size:11px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="color:var(--t2)">${esc(tx.date)}</span>
          <span style="font-weight:600">${tx.amount > 0 ? '<span style="color:var(--gr)">+' : '<span style="color:var(--rd)">'}₩${fmtN(Math.abs(tx.amount))}</span></span>
        </div>
        <div style="color:var(--t3)">${esc(tx.desc)}</div>
      </div>
    `).join('');

    const txsContainerId = `catTxs-${uniquePrefix}-${idx}`;
    const txsContainer = document.getElementById(txsContainerId);
    if (txsContainer) {
      txsContainer.innerHTML = txsHtml || '<div style="color:var(--t3);padding:8px">거래 내역이 없습니다</div>';
    }
  });

  // 반환된 HTML (임시 컨테이너에서 캡처하기 위함)
  return html;
}

function toggleCategoryDetail(detailId, header) {
  const detail = document.getElementById(detailId);
  const icon = header.querySelector('span:first-child');
  if (detail.style.display === 'none') {
    detail.style.display = 'block';
    icon.textContent = '▼';
  } else {
    detail.style.display = 'none';
    icon.textContent = '▶';
  }
}

function copyReportText() {
  const all = getActiveTransactions();
  if (!all.length) {
    toast('복사할 데이터가 없습니다');
    return;
  }

  const years = getYears(all);
  let md = `# 에어비앤비 수익 리포트\n\n`;
  md += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;

  years.forEach(year => {
    md += `## ${year}년 전체\n\n`;

    const yearTxs = filterByPeriod(all, year, null);
    const classifiedYearTxs = yearTxs.filter(tx => tx.category !== null);
    const yearKpi = calcKpi(classifiedYearTxs);
    const yearBreakdown = calcCategoryBreakdown(classifiedYearTxs);

    // 년도 KPI
    md += `### KPI\n`;
    md += `| 항목 | 금액 |\n`;
    md += `|------|--------|\n`;
    md += `| 총 수입 | ₩${fmtN(yearKpi.income)} |\n`;
    md += `| 총 지출 | ₩${fmtN(yearKpi.expense)} |\n`;
    md += `| 순이익 | ₩${fmtN(yearKpi.net)} |\n\n`;

    // 년도 카테고리별 분석
    if (yearBreakdown.length > 0) {
      md += `### 카테고리별 분석\n`;
      md += `| 카테고리 | 금액 | 비율 | 거래수 |\n`;
      md += `|----------|------|------|--------|\n`;
      yearBreakdown.forEach(r => {
        md += `| ${r.category} | ₩${fmtN(Math.abs(r.total))} | ${r.pct}% | ${r.count}건 |\n`;
      });
      md += '\n';
    }

    // 월별 상세
    const monthsWithData = getMonthsWithData(all, year).sort();
    if (monthsWithData.length > 0) {
      md += `### 월별 상세\n\n`;

      monthsWithData.forEach(month => {
        md += `#### ${year}년 ${parseInt(month)}월\n\n`;

        const monthTxs = filterByPeriod(all, year, month);
        const classifiedMonthTxs = monthTxs.filter(tx => tx.category !== null);
        const monthKpi = calcKpi(classifiedMonthTxs);
        const monthBreakdown = calcCategoryBreakdown(classifiedMonthTxs);

        // 월별 KPI
        md += `| 항목 | 금액 |\n`;
        md += `|------|--------|\n`;
        md += `| 총 수입 | ₩${fmtN(monthKpi.income)} |\n`;
        md += `| 총 지출 | ₩${fmtN(monthKpi.expense)} |\n`;
        md += `| 순이익 | ₩${fmtN(monthKpi.net)} |\n\n`;

        // 월별 카테고리
        if (monthBreakdown.length > 0) {
          md += `| 카테고리 | 금액 | 비율 | 거래수 |\n`;
          md += `|----------|------|------|--------|\n`;
          monthBreakdown.forEach(r => {
            md += `| ${r.category} | ₩${fmtN(Math.abs(r.total))} | ${r.pct}% | ${r.count}건 |\n`;
          });
        }
        md += '\n';
      });
    }

    md += '---\n\n';
  });

  // 클립보드에 복사
  navigator.clipboard.writeText(md).then(() => {
    toast('마크다운 형식으로 복사되었습니다 (Notion 붙여넣기 가능)');
  }).catch(err => {
    console.error('복사 실패:', err);
    toast('복사 실패했습니다');
  });
}

function exportReviewData() {
  const active = state.transactions.filter(tx => !tx.excluded);
  if (!active.length) {
    toast('내보낼 데이터가 없습니다');
    return;
  }

  // 헤더 작성
  let txt = '날짜\t설명\t메모\t금액\t카테고리\n';

  // 데이터 행 작성
  active.forEach(tx => {
    const amount = tx.amount < 0 ? `-${Math.abs(tx.amount)}` : tx.amount;
    txt += `${tx.date}\t${tx.desc}\t${tx.memo || '-'}\t${amount}\t${tx.category}\n`;
  });

  navigator.clipboard.writeText(txt)
    .then(() => toast('데이터가 복사되었습니다 (엑셀에 붙여넣기 가능)'))
    .catch(() => toast('복사 실패 - 브라우저 권한을 확인하세요'));
}
