# Phase 2-A: 함수 호출 맵 (Function Call Flow)

**작성일**: 2026-04-14  
**목표**: 함수 간 의존성 및 호출 순서 명확화

---

## 📊 함수 호출 플로우

### 1️⃣ 초기화 (Page Load)

```
1. getCategoryColor()        [① 유틸리티]
2. switchStep(0)            [⑩ 네비게이션]
3. initRules()              [② 규칙 관리]
   └─ renderRules()         [② 규칙 관리]
```

---

### 2️⃣ Step 1: 데이터 입력 → 파싱

**사용자 액션**: 파일 업로드

```
파일 선택
  └─ parseData()           [① 데이터 관리: 파싱]
      ├─ calculateSimilarity()  [① 데이터 관리: 파싱]
      └─ updateMapping()    [① 데이터 관리: 파싱]
           └─ showMsg()     [⑫ 유틸리티]

컬럼 매핑 확정
  └─ confirmMapping()       [① 데이터 관리: 파싱]
      └─ buildTransactions() [① 데이터 관리: 트랜잭션]
          ├─ normalizeDate() [① 데이터 관리: 날짜]
          └─ renderPreview() [① 데이터 관리: 미리보기]

Step 1 완료
  └─ completeStep1()        [⑩ 네비게이션]
      └─ switchStep(1)      [⑩ 네비게이션]

초기화
  └─ resetAll()            [⑩ 네비게이션]
      ├─ initRules()       [② 규칙 관리]
      └─ renderRules()     [② 규칙 관리]
```

---

### 3️⃣ Step 2: 규칙 설정

**사용자 액션**: 규칙 추가/수정/삭제

```
규칙 추가 모달
  └─ openRuleModal()        [② 규칙 관리]
      ├─ selectColor()      [② 규칙 관리]
      └─ closeRuleModal()   [② 규칙 관리]

규칙 저장
  └─ saveRule()             [② 규칙 관리]
      ├─ renderRules()      [② 규칙 관리]
      └─ updateCategoryInfo() [② 규칙 관리]

규칙 삭제
  └─ deleteRule()           [② 규칙 관리]
      └─ renderRules()      [② 규칙 관리]

규칙 활성/비활성
  └─ toggleCategory()       [② 규칙 관리]
      └─ renderRules()      [② 규칙 관리]

규칙 내보내기/불러오기
  ├─ exportRulesAsText()    [② 규칙 관리]
  └─ importRulesFromText()  [② 규칙 관리]
      └─ renderRules()      [② 규칙 관리]

규칙 초기화
  └─ resetRules()           [② 규칙 관리]
      └─ initRules()        [② 규칙 관리]
          └─ renderRules()  [② 규칙 관리]

Step 2 완료
  └─ completeStep2()        [⑩ 네비게이션]
      └─ switchStep(2)      [⑩ 네비게이션]
```

---

### 4️⃣ Step 3: 분류 적용 (메인 기능)

**switchStep(2) 시 자동 실행:**

```
switchStep(2)               [⑩ 네비게이션]
  ├─ applyClassification()  [③ 분류 적용]
  │   ├─ 활성 규칙 매칭
  │   └─ 비활성 규칙 매칭 (NEW: 2026-04-14)
  ├─ renderClassificationTable() [④ 분류 테이블]
  │   ├─ getFilteredTransactions() [③ 필터링]
  │   ├─ renderTransactionRow()    [④ 분류 테이블]
  │   └─ 섹션 렌더링 (정상/불일치/비활성/미분류)
  └─ renderCategoryStats()  [⑤ 카테고리 통계]
      ├─ 비활성 거래 제외 (NEW: 2026-04-14)
      └─ getCategoryColor() [① 유틸리티]

분류 필터링
  ├─ setFilterQuery()       [③ 필터링]
  ├─ setFilterCategory()    [③ 필터링]
  ├─ setFilterMode()        [③ 필터링]
  └─ renderClassificationTable() [④ 분류 테이블]

거래 수동 분류
  └─ changeTxCategory()     [③ 분류 적용]
      └─ renderClassificationTable() [④ 분류 테이블]

부호 불일치 처리
  ├─ showMismatchModal()    [⑫ 기타 UI]
  ├─ excludeMismatched()    [⑧ 데이터 제외]
  │   ├─ updateExcludeCount() [⑧ 데이터 제외]
  │   └─ renderExcludeTable() [⑧ 데이터 제외]
  ├─ ignoreMismatch()       [⑧ 데이터 제외]
  └─ closeMismatchModal()   [⑫ 기타 UI]

미분류 포함/제외 토글
  └─ toggleUnclassified()   [③ 필터링]
      └─ renderCategoryStats() [⑤ 카테고리 통계]

Step 3 완료
  └─ completeStep3()        [⑩ 네비게이션]
      └─ switchStep(3)      [⑩ 네비게이션]
```

