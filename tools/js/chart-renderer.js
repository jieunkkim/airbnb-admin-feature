/* ── ⑦ CHART RENDERING ── */
// 차트 렌더링 함수 (Chart.js 라이브러리 필요)
// - renderMonthlyLineChart(): 월별 추이 라인차트 (수입/지출)
// - renderDoughnutChart(): 카테고리별 비율 도넛차트

function renderMonthlyLineChart(allTxs, year, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !allTxs || !year) return;
  year = String(year);  // 문자열로 명시적 변환
  const { labels, income, expense } = buildMonthlyChartData(allTxs, year);

  // 데이터 검증
  const totalIncome = income.reduce((s, v) => s + v, 0);
  const totalExpense = expense.reduce((s, v) => s + v, 0);
  console.log('[Report] Monthly line chart data:', { year, totalIncome, totalExpense, incomeArray: income, expenseArray: expense });

  if (totalIncome === 0 && totalExpense === 0) {
    console.warn('[Report] No monthly data for year:', year);
    return;
  }

  const maxValue = Math.max(...income, ...expense, 0);
  // 만원 단위로 올림
  const maxManWon = maxValue > 0 ? Math.ceil(maxValue / 10000) : 100;
  const roundedMaxManWon = Math.ceil(maxManWon / 5) * 5;
  const yMax = roundedMaxManWon * 10000;
  const stepManWon = roundedMaxManWon / 5;
  const stepSize = stepManWon * 10000;

  // canvas 크기 부모 요소에 맞추기
  const parentWidth = canvas.parentElement.offsetWidth - 32;
  canvas.width = parentWidth;
  canvas.height = 280;

  const chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '수입',
          data: income,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#16a34a',
          pointRadius: 4
        },
        {
          label: '지출',
          data: expense,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220,38,38,.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#dc2626',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 } } },
        layout: { padding: { left: 10, right: 20, top: 10 } }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            font: { size: 11 }
          }
        },
        y: {
          max: yMax,
          ticks: {
            stepSize: stepSize,
            callback: v => {
              const manWon = Math.round(v / 10000);
              return `₩${fmtN(manWon)} 만원`;
            }
          },
          grid: { color: 'rgba(0,0,0,.05)' }
        }
      }
    }
  });

  return chartInstance;
}

function renderDoughnutChart(breakdown, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !breakdown || !breakdown.length) {
    console.warn('[Report] No breakdown data for doughnut chart');
    return;
  }
  const labels = breakdown.map(r => r.category);
  const data   = breakdown.map(r => Math.abs(r.total));
  const bgColors = breakdown.map(r => {
    const color = getCategoryColor(r.category);
    let bgColor = color.bg || color;
    // rgba 색상을 더 진하게 만들기 (알파값 증가)
    if (bgColor.startsWith('rgba')) {
      bgColor = bgColor.replace(/,\s*[\d.]+\)/, ', 0.6)');
    }
    return bgColor;
  });

  // canvas 크기 명시적 설정
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = 280;
  const chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 14, padding: 15 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const idx = ctx.dataIndex;
              const pct = breakdown[idx]?.pct || 0;
              return ` ₩${fmtN(ctx.raw)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
  console.log('[Report] Doughnut chart rendered:', labels);
  return chartInstance;
}
