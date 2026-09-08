# SelfFire (셀프파이어) 🔥

SelfFire는 사용자의 동기부여를 돕는 명언 및 목표 달성(스트릭) 트래킹 애플리케이션입니다. 매일 새로운 자극을 주고, 나만의 명언을 기록하며, 습관을 형성해나갈 수 있도록 지원합니다.

## ✨ 주요 기능

* **명언 제공 및 즐겨찾기**: 다양한 동기부여 명언을 확인하고, 마음에 드는 명언을 즐겨찾기에 추가할 수 있습니다.
* **나만의 명언 작성**: 사용자 본인만의 명언이나 다짐을 직접 작성하고 관리할 수 있습니다.
* **스트릭 (연속 달성) 기능**: 매일 목표를 달성하며 스트릭을 유지해 습관을 만들어갑니다.
* **커스텀 폰트 지원**: 나눔명조, 고운돋움, 주아체, 나눔펜스크립트 등 다양한 한국어 폰트를 지원하여 감성적인 UI를 제공합니다.
* **테마 설정**: 라이트/다크 모드 등 사용자가 원하는 앱 디자인 테마를 설정할 수 있습니다.
* **푸시 알림**: 잊지 않고 동기부여를 받을 수 있도록 리마인드 알림을 제공합니다.

## 🛠 기술 스택

* **Framework**: React Native, [Expo](https://expo.dev/)
* **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) (AsyncStorage를 활용한 기기 내 데이터 영구 저장)
* **Styling**: [@shopify/restyle](https://github.com/Shopify/restyle)
* **Language**: TypeScript
* **Monetization**: Google AdMob (`react-native-google-mobile-ads`)
* **Push Notifications**: Expo Notifications

## 🚀 시작하기 (Getting Started)

1. **패키지 설치**
   ```bash
   npm install
   ```

2. **앱 실행**

   ```bash
   npx expo start
   ```

   실행 후 터미널에 나타나는 QR 코드를 통해 다음 방법으로 앱을 확인할 수 있습니다:
   - **Expo Go** 앱을 통한 실제 기기 테스트
   - **Android Emulator** 실행 (`a` 입력)

## 📁 주요 프로젝트 구조

```text
self-fire/
├── app/                  # Expo Router 기반 화면(Screen) 및 레이아웃 폴더
│   ├── (navi)/           # 메인 화면들
│   ├── AddQuoteScreen.tsx # 나만의 명언 추가 모달 화면
│   ├── MyQuotesScreen.tsx # 내 명언 목록 화면
│   ├── SettingScreen.tsx  # 설정 화면
│   └── _layout.tsx       # 최상위 레이아웃 (폰트 로드, 테마, 광고 초기화)
├── assets/               # 이미지, 아이콘 등 정적 리소스
├── components/           # 재사용 가능한 UI 컴포넌트
├── models.tsx            # 공통 데이터 모델 및 타입 정의
├── store/                # Zustand 스토어 (quote, streak, theme, font 상태 관리)
├── plugins/              # Expo 커스텀 앱 플러그인
├── app.json              # Expo 프로젝트 메타데이터 및 설정 파일
└── package.json          # 패키지 의존성 관리 파일
```
