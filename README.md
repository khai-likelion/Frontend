# Lovelop Frontend

소상공인을 위한 AI 상권 분석 · 전략 시뮬레이션 플랫폼 **Lovelop(러블롭)** 의 프론트엔드 저장소.
매장 데이터를 기반으로 X-Report(진단) → 전략 선택 → 시뮬레이션 → Y-Report(비교 분석) 전 과정을 5단계 UI로 제공합니다.

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| UI Framework | React 19.2.0 |
| Build Tool | Vite 7.3.1 |
| Styling | Tailwind CSS 4.1.18 + PostCSS |
| 데이터 시각화 | Recharts 3.7.0 (RadarChart, BarChart, AreaChart 등) |
| 지도 | Mapbox GL 3.18.1 + React Map GL 8.1.0 |
| 아이콘 | Lucide React 0.564.0 |
| 마크다운 렌더링 | React Markdown 10.1.0 + remark-gfm |
| HTTP 클라이언트 | Fetch API (커스텀 구현, 외부 라이브러리 없음) |
| 패키지 매니저 | npm |

---

## 브랜치 구조

| 브랜치 | 설명 |
|---|---|
| **main** | 초기 시뮬레이션 지도(`SimulationMap`, `AgentMarker`) 핵심 기능 |
| **sub** | 전체 서비스 UI — 인증, 대시보드, X/Y-Report, 시뮬레이션 설정, 마이페이지, 가격 정책 포함 |

---

## 시작하기

```bash
npm install
npm run dev   # http://localhost:5173
```

### 환경변수 (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=<your_mapbox_token>
VITE_KAKAO_MAP_API_KEY=<your_kakao_key>
```

> 개발 서버 실행 후 브라우저 Network 탭에서 `GET http://localhost:8000/stores?limit=50&offset=0` 요청이 보이면 백엔드 연동 정상.

---

## 5단계 사용자 플로우

```
[Step 1] 매장 입력      → 매장 검색 & 선택 (Dashboard)
    ↓
[Step 2] X-Report      → AI 진단 리포트 생성 + 전략 선택
    ↓
[Step 3] 시뮬레이션 설정 → 기간 선택 + 선택 전략 확인
    ↓
[Step 4] 시뮬레이션     → 160명 에이전트 실시간 지도 시각화
    ↓
[Step 5] 최종 리포트    → Y-Report: 전략 적용 전후 비교 분석
```

상단 스텝바에서 각 단계를 클릭하여 이동 가능. 이전 단계 이동 시 리포트 데이터가 유지됩니다.

---

## 주요 기능

### Step 2 — X-Report

- GPT-4-turbo 기반 AI 매장 진단 리포트 생성
- **레이더 차트** (맛 / 서비스 / 분위기 / 가격 / 위생 5개 축)
- **키워드 감성 분석** (긍정·부정 색상 태그)
- **9개 전략 카드** (3개 솔루션 그룹 × 3개 액션)
  - 카드 클릭으로 시뮬레이션에 적용할 전략 선택/해제
  - 호버 시 실행 가이드(💡) + 기대 효과(📈) 오버레이
- 전문 보기 모달 (마크다운 전체 리포트)
- PDF 저장 (브라우저 인쇄 기능)
- **이전 페이지 복귀 시 리포트 상태 유지** (App 레벨 상태 관리)

### Step 3 — 시뮬레이션 설정

- 시뮬레이션 기간 선택 (1일 / 1주일 / 2주일 / 1개월 / 3개월 / 6개월 / 1년)
- 각 기간별 예상 소요 시간 및 크레딧 비용 표시
- Step 2에서 선택한 전략 목록 확인

### Step 4 — 시뮬레이션 맵

- Mapbox 기반 실시간 에이전트 이동 시각화 (160명)
- 거주민(resident) / 유동인구(floating) 에이전트 구분
- 시뮬레이션 완료 후 자동으로 Step 5(Y-Report)로 전환

### Step 5 — Y-Report

- 전략 적용 전(before) / 후(after) 지표 비교
- 방문객 수, 시장 점유율, 키워드 감성 변화, 평점 분포
- 피크 타임, 고객 재방문율, 성별·연령 분포 등
- 마크다운 전문 분석 보고서

