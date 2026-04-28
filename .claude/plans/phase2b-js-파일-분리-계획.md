# Phase 2-B: JS 파일 분리 (점진적 단계별 분리)

**작성일**: 2026-04-14  
**목표**: airbnb-revenue-analyzer.html 파일 크기 감소 (3,026줄 → 1,500줄 이상 감소)  
**전략**: 12개 그룹 중 관련 그룹들을 묶어 JS 파일로 분리, **단계별 테스트 검증**

---

## 📊 분리 계획 (5단계)

### 우선순위 기준
1. **독립성 높음** (다른 모듈과 의존성 적음)
2. **테스트 용이함** (동작 검증 쉬움)
3. **영향도 낮음** (분리 후 오류 위험 낮음)

---

## 🎯 단계별 분리 계획

### **Step 1 (우선순위 1): 유틸리티 & 색상** 독립 분리
**분리 대상**: ⑪ 유틸리티 + ① getCategoryColor

**파일 생성**: `js/utils.js`

**포함 함수**:
```js
// 유틸리티
- esc()              // HTML 이스케이프
- fmtN()             // 숫자 포매팅
- toast()            // 토스트 메시지
- showMsg()          // 메시지 박스
- showWarn()         // 경고 메시지

// 색상 관리
- getCategoryColor() // 카테고리 색상 조회
- COLOR_PALETTE      // 상수
- CATEGORY_COLORS    // 상수 (deprecated)
```

**라인 감소**: ~100줄  
**의존성**: 무(독립적)  
**테스트 방법**:
1. 파일 로드 확인
2. 토스트 메시지 표시 테스트
3. 숫자 포매팅 테스트
4. 색상 조회 테스트

**예상 오류**: 낮음 ✅

---

### **Step 2 (우선순위 2): 데이터 계산 함수 분리**
**분리 대상**: ① 데이터 관리 (계산 관련)

**파일 생성**: `js/data-calculator.js`

**포함 함수**:
```js
// KPI 계산
- calcKpi()                 // 수익/지출 계산 (비활성 제외)
- calcCategoryBreakdown()   // 카테고리별 집계 (비활성 제외)

// 필터링 & 기간
- filterByPeriod()          // 연월별 필터링
- getYears()                // 연도 추출
- getMonthsWithData()       // 월 추출

// 차트 데이터
- buildMonthlyChartData()   // 월별 차트 데이터
```

**라인 감소**: ~150줄  
**의존성**: `state.transactions` (낮음)  
**테스트 방법**:
1. KPI 계산 정확도 (수입/지출)
2. 카테고리별 집계 확인
3. 필터링 결과 검증
4. 차트 데이터 형식 확인

**예상 오류**: 낮음 ✅

---

### **Step 3 (우선순위 3): 차트 렌더링 분리**
**분리 대상**: ⑦ 차트 렌더링

**파일 생성**: `js/chart-renderer.js`

**포함 함수**:
```js
// 차트 렌더링
- renderMonthlyLineChart()  // 월별 추이 라인차트
- renderDoughnutChart()     // 카테고리 비율 도넛차트
```

**라인 감소**: ~140줄  
**의존성**: Chart.js 라이브러리  
**테스트 방법**:
1. Chart.js 로드 확인
2. 라인차트 렌더링 (데이터 표시)
3. 도넛차트 렌더링 (비율 정확도)
4. 브라우저 콘솔 에러 확인

**예상 오류**: 중간 (Chart.js 버전 호환성) ⚠️

---

### **Step 4 (우선순위 4): 규칙 관리 분리**
**분리 대상**: ② 규칙 관리

**파일 생성**: `js/rules-manager.js`

**포함 함수**:
```js
// 규칙 CRUD
- initRules()               // 규칙 초기화
- renderRules()             // 규칙 목록 렌더링
- saveRule()                // 규칙 저장
- deleteRule()              // 규칙 삭제
- toggleCategory()          // 활성/비활성 토글

// 규칙 UI
- openRuleModal()           // 모달 열기
- closeRuleModal()          // 모달 닫기
- selectColor()             // 색상 선택
- updateCategoryInfo()      // 정보 업데이트

// Import/Export
- exportRulesAsText()       // 마크다운 내보내기
- importRulesFromText()     // 마크다운 불러오기
- resetRules()              // 규칙 초기화
```

**라인 감소**: ~300줄  
**의존성**: `state.rules`, DOM 요소 (중간)  
**테스트 방법**:
1. 규칙 추가/수정/삭제 동작
2. 활성/비활성 토글
3. 규칙 내보내기/불러오기
4. 색상 선택 UI
5. 로컬스토리지 저장 확인

