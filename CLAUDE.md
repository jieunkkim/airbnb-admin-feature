# CLAUDE.md

이 파일은 이 저장소의 코드를 작업할 때 Claude Code(claude.ai/code)를 위한 가이드입니다.

## 프로젝트 개요

**h.run 도구 모음** — 에어비앤비 운영 및 컨설팅을 위한 한국어 단일 페이지 HTML 계산기 모음입니다. 빌드 도구, 의존성, 프레임워크 없이 순수 HTML + CSS + 바닐라 JavaScript로 구성됩니다.

## 일반적인 명령어

### 테스트 및 보기
- **허브 열기**: `index.html`을 더블클릭하거나 브라우저에서 열기
- **도구 테스트**: 허브의 카드를 클릭하거나 HTML 파일을 브라우저에서 직접 열기
- **반응형 테스트**: 브라우저를 860px, 480px로 리사이징하여 확인 (`@media` 중단점)
- **인쇄 테스트**: 도구 열기 → `Ctrl+P` / `Cmd+P` → PDF로 인쇄 (CSS에서 UI 숨김)

### 개발 워크플로우
1. HTML/CSS/JS를 편집기에서 수정
2. 파일 저장
3. 브라우저 새로고침 (Cmd+R / F5)
4. 컴파일, 빌드 단계 없음

### 파일 명명 및 버전 관리
새 도구를 만들 때:
```
new-tool-name_v1.html     # kebab-case, 버전 표시 필수
```
그 후 `index.html`에 카드를 추가하여 링크합니다.

## 아키텍처

### 허브 페이지 (`index.html`)
- 진입점: 3개의 클릭 가능한 카드 (💸 ⚡ 🛏️)
- 링크: `airbnb-revenue-calculator_v2.html`, `electrical-work-estimate-calculator_v1.html`, `bedding-estimate-calculator_v2.html`
- 레이아웃: 최대 너비 560px, 중앙 정렬, fade-up 애니메이션
- JavaScript 로직 없음 (네비게이션만 담당)

### 공유 스타일시트 (`styles.css`)
모든 도구가 이 단일 CSS 파일을 상속받습니다. 정의:
- **디자인 토큰** (`:root` 변수): 색상 (`--ac`, `--gr`, `--rd`, `--am`, `--bl`), 간격 (`--r4` ~ `--r24`), 텍스트 (`--t1`, `--t2`, `--t3`)
- **재사용 가능 컴포넌트**: `.card`, `.notion-btn`, `.table`, `.tbl-input`, `.total-row`, `.toast`, 애니메이션 (`.fuv`, `.d1`–`.d5`)
- **반응형 중단점**: 860px (헤더 flex→column), 480px (모바일 패딩/폰트), 620px (그리드 1→2)
- **인쇄 미디어 쿼리**: `.bg-glow`, `.hdr-btns`, `.del-btn`, `.add-area`, `#toast` 숨김

**도구별 오버라이드** (각 HTML의 `<style>` 블록):
- `airbnb-revenue-calculator_v2.html`: `body{font-size:18px}`, `.wrap{max-width:1080px}`, 슬라이더 스타일, KPI 카드, 매트릭스 테이블, 모달
- `electrical-work-estimate-calculator_v1.html`: `.input-grid{minmax:200px}`, textarea, `.summary-grid`, `.section-toggle`, `.mat-tbl`, `.cat-badge` (자재 카테고리)
- `bedding-estimate-calculator_v2.html`: `.input-grid{minmax:150px}`, `.derived-val` (자동 계산 필드), `.bed-chips`, `.size-badge`

### 각 도구의 패턴 (단일 페이지 앱)
```
<head>
  <link rel="stylesheet" href="styles.css">
  <style>/* 파일별 오버라이드만 */</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="wrap">
    <!-- HEADER -->
    <!-- SETTINGS 카드 -->
    <!-- DATA 카드 (테이블) -->
    <!-- SUMMARY -->
  </div>
  <div id="toast"></div>
  <script>
    // 데이터 배열: DEFAULTS, TEMPLATES, SIZES
    // 반응형 핵심: 입력 변화 시마다 recalc() 호출
    // 헬퍼: esc(), fmtN(), toast(), resetAll()
  </script>
</body>
```

### JavaScript 패턴

**데이터 모델**: 단일 진실 공급원 배열 (`items[]`, `matItems[]` 등)
```js
const DEFAULTS = [{ id:1, name:'...', price:0, ... }, ...];
const items = [];  // DEFAULTS에서 빌드
```

**반응성**: 모든 입력이 `recalc()`을 호출하여 한 번에 모든 요약을 재렌더링 (세밀한 업데이트 없음)

**헬퍼 함수**:
- `esc(str)` — HTML 이스케이프 (XSS 안전한 `innerHTML`)
- `fmtN(num)` — 한글 로케일 쉼표로 숫자 포매팅: `1000000` → `1,000,000`
- `toast(msg)` — 2800ms 하단 중앙 알림 표시
- `recalc()` — 모든 합계 재계산 및 DOM 재렌더링
- `buildItems()` / `buildMarkdown()` — 데이터 초기화 또는 내보내기

