# TODO: 에어비앤비 수익 분석기

## 진행 중 / 보류

### Sticky Period Bar & Scroll Spy 수정 (우선순위: 높음)
**상태**: 보류  
**문제점**:
- Sticky position이 작동하지 않아 라벨이 스크롤과 함께 사라짐
- IntersectionObserver scroll spy가 라벨을 자동으로 활성화하지 않음
- 구조 수정 시도했으나 여전히 미작동

**참고**:
- reportPeriodBar CSS: position:sticky; top:0; z-index:10
- initScrollSpy() 함수 구현됨 (line 2333)
- scrollToSection() 부드러운 스크롤 구현됨

### 리포트 모달 & UI 문제 (우선순위: 중간)
**상태**: 보류  
**작업 내용**:
- [ ] 금액 부호 불일치 모달 스크롤 문제 - 모달 내부 콘텐츠 스크롤 깨짐
- [ ] 인사이트 배지 다중 열 표시 - 4열 그리드 레이아웃 CSS 미적용

### PDF 내보내기 기능 개선 (우선순위: 높음)
**상태**: 보류  
**작업 내용**:
- [x] 기본 PDF 내보내기 라이브러리 (html2pdf) 통합
- [x] 미리보기 기능 구현
- [ ] **A4 너비 비율 문제 해결** - 오른쪽 컨텐츠가 깨지는 현상
- [ ] **html2canvas 렌더링 최적화** - 복잡한 테이블/요소 처리 개선
- [ ] PDF 품질 향상 (현재 해상도 낮음)
- [ ] 다른 라이브러리 검토 (pdfkit, jsPDF 직접 사용 등)

**기술 배경**:
- 현재: 미리보기 div를 직접 html2pdf에 전달하는 방식
- 문제: html2canvas가 모달 너비(820px)와 PDF A4 너비(794px) 간 비율 맞춤에 실패
- 해결책 후보:
  1. 미리보기 레이아웃을 PDF 정확 크기로 맞추기
  2. Canvas 스크린샷 방식 검토
  3. window.print() 대체안 검토

**참고**:
- 현재 PDF 버튼은 display: none으로 숨김 (tools/airbnb-revenue-analyzer.html:716)
- pdf-utils.js에서 downloadPdfFromPreview() 함수 구현 중
- 최초 구현 방식: .step-content.active를 직접 html2pdf에 전달 (시도했으나 동적 HTML 생성 방식으로 변경)

