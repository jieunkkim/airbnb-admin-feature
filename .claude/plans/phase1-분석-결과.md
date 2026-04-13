# Phase 1 분석 결과

**분석 일시**: 2026-04-14  
**대상 파일**: `tools/airbnb-revenue-analyzer.html`

---

## 📊 파일 구조 분석

### 기본 통계
| 항목 | 값 |
|------|-----|
| **총 라인 수** | 3,026 라인 |
| **함수 개수** | 83개 |
| **평균 함수 길이** | ~36 라인 |
| **주요 구성** | HTML (헤더) + CSS (스타일) + JS (논리) |

---

## 🔧 함수 분류 분석

### 1️⃣ 데이터 관리 (11개)

**역할**: 거래 데이터 로드, 파싱, 변환, 계산

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `parseData()` | 1000 | CSV 데이터 파싱 |
| `calculateSimilarity()` | 1030 | 헤더 컬럼 매칭 |
| `updateMapping()` | 1083 | 컬럼 매핑 업데이트 |
| `confirmMapping()` | 1087 | 매핑 확정 |
| `normalizeDate()` | 1167 | 날짜 정규화 |
| `buildTransactions()` | 1205 | 트랜잭션 객체 생성 |
| `getActiveTransactions()` | 2237 | 제외되지 않은 거래 필터링 |
| `calcKpi()` | 2241 | KPI 계산 |
| `calcCategoryBreakdown()` | 2258 | 카테고리별 집계 |
| `filterByPeriod()` | 2283 | 연월별 필터링 |
| `buildMonthlyChartData()` | 2293 | 월별 차트 데이터 생성 |

**주의사항**:
- `buildTransactions()`는 현재 **비활성 규칙 처리** 포함 (2026-04-14 추가)
- 상태 객체 `state.transactions` 직접 수정

---

### 2️⃣ 규칙 관리 (10개)

**역할**: 분류 규칙 CRUD, UI 관리

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `initRules()` | 1330 | 규칙 초기화 |
| `renderRules()` | 1336 | 규칙 목록 렌더링 |
| `openRuleModal()` | 1361 | 규칙 편집 모달 열기 |
| `selectColor()` | 1423 | 규칙 색상 선택 |
| `closeRuleModal()` | 1438 | 모달 닫기 |
| `updateCategoryInfo()` | 1447 | 카테고리 정보 업데이트 |
| `saveRule()` | 1457 | 규칙 저장 |
| `toggleCategory()` | 1527 | 규칙 활성/비활성 토글 |
| `deleteRule()` | 1535 | 규칙 삭제 |
| `resetRules()` | 1619 | 규칙 초기화 |
| `exportRulesAsText()` | 1562 | 규칙 내보내기 |
| `importRulesFromText()` | 1575 | 규칙 불러오기 |

**상태 관리**: `state.rules` 배열

**주의사항**:
- 규칙 수정 시 `renderRules()` 호출 필수
- 클립보드 API 사용 (내보내기/불러오기)

---

### 3️⃣ 분류 적용 (7개)

**역할**: 키워드 매칭, 필터링, 거래 분류

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `applyClassification()` | 1628 | 규칙 기반 자동 분류 |
| `getFilteredTransactions()` | 1662 | 검색/카테고리 필터링 |
| `setFilterQuery()` | 1675 | 검색어 설정 |
| `setFilterCategory()` | 1680 | 카테고리 필터 설정 |
| `setFilterMode()` | 1685 | 자동/수동 모드 필터 |
| `changeTxCategory()` | 1951 | 거래 카테고리 수동 변경 |
| `toggleUnclassified()` | 1835 | 미분류 포함/제외 토글 |

**필터 상태**: `filterState` 객체

**주의사항**:
- `applyClassification()`에 **비활성 규칙 로직** 포함 (2026-04-14 추가)
- `inactiveRule` 플래그로 구분

---

### 4️⃣ 분류 테이블 렌더링 (2개)

**역할**: 거래 목록 테이블 렌더링

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `renderClassificationTable()` | 1694 | 메인 테이블 렌더링 |
| `renderTransactionRow()` | 1734 | 거래 행 렌더링 |

**주의사항**:
- `renderClassificationTable()`에서 **비활성 카테고리 섹션** 렌더링 (2026-04-14 추가)
- `opacity: 0.5`로 비활성 거래 표시

---

### 5️⃣ 카테고리 통계 (2개)

**역할**: 카테고리별 통계 계산 및 렌더링

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `renderCategoryStats()` | 1840 | 카테고리별 KPI 카드 렌더링 |
| `getCategoryColor()` | 955 | 카테고리 색상 조회 |

