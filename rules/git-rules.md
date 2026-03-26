# Git Rules

## 커밋 메시지 형식

```
<type>: <imperative description>
```

### Type 종류
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **chore**: 파일 rename, 폴더 구조 변경 등 기능 변화 없는 작업
- **refactor**: 기능 변화 없이 코드 구조 개선
- **style**: CSS/스타일 변경
- **docs**: 문서 추가/수정

### 예시
```
feat: add VAT toggle to electrical estimate
fix: correct bedding quantity formula for SS beds
chore: rename HTML files to English filenames
refactor: extract shared CSS into styles.css
style: update color tokens for better contrast
docs: add CLAUDE.md project context
```

## 브랜치 전략

- **main**: 항상 배포 가능한 상태 유지
- **feature/<short-name>**: 새 기능 또는 기능 향상
- **fix/<short-name>**: 버그 수정
- **chore/<short-name>**: 유지보수 작업 (파일명 변경, 구조 개선 등)

예: `feature/kpi-cards`, `fix/slider-value`, `chore/css-extraction`

## 커밋 규칙

- 한 커밋 = 한 가지 논리적 변화
- HTML 검증 후 커밋 (구문 오류 없어야 함)
- 파일명 변경 시 반드시 `git mv` 사용 (히스토리 보존)
- 커밋 메시지는 명령조 (imperative mood) 사용

## 태그

릴리스 시 다음 형식으로 태깅:
```
git tag -a v<major>.<minor> -m "<description>"
```

예: `v1.0` (초기 기능 완성), `v1.1` (기능 추가), `v2.0` (주요 리팩토링)

## 기타

- 커밋 전 항상 `git status`로 상태 확인
- 의도하지 않은 파일이 포함되지 않았는지 확인
- 불필요한 파일은 `.gitignore`에 추가
