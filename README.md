# Lovelop Frontend

lovelop(러블롭) 서비스의 프론트엔드 저장소입니다. 소상공인을 위한 AI 기반 솔루션 플랫폼을 제공합니다.

## 서비스 특징
- **AI 기반 X-Report**: 상권 데이터 및 매장 데이터를 분석한 상세 리포트 제공.
- **시뮬레이션 기반 Y-Report**: AI 페르소나를 통한 가상 고객 시뮬레이션 및 마케팅 효과 분석.
- **데모 대시보드**: 현대적인 디자인(Glassmorphism)과 반응형 UI를 적용한 통합 대시보드.

## 브랜치 구조 및 비교

| 브랜치 | 상태 | 주요 내용 |
| :--- | :--- | :--- |
| **main** | **Base** | 초기 시뮬레이션 지도(`SimulationMap`) 및 마커(`AgentMarker`) 등 핵심 기능 위주의 가벼운 구조 |
| **sub** | **Development** | 대시보드 UI, 리포트 상세 페이지(X/Y-Report), API 클라이언트, 레이아웃 시스템 등이 추가된 고도화된 버전 |

### 주요 차이점
- **기능 확장**: `sub` 브랜치는 인증(Auth), 가격 정책(Pricing), 마이페이지(MyPage) 등 실제 서비스 운영에 필요한 다수의 페이지를 포함하고 있습니다.
- **디자인 시스템**: `MainLayout`을 도입하여 전역 네비게이션과 사이드바 구조를 통합했습니다.
- **데이터 통신**: `src/api` 모듈을 통해 서버와의 통신 규약이 정의되어 있습니다.

## 시작하기

```bash
npm install
npm run dev
```

## 환경변수 설정 (로컬 개발)

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 설정하세요.

```
VITE_API_BASE_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=<your_mapbox_token>
VITE_KAKAO_MAP_API_KEY=<your_kakao_key>
```

프론트 실행 후 브라우저 Network 탭에서 `GET http://localhost:8000/stores?limit=50&offset=0` 요청이 발생하면 백엔드 연동이 정상입니다.
