# Code Style Guide

## 파일 명명

- **영문 kebab-case** 사용: `airbnb-revenue-calculator_v2.html`
- **버전 표시** (필수): `_v1`, `_v2` 등으로 버전 명시
- 파일명은 도구 기능을 명확히 반영
- 스타일시트: `styles.css` (단수)
- 설정/규칙: `rules/` 폴더 하위

## HTML

- `lang="ko"` 속성 (다국어 버전 제외)
- Google Fonts import는 `styles.css`에서만 수행
- 시맨틱 HTML: `<h1>` 페이지 제목, `<h2>` 섹션 제목
- 접근성: 인터랙티브 요소에 `aria-label` 추가
- 주석: 한글 레이블로 섹션 구분 `<!-- ── HEADER ── -->`
- 이벤트: 인라인 이벤트 핸들러 허용 (싱글페이지 도구 특성상)

## CSS

### 설계 토큰
- **모든 값은 CSS 변수로**: `var(--token)` 사용 필수
- **매직 넘버 금지**: 하드코딩된 값 없음

### 색상 토큰 (`:root`에서 관리)
```css
--ac: #e8650a     /* 주요 accent (orange) */
--ac2: #f07820    /* 보조 accent (lighter orange) */
--acg: rgba(...)  /* accent glow/focus ring */
--gr: #16a34a     /* green (positive) */
--rd: #dc2626     /* red (negative) */
--am: #d97706     /* amber (warning) */
--bl: #2563eb     /* blue (informational) */
```

### 간격 토큰
```css
--r4: 8px    /* 작음 */
--r8: 12px   /* 중간 */
--r12: 16px  /* 큼 */
--r16: 20px  /* 카드용 */
--r24: 28px  /* 특대 */
```

### 스타일링 규칙
- **Block comment**: `/* ── SECTION ── */` 형식
- **Minified shorthand**: 가능한 축약 형식 사용 (단, 가독성 해치지 않는 범위)
- **색상 그래디언트**: `linear-gradient(135deg, var(--ac), var(--ac2))`
- **반응형 폰트**: `clamp(1.7rem, 4vw, 2.5rem)` 사용
- **박스 섀도우**: `0 2px 12px rgba(0,0,0,.06)` (기본)
- **애니메이션 타이밍**:
  - Spring: `cubic-bezier(.34,1.56,.64,1)`
  - Fade-up: `.42s ease`

### 버튼 스타일
- **Primary**: 주황 그래디언트 배경, 흰 텍스트
- **Ghost**: 흰 배경, 테두리, 호버 시 배경색 변경
- **Secondary**: 파란색 톤

### 입력 필드
- Focus 시: 주황 테두리 + glow 효과
- 포커스 링: `0 0 0 3px var(--acg)`
- Number input: spinner 버튼 숨김 (모양 정규화)

### 테이블
- `thead`: 연한 배경(`--s2`), 대문자 레이블
- `tbody`: 호버 시 미묘한 배경색
- `.disabled-row`: opacity 감소 처리
- 모든 셀 padding: `4px 4px` (기본)

### 애니메이션
- **페이드업 진입**: `@keyframes fuv` + `.fuv` 클래스
- **지연**: `.d1`–`.d5` (0.05s ~ 0.28s 간격)
- **Toast**: Spring animation + `opacity` 전환

### 반응형 breakpoint
- `860px`: 헤더 레이아웃 변경 (flex → column)
- `480px`: 모바일 조정 (패딩, 폰트 크기, 그리드 1→2열)
- `620px`: 그리드 1→2열

### Print Media
- 숨길 요소: `.bg-glow`, `.hdr-btns`, `.del-btn`, `.add-area`, `#toast`
- 입력 필드: 테두리/배경 제거, transparent
- 카드: 섀도우 제거
- `.total-row`, `.mat-total-row`: 주황/파란 2px 테두리만 유지

## JavaScript

### 변수 선언
- `const` / `let` 사용 (var 금지)
- 설정 상수: `SCREAMING_SNAKE_CASE`
  - 예: `DEFAULTS`, `TEMPLATES`, `SIZES`, `MAT_DEFAULTS`

### 함수
- 이름: camelCase
- 주요 헬퍼:
  - `esc()` — HTML 이스케이프 (XSS 방지)
  - `fmtN()` — 숫자 포매팅 (한글 로케일 쉼표)
  - `toast()` — 토스트 메시지 표시 (2800ms 자동 dismissed)
  - `recalc()` — 전체 계산 및 재렌더링

### DOM 조작
- `getElementById()` 선호 (성능)
- 인라인 이벤트 핸들러 사용 가능: `onclick="func()"`
- 동적 HTML 생성: `innerHTML` 사용 시 `esc()` 필수 (사용자 입력)
- 텍스트 업데이트: `textContent` 우선

### 주석
- 로직 설명: 한글 주석 사용
- 섹션 구분: HTML 주석 `<!-- ── LOGIC ── -->` 형식
- 복잡한 계산: 단계별 주석 추가

### 클립보드 및 UI 피드백
- 복사: `navigator.clipboard.writeText(text).then(...).catch(...)`
- 피드백: `toast("메시지")` 사용
- 인쇄: `window.print()` 위임

### 초기화
- `DOMContentLoaded` 이벤트에서 초기값 설정 및 이벤트 리스너 등록
- 입력값 검증: 사용자 입력에만 적용
- 포맷팅: 입력 시 → blur 시 재포매팅 패턴

## 코드 리뷰 체크리스트

- [ ] 모든 색상이 CSS 변수로 정의됨
- [ ] 하드코딩된 매직 넘버 없음
- [ ] HTML은 유효함 (문법 오류 없음)
- [ ] 접근성 최소 요구: `aria-label` on interactive cards
- [ ] 반응형 레이아웃: 860px, 480px 테스트
- [ ] 인쇄 스타일: 불필요한 요소 숨김, 레이아웃 정리됨
- [ ] 사용자 입력: `esc()` 또는 `textContent` (XSS 방지)
- [ ] 포커스 시각화: `box-shadow` glow ring
- [ ] 토스트/피드백: 명확한 메시지 + 적절한 타이밍
