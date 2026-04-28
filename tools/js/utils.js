/* ── ⑪ PUBLIC UTILITIES ── */
// 공용 유틸리티 함수 (모든 도구에서 사용 가능)
// - esc(): HTML 이스케이프 (XSS 방지)
// - fmtN(): 숫자 포매팅 (한글 로케일)
// - toast(): 토스트 메시지 (2.8초 표시)
// - showMsg(): 메시지 박스 (success/error/warning)
// - showWarn(): 경고 메시지

function showWarn(msg) {
  const el = document.getElementById('mo_warn');
  el.textContent = msg;
  el.style.display = 'block';
}

function showMsg(elementId, text, type) {
  const el = document.getElementById(elementId);
  const colors = {
    success: { bg: 'rgba(22,163,74,.08)', border: 'rgba(22,163,74,.2)', color: 'var(--gr)' },
    error: { bg: 'rgba(220,38,38,.08)', border: 'rgba(220,38,38,.2)', color: 'var(--rd)' },
    warning: { bg: 'rgba(217,119,6,.08)', border: 'rgba(217,119,6,.2)', color: 'var(--am)' }
  };
  const c = colors[type] || colors.success;
  el.innerHTML = `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:var(--r8);padding:10px 14px;font-size:13px;color:${c.color}">${esc(text)}</div>`;
  el.style.display = 'block';
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function fmtN(num) {
  return num.toLocaleString('ko-KR');
}