**예상 오류**: 중간 (DOM 선택자 오류 가능) ⚠️

---

### **Step 5 (우선순위 5): 리포트 & 네비게이션 분리**
**분리 대상**: ⑥ 리포트 생성 + ⑩ 단계별 네비게이션

**파일 생성**: `js/report-generator.js`

**포함 함수**:
```js
// 리포트 진입점
- renderReport()            // 리포트 생성

// 연월 섹션
- buildYearSection()        // 연도 섹션 (비활성 제외)
- buildMonthSection()       // 월 섹션 (비활성 제외)

// KPI 렌더링
- renderKpiCards()          // KPI 카드
- renderSummaryBar()        // 수익/지출 바
- renderUnclassifiedBanner() // 미분류 배너

// 인사이트 & 상세
- renderInsights()          // 인사이트 배지
- renderCategoryDetails()   // 카테고리 상세
- toggleCategoryDetail()    // 상세 항목 토글

// 네비게이션
- renderPeriodBar()         // 기간 선택 바
- scrollToSection()         // 섹션 스크롤
- initScrollSpy()           // 스크롤 스파이

// Step 네비게이션
- switchStep()              // 탭 전환
- completeStep4()           // Step 4 완료
- getActiveTransactions()   // 활성 거래 필터
```

**라인 감소**: ~400줄  
**의존성**: `state`, `calcKpi`, `calcCategoryBreakdown` (높음)  
**테스트 방법**:
1. 리포트 생성 동작
2. 연도/월별 섹션 렌더링
3. KPI 카드 데이터 정확도
4. 차트 표시 (라인차트, 도넛차트)
5. 인사이트 배지 표시
6. 기간 선택 바 동작
7. 스크롤 네비게이션

**예상 오류**: 높음 (복잡도 큼) ⚠️⚠️

---

## 📁 최종 파일 구조

```
airbnb-revenue-analyzer.html      (main, ~800-1000줄)
├─ HTML + CSS + 기본 설정
├─ state, filterState, CATEGORIES, DEFAULT_RULES
├─ Step 1-3 함수들 (파싱, 분류, 필터링 UI)
└─ <script src="js/utils.js"></script>
   <script src="js/data-calculator.js"></script>
   <script src="js/chart-renderer.js"></script>
   <script src="js/rules-manager.js"></script>
   <script src="js/report-generator.js"></script>

js/utils.js                       (~120줄)
├─ 유틸리티 함수 (esc, fmtN, toast, showMsg, showWarn)
├─ 색상 관리 (getCategoryColor, COLOR_PALETTE)
└─ 의존성: 없음

js/data-calculator.js             (~150줄)
├─ KPI 계산 (calcKpi, calcCategoryBreakdown)
├─ 필터링 (filterByPeriod, getYears, getMonthsWithData)
├─ 차트 데이터 (buildMonthlyChartData)
└─ 의존성: state.transactions

js/chart-renderer.js              (~140줄)
├─ 라인차트 (renderMonthlyLineChart)
├─ 도넛차트 (renderDoughnutChart)
└─ 의존성: Chart.js

js/rules-manager.js               (~300줄)
├─ 규칙 CRUD (saveRule, deleteRule, toggleCategory)
├─ 규칙 UI (openRuleModal, selectColor)
├─ Import/Export (exportRulesAsText, importRulesFromText)
└─ 의존성: state.rules, DOM

js/report-generator.js            (~400줄)
├─ 리포트 생성 (renderReport, buildYearSection)
├─ KPI 렌더링 (renderKpiCards, renderSummaryBar)
├─ 인사이트 (renderInsights, renderCategoryDetails)
├─ 네비게이션 (switchStep, scrollToSection)
└─ 의존성: calcKpi, calcCategoryBreakdown, 차트 함수들
```

---

## ✅ 단계별 테스트 체크리스트 (완료)

### **Step 1: Utils 분리 후** ✅ 완료
- [x] 파일 로드 (콘솔 에러 확인)
- [x] 토스트 메시지 표시
- [x] 숫자 포매팅 (예: 1000000 → 1,000,000)
- [x] HTML 이스케이프 (특수문자 안전성)
- [x] 카테고리 색상 조회

### **Step 2: Data-Calculator 분리 후** ✅ 완료
- [x] 파일 로드
- [x] KPI 계산 정확도 (수입/지출 합계)
- [x] 카테고리별 집계 (개수, 금액)
- [x] 필터링 (연도, 월)
- [x] 차트 데이터 형식 (배열 구조)

