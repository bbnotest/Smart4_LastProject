# Firebase 보안 설정

Firebase 웹 API 키는 브라우저에서 사용되므로 배포된 정적 사이트에서 숨길 수 없다.
API 키를 비밀번호처럼 신뢰하지 말고 아래 설정을 모두 적용해 접근을 통제한다.

## 즉시 적용

1. Google Cloud Console의 **API 및 서비스 > 사용자 인증 정보**에서 현재 웹 API 키를 연다.
2. 애플리케이션 제한사항을 **웹사이트**로 설정하고 아래 리퍼러만 허용한다.
   - `https://bbnotest.github.io/*`
   - `https://bbnotest.github.io/Smart4_LastProject/*`
   - `http://localhost:4173/*`
   - `http://127.0.0.1:4173/*`
3. API 제한사항을 **키 제한**으로 설정하고 실제 Firebase 웹앱에서 사용하는 API만 허용한다.
4. GitHub에 이미 공개된 키는 제한 설정 후 새 키로 교체하고 기존 키를 삭제한다.
5. Firebase Authentication 사용자 목록에서 알 수 없는 계정을 삭제한다.
6. `@smart.com` 이메일 접미사만으로 권한을 부여하지 않는다. `firestore.rules`처럼 허용 계정을 명시하거나 Custom Claims를 사용한다.
7. Firebase Console에서 `firestore.rules` 내용을 게시한다.

## App Check

1. Firebase Console의 **App Check**에서 웹앱을 등록한다.
2. reCAPTCHA Enterprise 공급자를 만들고 사이트 키를 발급한다.
3. `firebase-config.js`의 `appCheckSiteKey`에 사이트 키를 입력한다. 사이트 키는 공개 값이다.
4. App Check 요청 지표를 확인한 뒤 Firestore 적용을 활성화한다.

## 주의

- GitHub 저장소에서 `firebase-config.js`를 삭제해도 배포된 웹페이지에서는 설정값을 확인할 수 있다.
- Git 기록에는 이전 키가 남아 있으므로 키 교체가 우선이다.
- 기록 삭제를 위한 강제 푸시는 협업자의 저장소를 깨뜨릴 수 있어 별도 합의 후 진행한다.
- Firebase 설정 객체에 서비스 계정 키, 개인 키, 관리자 SDK 인증 파일을 절대 넣지 않는다.
