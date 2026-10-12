# 모아 · 작은 시간의 기록

파스텔 네모 달력으로 작업 시간을 모으는 반응형 웹앱이에요. 별도 빌드 없이 Firebase Hosting 또는 GitHub Pages에 배포할 수 있어요.

## 먼저 실행해요

Node.js 20 이상에서 이 폴더를 열고 실행해요.

```sh
npm start
```

브라우저에서 http://127.0.0.1:4173 을 열어요. HTML 파일을 더블클릭하는 방식은 ES 모듈 때문에 지원하지 않아요. 기본은 체험 모드이며 프로젝트, 기록, 타이머를 해당 브라우저의 localStorage에 저장해요. 체험 기록은 Firebase로 자동 이전하지 않아요. 필요한 기록은 하단의 ‘기록 백업’으로 JSON을 내려받을 수 있어요. 가져오기 기능은 없어요.

## Firebase 연결

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 만들고 웹 앱을 등록해요.
2. 프로젝트 설정 → 내 앱의 `firebaseConfig` 값을 `public/firebase-config.js`에 넣어요. 기존 `null`을 아래와 같은 객체로 바꾸면 돼요.

```js
export const firebaseConfig = {
  apiKey: '콘솔에서 복사한 값',
  authDomain: '내-프로젝트.firebaseapp.com',
  projectId: '내-프로젝트',
  appId: '콘솔에서 복사한 값'
};
```

3. Authentication → 로그인 방법에서 Google을 활성화하고 지원 이메일을 지정해요.
4. Authentication → 설정 → 승인된 도메인에 실제 호스팅 도메인을 추가해요. 로컬 테스트에는 `localhost`, `127.0.0.1`을 필요에 따라 추가해요. 경로와 `https://`는 넣지 않아요. GitHub Pages라면 `사용자명.github.io`예요.
5. Cloud Firestore의 **기본 데이터베이스 `(default)`**를 만들어요. 테스트 모드의 공개 규칙은 사용하지 않아요. `firestore.rules` 전체를 규칙 탭에 붙여 넣고 게시하거나 아래 CLI로 배포해요.
6. 앱을 새로고침하고 Google로 로그인해요. 폰과 PC에서 같은 주소와 같은 Google 계정을 사용해요. 팝업이 막히면 팝업을 허용하고 다시 눌러요. 메신저 내부 브라우저 대신 Safari 또는 Chrome에서 열어요.

