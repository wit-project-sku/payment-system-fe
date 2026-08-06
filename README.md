# Payment-fe

**WIT 키오스크 플랫폼의 굿즈 쇼핑몰**

## About this repository

키오스크에서 굿즈를 고르고 결제한 뒤, 고객이 휴대폰으로 배송지를 입력하고 주문을 조회하는 흐름 전체를 담당합니다. 하나의 React 앱이지만 **두 개의 서로 다른 화면**을 제공합니다.

`/kiosk` 는 매장에 설치된 키오스크의 터치 화면입니다. 굿즈를 둘러보고 장바구니에 담아 카드로 결제합니다. 결제가 끝나면 QR 코드가 뜹니다.

`/mobile` 은 그 QR을 찍었을 때 열리는 휴대폰 화면입니다. 배송지와 폰케이스 기종을 입력하고, 주문 내역을 조회하고, 환불을 신청합니다.

데이터는 형제 저장소인 admin-be에서 옵니다. 상품·카테고리·결제·배송·환불 API를 호출하며, 이 계약은 백엔드와 공유하므로 필드나 경로를 바꿀 때는 반드시 함께 움직여야 합니다.

## Built With

* JavaScript (JSX) — TypeScript를 쓰지 않습니다
* React 19
* Vite 7
* React Router v7
* Zustand
* Axios
* CSS Modules

결제 완료 QR 생성에 react-qr-code와 qrcode.react를 씁니다.

## Getting started

### Prerequisites

* **Node.js:** v20.19.0 이상 또는 v22.12.0 이상

### Installation

1. **Repository 클론**

```bash
git clone https://github.com/wit-project-sku/payment-fe.git
cd payment-fe
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

```bash
# .env.example 파일을 복사하여 .env 파일을 생성하고, 각 항목을 입력합니다.
cp .env.example .env
```

세 개의 키가 들어갑니다.

```
VITE_API_BASE_URL     공개 API 주소. 상품·카테고리·주문·배송·환불 대부분이 이걸 씁니다
VITE_API_LOCAL_URL    결제 승인 전용 주소. 일부러 분리해 둔 것이니 합치지 마세요
VITE_APP_API_URL      인증 API 주소 (비워 두면 VITE_API_BASE_URL 로 폴백)
```

VITE_로 시작하는 값은 빌드할 때 번들에 그대로 인라인되어 브라우저에서 보입니다. 비밀로 지켜야 하는 값은 넣지 마세요.

### Run Project

```bash
npm run dev
```

http://localhost:5173 으로 접속하면 `/mobile` 로 이동합니다. 키오스크 화면을 보려면 `/kiosk/store` 로 직접 들어가세요.

빌드는 `npm run build`, 린트는 `npm run lint`, 빌드 결과 확인은 `npm run preview`입니다. 테스트 스위트가 없으므로 변경을 확인할 때는 린트를 돌리고 브라우저에서 해당 흐름을 직접 눌러 봐야 합니다.

### Before You Start

**키오스크 화면은 매장 번호가 있어야 제대로 동작합니다.** 어느 매장의 키오스크인지 구분하는 값이 URL로 들어옵니다.

```
http://localhost:5173/kiosk/store?kioskId=5
```

화면이 이 값을 읽어 localStorage에 저장하고 주소창은 깨끗한 경로로 바꿉니다. 이후로는 저장된 값을 씁니다. **유효한 값이 없으면 기본값 3으로 동작하므로**, 엉뚱한 매장 상품이 보인다면 localStorage를 먼저 확인하세요. 매장 번호는 인사동 1, 오색 4, 화성 5입니다.

**모바일의 배송지·배송 화면은 직접 링크로 들어갈 수 없습니다.** 기종 선택 화면을 거쳐 왔다는 표시가 없으면 `/mobile` 로 돌려보냅니다. 개발 중에 해당 화면만 보려면 앞 단계부터 눌러서 진입해야 합니다.

**라우트를 추가하면 SPA 폴백 설정을 확인하세요.** `public/_redirects` 의 규칙에 의존해 모든 경로가 index.html로 떨어집니다. 이 파일이 깨지면 새로고침할 때 404가 납니다.

**인증용 axios 인스턴스는 사실상 쓰이지 않습니다.** 토큰 갱신과 강제 로그아웃 코드가 남아 있지만 로그아웃이 이동시키는 경로는 이 앱에 존재하지 않습니다. 다른 저장소에서 옮겨온 흔적이니 그대로 믿고 쓰지 마세요.

## Project Structure

```
src/
├── main.jsx → App.jsx → routes/Router.jsx
├── pages/kiosk/            키오스크 매장 화면
├── pages/mobile/           배송지·기종·조회·환불 화면
├── layouts/                KioskLayout · MobileLayout
├── components/             cart · common · goods · modal
├── apis/                   axios 인스턴스 3종과 도메인별 호출 함수
├── hooks/                  장바구니, 전화번호 저장
└── assets/ datas/
```

서버 호출은 컴포넌트에서 axios를 직접 쓰지 말고 apis 폴더의 함수를 통합니다. 응답 껍데기를 두 번 벗기는 구조라 새 함수를 만들 때도 같은 방식을 따라야 합니다.

장바구니는 컴포넌트 지역 상태이고, 전화번호만 zustand로 localStorage에 남습니다. 그 외 전역 스토어는 없습니다.

경로 별칭은 vite.config.js에 선언돼 있습니다.

## Deployment

기본 브랜치에 push하면 Netlify가 자동으로 배포합니다. SPA 라우팅은 `public/_redirects` 규칙에 의존합니다.

운영에서 결제 완료 QR이 가리키는 주소는 witteria.com/mobile 입니다.

배포는 요청받았을 때만 합니다. 작업을 시작할 때 기본 브랜치에 있다면 먼저 작업 브랜치로 분기하세요.

## References

* [Swagger](https://api-stage-v3.witteria.com/swagger-ui/index.html) — 백엔드 API 명세
* [admin-be](../admin-be/README.md) — 백엔드 저장소
* [admin-fe](../admin-fe/README.md) — 관리자 웹. 상품·주문·환불을 여기서 관리합니다
* [wit-platform-docs](../wit-platform-docs/README.md) — 플랫폼 전체 그림, 온보딩, 인프라