---

### 5️⃣ Step 4: 데이터 제외 (부호 불일치, 파싱 오류)

**switchStep(3) 시 자동 실행:**

```
switchStep(3)               [⑩ 네비게이션]
  ├─ renderExcludeTable()   [⑧ 데이터 제외]
  └─ renderExcludedList()   [⑧ 데이터 제외]

거래 제외/복구
  ├─ toggleExclude()        [⑧ 데이터 제외]
  ├─ updateExcludeCount()   [⑧ 데이터 제외]
  └─ renderExcludeTable()   [⑧ 데이터 제외]

제외 섹션 표시/숨김
  └─ toggleExcludedSection() [⑧ 데이터 제외]

파싱 오류 모달
  ├─ showExcludedRowsModal() [⑫ 기타 UI]
  ├─ proceedToExclude()     [⑧ 데이터 제외]
  └─ closeExcludedModal()   [⑫ 기타 UI]

Step 4 완료
  └─ completeStep4()        [⑥ 리포트]
      └─ renderReport()     [⑥ 리포트]
```

---

### 6️⃣ Step 4: 리포트 생성 (분석)

**renderReport() 실행:**

```
renderReport()              [⑥ 리포트]
  ├─ getActiveTransactions() [⑥ 리포트]
  ├─ getYears()            [⑥ 리포트]
  │   └─ getMonthsWithData() [⑥ 리포트]
  ├─ renderPeriodBar()     [⑥ 리포트]
  ├─ renderUnclassifiedBanner() [⑫ 기타 UI]
  ├─ buildYearSection()    [⑥ 리포트]
  │   ├─ calcKpi()         [⑥ 리포트] (비활성 제외, NEW: 2026-04-14)
  │   ├─ calcCategoryBreakdown() [⑥ 리포트] (비활성 제외)
  │   ├─ renderKpiCards()  [⑥ 리포트]
  │   ├─ renderSummaryBar() [⑥ 리포트]
  │   ├─ renderInsights()  [⑥ 리포트]
  │   └─ buildMonthlyChartData() [⑥ 리포트]
  │       └─ renderMonthlyLineChart() [⑦ 차트]
  └─ buildMonthSection()   [⑥ 리포트]
      ├─ calcKpi()         [⑥ 리포트] (비활성 제외, NEW: 2026-04-14)
      ├─ renderKpiCards()  [⑥ 리포트]
      ├─ renderCategoryDetails() [⑥ 리포트]
      │   └─ toggleCategoryDetail() [⑥ 리포트]
      └─ getCategoryColor() [① 유틸리티]

리포트 네비게이션
  ├─ scrollToSection()      [⑥ 리포트]
  ├─ initScrollSpy()        [⑥ 리포트]
  └─ renderPeriodBar()      [⑥ 리포트]

리포트 내보내기
  ├─ copyReportText()       [⑨ 데이터 내보내기]
  │   ├─ buildMarkdown()    [⑨ 데이터 내보내기]
  │   └─ toast()            [⑪ 유틸리티]
  └─ exportReviewData()     [⑨ 데이터 내보내기]
      └─ toast()            [⑪ 유틸리티]
```

---

## 🔗 함수 의존성 정리

### 필수 함수 (거의 모든 곳에서 호출)
- `toast()` [⑪]: 메시지 표시
- `esc()` [⑪]: HTML 이스케이프
- `fmtN()` [⑪]: 숫자 포매팅
- `getCategoryColor()` [① 유틸리티]: 카테고리 색상

### 높은 호출 빈도
- `renderRules()` [② 규칙]: 규칙 CRUD 후 항상
- `renderClassificationTable()` [④]: 필터 변경 시 항상
- `renderCategoryStats()` [⑤]: 분류 후 항상
- `calcKpi()` [⑥]: 리포트 생성 시 필수

### 조건부 호출
- `applyClassification()` [③]: Step 2 전환 시
- `renderReport()` [⑥]: Step 4 진입 시
- `showMismatchModal()` [⑫]: 부호 불일치 있을 때만

---

## 🎯 주요 리팩토링 지점 (향후)

1. **renderClassificationTable() 분리**
   - 너무 많은 섹션 렌더링 (정상/불일치/비활성/미분류)
   - 각 섹션별 함수로 분리 가능

2. **필터링 로직 단순화**
   - getFilteredTransactions()가 복잡
   - 필터 종류별로 함수 분리

3. **차트 인스턴스 관리 자동화**
   - reportChartInstances 수동 관리
   - 클래스 기반 관리 고려

