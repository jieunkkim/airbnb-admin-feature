/* ── PDF Utilities for Airbnb Revenue Analyzer ── */

/**
 * CSS 변수 → HEX 색상 매핑
 */
const PDF_COLORS = {
  green:  '#16a34a',    // var(--gr)
  red:    '#dc2626',    // var(--rd)
  orange: '#e8650a',    // var(--ac)
  t1:     '#111827',    // 본문 텍스트
  t2:     '#374151',    // 보조 텍스트
  t3:     '#6b7280',    // 약한 텍스트
  s2:     '#f3f4f6',    // 배경 톤
  border: '#e5e7eb'     // 테두리
};

/**
 * CSS 변수를 HEX 리터럴로 변환
 */
function resolveCssVar(colorStr) {
  if (!colorStr) return PDF_COLORS.t1;
  if (colorStr.startsWith('var(--')) {
    const varName = colorStr.match(/var\(--(\w+)\)/)?.[1];
    return varName === 'gr' ? PDF_COLORS.green
         : varName === 'rd' ? PDF_COLORS.red
         : varName === 'ac' ? PDF_COLORS.orange
         : varName === 't1' ? PDF_COLORS.t1
         : varName === 't2' ? PDF_COLORS.t2
         : varName === 't3' ? PDF_COLORS.t3
         : colorStr;
  }
  return colorStr;
}

/**
 * 헤더 섹션 (제목 + 생성일)
 */
function buildHeader(date) {
  return `
    <div style="margin-bottom:30px">
      <h1 style="margin:0 0 10px 0;font-size:28px;font-weight:700;color:${PDF_COLORS.t1}">에어비앤비 수익 보고서</h1>
      <p style="margin:0;font-size:13px;color:${PDF_COLORS.t3}">생성일: ${date}</p>
    </div>
  `;
}

/**
 * 전체 기간 KPI 섹션
 */
function buildOverallKpiSection(kpi) {
  return `
    <div style="margin:20px 0">
      <div style="padding:16px;background:${PDF_COLORS.s2};border:1px solid ${PDF_COLORS.border};margin-bottom:10px">
        <div style="font-size:11px;color:${PDF_COLORS.t3};font-weight:600;margin-bottom:4px">총 수입</div>
        <div style="font-size:18px;font-weight:700;color:${PDF_COLORS.green}">₩${fmtN(kpi.income)}</div>
      </div>
      <div style="padding:16px;background:${PDF_COLORS.s2};border:1px solid ${PDF_COLORS.border};margin-bottom:10px">
        <div style="font-size:11px;color:${PDF_COLORS.t3};font-weight:600;margin-bottom:4px">총 지출</div>
        <div style="font-size:18px;font-weight:700;color:${PDF_COLORS.red}">₩${fmtN(kpi.expense)}</div>
      </div>
      <div style="padding:16px;background:${PDF_COLORS.s2};border:1px solid ${PDF_COLORS.border}">
        <div style="font-size:11px;color:${PDF_COLORS.t3};font-weight:600;margin-bottom:4px">순이익</div>
        <div style="font-size:18px;font-weight:700;color:${kpi.net >= 0 ? PDF_COLORS.green : PDF_COLORS.red}">₩${fmtN(kpi.net)}</div>
      </div>
    </div>
  `;
}

/**
 * 월별 KPI 리스트
 */