**주의사항**:
- `renderCategoryStats()`에서 **비활성 거래 제외** (2026-04-14 추가)

---

### 6️⃣ 리포트 생성 (10개)

**역할**: 연월별 리포트, 차트, 인사이트 생성

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `renderReport()` | 2396 | 리포트 진입점 |
| `buildYearSection()` | 2429 | 연도 섹션 빌드 |
| `buildMonthSection()` | 2501 | 월 섹션 빌드 |
| `renderPeriodBar()` | 2567 | 기간 선택 바 렌더링 |
| `scrollToSection()` | 2592 | 섹션 스크롤 |
| `initScrollSpy()` | 2600 | 스크롤 스파이 초기화 |
| `renderKpiCards()` | 2621 | KPI 카드 렌더링 |
| `renderInsights()` | 2352 | 인사이트 배지 생성 |
| `renderCategoryDetails()` | 2787 | 카테고리별 상세 렌더링 |
| `toggleCategoryDetail()` | 2846 | 상세 항목 토글 |

**주의사항**:
- `buildYearSection()`, `buildMonthSection()`에서 **비활성 거래 제외** (2026-04-14 추가)
- Chart.js 인스턴스 관리 필수

---

### 7️⃣ 차트 렌더링 (2개)

**역할**: 시각화 (라인차트, 도넛차트)

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `renderMonthlyLineChart()` | 2644 | 월별 추이 라인차트 |
| `renderDoughnutChart()` | 2735 | 카테고리별 비율 도넛차트 |

**의존성**: Chart.js 라이브러리

---

### 8️⃣ 데이터 제외 관리 (9개)

**역할**: 거래 제외 처리 (파싱 오류 등)

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `showExcludedRowsModal()` | 1118 | 제외된 행 모달 표시 |
| `closeExcludedModal()` | 1159 | 모달 닫기 |
| `showMismatchModal()` | 2004 | 부호 불일치 모달 |
| `closeMismatchModal()` | 2111 | 모달 닫기 |
| `excludeMismatched()` | 2115 | 불일치 거래 제외 |
| `ignoreMismatch()` | 2133 | 불일치 무시 |
| `toggleExclude()` | 2139 | 거래 제외 토글 |
| `restoreExclude()` | 2149 | 제외 복구 |
| `toggleExcludedSection()` | 2220 | 제외 섹션 표시/숨김 |

**상태**: `state.excludedRows` 배열

---

### 9️⃣ 데이터 내보내기 (2개)

**역할**: 분석 결과 내보내기

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `copyReportText()` | 2858 | 리포트 마크다운 복사 |
| `exportReviewData()` | 2940 | 모든 데이터 JSON 내보내기 |

---

### 🔟 단계별 네비게이션 (5개)

**역할**: 탭 전환, 단계별 완료

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `switchStep()` | 967 | 탭 전환 |
| `completeStep1()` | 1300 | 1단계 (데이터) 완료 |
| `completeStep2()` | 1961 | 2단계 (규칙) 완료 |
| `completeStep3()` | 1983 | 3단계 (분류) 완료 |
| `completeStep4()` | 2229 | 4단계 (리포트) 완료 |
| `backToMap()` | 1290 | 맵핑 단계로 이동 |
| `backToParse()` | 1295 | 파싱 단계로 이동 |
| `resetAll()` | 1310 | 전체 초기화 |

---

### 1️⃣1️⃣ 유틸리티/헬퍼 (8개)

**역할**: 공통 기능 (HTML 이스케이프, 포매팅, 메시지)

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `esc()` | 2987 | HTML 이스케이프 |
| `fmtN()` | 2993 | 숫자 포매팅 (쉼표) |
| `toast()` | 2980 | 토스트 메시지 표시 |
| `showMsg()` | 2968 | 메시지 박스 표시 |
| `showWarn()` | 2961 | 경고 메시지 표시 |
| `getYears()` | 2277 | 거래에서 연도 추출 |
| `getMonthsWithData()` | 2308 | 데이터 있는 월 추출 |
| `moOut()` | 1443 | 마우스 아웃 핸들러 |

---

### 1️⃣2️⃣ 기타 UI 관리 (6개)

**역할**: 모달, 배너, 영역 관리