### **Step 3: Chart-Renderer 분리 후** ✅ 완료
- [x] Chart.js 라이브러리 로드
- [x] 라인차트 렌더링 (리포트에서)
- [x] 도넛차트 렌더링 (카테고리별)
- [x] 차트 레이아웃 (캔버스 크기)
- [x] 차트 인스턴스 cleanup

### **Step 4: Rules-Manager 분리 후** ✅ 완료
- [x] 파일 로드
- [x] 규칙 추가 (모달 → 저장)
- [x] 규칙 수정 (기존 규칙 변경)
- [x] 규칙 삭제 (목록에서 제거)
- [x] 활성/비활성 토글
- [x] 색상 선택 UI
- [x] 규칙 내보내기 (마크다운)
- [x] 규칙 불러오기 (마크다운 파싱)
- [x] 로컬스토리지 저장/로드

### **Step 5: Report-Generator 분리 후** ✅ 완료
- [x] 파일 로드
- [x] 리포트 생성 (Step 4 진입)
- [x] 연도 섹션 렌더링
- [x] 월 섹션 렌더링
- [x] KPI 카드 표시 (수입/지출/순수익)
- [x] 차트 표시 (라인 + 도넛)
- [x] 인사이트 배지 표시
- [x] 카테고리 상세 토글
- [x] 기간 선택 바 (스크롤 네비게이션)
- [x] 모든 Step 동작 (Step 1-4)

---

## 📝 진행 현황 기록

**2026-04-14 완료** ✅

### Phase 2-B: 모든 단계 완료!
- [x] Step 1 (Utils): 완료 (42줄) - Commit: 3e01634
- [x] Step 2 (Data-Calculator): 완료 (79줄) - Commit: 85d38e5
- [x] Step 3 (Chart-Renderer): 완료 (151줄) - Commit: d09b20f, 0a1b2b3
- [x] Step 4 (Rules-Manager): 완료 (320줄) - Commit: 9e1b510
- [x] Step 5 (Report-Generator): 완료 (538줄) - Commit: 9909c8f

---

## 🚀 실행 순서

1. **Step 1 실행 → 테스트 → Commit**
2. **Step 2 실행 → 테스트 → Commit**
3. **Step 3 실행 → 테스트 → Commit**
4. **Step 4 실행 → 테스트 → Commit**
5. **Step 5 실행 → 테스트 → Commit**

각 단계는 **독립적으로 실행**되므로, 문제 발생 시 **이전 단계로 롤백** 가능!

---

## 💡 주의사항

1. **전역 변수 접근**
   - `state`, `filterState` 등은 메인 파일에 유지
   - 각 JS 파일은 이들을 읽기/쓰기 가능

2. **함수 호출 순서**
   - utils.js 먼저 로드 (다른 파일들이 의존)
   - data-calculator.js, chart-renderer.js 순서 무관
   - rules-manager.js, report-generator.js는 나중에

3. **테스트 중요**
   - 각 단계마다 **브라우저에서 실제 동작 테스트**
   - 콘솔 에러 확인 필수
   - 로컬스토리지, 클립보드 API 테스트

4. **롤백 전략**
   - 각 단계마다 commit
   - 문제 발생 시 이전 commit으로 돌아갈 수 있음

---

## 📊 최종 결과 (실제 측정치)

| 항목 | 초기 | 최종 | 감소 |
|------|------|------|------|
| **HTML 파일** | 3,010줄 | 2,037줄 | **973줄 (32%)** ✅ |
| **JS 모듈 (총합)** | - | 1,130줄 | 5개 파일 분리 |
| **평균 모듈 크기** | - | 226줄 | 가독성 ⬆️⬆️ |
| **의존성 관리** | 복잡 | 명확 | 구조화 완료 |
| **유지보수성** | 낮음 | 높음 | 개선 ⬆️⬆️ |

### 파일별 상세
| 파일명 | 라인수 | 함수 수 | 역할 |
|--------|-------|--------|------|
| `js/utils.js` | 42 | 5 | 공용 유틸리티 |
| `js/data-calculator.js` | 79 | 6 | 데이터 계산 |
| `js/chart-renderer.js` | 151 | 2 | 차트 렌더링 |
| `js/rules-manager.js` | 320 | 14 | 규칙 관리 |
| `js/report-generator.js` | 538 | 17 | 리포트 생성 |
| **합계** | **1,130** | **44** | - |

