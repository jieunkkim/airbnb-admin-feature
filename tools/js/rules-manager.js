/* ── ② RULES MANAGEMENT ── */
// 규칙 관리 함수 (CRUD, Import/Export, UI 모달)
// - initRules(): 기본 규칙으로 초기화
// - renderRules(): 규칙 목록 테이블 렌더링
// - openRuleModal(): 규칙 추가/수정 모달 열기
// - closeRuleModal(): 모달 닫기
// - updateCategoryInfo(): 카테고리 정보 업데이트
// - saveRule(): 규칙 저장 (추가/수정)
// - toggleCategory(): 규칙 활성/비활성 토글
// - deleteRule(): 규칙 삭제
// - selectColor(): 색상 선택 UI 업데이트
// - openImportRulesModal(): 규칙 불러오기 모달 열기
// - closeImportRulesModal(): 규칙 불러오기 모달 닫기
// - exportRulesAsText(): 규칙을 마크다운 형식으로 복사
// - importRulesFromText(): 마크다운에서 규칙 불러오기
// - resetRules(): 기본 규칙으로 초기화

// 전역 변수 참조: state, editingCategory, DEFAULT_RULES, COLOR_PALETTE
// 함수 참조: getCategoryColor() (utils.js), esc() (utils.js), toast() (utils.js), showWarn() (utils.js)

function initRules() {
  state.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  state.rules.forEach(r => r.isActive = true);
  renderRules();
}

function renderRules() {
  const body = document.getElementById('rulesBody');
  body.innerHTML = state.rules.map((r, idx) => {
    const color = getCategoryColor(r.category);
    const typeText = r.type === 'income' ? '<span style="color:var(--gr);font-weight:700">수익</span>' : '<span style="color:var(--rd);font-weight:700">지출</span>';
    return `
    <tr class="${!r.isActive ? 'disabled-row' : ''}">
      <td style="text-align:center;padding:8px">
        <input type="checkbox" ${r.isActive ? 'checked' : ''} onchange="toggleCategory('${r.category}')"
               style="width:16px;height:16px;accent-color:var(--ac);cursor:pointer">
      </td>
      <td style="padding:8px"><span class="cat-badge" style="background:${color.bg};color:${color.fg}">${r.category}</span></td>
      <td style="padding:8px;text-align:center">${typeText}</td>
      <td style="padding:8px;text-align:left;font-weight:500;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${r.keywords.map(k => `<span style="display:inline-block;background:var(--s2);padding:4px 8px;border-radius:4px;margin-right:6px;font-size:12px">${esc(k)}</span>`).join('')}
      </td>
      <td style="padding:8px;text-align:center;font-size:13px">
        <button class="del-btn" onclick="openRuleModal('${r.category}')" title="수정" style="font-size:13px">✎</button>
        ${!r.isDefault ? `<button class="del-btn" onclick="deleteRule('${r.category}')" title="삭제">✕</button>` : ''}
      </td>
    </tr>
    `;
  }).join('');
}