**이벤트**: 인라인 `onclick`, `oninput`, `onchange` 핸들러 (단일 페이지 도구에서 허용)

**클립보드 및 인쇄**:
- 복사: `navigator.clipboard.writeText(markdown).then(...).catch(...)`
- 인쇄: `window.print()` (`@media print` 트리거)

## 디자인 시스템

### 색상 팔레트
- **브랜드**: `--ac: #e8650a` (주황색), `--ac2: #f07820` (밝은 주황색)
- **의미론적**: `--gr: #16a34a` (수익/좋음), `--rd: #dc2626` (손실/나쁨), `--am: #d97706` (경고), `--bl: #2563eb` (정보)
- **중립**: `--bg: #faf8f5` (페이지 bg), `--s1: #fff` (카드 bg), `--s2–s4` (톤), `--t1–t3` (텍스트 회색)

### 컴포넌트
- **카드**: 20px 반경, 1px 테두리, 부드러운 그림자, 흰색 배경
- **버튼 (Primary)**: 주황 그래디언트, 흰 텍스트, 호버 시 glow
- **입력**: 포커스 → 주황 테두리 + glow box-shadow
- **테이블**: 밝은 헤더 배경, 미묘한 호버 톤, `.disabled-row` 불투명도 처리
- **토스트**: 고정 하단 중앙, spring 애니메이션 `cubic-bezier(.34,1.56,.64,1)`, 2800ms 자동 닫음
- **진입 애니메이션**: `.fuv` 클래스 (fade-up, `.42s ease`) + `.d1`–`.d5` 계층 지연

### 타이포그래피
- 폰트: `'DM Sans'` (Google Fonts, 가변 폰트)
- 기본 크기: 16px (본문), 18px (수익 계산기 오버라이드)
- 반응형 제목: `clamp(1.7rem, 4vw, 2.5rem)`
- 모든 폰트 두께 사용 가능: 300–900

## 코드 스타일 및 컨벤션

`rules/code-style.md`에서 상세 규칙을 확인하세요. 주요 사항:

**CSS**:
- 모든 값을 `var(--token)`으로 (매직 넘버 금지)
- 축약 형식 (한 줄 규칙)
- 블록 주석: `/* ── SECTION ── */`
- 그래디언트: `linear-gradient(135deg, var(--ac), var(--ac2))`

**JavaScript**:
- `const`/`let` 사용 (var 금지)
- 설정 상수: `SCREAMING_SNAKE_CASE`
- 헬퍼 함수: camelCase
- 입력 새니타이제이션: 동적 HTML에 `esc()` 사용
- 숫자 포매팅: 표시용 `toLocaleString('ko-KR')`

**HTML**:
- `lang="ko"`
- 시맨틱 태그 (`<h1>`, `<h2>`)
- 접근성: 인터랙티브 카드에 `aria-label`
- 주석: `<!-- ── SECTION ── -->`

## Git & 커밋 컨벤션

`rules/git-rules.md`를 참고하세요. 커밋 메시지 형식:
```
<type>: <명령조 설명>
```

타입: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`

예:
```
feat: add break-even analysis to revenue calculator
fix: correct VAT rounding in electrical estimate
style: extract colors to shared design tokens
```

브랜치 명명:
- `main` — 프로덕션
- `feature/short-name` — 새 기능
- `fix/short-name` — 버그 수정
- `chore/short-name` — 유지보수

릴리스 태그: `v1.0`, `v1.1`, `v2.0`

## 파일 구조
```
.
├── index.html                                    # 허브 (진입점)
├── airbnb-revenue-calculator_v2.html             # 도구: 수익/이익/KPI 분석
├── electrical-work-estimate-calculator_v1.html   # 도구: 공사 견적 + 자재
├── bedding-estimate-calculator_v2.html           # 도구: 자동 수량 계산
├── styles.css                                    # 공유 디자인 시스템
├── rules/
│   ├── git-rules.md                             # Git 컨벤션
│   └── code-style.md                            # 상세 코드 스타일
└── CLAUDE.md                                     # 이 파일
```

## 디버깅 팁

**스타일이 적용되지 않는가?**
- 도구 HTML에 `<link rel="stylesheet" href="styles.css">`가 있는지 확인
- 색상 토큰 이름 확인 (예: `--ac` not `--accent`)
- 브라우저 DevTools: 요소 검사, 계산된 스타일 확인

**JavaScript 오류?**
- 브라우저 콘솔 열기 (F12)
- 함수명이나 `getElementById()` ID 오타 확인
- `buildItems()` 호출 전 `DEFAULTS` 배열 초기화 확인

**인쇄 레이아웃이 깨졌는가?**
- 도구의 `<style>`에서 `@media print` 규칙 확인
- `.bg-glow`, `.hdr-btns`, `.del-btn`이 `display:none!important`로 숨겨졌는지 확인
- 다양한 브라우저 확대/축소 레벨에서 테스트 (100%, 90%, 80%)

**폼 입력이 업데이트되지 않는가?**
- 입력에 `oninput="recalc()"` 또는 `onchange="recalc()"` 확인
- `recalc()`가 DOM 요소를 다시 읽도록 확인 (`getElementById()` 사용, 캐시된 참조 사용 금지)
