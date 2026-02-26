# 프론트엔드 파일 구조 (FILE_STRUCTURE.md)

이 문서는 `lovelop-frontend` 프로젝트의 디렉토리와 파일 구조에 대한 상세 설명을 제공합니다.

## 디렉토리 개요

```text
lovelop-frontend/
├── src/                        # 메인 애플리케이션 소스 코드
│   ├── api/                    # API 클라이언트 및 서비스별 모듈
│   ├── assets/                 # 정적 자산 (이미지, 폰트 등)
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   └── simulation/         # 시뮬레이션 전용 UI (지도, 마커 등)
│   ├── data/                   # 로컬 JSON 모킹 데이터 및 상수
│   ├── hooks/                  # 커스텀 리액트 훅 (로직 재사용)
│   ├── i18n/                   # 국제화 및 에러 메시지 매핑
│   ├── utils/                  # 헬퍼 함수 및 포맷팅 유틸리티
│   ├── App.jsx                 # 루트 컴포넌트, 상태 관리 및 라우팅
│   ├── index.css               # 글로벌 스타일 (Tailwind CSS)
│   └── main.jsx                # 리액트 애플리케이션 엔트리 포인트
├── public/                     # 루트 경로에서 호스팅되는 정적 파일
├── .env.local                  # 환경 변수 (API 주소, Mapbox 토큰 등)
├── tailwind.config.js          # Tailwind CSS 설정 파일
├── package.json                # 프로젝트 의존성 및 스크립트 정의
└── README.md                   # 프로젝트 전체 개요 및 사용자 플로우 설명
```

## 상세 파일 설명

### /src/api
- `client.js`: 타임아웃 및 에러 처리 로직이 포함된 핵심 Fetch 기반 HTTP 클라이언트.
- `stores.js`: 매장 데이터 조회 및 검색을 위한 서비스.
- `xReport.js`: X-Report 생성 요청 및 응답 데이터 정규화 처리.
- `simulation.js`: 시뮬레이션 시작 및 결과 데이터 조회.
- `yReport.js`: 최종 비교 데이터 및 AI 리포트 조회.
- `jobs.js`: 모든 비동기 작업에 공통으로 사용되는 상태 폴링(Polling) 서비스.

### /src/components
- `ToastProvider.jsx`: 글로벌 알림(토스트) 시스템 관리.
- `simulation/SimulationMap.jsx`: Mapbox를 활용한 에이전트 이동 시각화 컴포넌트.

### /src/hooks
- `useJobPolling.js`: 백엔드 작업이 완료될 때까지 주기적으로 상태를 확인하는 로직을 추상화한 커스텀 훅.

### /src/i18n
- `errors.js`: 백엔드 에러 코드(예: `[NOT_FOUND]`)를 사용자 친화적인 한국어 메시지로 변환.

### /src/utils
- `formatting.js`: 통화, 퍼센트, 문자열 조작을 위한 헬퍼 함수.
- `normalization.js`: API의 snake_case 응답을 프론트엔드의 camelCase로 변환하는 등의 로직.

### 루트 파일
- `App.jsx`: 애플리케이션의 핵심부입니다. 현재 탭, 선택된 매장, 리포트 상태, 글로벌 시뮬레이션 상태 등을 관리하여 단계 이동 시에도 데이터가 유지되도록 합니다.
- `tailwind.config.js`: 사이트 전체에서 사용되는 색상, 폰트, 애니메이션 등의 커스텀 설정.