function openRuleModal(category) {
  const rule = category ? state.rules.find(r => r.category === category) : null;
  editingCategory = category || null;

  document.getElementById('mo_title').textContent = rule ? `${rule.category} 수정` : '규칙 추가';
  document.getElementById('mo_warn').style.display = 'none';
  document.getElementById('mo_warn').textContent = '';

  const catInput = document.getElementById('mo_category');
  const keywordsInput = document.getElementById('mo_keywords');

  if (rule) {
    // 편집 모드
    catInput.value = rule.category;
    catInput.readOnly = true;
    catInput.style.backgroundColor = 'var(--s2)';
    keywordsInput.value = rule.keywords.join(', ');
    keywordsInput.readOnly = false;
    keywordsInput.style.backgroundColor = '';
    keywordsInput.placeholder = '각 줄에 하나씩 또는 쉼표로 구분';
    document.getElementById('mo_info').textContent = '편집 모드에서는 카테고리를 변경할 수 없습니다';
  } else {
    // 추가 모드
    catInput.value = '';
    catInput.readOnly = false;
    catInput.style.backgroundColor = '';
    keywordsInput.value = '';
    keywordsInput.readOnly = false;
    keywordsInput.style.backgroundColor = '';
    keywordsInput.placeholder = '각 줄에 하나씩 또는 쉼표로 구분';
    document.getElementById('mo_info').textContent = '';
  }

  // 색상 팔레트 초기화
  const colorsContainer = document.getElementById('mo_colors');
  colorsContainer.innerHTML = COLOR_PALETTE.map((color, idx) => `
    <div class="color-swatch ${rule && rule.colorIdx === idx ? 'selected' : ''}"
         data-idx="${idx}"
         style="width:32px;height:32px;border-radius:4px;background:${color.bg};border:2px solid ${rule && rule.colorIdx === idx ? color.fg : 'transparent'};cursor:pointer;transition:all .2s"
         onclick="selectColor(${idx})"
         title="${color.name}"></div>
  `).join('');

  // 기본값 설정 (새 규칙은 첫 번째 색상, 첫 번째 색상 선택)
  if (!rule && COLOR_PALETTE.length > 0) {
    const firstSwatch = colorsContainer.querySelector('[data-idx="0"]');
    if (firstSwatch) {
      firstSwatch.classList.add('selected');
      firstSwatch.style.border = `2px solid ${COLOR_PALETTE[0].fg}`;
    }
  }

  // 유형 라디오 버튼 초기화
  const selectedType = rule ? rule.type : 'expense';
  document.querySelectorAll('input[name="mo_type"]').forEach(radio => {
    radio.checked = radio.value === selectedType;
  });

  document.getElementById('mo_rule').classList.add('open');
  catInput.focus();
}

function selectColor(idx) {
  // 모든 스와치에서 selected 클래스 제거
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.remove('selected');
    const swatchIdx = parseInt(swatch.dataset.idx);
    swatch.style.border = `2px solid transparent`;
  });
  // 선택된 스와치에 selected 클래스 추가 및 테두리 표시
  const selectedSwatch = document.querySelector(`.color-swatch[data-idx="${idx}"]`);
  if (selectedSwatch) {
    selectedSwatch.classList.add('selected');
    selectedSwatch.style.border = `2px solid ${COLOR_PALETTE[idx].fg}`;
  }
}

function closeRuleModal() {
  document.getElementById('mo_rule').classList.remove('open');
  editingCategory = null;
}

function moOut(e) {
  if (e.target === document.getElementById('mo_rule')) closeRuleModal();
}

function updateCategoryInfo() {
  const cat = document.getElementById('mo_category').value;
  const existing = state.rules.find(r => r.category === cat && !editingCategory);
  if (existing) {
    document.getElementById('mo_info').textContent = `현재 키워드: ${existing.keywords.join(', ')}`;
  } else {
    document.getElementById('mo_info').textContent = '';
  }
}

function saveRule() {
  const category = document.getElementById('mo_category').value.trim();
  const keywordsText = document.getElementById('mo_keywords').value.trim();

  if (!category) {
    showWarn('카테고리명을 입력하세요');
    return;
  }

  if (!keywordsText) {
    showWarn('최소 하나의 키워드를 입력하세요');
    return;
  }

  // 키워드 정규화 (쉼표 또는 줄바꿈으로 구분)
  const keywords = keywordsText
    .split(/[,\n]+/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);

  if (keywords.length === 0) {
    showWarn('유효한 키워드가 없습니다');
    return;
  }

  // 중복 키워드 체크 (다른 카테고리)
  for (const kw of keywords) {
    const dup = state.rules.find(r => r.category !== category && r.keywords.includes(kw) && !r.isFallback);
    if (dup) {
      showWarn(`"${kw}"은(는) 이미 "${dup.category}"에 포함되어 있습니다`);
      return;
    }
  }

  // 중복 카테고리 체크 (편집 모드가 아닐 때)
  if (!editingCategory) {
    const existingCategory = state.rules.find(r => r.category === category);
    if (existingCategory) {
      showWarn(`"${category}" 카테고리가 이미 존재합니다`);
      return;
    }
  }

  // 색상과 유형 추출
  const colorIdx = parseInt(document.querySelector('.color-swatch.selected')?.dataset.idx ?? 0);
  const type = document.querySelector('input[name="mo_type"]:checked')?.value || 'expense';

  if (editingCategory) {
    // 수정
    const rule = state.rules.find(r => r.category === editingCategory);
    rule.keywords = keywords;
    rule.colorIdx = colorIdx;
    rule.type = type;
  } else {
    // 추가
    state.rules.push({
      category,
      keywords,
      isActive: true,
      isDefault: false,
      colorIdx,
      type
    });
  }

  renderRules();
  closeRuleModal();
  toast(editingCategory ? '규칙이 수정되었습니다' : '규칙이 추가되었습니다');
}