| 함수명 | 라인 | 용도 |
|--------|------|------|
| `moOut()` | 1443 | 모달 닫기 (밖 클릭) |
| `openImportRulesModal()` | 1543 | 규칙 불러오기 모달 |
| `closeImportRulesModal()` | 1555 | 모달 닫기 |
| `renderExcludeTable()` | 2170 | 제외 테이블 렌더링 |
| `renderExcludedList()` | 2195 | 제외된 거래 목록 |
| `renderParsingExcludedRows()` | 2063 | 파싱 제외 행 표시 |
| `updateExcludeCount()` | 2159 | 제외 건수 업데이트 |
| `proceedToExclude()` | 2048 | 제외 처리 진행 |
| `renderUnclassifiedBanner()` | 2337 | 미분류 배너 렌더링 |
| `renderPreview()` | 1263 | 데이터 미리보기 렌더링 |

---

## 🔗 의존성 분석

### 상태 객체 (전역)
```js
state = {
  transactions: [],      // 거래 데이터
  rules: [],             // 분류 규칙
  excludedRows: [],      // 제외된 행
  mapping: {},           // 컬럼 매핑
  parseErrors: []        // 파싱 오류
}

filterState = {
  query: '',             // 검색어
  category: '',          // 카테고리 필터
  mode: 'all',           // all/auto/manual
  includeUnclassified: false
}
```

### 차트 인스턴스
```js
reportChartInstances = [];  // Chart.js 인스턴스 관리
```

### 주요 의존성
- **Chart.js**: 라인차트, 도넛차트
- **Clipboard API**: 데이터 복사

---

## 📈 함수별 의존 관계 (핵심 플로우)

```
1. parseData()
   ├─ calculateSimilarity()
   └─ updateMapping()
         └─ confirmMapping()
              └─ buildTransactions()
                   ├─ normalizeDate()
                   └─ renderPreview()

2. applyClassification()
   ├─ 활성 규칙 매칭
   └─ 비활성 규칙 매칭 (NEW: 2026-04-14)

3. renderClassificationTable()
   ├─ getFilteredTransactions()
   ├─ renderTransactionRow()
   └─ 비활성 카테고리 섹션 (NEW: 2026-04-14)

4. renderCategoryStats()
   ├─ 비활성 거래 제외 (NEW: 2026-04-14)
   └─ getCategoryColor()

5. renderReport()
   ├─ buildYearSection()
   │  ├─ calcKpi() (비활성 제외)
   │  └─ buildMonthlyChartData()
   └─ buildMonthSection()
      ├─ calcKpi() (비활성 제외)
      └─ renderMonthlyLineChart()
```

---

## 🎯 리팩토링 우선순위

### 높음 (영향도 큼)
1. **데이터 관리 함수** (11개) → 독립적인 모듈화 가능
2. **규칙 관리 함수** (10개) → 함수 그룹화만으로 큰 효과

### 중간 (유지보수성)
3. **분류 적용 함수** (7개) → 필터링 로직 단순화
4. **렌더링 함수** (2+2개) → 컴포넌트화 가능

### 낮음 (선택적)
5. **유틸리티 함수** (8개) → 이미 충분히 분리됨
6. **기타 UI 함수** (6개) → 필요시만 정리

---

## 💡 개선 기회

1. **상태 관리 중앙화**: 현재 전역 `state` 객체 → 더 명확한 구조
2. **필터링 로직**: `getFilteredTransactions()` 복잡 → 분리 가능
3. **차트 관리**: `reportChartInstances` 수동 관리 → 자동화 가능
4. **렌더링 성능**: DOM 전체 재렌더링 → 부분 업데이트 최적화 가능
5. **에러 처리**: 현재 토스트 메시지만 → 더 상세한 에러 UI

---

## ✅ Phase 1 체크리스트

- [x] 파일 크기 분석 (3,026 라인)
- [x] 함수 개수 파악 (83개)
- [x] 함수별 분류 (12개 그룹)
- [x] 의존성 분석
- [x] 리팩토링 우선순위 설정

---

## 🚀 다음 단계 (Phase 2)

1. **데이터 관리 함수 그룹화**
   - 파싱 관련: parseData, calculateSimilarity, updateMapping, confirmMapping
   - 트랜잭션: buildTransactions, normalizeDate
   - 계산: calcKpi, calcCategoryBreakdown, filterByPeriod

2. **규칙 관리 함수 그룹화**
   - CRUD: saveRule, deleteRule, initRules, resetRules
   - UI: renderRules, openRuleModal, closeRuleModal, selectColor
   - Import/Export: importRulesFromText, exportRulesAsText

3. **섹션 주석 강화**
   - `/* ── DATA MANAGEMENT ── */`
   - `/* ── RULES MANAGEMENT ── */`
   - `/* ── CLASSIFICATION ── */` 등

4. **함수 호출 순서 명확화**
   - 초기화 함수들 먼저
   - 이벤트 핸들러들 마지막
