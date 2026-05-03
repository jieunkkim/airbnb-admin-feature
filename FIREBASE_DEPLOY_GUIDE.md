# Firebase Hosting 배포 가이드

이 문서는 프로젝트를 Firebase Hosting에 배포하는 단계별 가이드입니다.

---

## 1단계: Firebase CLI 설치

macOS 또는 Linux:
```bash
brew install firebase-cli
```

또는 npm을 통해 (모든 OS):
```bash
npm install -g firebase-tools
```

설치 확인:
```bash
firebase --version
```

---

## 2단계: Google 계정으로 로그인

```bash
firebase login
```

- 브라우저가 열리면 Google 계정으로 로그인
- 콘솔에서 로그인 완료 메시지 확인

---

## 3단계: Firebase Console에서 프로젝트 생성

1. **Firebase Console 열기**: https://console.firebase.google.com
2. **새 프로젝트 추가** 클릭
3. **프로젝트 이름** 입력 (예: `hrun-tools`)
4. **Google Analytics** (선택사항)
   - 필요 없으면 체크 해제
   - 필요하면 Google Analytics 계정 선택
5. **프로젝트 생성** 클릭

**프로젝트 ID 확인 (중요!)**
- 프로젝트 생성 후, Firebase Console 좌측에서 프로젝트명 옆 설정 아이콘 → 프로젝트 설정
- 또는 프로젝트 ID는 보통 `프로젝트명-abc123` 형식
- 예: `hrun-tools-a1b2c3d4e5f6`

---

## 4단계: 로컬 `.firebaserc` 파일 수정

프로젝트 루트의 `.firebaserc` 파일을 열어서:

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

`YOUR_PROJECT_ID` 부분을 **3단계에서 확인한 프로젝트 ID로 교체**

예:
```json
{
  "projects": {
    "default": "hrun-tools-a1b2c3d4e5f6"
  }
}
```

---

## 5단계: 배포

프로젝트 루트에서:

```bash
firebase deploy
```

배포 진행 중:
- `firebase.json` 설정 파일 검증
- 파일 업로드
- 배포 완료

---

## 6단계: 배포 결과 확인

배포 완료 후 콘솔에 다음과 같은 메시지가 나타남:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/hrun-tools-a1b2c3d4e5f6
Hosting URL: https://hrun-tools-a1b2c3d4e5f6.web.app
```

**배포된 URL에서 서비스 확인**:
1. 브라우저에서 `https://hrun-tools-a1b2c3d4e5f6.web.app` 열기
2. index.html 허브 페이지가 정상 표시되는지 확인
3. 각 도구 카드 클릭 후 tools/ 페이지가 정상 로드되는지 확인
4. 디자인(색상, 폰트, 레이아웃) 깨짐이 없는지 확인

---

## 이후 업데이트 배포

프로젝트를 수정한 후 다시 배포하려면:

```bash
firebase deploy
```

그러면 자동으로 변경된 파일만 업데이트합니다.

---

## 문제 해결

### "firebase" 명령어를 찾을 수 없습니다
```bash
npm install -g firebase-tools
```
또는 경로 재설정 필요

### 로그인 오류
```bash
firebase logout
firebase login
```

### 프로젝트 ID가 없습니다
`.firebaserc`에서 `YOUR_PROJECT_ID`를 실제 프로젝트 ID로 교체했는지 확인

### 배포 후 404 오류
- `firebase.json`의 `public` 필드가 `.` (현재 폴더)로 설정되어 있는지 확인
- 캐시 문제일 수 있음: 브라우저 캐시 비우기 또는 시크릿 모드에서 확인

---

## 커스텀 도메인 연결 (선택사항)

나중에 `hrun.kr` 같은 도메인을 연결하려면:

1. Firebase Console → Hosting → 도메인 연결
2. 도메인 추가 → 도메인명 입력
3. DNS 레코드 설정 (제공된 레코드를 도메인 관리 업체에 입력)
4. 확인 버튼 클릭

---

## 참고

- **배포된 파일**: `firebase.json`의 `ignore` 필드에 제외된 파일 제외, `.` (루트) 아래 모든 파일
- **제외된 파일**: `CLAUDE.md`, `TODO.md`, `rules/`, `test-data/`, `docs/`, `.claude/`, `tools/Untitled`
- **캐시 정책**:
  - HTML: `no-cache` (항상 최신)
  - CSS/JS: 7일 캐시 (성능 최적화)