4. **상태 객체 구조화**
   - state, filterState 분리 고려
   - 상태 변경 추적 가능하게

---

## 📋 함수 목록 (그룹별)

### ① 데이터 관리 (11개)
```
1. calculateSimilarity() - L1057
2. updateMapping() - L1111
3. confirmMapping() - L1115
4. normalizeDate() - L1193
5. buildTransactions() - L1223
6. getActiveTransactions() - L2287
7. calcKpi() - L2291
8. calcCategoryBreakdown() - L2305
9. filterByPeriod() - L2331
10. buildMonthlyChartData() - L2341
11. getYears() - L2325
12. getMonthsWithData() - L2358
```

### ② 규칙 관리 (12개)
```
1. initRules() - L1349
2. renderRules() - L1355
3. openRuleModal() - L1381
4. selectColor() - L1451
5. closeRuleModal() - L1466
6. updateCategoryInfo() - L1471
7. saveRule() - L1481
8. toggleCategory() - L1554
9. deleteRule() - L1562
10. openImportRulesModal() - L1571
11. exportRulesAsText() - L1590
12. importRulesFromText() - L1603
13. resetRules() - L1645
```

### ③ 분류 적용 (7개)
```
1. applyClassification() - L1655
2. getFilteredTransactions() - L1688
3. setFilterQuery() - L1702
4. setFilterCategory() - L1707
5. setFilterMode() - L1712
6. changeTxCategory() - L1986
7. toggleUnclassified() - L1873
```

### ④ 분류 테이블 렌더링 (2개)
```
1. renderClassificationTable() - L1720
2. renderTransactionRow() [내부] - L1760
```

### ⑤ 카테고리 통계 (2개)
```
1. renderCategoryStats() - L1876
2. getCategoryColor() - L973
```

### ⑥ 리포트 생성 (11개)
```
1. renderReport() - L2453
2. buildYearSection() - L2481
3. buildMonthSection() - L2552
4. renderKpiCards() - L2670
5. renderSummaryBar() - L2362
6. renderUnclassifiedBanner() - L2384
7. renderInsights() - L2399
8. renderPeriodBar() - L2619
9. scrollToSection() - L2646
10. initScrollSpy() - L2656
11. renderCategoryDetails() - L2836
12. toggleCategoryDetail() - L2896
```

### ⑦ 차트 렌더링 (2개)
```
1. renderMonthlyLineChart() - L2694
2. renderDoughnutChart() - L2786
```

### ⑧ 데이터 제외 관리 (9개)
```
1. showExcludedRowsModal() - L1137
2. closeExcludedModal() - L1177
3. showMismatchModal() - L2028
4. proceedToExclude() - L2071
5. closeMismatchModal() - L2157
6. excludeMismatched() - L2161
7. toggleExclude() - L2179
8. updateExcludeCount() - L2206
9. renderExcludeTable() - L2218
10. renderExcludedList() - L2243
11. toggleExcludedSection() - L2269
12. renderParsingExcludedRows() - L2090
13. ignoreMismatch() - L2172
14. restoreExclude() - L2188
```

### ⑨ 데이터 내보내기 (2개)
```
1. copyReportText() - L2906
2. exportReviewData() - L2988
```

### ⑩ 단계별 네비게이션 (8개)
```
1. switchStep() - L975
2. completeStep1() - L1315
3. completeStep2() - L1991
4. completeStep3() - L2012
5. completeStep4() - L2245
6. backToMap() - L1309
7. backToParse() - L1313
8. resetAll() - L1326
```

### ⑪ 유틸리티/헬퍼 (6개)
```
1. esc() - L3033
2. fmtN() - L3039
3. toast() - L3026
4. showMsg() - L3014
5. showWarn() - L3007
6. moOut() - L1468
```

### ⑫ 기타 UI 관리 (8개)
```
1. parseData() - L1026
2. getFilteredTransactions() [재사용]
3. renderPreview() - L1279
4. completeStep1() [재사용]
...
```

---

## ✅ Phase 2-A 완료 체크리스트

- [x] 섹션 주석 강화 (12개 그룹)
- [x] 함수 호출 맵 생성
- [x] 의존성 분석
- [ ] Phase 2-B 준비: 함수 순서 재조정 (필요시)

---

## 🚀 다음 단계

### Phase 2-A 완료 후 평가
1. 현재 코드 가독성 개선 정도 확인
2. 함수 호출 맵 활용도 확인
3. Phase 2-B (전체 재구성) 필요 여부 판단

### 판단 기준
- ✅ **가독성 충분하면**: Phase 2-A 마무리 → Option B로 이동
- ⚠️ **개선 필요하면**: Phase 2-B 함수 재배열 진행