function toggleCategory(category) {
  const rule = state.rules.find(r => r.category === category);
  if (rule) {
    rule.isActive = !rule.isActive;
    renderRules();
  }
}

function deleteRule(category) {
  if (confirm(`"${category}" 규칙을 삭제하시겠습니까?`)) {
    state.rules = state.rules.filter(r => r.category !== category);
    renderRules();
    toast('규칙이 삭제되었습니다');
  }
}

function openImportRulesModal() {
  const modal = document.getElementById('mo_importRules');
  if (modal) {
    modal.classList.add('open');
    const textarea = document.getElementById('ruleInputText');
    if (textarea) {
      textarea.value = '';
      textarea.focus();
    }
  }
}

function closeImportRulesModal() {
  const modal = document.getElementById('mo_importRules');
  if (modal) {
    modal.classList.remove('open');
  }
}

function exportRulesAsText() {
  if (!state.rules || state.rules.length === 0) {
    toast('내보낼 규칙이 없습니다');
    return;
  }
  const text = state.rules
    .map(r => `${r.category} | ${r.keywords.join(',')} | ${r.type}`)
    .join('\n');
  navigator.clipboard.writeText(text)
    .then(() => toast(`${state.rules.length}개 규칙이 복사되었습니다 (규칙 불러오기에 붙여넣기 가능)`))
    .catch(() => toast('복사 실패 - 브라우저 권한을 확인하세요'));
}

function importRulesFromText() {
  const text = document.getElementById('ruleInputText').value.trim();
  if (!text) {
    toast('규칙 데이터를 입력해주세요');
    return;
  }

  try {
    const rules = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    lines.forEach((line, idx) => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length !== 3) {
        throw new Error(`${idx + 1}번 줄: "카테고리 | 키워드 | type" 형식이어야 합니다`);
      }

      const [category, keywordsStr, type] = parts;

      if (!category) throw new Error(`${idx + 1}번 줄: 카테고리가 필요합니다`);
      if (!keywordsStr) throw new Error(`${idx + 1}번 줄: 키워드가 필요합니다`);
      if (!['income', 'expense'].includes(type)) throw new Error(`${idx + 1}번 줄: type은 'income' 또는 'expense'이어야 합니다`);

      const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k);
      if (keywords.length === 0) throw new Error(`${idx + 1}번 줄: 최소 1개 이상의 키워드가 필요합니다`);

      rules.push({
        category,
        keywords,
        type,
        colorIdx: Math.floor(Math.random() * COLOR_PALETTE.length),
        isActive: true
      });
    });

    state.rules = rules;
    renderRules();
    closeImportRulesModal();
    toast(`${rules.length}개 규칙이 불러워졌습니다`);
  } catch (err) {
    toast('규칙 파싱 실패: ' + err.message);
  }
}

function resetRules() {
  if (confirm('기본 규칙으로 초기화하시겠습니까? 사용자 규칙은 삭제됩니다.')) {
    initRules();
    renderRules();
    toast('기본 규칙으로 초기화되었습니다');
  }
}