---

## 프로젝트 구조

```
src/
├── App.jsx                      # 메인 앱 (전체 페이지 + 라우팅 + 상태 관리)
├── api/
│   ├── client.js                # Fetch 기반 HTTP 클라이언트 (타임아웃, 에러 코드)
│   ├── auth.js                  # 인증 API
│   ├── stores.js                # 매장 목록·검색 API
│   ├── jobs.js                  # Job 상태 조회 API
│   ├── xReport.js               # X-Report 생성·조회, 응답 정규화
│   ├── simulation.js            # 시뮬레이션 생성 API
│   └── yReport.js               # Y-Report 조회, 응답 정규화
├── components/
│   ├── ToastProvider.jsx        # 토스트 알림 시스템
│   └── simulation/
│       └── SimulationMap.jsx    # Mapbox 에이전트 시뮬레이션 맵
├── hooks/
│   └── useJobPolling.js         # Job 상태 폴링 커스텀 훅
├── i18n/
│   └── errors.js                # 한국어 에러 메시지 매핑
├── assets/images/               # 로고 등 정적 이미지
├── data/
│   └── real_data.json           # 로컬 샘플 데이터
└── utils/                       # 포맷팅 유틸리티
```

---

## 상태 관리

모든 핵심 상태는 `App` 컴포넌트에서 관리되어 탭 이동 시에도 유지됩니다.

| 상태 | 설명 |
|---|---|
| `activeTab` | 현재 활성 단계 (dashboard / x-report / simulation / ...) |
| `completedSteps` | 완료된 단계 목록 (스텝바 표시용) |
| `selectedStoreId` | 선택된 매장 ID |
| `xReportData` | X-Report 분석 결과 (탭 이동 후 복귀 시 유지) |
| `selectedSolutions` | 선택된 전략 목록 (Step 2→3→5 전달) |
| `simJobId` | 실행 중인 시뮬레이션 Job ID |
| `simId` | 완료된 시뮬레이션 결과 ID (Y-Report 연결) |

---

## API 클라이언트 (`api/client.js`)

- Fetch API 직접 사용 (axios 없음, 번들 크기 최소화)
- 기본 타임아웃: 10초 / X-Report 생성: 180초
- AbortController 기반 요청 취소 지원
- 에러 코드 추출: `[ERROR_CODE] 메시지` 형식 파싱
- 한국어 에러 메시지 매핑 (`i18n/errors.js`)

---

## 데이터 정규화

API 응답의 snake_case ↔ camelCase, 필드 누락 등을 안전하게 처리합니다.

| 함수 | 위치 | 역할 |
|---|---|---|
| `normalizeStoresResponse()` | `api/stores.js` | 매장 목록 다양한 필드명 처리 |
| `normalizeXReportView()` | `api/xReport.js` | X-Report DTO 정규화, 기본값 처리 |
| `normalizeYReportView()` | `api/yReport.js` | Y-Report DTO 정규화, null 안전 처리 |

---

## 완료된 작업 ✅

- [x] 5단계 네비게이션 플로우 (스텝바 + 사이드바)
- [x] X-Report 생성 UI (레이더 차트, 키워드, 전략 카드)
- [x] 전략 선택 / 해제 (체크박스 + 호버 오버레이)
- [x] 시뮬레이션 설정 페이지 (기간·크레딧 선택)
- [x] Mapbox 에이전트 시뮬레이션 맵 (160명)
- [x] Y-Report 비교 분석 뷰어
- [x] Job 폴링 훅 (`useJobPolling`)
- [x] 인증 (로그인 / 회원가입)
- [x] 마이페이지, 가격 정책 페이지
- [x] X-Report 데이터 App 레벨 상태 유지 (탭 이동 후 복귀 시 데이터 보존)

## 진행 예정 📋

- [ ] 다국어 지원 (i18n)
- [ ] 모바일 반응형 완성도 개선
- [ ] Y-Report 차트 고도화
- [ ] 사용자 리포트 저장 / 이력 관리

---

## 라이선스

MIT