웹 설정값은 브라우저에 공개되는 값이에요. 서비스 계정 JSON, 비공개 키, 관리자 자격 증명은 이 앱에 넣지 않아요. 데이터 접근 권한은 Firebase Authentication과 배포한 Firestore 규칙으로 제한해요. [Google 로그인 공식 안내](https://firebase.google.com/docs/auth/web/google-signin), [사용자별 보안 규칙](https://firebase.google.com/docs/rules/rules-and-auth)을 참고해요.

## Firebase Hosting 배포

이 프로젝트 폴더에서 실행해요. `YOUR_PROJECT_ID`를 실제 프로젝트 ID로 바꿔요.

```sh
npm install -g firebase-tools
firebase login
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,hosting
```

CLI가 알려 주는 HTTPS 주소를 폰과 PC에서 열어요. Firebase 설정과 규칙은 배포 전에 확인해요. 서버용 서비스 계정은 필요하지 않아요.

## GitHub Pages 배포 (선택)

이 폴더의 **내용 전체**를 저장소 루트에 올려요. 숨김 폴더 `.github`도 포함해요. 저장소 Settings → Pages → Source를 GitHub Actions로 설정한 뒤 Actions → Deploy GitHub Pages → Run workflow를 실행해요. 워크플로는 `public/` 폴더만 게시해요. 상대 경로를 사용하므로 `/저장소명/` 경로에서도 동작해요.

GitHub Pages는 화면만 호스팅해요. 데이터는 계속 Firebase에 저장해요. 보안 규칙은 별도로 게시해야 해요.

```sh
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules
```

## 사용과 집계 기준

- 새 프로젝트를 만들고 색을 골라요.
- 프로젝트를 선택해 타이머를 시작하거나, 시작·종료 날짜와 시간을 직접 입력해요.
- 타이머는 `users/{uid}/state/timer` 한 문서로 공유해요. 다른 기기에서 종료할 수 있고 Firestore 트랜잭션으로 중복 시작·종료 충돌을 처리해요.
- 작업 기록은 `users/{uid}/sessions/{id}`, 프로젝트는 `users/{uid}/projects/{id}`에 저장해요. 다른 사용자의 읽기·쓰기는 거부해요. 필드, 시간 범위, 프로젝트 참조도 규칙에서 검사해요.
- 달력 색은 해당 날짜와 겹치는 작업 횟수(0, 1, 2, 3회 이상)예요. 자정을 넘긴 기록은 날짜별 시간으로 분할하며 양쪽 날짜에 각 1회로 집계해요. 누적 시간은 각 세션 시간을 더해요. 겹치는 수동 기록도 각각 합산해요.
- 날짜는 **기기의 현지 시간대**로 표시해요. 폰과 PC의 시간대가 다르면 달력의 날짜별 분배가 달라질 수 있어요. 한국에서 동일하게 보려면 두 기기를 서울 시간대로 설정해요.
- 수동 기록은 최대 7일, 미래 종료는 허용하지 않아요(기기 시계 오차 1분 허용). 타이머를 장기간 방치했다면 취소 후 수동 기록으로 나누어 남겨요.
- 타이머는 탭을 닫아도 시작 시각을 유지해요. 시간 계산은 기기 시계 기반이에요. 기기의 자동 날짜/시간을 켜 두어요.
- 클라우드 모드에서 오프라인 쓰기는 지원하지 않아요. 인터넷 연결 후 다시 저장해요. 로그인하지 않으면 개인 데이터는 표시하지 않아요.
- 프로젝트 삭제·이름 수정과 기록 수정은 현재 제공하지 않아요. 잘못된 기록은 삭제하고 다시 입력해요. 기록 백업은 JSON 내보내기예요.
- 모든 기록을 실시간 구독하는 개인용 소규모 앱이에요. 기록이 아주 많아지면 페이지 나누기와 서버 집계를 추가하는 게 좋아요.

## 검증

```sh
npm test
node --check public/app.js
```

시간 분할, 자정 경계, 작업 횟수, 잘못된 시간 입력, 표시 문자열 처리를 검사하는 6개 테스트를 통과했어요. JavaScript 구문 검사도 통과했어요.

이 제작 환경에서는 로컬 미리보기 소켓 접근이 제한되어 브라우저 렌더링·모바일 화면·클릭 동작 검증을 완료하지 못했어요. 실제 Firebase 자격 설정이 없으므로 Google 로그인, Firestore 규칙 실행, 두 기기 동기화도 실행 검증 전이에요. 실제 배포를 수행하지 않은 배포용 소스예요.

연결 후 다음 순서로 확인해 주세요.

1. 폭 390px와 1280px에서 가로 넘침, 입력창, 달력 클릭을 확인해요.
2. 프로젝트 생성 → 1시간 수동 기록 → 누적 1시간과 달력 1회가 표시되는지 확인해요.
3. 23:30~다음 날 01:00 기록이 각각 30분·60분으로 표시되는지 확인해요.
4. PC에서 시작 → 폰에서 종료 → 두 기기에 한 기록만 생기는지 확인해요. 동시에 시작/종료해도 중복 기록이 없어야 해요.
5. 새로고침 후 타이머 복원, 로그아웃 시 기록 제거, 다른 계정으로 로그인 시 별도 작업실을 확인해요.
6. Firestore Rules Playground 또는 Emulator에서 익명 접근과 다른 UID 접근이 거부되고, 소유자의 올바른 기록만 허용되는지 확인해요. 음수 시간·역전 시간·없는 프로젝트·추가 필드도 거부되어야 해요.

Firebase SDK는 Google CDN의 12.4.0 고정 버전을 불러와요. 글꼴은 Google Fonts를 사용하고 로딩에 실패하면 기본 글꼴로 표시해요.