function buildMonthlyKpiTable(all, years) {
  let html = `<h3 style="font-size:16px;font-weight:700;margin:30px 0 16px 0;color:${PDF_COLORS.t1}">월별 현황</h3>`;
  html += `<div style="font-size:11px;line-height:1.8">`;

  years.forEach(year => {
    const months = getMonthsWithData(all, year).sort();
    let yearIncome = 0, yearExpense = 0, yearNet = 0;

    months.forEach(month => {
      const monthTxs = filterByPeriod(all, year, month);
      const classifiedTxs = monthTxs.filter(tx => tx.category !== null);
      const kpi = calcKpi(classifiedTxs);

      yearIncome += kpi.income;
      yearExpense += kpi.expense;
      yearNet += kpi.net;

      const monthName = parseInt(month) + '월';
      html += `<div style="padding:8px 0;border-bottom:1px solid ${PDF_COLORS.border};color:${PDF_COLORS.t2}">`;
      html += `${year}년 ${monthName} | `;
      html += `<span style="color:${PDF_COLORS.green}">수입 ₩${fmtN(kpi.income)}</span> | `;
      html += `<span style="color:${PDF_COLORS.red}">지출 ₩${fmtN(kpi.expense)}</span> | `;
      html += `<span style="color:${kpi.net >= 0 ? PDF_COLORS.green : PDF_COLORS.red};font-weight:600">순이익 ₩${fmtN(kpi.net)}</span>`;
      html += `</div>`;
    });

    // 연도 소계
    html += `<div style="padding:10px 0;background:${PDF_COLORS.s2};border-bottom:2px solid ${PDF_COLORS.border};color:${PDF_COLORS.t1};font-weight:700">`;
    html += `${year} 소계 | `;
    html += `<span style="color:${PDF_COLORS.green}">수입 ₩${fmtN(yearIncome)}</span> | `;
    html += `<span style="color:${PDF_COLORS.red}">지출 ₩${fmtN(yearExpense)}</span> | `;
    html += `<span style="color:${yearNet >= 0 ? PDF_COLORS.green : PDF_COLORS.red}">순이익 ₩${fmtN(yearNet)}</span>`;
    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

/**
 * 카테고리별 거래 상세 테이블
 */
function buildCategoryBreakdownTable(breakdown, txs) {
  let html = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px;font-family:Arial, sans-serif">
      <thead>
        <tr style="background:${PDF_COLORS.s2}">
          <th style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:left;color:${PDF_COLORS.t1};font-weight:600">카테고리</th>
          <th style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t1};font-weight:600">금액</th>
          <th style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t1};font-weight:600">비율</th>
          <th style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t1};font-weight:600">건수</th>
        </tr>
      </thead>
      <tbody>
  `;

  breakdown.forEach(cat => {
    const colorInfo = getCategoryColor(cat.category);
    const colorFg = resolveCssVar(colorInfo.fg || colorInfo);

    // 카테고리 헤더 행
    html += `
      <tr style="background:#fafafa;border-left:4px solid ${colorFg};border-bottom:1px solid ${PDF_COLORS.border}">
        <td style="padding:10px;border:1px solid ${PDF_COLORS.border};color:${PDF_COLORS.t1};font-weight:600">${esc(cat.category)}</td>
        <td style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t2};font-weight:600">₩${fmtN(Math.abs(cat.total))}</td>
        <td style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t2}">${cat.pct}%</td>
        <td style="padding:10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${PDF_COLORS.t2}">${cat.count}건</td>
      </tr>
    `;

    // 해당 카테고리 거래 행들 (들여쓰기)
    const catTxs = txs.filter(tx => tx.category === cat.category);
    catTxs.forEach(tx => {
      const amtColor = tx.amount > 0 ? PDF_COLORS.green : PDF_COLORS.red;
      html += `
        <tr style="border-bottom:1px solid ${PDF_COLORS.border}">
          <td style="padding:8px 10px 8px 20px;border:1px solid ${PDF_COLORS.border};color:${PDF_COLORS.t3};font-size:10px">
            ${esc(tx.date)} — ${esc(tx.desc)}
          </td>
          <td colspan="3" style="padding:8px 10px;border:1px solid ${PDF_COLORS.border};text-align:right;color:${amtColor};font-size:10px">
            ₩${fmtN(Math.abs(tx.amount))}
          </td>
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
  `;
  return html;
}

/**
 * 월별 상세 섹션 (page-break 포함)
 */
function buildMonthDetailSection(year, month, txs) {
  const monthName = parseInt(month) + '월';
  const classifiedTxs = txs.filter(tx => tx.category !== null);
  const breakdown = calcCategoryBreakdown(classifiedTxs);

  let html = `
    <div style="page-break-before:always;margin-top:40px">
      <h3 style="font-size:15px;font-weight:700;color:${PDF_COLORS.t1};border-bottom:2px solid ${PDF_COLORS.orange};padding-bottom:10px;margin:0 0 20px 0">
        ${year}년 ${monthName}
      </h3>
  `;

  if (breakdown.length > 0) {
    html += buildCategoryBreakdownTable(breakdown, classifiedTxs);
  } else {
    html += `<p style="color:${PDF_COLORS.t3};font-size:12px">이 기간의 분류된 거래가 없습니다.</p>`;
  }

  html += `</div>`;
  return html;
}

/**
 * 전체 PDF 문서 조립
 */
function buildPdfDocument(mode = 'full') {
  const container = document.createElement('div');
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = PDF_COLORS.t1;
  container.style.fontFamily = "Arial, sans-serif";
  container.style.lineHeight = '1.6';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.boxSizing = 'border-box';

  const all = getActiveTransactions();
  const classifiedAll = all.filter(tx => tx.category !== null);
  const years = getYears(all);
  const overallKpi = calcKpi(classifiedAll);

  let html = buildHeader(new Date().toLocaleDateString('ko-KR'));
  html += buildOverallKpiSection(overallKpi);
  html += buildMonthlyKpiTable(all, years);

  // 상세 모드: 월별 상세 섹션 추가
  if (mode === 'full') {
    years.forEach(year => {
      const months = getMonthsWithData(all, year).sort();
      months.forEach(month => {
        const monthTxs = filterByPeriod(all, year, month);
        html += buildMonthDetailSection(year, month, monthTxs);
      });
    });
  }

  container.innerHTML = html;
  return container;
}

/**
 * PDF 내보내기 실행
 */
function downloadPdf(mode = 'full') {
  if (typeof html2pdf === 'undefined') {
    toast('PDF 라이브러리를 로드 중...');
    return;
  }

  const all = getActiveTransactions();
  if (!all.length) {
    toast('데이터가 없습니다');
    return;
  }

  const years = getYears(all);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const filename = years.length === 1
    ? `에어비앤비-리포트-${firstYear}.pdf`
    : `에어비앤비-리포트-${firstYear}년-${lastYear}년.pdf`;

  const container = buildPdfDocument(mode);
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.background = '#fff';
  document.body.appendChild(container);

  toast('PDF 생성 중...');

  html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowHeight: container.scrollHeight,
        windowWidth: 794
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: false
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    })
    .from(container)
    .save()
    .then(() => {
      document.body.removeChild(container);
      toast('PDF가 생성되었습니다');
    })
    .catch(err => {
      console.error('[PDF 오류]', err);
      document.body.removeChild(container);
      toast('PDF 생성에 실패했습니다');
    });
}

/**
 * PDF 옵션 모달 열기
 */
function openPdfOptionsModal() {
  const mo = document.getElementById('mo_pdfOptions');
  if (mo) mo.classList.add('open');
}

/**
 * PDF 옵션 모달 닫기
 */
function closePdfOptionsModal() {
  const mo = document.getElementById('mo_pdfOptions');
  if (mo) mo.classList.remove('open');
}

/**
 * PDF 미리보기 모달 열기
 */
function openPdfPreviewModal() {
  const mo = document.getElementById('mo_pdfPreview');
  if (mo) mo.classList.add('open');
}

/**
 * PDF 미리보기 모달 닫기
 */
function closePdfPreviewModal() {
  const mo = document.getElementById('mo_pdfPreview');
  if (mo) mo.classList.remove('open');
}

/**
 * PDF 미리보기 렌더링
 */
function previewPdfContent() {
  const selected = document.querySelector('input[name="pdfOption"]:checked');
  const option = selected ? selected.value : 'full';

  const doc = buildPdfDocument(option);
  const content = document.getElementById('pdfPreviewContent');
  if (content) {
    content.innerHTML = doc.innerHTML;
    closePdfOptionsModal();
    openPdfPreviewModal();
  }
}

/**
 * 미리보기 내용을 PDF로 다운로드
 */
function downloadPdfFromPreview() {
  const content = document.getElementById('pdfPreviewContent');

  if (!content || !content.innerHTML) {
    toast('미리보기 내용이 없습니다');
    return;
  }

  // PDF 생성 시 max-height 제한 제거 (전체 내용 캡처 가능하게)
  const originalMaxHeight = content.style.maxHeight;
  const originalOverflow = content.style.overflow;
  content.style.maxHeight = 'none';
  content.style.overflow = 'visible';

  const all = getActiveTransactions();
  const years = getYears(all);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const filename = years.length === 1
    ? `에어비앤비-리포트-${firstYear}.pdf`
    : `에어비앤비-리포트-${firstYear}년-${lastYear}년.pdf`;

  toast('PDF 생성 중...');

  html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['css', 'legacy']
      }
    })
    .from(content)
    .save()
    .then(() => {
      // 스타일 복원
      content.style.maxHeight = originalMaxHeight;
      content.style.overflow = originalOverflow;
      closePdfPreviewModal();
      toast('PDF가 생성되었습니다');
    })
    .catch(err => {
      // 스타일 복원
      content.style.maxHeight = originalMaxHeight;
      content.style.overflow = originalOverflow;
      console.error('[PDF 오류]', err);
      toast('PDF 생성에 실패했습니다');
    });
}

/**
 * 선택된 옵션으로 PDF 내보내기 (미사용)
 */
function executePdfExport() {
  previewPdfContent();
}
