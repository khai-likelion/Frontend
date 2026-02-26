const USE_MOCK_DATA = true;
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; // Force rebuild for Vercel
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  LayoutDashboard,
  FileText,
  Play,
  BarChart2,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  Download,
  Zap,
  Printer,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  X,
  Sliders,
  Info,
  CreditCard,
  Target,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Globe,
  Clock, // Added Clock icon
  Sparkles, // Added Sparkles icon
  RefreshCw, // Added for retention metric
  AlertTriangle, // Side effect alerts
  Shield, // Risk score
  ArrowDownRight, // Trade-off negative
  ArrowUpRight, // Trade-off positive
} from 'lucide-react';
import logo from './assets/images/logo.png';
import SimulationMap from './components/simulation/SimulationMap'; // Import SimulationMap
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';

import { fetchStores, normalizeStoresResponse } from './api/stores';
import { createSimulation, fetchSimulation } from './api/simulation';
import { createYReport, fetchYReportView, normalizeYReportView } from './api/yReport';
import { useJobPolling } from './hooks/useJobPolling';
import { createXReport, fetchXReportView, normalizeXReportView } from './api/xReport';
import { getErrorMessage } from './i18n/errors';
import { ToastProvider } from './components/ToastProvider';
import { fetchJob, normalizeJob } from './api/jobs';
import { formatNumber, formatPercent, clamp } from './utils/format';
import realData from './data/real_data.json';

// Alias keeps existing call-sites unchanged
const getJobErrorMessage = getErrorMessage;

// simulationData moved to SimulationView (or can be dynamic later)
const simulationData = [
  { day: '월', before: 12, after: 18 },
  { day: '화', before: 15, after: 22 },
  { day: '수', before: 18, after: 28 },
  { day: '목', before: 20, after: 35 },
  { day: '금', before: 35, after: 55 },
  { day: '토', before: 50, after: 75 },
  { day: '일', before: 45, after: 68 },
];

const MyPageView = ({ data, onBack, onManageMembership }) => {
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef(null);

  // Initialize Kakao Map with retry logic
  useEffect(() => {
    const initMap = () => {
      const container = mapContainerRef.current;
      if (!container || !window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        const mapLat = data?.lat || MANGWON_CENTER.lat;
        const mapLng = data?.lng || MANGWON_CENTER.lng;
        const zoomLevel = data?.lat ? 3 : 5;
        const options = {
          center: new window.kakao.maps.LatLng(mapLat, mapLng),
          level: zoomLevel,
        };
        const map = new window.kakao.maps.Map(container, options);

        if (data?.lat && data?.lng) {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(data.lat, data.lng),
          });
          marker.setMap(map);
        }
        setMapReady(true);
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      let attempts = 0;
      const intervalId = setInterval(() => {
        attempts++;
        if ((window.kakao && window.kakao.maps) || attempts >= 20) {
          clearInterval(intervalId);
          if (window.kakao && window.kakao.maps) initMap();
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, [data]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-space">마이페이지</h1>
          <p className="text-gray-500 text-sm">내 가게 정보와 지난 리포트 보관함</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Store Info & Map (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <MapPin size={20} className="text-red-500" /> 매장 정보
              </h3>
            </div>

            {/* Map Area */}
            <div className="h-48 bg-gray-100 relative">
              <div ref={mapContainerRef} className="w-full h-full"></div>
              {/* 지도 초기화 전 오버레이 */}
              {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
                  <span className="text-xs text-gray-500 font-medium">지도 로딩 중...</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">매장명</label>
                <div className="font-bold text-xl text-gray-900">{data.name}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">상세 주소</label>
                <div className="text-sm text-gray-700 leading-relaxed">{data.address}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">등록된 키워드</label>
                <div className="flex flex-wrap gap-1.5">
                  {['한식', '가성비', '점심맛집'].map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs font-bold text-gray-400 mb-1">MY MEMBERSHIP</div>
                <div className="text-xl font-bold font-space">PRO PLAN</div>
              </div>
              <div className="bg-white/10 p-2 rounded-lg">
                <Zap size={20} className="text-yellow-400" fill="currentColor" />
              </div>
            </div>
            <div className="text-sm text-gray-300 mb-4">
              다음 결제일: 2026. 03. 19
            </div>
            <button
              onClick={onManageMembership}
              className="w-full bg-white text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              멤버십 관리
            </button>
          </div>
        </div>

        {/* Right Column: Report Archives (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* X-Report Archive */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <FileText size={24} className="text-blue-500" /> X-Report 보관함
              </h3>
              <button className="text-sm text-gray-500 hover:text-gray-900 underline">전체보기</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Report Card */}
              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">최신 리포트</span>
                  <span className="text-xs text-gray-400">2026.02.19</span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{data.name} 2월 진단 리포트</h4>
                <p className="text-sm text-gray-500 mb-4 line-clamp-1">경쟁사 대비 상위 8% 달성, 맛/서비스 우수</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><Target size={12} /> 종합등급 S</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Past Report Mockup */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 cursor-not-allowed opacity-70">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">지난 리포트</span>
                  <span className="text-xs text-gray-400">2026.01.18</span>
                </div>
                <h4 className="font-bold text-gray-700 text-lg mb-1">1월 월간 분석 리포트</h4>
                <p className="text-sm text-gray-400 mb-4">기간 만료로 열람할 수 없습니다.</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} /> 멤버십 업그레이드 필요
                </div>
              </div>
            </div>
          </section>

          {/* Y-Report Archive */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <BarChart2 size={24} className="text-purple-500" /> Y-Report 보관함
              </h3>
              <button className="text-sm text-gray-500 hover:text-gray-900 underline">전체보기</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-purple-400" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">아직 완료된 시뮬레이션 결과가 없습니다</h4>
              <p className="text-gray-500 text-sm mb-6">X-Report 진단 후 가상 시뮬레이션을 돌려보세요.<br />미래의 매출 변화를 미리 예측해드립니다.</p>
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors">
                새 시뮬레이션 시작하기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
      ? 'bg-red-50 text-red-600 font-medium'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    <Icon size={18} className={active ? 'text-red-600' : 'text-gray-400'} />
    <span className="text-sm font-space">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600" />}
  </button>
);

const StatCard = ({ label, value, subtext, icon: Icon, trend, trendValue }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-gray-50 rounded-xl">
        <Icon size={20} className="text-gray-700" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
          {trend === 'up' ? '▲' : '▼'} {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-sm text-gray-500 mb-1 font-medium">{label}</h3>
    <div className="text-2xl font-bold text-gray-900 font-space tracking-tight">{value}</div>
    <p className="text-xs text-gray-400 mt-2">{subtext}</p>
  </div>
);

const StepCard = ({ number, title, desc, active, completed, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer hover:scale-105 duration-200 min-w-[100px] ${active
      ? 'bg-white border-red-500 shadow-md ring-1 ring-red-100'
      : completed
        ? 'bg-red-50 border-red-100'
        : 'bg-gray-50 border-gray-100 opacity-60'
      }`}>
    <div className="flex items-center gap-1 mb-1">
      {completed && <CheckCircle size={10} className="text-red-600" />}
      <span className={`text-xs font-bold ${active || completed ? 'text-red-600' : 'text-gray-400'}`}>STEP {number}</span>
    </div>
    <h4 className={`text-sm font-medium mb-0.5 ${active || completed ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
    <p className="text-[10px] text-center text-gray-400">{desc}</p>
  </div>
);

const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 h-96 flex flex-col animate-fade-in-up">
          <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold text-sm">AI Analyst</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs">AI</div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 shadow-sm border border-gray-100">
                사장님, X-Report 분석 결과 <strong>'가성비'</strong> 항목 보완이 시급합니다. 관련 리뷰를 보여드릴까요?
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <input type="text" placeholder="질문을 입력하세요..." className="w-full bg-gray-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-1 focus:ring-red-500" />
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

// --- View Components ---

const LoginView = ({ onLogin, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">
      <div className="p-8 pb-0 text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <img
            src={logo}
            alt="Lovelop"
            className="h-64 w-auto"
          />
        </div>
        <p className="text-gray-500">AI가 실험해주는 내 가게의 미래</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="example@email.com"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="••••••••"
            />
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <LogIn size={20} />
          로그인하기
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">계정이 없으신가요?</span>
          </div>
        </div>

        <button
          onClick={onSignup}
          className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          회원가입
        </button>
      </div>
    </div>
  );
};

const SignupView = ({ onSignup, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">
      <div className="p-8 pb-0 text-center">
        <div className="inline-flex items-center justify-center mb-2">
          <img
            src={logo}
            alt="Lovelop"
            className="h-56 w-auto"
          />
        </div>
        <p className="text-gray-500 mb-6">AI가 실험해주는 내 가게의 미래</p>
        <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">회원가입</h2>
      </div>

      <div className="p-8 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">이름 (사업자명)</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="홍길동"
            />
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="example@email.com"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="8자 이상 입력"
            />
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">비밀번호 확인</label>
          <div className="relative">
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              placeholder="비밀번호 재입력"
            />
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <button
          className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
        >
          <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477l-10.202 37.319a4 4 0 0 0 6.029 4.413l43.689-29.126C118.687 201.372 123.281 202 128 202c57.438 0 104-36.713 104-84S185.438 36 128 36z" />
          </svg>
          카카오 로그인
        </button>

        <button
          onClick={onSignup}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
        >
          <UserPlus size={20} />
          가입 완료
        </button>

        <div className="text-center mt-4">
          <button
            onClick={onLogin}
            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({
  stats,
  stores,
  storeTotal,
  onAnalyze,
  selectedStoreId,
  onSelectStore,
  isLoadingStores,
  storeError,
  onSearchQueryChange,
  onLoadMore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize searchTerm with selected store name
  useEffect(() => {
    if (selectedStoreId) {
      const store = stores.find(s => s.id === selectedStoreId);
      if (store) setSearchTerm(store.name);
    }
  }, [selectedStoreId, stores]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowResults(true);
    onSearchQueryChange?.(val);
  };

  const handleSelectResult = (store) => {
    onSelectStore(store.id);
    setSearchTerm(store.name);
    setShowResults(false);
  };

  // API already filters by query; show all loaded results (더 보기로 추가된 항목 포함)
  const filteredStores = searchTerm.length >= 2 ? stores : [];
  const canLoadMore = typeof storeTotal === 'number' && storeTotal > stores.length;

  // Map API error codes to user-friendly messages
  const ERROR_CODE_MAP = {
    STORE_NOT_FOUND: '매장을 찾을 수 없습니다.',
    INVALID_QUERY: '검색어가 올바르지 않습니다.',
  };
  const displayError = storeError
    ? (storeError.code && ERROR_CODE_MAP[storeError.code]) || storeError.message || '매장 데이터를 불러오지 못했습니다.'
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight mb-2">로벨롭 대시보드</h1>
          <p className="text-gray-500 text-sm">AI 기반 소상공인 솔루션 플랫폼 — 망원동 상권 분석</p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2 w-full relative">
            <label className="text-gray-300 text-sm font-medium">
              분석할 매장 검색 (720개 매장 데이터 보유)
            </label>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                placeholder="매장명 검색 (2글자 이상 입력)"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm placeholder-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" size={20} />

              {/* Loading spinner inside input */}
              {isLoadingStores && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* Autocomplete Dropdown */}
              {showResults && searchTerm.length >= 2 && (
                <div ref={dropdownRef} className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-64 overflow-y-auto transition-opacity ${isLoadingStores ? 'opacity-50' : 'opacity-100'}`}>
                  {filteredStores.length > 0 ? (
                    <>
                      {filteredStores.map(store => (
                        <div
                          key={store.id}
                          onClick={() => handleSelectResult(store)}
                          className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-50 last:border-none flex flex-col gap-0.5 transition-colors"
                        >
                          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {store.name}
                            {store.id === selectedStoreId && <CheckCircle size={14} className="text-red-500" />}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10} /> {store.address || '주소 정보 없음'}
                          </div>
                        </div>
                      ))}
                      {canLoadMore && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onLoadMore?.(); }}
                          className="w-full p-3 text-center text-red-500 text-xs font-medium hover:bg-red-50 transition-colors border-t border-gray-50"
                        >
                          더 보기 ({stores.length} / {storeTotal})
                        </button>
                      )}
                    </>
                  ) : isLoadingStores ? (
                    <div className="p-4 text-center text-gray-400 text-sm">불러오는 중...</div>
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            {displayError && (
              <div className="flex items-center gap-1.5 text-red-300 text-xs mt-1">
                <AlertCircle size={12} />
                {displayError}
              </div>
            )}

            {/* Empty state when backend is unreachable */}
            {!isLoadingStores && !displayError && stores.length === 0 && (
              <p className="text-gray-400 text-xs mt-1">데이터를 불러오는 중입니다...</p>
            )}
          </div>
          <button
            onClick={onAnalyze}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/30 whitespace-nowrap hover:shadow-red-900/50 hover:-translate-y-0.5 h-full"
          >
            <Zap size={18} fill="currentColor" />
            AI 분석 시작
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatCard label="분석 매장 수" value={stats.storeCount} subtext="망원동 전체 카페·음식점" icon={TrendingUp} trend="up" trendValue="12%" />
          <StatCard label="평균 감성 점수" value={stats.avgSentiment} subtext="상권 평균 대비 우수" icon={Zap} trend="up" trendValue="5.2%" />
          <StatCard label="시뮬레이션 에이전트" value={stats.totalAgents} subtext="가상 페르소나 기반 검증" icon={Users} trend="up" trendValue="Live" />
          <StatCard label="평균 객단가" value={stats.avgRevenue} subtext="개선 잠재력 보유" icon={DollarSign} trend="up" trendValue="9%" />
        </div>
      </div>
    </div>
  );
};


// 망원동 중심 좌표 (stores 테이블에 lat/lng 컬럼 없음 → 항상 폴백 사용)
const MANGWON_CENTER = { lat: 37.5556, lng: 126.9068 };

const VerificationView = ({ data, onVerified, onBack }) => {
  const [bizNum, setBizNum] = useState('');
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef(null);

  // Initialize Kakao Map with retry logic
  useEffect(() => {
    const initMap = () => {
      const container = mapContainerRef.current;
      if (!container || !window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        // lat/lng 없으면 망원동 중심으로 폴백
        const mapLat = data?.lat || MANGWON_CENTER.lat;
        const mapLng = data?.lng || MANGWON_CENTER.lng;
        const zoomLevel = data?.lat ? 3 : 5; // 정확한 좌표 없으면 넓게
        const options = {
          center: new window.kakao.maps.LatLng(mapLat, mapLng),
          level: zoomLevel,
        };
        const map = new window.kakao.maps.Map(container, options);

        // 실제 좌표가 있을 때만 마커 표시
        if (data?.lat && data?.lng) {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(data.lat, data.lng),
          });
          marker.setMap(map);
        }
        setMapReady(true);
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // If not loaded, retry every 500ms for 10 seconds
      let attempts = 0;
      const intervalId = setInterval(() => {
        attempts++;
        if ((window.kakao && window.kakao.maps) || attempts >= 20) {
          clearInterval(intervalId);
          if (window.kakao && window.kakao.maps) initMap();
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, [data]);

  // Format business number (xxx-xx-xxxxx)
  const handleBizNumChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 10) val = val.slice(0, 10);

    if (val.length > 5) {
      val = `${val.slice(0, 3)}-${val.slice(3, 5)}-${val.slice(5)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}-${val.slice(3)}`;
    }

    setBizNum(val);
    setError('');
  };

  const handleVerify = () => {
    if (bizNum.replace(/-/g, '').length !== 10) {
      setError('올바른 사업자등록번호 10자리를 입력해주세요.');
      return;
    }
    // In a real app, verify API would be called here
    onVerified();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 font-space mb-2">사장님의 매장이 맞습니까?</h1>
        <p className="text-gray-500">정확한 상권 분석을 위해 매장 소유주 확인이 필요합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Map Section */}
        <div className="h-64 w-full bg-gray-100 relative">
          <div ref={mapContainerRef} className="w-full h-full"></div>

          {/* Overlay: SDK 로드 실패 또는 지도 초기화 전 */}
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 pointer-events-none">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700">
                <MapPin className="text-red-500" size={18} />
                <span>{data.address || '주소 정보 없음'}</span>
              </div>
            </div>
          )}

          {/* 지도 로드 후 주소 뱃지 */}
          {mapReady && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-100">
                <MapPin className="text-red-500" size={16} />
                <span>{data.address || '주소 정보 없음'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info & Verification Section */}
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">매장명</label>
                <div className="text-2xl font-bold text-gray-900">{data.name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">상세 주소</label>
                <div className="text-base text-gray-700 flex items-start gap-2">
                  <MapPin className="text-gray-400 mt-0.5" size={16} />
                  {data.address || '주소 정보가 없습니다.'}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  사업자등록번호
                  <span className="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">필수</span>
                </label>
                <input
                  type="text"
                  value={bizNum}
                  onChange={handleBizNumChange}
                  placeholder="000-00-00000"
                  className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-red-200'} focus:outline-none focus:ring-2 transition-all font-mono text-lg bg-white`}
                  maxLength={12}
                />
                {error && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  * 추후 사업자등록정보 진위확인 API를 통해 검증됩니다.
                </p>
              </div>

              <button
                onClick={handleVerify}
                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                소유주 인증 및 리포트 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mx-auto block text-gray-400 hover:text-gray-600 text-sm underline transition-colors"
      >
        매장 다시 선택하기
      </button>
    </div>
  );
};

const XReportView = ({ storeData, onNext, selectedSolutions = [], onSelectSolution, xReportData, onXReportDataChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // ── API / Job state ───────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);
  const [jobId, setJobId] = useState(null);
  const setXReportData = onXReportDataChange;
  const [createError, setCreateError] = useState(null); // { message, code }

  // Update selectedMetric when xReportData changes
  useEffect(() => {
    setSelectedMetric(xReportData?.radarData?.[0] ?? null);
  }, [xReportData]);

  // ── Job polling ───────────────────────────────────────────────────────
  const { status: pollStatus, progress, isPolling } = useJobPolling(jobId, {
    enabled: !!jobId,
    onCompleted: async (resultId) => {
      setIsFetchingResult(true);
      try {
        const raw = await fetchXReportView(resultId);
        const norm = normalizeXReportView(raw);
        setXReportData(norm);
      } catch (err) {
        setCreateError({ message: getJobErrorMessage(err.code, err.message), code: err.code ?? null });
      } finally {
        setIsFetchingResult(false);
      }
    },
    onFailed: (message, code) => {
      setCreateError({ message: getJobErrorMessage(code, message), code });
      setJobId(null);
    },
  });

  const isBusy = isCreating || isPolling || isFetchingResult;

  const handleCreate = async () => {
    if (isBusy) return;
    setCreateError(null);
    setXReportData(null);
    setIsCreating(true);

    if (USE_MOCK_DATA) {
      setTimeout(() => {
        // Find current store in realData.stores to get its specific mock data
        const currentStoreId = storeData?.id || selectedStoreId;
        const mockStore = realData.stores.find(s => s.id === currentStoreId) || realData.stores[0];

        const mockDataForStore = {
          name: mockStore.name,
          grade: mockStore.grade || 'A',
          rankPercent: mockStore.rankPercent || 8,
          description: mockStore.description,
          fullReport: mockStore.fullReport,
          radarData: mockStore.radarData,
          keywords: mockStore.keywords,
          solutions: mockStore.solutions,
        };

        setXReportData(mockDataForStore);
        setIsCreating(false);
      }, 1500);
      return;
    }

    const controller = new AbortController();
    try {
      const result = await createXReport(
        {
          store_source_id: storeData?.id || undefined,
          snapshot_version: 'v1',
          prompt_id: 'default',
        },
        { signal: controller.signal },
      );
      // Backend is synchronous — no job queue. Fetch the view directly.
      setIsCreating(false);
      setIsFetchingResult(true);
      const raw = await fetchXReportView(result.xReportId, { signal: controller.signal });
      const norm = normalizeXReportView(raw);
      setXReportData(norm);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCreateError({ message: getJobErrorMessage(err.code, err.message), code: err.code ?? null });
      }
    } finally {
      setIsCreating(false);
      setIsFetchingResult(false);
    }
  };

  const handleRetry = () => {
    setCreateError(null);
    setJobId(null);
    setXReportData(null);
  };

  // ── Derived data ──────────────────────────────────────────────────────
  const d = xReportData;

  const toggleSolution = (solution) => {
    if (selectedSolutions.find(s => s.title === solution.title)) {
      onSelectSolution(selectedSolutions.filter(s => s.title !== solution.title));
    } else {
      onSelectSolution([...selectedSolutions, solution]);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-end border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">X-Report: {d?.name ?? storeData?.name ?? '—'}</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">진단 완료</span>
            </div>
            <p className="text-gray-500 text-sm">GPT-5.2 기반 AI 분석 리포트 — 매장 전략 처방전</p>
          </div>
          {d && (
            <div className="flex items-center gap-6">
              {/* Action Buttons in Header */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 text-sm transition-colors"
                >
                  <FileText size={16} className="text-red-500" />
                  전문 보기
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black text-sm transition-colors"
                >
                  <Printer size={16} />
                  PDF 저장
                </button>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>

              <div className="text-right group relative cursor-help">
                <div className="text-sm text-gray-400 mb-1">종합 등급</div>
                <div className="text-4xl font-bold font-space text-gray-900">{d?.grade ?? '—'}</div>
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-52 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {[
                    { g: 'S', pct: '상위 3%', desc: '최상위' },
                    { g: 'A', pct: '상위 10%', desc: '' },
                    { g: 'B', pct: '상위 30%', desc: '' },
                    { g: 'C', pct: '상위 70%', desc: '중간층' },
                    { g: 'D', pct: '상위 90%', desc: '' },
                    { g: 'E', pct: '상위 97%', desc: '' },
                    { g: 'F', pct: '하위 3%', desc: '최하위' },
                  ].map(({ g, pct, desc }) => (
                    <div key={g} className={`flex justify-between mb-1 ${d?.grade === g ? 'text-red-400 font-bold' : ''}`}>
                      <span>{g}</span>
                      <span className="text-gray-400">{pct}{desc ? ` · ${desc}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">상위</div>
                <div className="text-4xl font-bold font-space text-red-600">
                  {d?.rankPercent != null ? `${d.rankPercent}%` : '—'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════ X-Report 생성 UI ══════════════════ */}
        {!d && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Sparkles size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">X-Report 생성 준비 완료</h2>
              <p className="text-gray-500 text-sm">AI가 매장을 진단하고 맞춤형 전략 처방전을 생성합니다.</p>
            </div>

            {/* Progress while polling */}
            {(isPolling || isFetchingResult) && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>처리 중... ({pollStatus})</span>
                  {progress !== null && <span>{progress}%</span>}
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: progress !== null ? `${progress}%` : '60%' }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {createError && (
              <div className="w-full max-w-md flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {createError.message}
                  <button onClick={handleRetry} className="ml-2 underline text-red-500 hover:text-red-700">다시 시도</button>
                </div>
              </div>
            )}

            {!isBusy && !createError && (
              <button
                onClick={handleCreate}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <Sparkles size={18} /> X-Report 생성 시작
              </button>
            )}

            {isBusy && !createError && (
              <button disabled className="bg-gray-400 cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isCreating ? '생성 요청 중...' : '분석 중...'}
              </button>
            )}
          </div>
        )}

        {d && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Interactive Radar Chart */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2">역량 분석 (Deep-Dive)</h3>
              <p className="text-sm text-gray-400 mb-6">항목을 클릭하여 상세 분석을 확인하세요.</p>
              <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d?.radarData ?? []}>
                    <PolarGrid stroke="#f3f4f6" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={({ x, y, payload }) => (
                        <text
                          x={x} y={y}
                          dy={4}
                          textAnchor="middle"
                          fill={selectedMetric?.subject === payload.value ? '#E42313' : '#6b7280'}
                          fontWeight={selectedMetric?.subject === payload.value ? 'bold' : 'normal'}
                          fontSize={13}
                          className="cursor-pointer hover:fill-red-500 transition-colors"
                          onClick={() => setSelectedMetric((d?.radarData ?? []).find(rd => rd.subject === payload.value) ?? null)}
                        >
                          {payload.value}
                        </text>
                      )}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={d?.name ?? ''}
                      dataKey="A"
                      stroke="#E42313"
                      strokeWidth={3}
                      fill="#E42313"
                      fillOpacity={0.15}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dynamic Insight Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Selected Metric Detail */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">FOCUS ON</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">종합 <span className="text-red-600">{d?.radarData?.length ? Math.round(d.radarData.reduce((s, r) => s + r.A, 0) / d.radarData.length) : '—'}점</span></h3>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-500">
                    망원동 평균: 78점
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <MessageSquare size={14} /> 주요 키워드
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(d?.keywords ?? []).slice(0, 8).map(k => {
                        let colorClass = 'bg-gray-100 text-gray-600';
                        if (k.sentiment === 'positive') colorClass = 'bg-green-100 text-green-700 border border-green-200';
                        if (k.sentiment === 'negative') colorClass = 'bg-red-50 text-red-600 border border-red-100';

                        return (
                          <span key={k.text} className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                            #{k.text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 flex gap-3 items-start">
                  <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>AI 분석:</strong> {selectedMetric?.reason}.
                    {d?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mb-4">
                <h4 className="font-bold text-gray-900">추천 필살기 (Solutions)</h4>
                <button onClick={onNext} className="flex items-center gap-2 text-red-600 font-medium hover:underline">
                  전체 시뮬레이션으로 적용 <ArrowRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Group solutions by category */}
                {Object.entries(
                  (d?.solutions ?? []).reduce((acc, sol) => {
                    if (!acc[sol.category]) acc[sol.category] = [];
                    acc[sol.category].push(sol);
                    return acc;
                  }, {})
                ).map(([category, solutions], catIdx) => (
                  <div key={category} className="flex flex-col gap-4">
                    {/* Category Header */}
                    <div className={`p-3 rounded-lg border-l-4 ${catIdx === 0 ? 'bg-red-50 border-red-500' : catIdx === 1 ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'}`}>
                      <h5 className={`font-bold text-sm ${catIdx === 0 ? 'text-red-700' : catIdx === 1 ? 'text-blue-700' : 'text-green-700'}`}>
                        {category}
                      </h5>
                    </div>

                    {/* Solutions in this category */}
                    <div className="flex flex-col gap-3">
                      {solutions.map((sol, idx) => {
                        const isSelected = selectedSolutions.some(s => s.title === sol.title);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleSolution(sol)}
                            style={{ isolation: 'isolate' }}
                            className={`relative bg-white p-4 rounded-xl border cursor-pointer transition-all duration-200 group flex flex-col min-h-[100px] hover:z-50
                          ${isSelected
                                ? 'border-red-500 ring-2 ring-red-100 bg-red-50/10'
                                : 'border-gray-200'}
                        `}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm z-30">
                                <CheckCircle2 size={16} className="text-red-500" fill="currentColor" />
                              </div>
                            )}
                            {/* Default: title (clamped) + category tag */}
                            <div className="flex flex-col gap-2">
                              <div className="font-bold text-gray-900 text-sm leading-snug line-clamp-3">"{sol.title}"</div>
                              <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${catIdx === 0 ? 'text-red-600 bg-red-50' : catIdx === 1 ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>
                                {sol.category}
                              </span>
                            </div>

                            {/* Hover Overlay */}
                            <div className={`absolute left-[-1px] top-[-1px] w-[calc(100%+2px)] bg-white p-4 flex flex-col gap-3 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 rounded-xl border shadow-xl ${catIdx === 0 ? 'border-red-400 shadow-red-100' : catIdx === 1 ? 'border-blue-400 shadow-blue-100' : 'border-green-400 shadow-green-100'}`}>
                              {sol.execution && (
                                <div>
                                  <div className={`text-xs font-bold mb-2 flex items-center gap-1 ${catIdx === 0 ? 'text-red-600' : catIdx === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                                    <span className="text-base">💡</span> 이렇게 실행해보세요
                                  </div>
                                  <div className="text-xs text-gray-700 leading-relaxed">
                                    <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                                      {sol.execution}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {sol.effect && (
                                <div>
                                  <div className={`text-[10px] font-bold mb-2 flex items-center gap-1 ${catIdx === 0 ? 'text-red-600' : catIdx === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                                    <span className="text-base">📈</span> 기대되는 변화
                                  </div>
                                  <div className="text-xs text-gray-500 leading-relaxed">
                                    <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                                      {sol.effect}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Full Report Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-red-600" />
                  X-Report 전문 보기
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto prose prose-slate prose-headings:font-space prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 max-w-none text-left bg-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{d?.fullReport}</ReactMarkdown>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2"
                >
                  <Printer size={18} />
                  PDF 저장
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

// --- New Component: Interactive Simulation Lab ---
// --- New Component: Interactive Simulation Lab ---
// 기간 → 일수 매핑 (SimulationView 전체에서 공유)
const DURATION_DAYS = {
  '1day': 1, '1week': 7, '2weeks': 14, '1month': 30,
  '3months': 90, '6months': 180, '1year': 365,
};

// 시뮬레이션 일수 기반 폴링 타임아웃 계산
// 모든 기간: Celery task_time_limit(2시간)에 맞춰 2시간 대기 (사실상 무제한)
function calcSimTimeout(_days) {
  return 2 * 60 * 60 * 1000; // 2시간
}

const SimulationView = ({ data, onJobCreated, selectedSolutions = [] }) => {
  const [simValues, setSimValues] = useState({});
  const [duration, setDuration] = useState('1week');

  // ── API / Job state ───────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null); // { message, code }

  // Initialize simulation values from data
  useEffect(() => {
    if (data?.simulationVariables) {
      const initial = {};
      data.simulationVariables.forEach(v => {
        initial[v.id] = v.default;
      });
      setSimValues(initial);
    }
  }, [data]);

  const simDays = DURATION_DAYS[duration] ?? 7;
  const simTimeoutMs = calcSimTimeout(simDays);

  const isBusy = isCreating;

  const handleStart = async () => {
    if (isBusy) return;
    const storeName = data?.name;
    if (!storeName || storeName === '—' || storeName === '이름 정보 없음') {
      setCreateError({ message: '매장을 먼저 선택해주세요.', code: null });
      return;
    }
    setCreateError(null);
    setIsCreating(true);

    if (USE_MOCK_DATA) {
      setTimeout(() => {
        onJobCreated(null, 5000, 2);
        setIsCreating(false);
      }, 500);
      return;
    }

    const controller = new AbortController();
    try {
      const payload = {
        store_source_id: storeName,
        selected_strategy_ids: selectedSolutions
          .map(s => s.id ?? s.title)
          .filter(Boolean),
        days: simDays,
      };
      const result = await createSimulation(payload, { signal: controller.signal });
      onJobCreated(result.jobId, simTimeoutMs, Math.ceil(simTimeoutMs / 4000));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCreateError({ message: getJobErrorMessage(err.code, err.message), code: err.code ?? null });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const durationOptions = [
    { id: '1day', label: '1일', credits: 3, estimatedTime: '약 10~15분' },
    { id: '1week', label: '1주일', credits: 10, estimatedTime: '약 1~2시간' },
    { id: '2weeks', label: '2주일', credits: 20, estimatedTime: '약 2~4시간' },
    { id: '1month', label: '1개월', credits: 35, estimatedTime: '약 8시간' },
    { id: '3months', label: '3개월', credits: 100, estimatedTime: '약 24시간' },
    { id: '6months', label: '6개월', credits: 180, estimatedTime: '약 2일' },
    { id: '1year', label: '1년', credits: 330, estimatedTime: '약 4일' },
  ];

  const selectedCredits = durationOptions.find(d => d.id === duration)?.credits || 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">Simulation Settings</h1>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Step 3</span>
          </div>
          <p className="text-gray-500 text-sm">시뮬레이션을 진행할 기간과 변수를 설정하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Duration Settings */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            <Clock size={20} className="text-blue-500" /> 시뮬레이션 기간 설정
          </h3>

          <div className="space-y-3">
            {durationOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${duration === opt.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setDuration(opt.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${duration === opt.id ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                    {duration === opt.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <div>
                    <span className={`font-medium ${duration === opt.id ? 'text-gray-900' : 'text-gray-600'}`}>
                      {opt.label}
                    </span>
                    <p className="text-[11px] text-gray-400 leading-tight">{opt.estimatedTime}</p>
                  </div>
                </div>
                <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">
                  {opt.credits} CREDITS
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Right Col: Variable Settings */}
        <div className="flex flex-col h-full space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
              <Sliders size={20} className="text-green-500" /> 사장님이 선택하신 솔루션 리스트
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {selectedSolutions.length > 0 ? (
                selectedSolutions.map((sol, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex flex-col gap-1 items-start shadow-sm">
                    <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 mb-1">{sol.category}</span>
                    <div className="font-bold text-gray-900 text-sm">{sol.title}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">
                  선택된 솔루션이 없습니다.<br />
                  <span className="text-xs">Step 2에서 솔루션을 선택해주세요.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">지불할 크레딧</span>
              <span className="text-2xl font-bold text-gray-900">{selectedCredits} CREDITS</span>
            </div>

            {/* Error message */}
            {createError && (
              <div className="mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{createError.message}</span>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={isBusy}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isBusy
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gray-900 hover:bg-black text-white hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
            >
              {isCreating ? '생성 중...' : <>시뮬레이션 시작하기 <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Y-Report: 비교 분석 리포트 (지표 1~3) ──────────────────────────────
const xReportMockData = {
  name: "류진 (망원본점)",
  grade: "S",
  rankPercent: 8,
  description: "망원동 상권 내 경쟁사 대비 상위 8%의 경쟁력을 보유하고 있습니다. 특히 맛과 위생 측면에서 고객 만족도가 매우 높게 나타나고 있습니다.",
  fullReport: `# AI 분석 리포트: 류진 (망원본점) 상세 지표 분석

## 1. 종합 진단
류진은 망원동 상권 내에서 **'맛'과 '위생'** 면에서 독보적인 강점을 보이고 있습니다. 현재 종합 등급은 **S등급**으로, 상위 8%의 우수한 성과를 내고 있습니다.

## 2. 세부 분석
- **맛 (92점):** 시그니처 메뉴의 아이덴티티가 확실하며, 맛의 일관성이 높습니다.
- **서비스 (85점):** 직원들의 친절도에 대한 긍정적 피드백이 주를 이뤄지고 있습니다.
- **분위기 (78점):** 모던한 인테리어가 젊은 층에 어필하고 있으나, 공간 효율성은 다소 떨어집니다.
- **가격 (70점):** 주변 경쟁사 대비 가격대가 소폭 높게 형성되어 있어, 가성비에 대한 인식이 개선 과제로 남아있습니다.

## 3. 핵심 키워드
- **긍정:** #맛의달인 #친절한사장님 #인생맛집 #인스타감성
- **부정:** #웨이팅지옥 #가격부담 #양이적음

## 4. AI 처방전 (Solutions)
현재의 높은 품질을 유지하면서 **'가성비'** 문제를 해결하기 위한 **2인 커스텀 세트 메뉴** 도입을 제안합니다. 이를 통해 객단가 상승과 고객 만족도 개선을 동시에 노릴 수 있습니다.`,
  radarData: [
    { subject: '맛', A: 92, score: 92, reason: '메뉴의 완성도와 식재료의 신선함이 탁월함' },
    { subject: '서비스', A: 85, score: 85, reason: '빠른 응대와 친절한 서비스 태도가 장점' },
    { subject: '분위기', A: 78, score: 78, reason: '전반적인 무드는 좋으나 좌석 간격이 다소 좁음' },
    { subject: '가격', A: 70, score: 70, reason: '상권 평균 대비 가격 저항선에 근접한 상태' },
    { subject: '위생', A: 95, score: 95, reason: '오픈 주방의 청결도가 고객 신뢰를 형성함' },
  ],
  keywords: [
    { text: '맛있다', sentiment: 'positive' },
    { text: '친절함', sentiment: 'positive' },
    { text: '위생적', sentiment: 'positive' },
    { text: '웨이팅', sentiment: 'negative' },
    { text: '가성비', sentiment: 'negative' },
    { text: '분위기굿', sentiment: 'positive' },
    { text: '재방문', sentiment: 'positive' },
    { text: '양이부족', sentiment: 'negative' },
  ],
  solutions: [
    {
      id: "SOL_001",
      category: '메뉴 전략',
      title: '2인 가성비 세트 메뉴 도입',
      desc: '인기 메뉴 2가지와 사이드를 묶어 15% 할인된 가격으로 제공',
      execution: '기존 단품 위주의 구성에서 2인 방문객을 겨냥한 세트 구성을 메뉴판 전면에 배치하세요.',
      effect: '가성비 인식 12% 개선 및 2인 테이블 회전율 15% 향상 기대',
    },
    {
      id: "SOL_002",
      category: '마케팅',
      title: '원격 줄서기 시스템 도입',
      desc: '웨이팅에 대한 부정적 인식을 줄이기 위한 디지털 대기 시스템',
      execution: '테이블링이나 캐치테이블과 같은 원격 줄서기 솔루션을 연동하여 고객 대기 시간을 관리하세요.',
      effect: '웨이팅 포기 고객 20% 감소 및 방문 전환율 10% 상승',
    },
    {
      id: "SOL_003",
      category: '공간',
      title: '조명 및 가구 조정을 통한 분위기 개선',
      desc: '인스타 감성을 강화하기 위한 핵심 스팟 조명 교체',
      execution: '메인 테이블 상단에 핀 조명을 설치하여 음식 사진이 더 잘 나오도록 유도하세요.',
      effect: 'SNS 언급량 30% 증가 및 젊은 층 유입 가속화',
    }
  ]
};



const yReportMockData = {
  // 지표 1: 기본 방문 지표 (돼지야 기준: 방문수 142->189, 점유율 10.4%->13.8% 가정)
  overview: {
    sim1: { totalVisits: 142, marketShare: 10.4 },
    sim2: { totalVisits: 189, marketShare: 13.8 },
  },
  // 워드클라우드 키워드 (돼지야_result.json 기반)
  keywords: {
    sim1: [
      { text: '고기', weight: 25 }, { text: '청국장', weight: 22 },
      { text: '비빔국수', weight: 18 }, { text: '친절', weight: 15 },
      { text: '밑반찬', weight: 12 }, { text: '가성비', weight: 10 },
      { text: '고사리', weight: 14 }, { text: '위생', weight: 12 },
    ],
    sim2: [
      { text: '청결표준', weight: 28 }, { text: '환기강화', weight: 24 },
      { text: '맛있다', weight: 22 }, { text: '친절사장님', weight: 20 },
      { text: '2인세트', weight: 18 }, { text: '위생관리', weight: 16 },
      { text: '고사리일관성', weight: 14 }, { text: '단골혜택', weight: 12 },
    ],
  },
  // 지표 2: 평점 분포 (돼지야 기준: 맛 0.9, 서비스 0.8, 가성비 0.7, 청결 0.6)
  ratingDistribution: {
    taste: {
      sim1: [
        { score: 1, density: 0.02 }, { score: 2, density: 0.05 }, { score: 3, density: 0.15 },
        { score: 4, density: 0.45 }, { score: 5, density: 0.33 },
      ],
      sim2: [
        { score: 1, density: 0.01 }, { score: 2, density: 0.03 }, { score: 3, density: 0.10 },
        { score: 4, density: 0.40 }, { score: 5, density: 0.46 },
      ],
    },
    cleanliness: {
      sim1: [
        { score: 1, density: 0.15 }, { score: 2, density: 0.25 }, { score: 3, density: 0.40 },
        { score: 4, density: 0.15 }, { score: 5, density: 0.05 },
      ],
      sim2: [
        { score: 1, density: 0.02 }, { score: 2, density: 0.08 }, { score: 3, density: 0.25 },
        { score: 4, density: 0.45 }, { score: 5, density: 0.20 },
      ],
    },
    service: {
      sim1: [
        { score: 1, density: 0.05 }, { score: 2, density: 0.10 }, { score: 3, density: 0.25 },
        { score: 4, density: 0.50 }, { score: 5, density: 0.10 },
      ],
      sim2: [
        { score: 1, density: 0.02 }, { score: 2, density: 0.05 }, { score: 3, density: 0.20 },
        { score: 4, density: 0.45 }, { score: 5, density: 0.28 },
      ],
    },
  },
  ratingSummary: {
    sim1: { avg: 3.61, satisfaction: 32.7 },
    sim2: { avg: 4.15, satisfaction: 58.2 },
  },
  // 지표 3: 시간대별 트래픽 (돼지야 기준: 저녁 17-21시 피크 46.5%)
  hourlyTraffic: [
    { slot: '아침(07)', sim1: 5, sim2: 6 },
    { slot: '점심(12)', sim1: 32, sim2: 35 },
    { slot: '저녁(18)', sim1: 66, sim2: 98 },
    { slot: '야식(22)', sim1: 39, sim2: 50 },
  ],
  peakSlot: { sim1: '저녁(18)', sim2: '저녁(18)' },
  // 지표 4: 세대별 증감 (돼지야 기준: 30대 25.9%, 50대 24.1%)
  generation: [
    { gen: '20대', sim1: 15.0, sim2: 22.5 },
    { gen: '30대', sim1: 25.9, sim2: 32.4 },
    { gen: '40대', sim1: 19.7, sim2: 21.0 },
    { gen: '50대', sim1: 24.1, sim2: 18.2 },
    { gen: '60대+', sim1: 19.0, sim2: 15.6 },
  ],
  purpose: [
    { type: '사적모임', sim1Pct: 35, sim2Pct: 48, sim1Sat: 3.5, sim2Sat: 4.2 },
    { type: '가족외식', sim1Pct: 25, sim2Pct: 30, sim1Sat: 3.2, sim2Sat: 4.0 },
    { type: '직장회식', sim1Pct: 30, sim2Pct: 15, sim1Sat: 3.8, sim2Sat: 3.9 },
    { type: '기타', sim1Pct: 10, sim2Pct: 7, sim1Sat: 3.0, sim2Sat: 3.5 },
  ],
  retention: {
    retained: 85,
    retentionRate: 59.8,
    newUsers: 104,
    newRatio: 55.0,
    churned: 57,
    sim1Agents: 142,
    sim2Agents: 189,
  },
  agentType: [
    { type: '유동 인구', sim1: 65, sim2: 78 },
    { type: '상주 고객', sim1: 35, sim2: 22 },
  ],
  gender: [
    { label: '남성', sim1: 62.6, sim2: 58.0 },
    { label: '여성', sim1: 37.4, sim2: 42.0 },
  ],
  crosstab: {
    generations: ['20대', '30대', '40대', '50대', '60대+'],
    purposes: ['사적모임', '가족외식', '직장회식', '기타'],
    sim2: [
      [45, 20, 10, 25],
      [50, 25, 15, 10],
      [30, 40, 20, 10],
      [20, 30, 40, 10],
      [15, 25, 50, 10],
    ]
  },
  radarStores: {
    comp1: '오시 망원본점',
    comp2: '마마무식당',
    comp3: '홍익돈까스',
  },
  radar: [
    { metric: '맛', unit: '점', target_before: 90, target_after: 95, comp1: 85, comp2: 80, comp3: 82 },
    { metric: '위생', unit: '점', target_before: 60, target_after: 85, comp1: 80, comp2: 75, comp3: 88 },
    { metric: '재방문율', unit: '%', target_before: 45, target_after: 62, comp1: 55, comp2: 48, comp3: 50 },
  ],
  sideEffects: [
    { type: 'warning', metric: 'Y세대 방문 비중', change: -5.1, unit: '%p', detail: '2인 세트 메뉴 도입이 1인 직장인(Y세대) 방문을 감소시킬 수 있음' },
    { type: 'warning', metric: '점심 시간대 트래픽', change: -12, unit: '%', detail: '피크타임이 저녁으로 전환되며 점심 매출 공백 발생 위험' },
    { type: 'watch', metric: '가성비 인식', change: -0.3, unit: '점', detail: '인테리어 개선 후 "비싸 보인다"는 인식이 소폭 증가' },
  ],
  tradeoffs: [
    { gain: 'Z세대(Z1+Z2) 유입', gainVal: '+8.9%p', loss: 'Y세대 이탈', lossVal: '-5.1%p' },
    { gain: '사적모임형 방문', gainVal: '+7.3%p', loss: '가족모임형 감소', lossVal: '-6.5%p' },
    { gain: '저녁 트래픽 급증', gainVal: '+50%', loss: '점심 트래픽 하락', lossVal: '-12%' },
    { gain: '분위기 만족도', gainVal: '+0.5점', loss: '가성비 인식', lossVal: '-0.3점' },
  ],
  riskScore: {
    score: 23,
    level: '낮은 위험',
    positive: 8,
    watch: 1,
    negative: 2,
    totalMetrics: 11,
  },
  llmSummary: `**돼지야 전략 시뮬레이션 결과 요약**\n\n전략 적용 후 '돼지야'의 방문 수는 +33% 증가하였으며, 특히 저녁 시간대(17-21시) 유입이 두드러졌습니다. \n\n**핵심 성과**\n1. **위생 및 청결 리스크 해결**: '청결 표준화' 솔루션 도입으로 위생 만족도가 60점에서 85점으로 크게 개선되었습니다.\n2. **Z/M세대 유입 확대**: 2인 세트 메뉴와 분위기 개선으로 2030 고객 비중이 40.9%에서 54.9%로 확대되었습니다.\n3. **맛의 우위 고착**: 고사리 품질 표준화를 통해 맛에 대한 일관성을 확보, '맛' 점수가 95점으로 상권 최상위권을 유지했습니다.\n\n**주의 사항**\n- 주말 피크 타임의 높은 혼잡도로 인한 서비스 지연 가능성이 있으니, 서빙 프로세스 최적화를 권장합니다.`
};

// 워드클라우드 시각화 컴포넌트
const WordCloudVisual = ({ keywords = [], label, accentColor }) => {
  const maxWeight = keywords.length ? Math.max(...keywords.map(k => k.weight || 1)) : 1;
  return (
    <div className="flex-1">
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${accentColor === 'gray' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-[140px] p-4 rounded-xl bg-gray-50/50">
        {keywords.length === 0 ? (
          <span className="text-xs text-gray-400">키워드 없음</span>
        ) : keywords.map((kw, i) => {
          const ratio = (kw.weight || 1) / maxWeight;
          const fontSize = 12 + ratio * 18;
          const opacity = 0.4 + ratio * 0.6;
          const colors = accentColor === 'gray'
            ? ['text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900']
            : ['text-emerald-400', 'text-emerald-500', 'text-emerald-600', 'text-emerald-700', 'text-emerald-800'];
          const colorIdx = Math.min(Math.floor(ratio * 5), 4);
          return (
            <span
              key={i}
              className={`font-bold ${colors[colorIdx]} transition-all hover:scale-110 cursor-default`}
              style={{ fontSize: `${fontSize}px`, opacity }}
              title={`${kw.text}: ${kw.weight}회`}
            >
              #{kw.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// 변화량 뱃지
const ChangeBadge = ({ value, suffix = '%', showPlus = true }) => {
  const isPositive = value > 0;
  const isZero = value === 0;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isZero ? 'bg-gray-100 text-gray-500' :
      isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}>
      {isPositive && showPlus ? '+' : ''}{value}{suffix}
    </span>
  );
};

// ── Y-Report TTL reconnect constants ────────────────────────────────────────
const Y_REPORT_JOB_KEY = 'pending_y_report_job';
const Y_REPORT_JOB_TTL = 600_000; // 10 minutes

const YReportView = ({ storeData, selectedSolutions = [], simId = null }) => {
  const [activeRatingTab, setActiveRatingTab] = useState('taste');

  // ── API / Job state ───────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [yReportData, setYReportData] = useState(null);
  const [createError, setCreateError] = useState(null); // { message, code }
  const [isReconnecting, setIsReconnecting] = useState(false); // TTL reconnect banner

  // ── TTL reconnect on mount ─────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(Y_REPORT_JOB_KEY);
    if (!raw) return;
    let saved;
    try { saved = JSON.parse(raw); } catch { localStorage.removeItem(Y_REPORT_JOB_KEY); return; }
    const { jobId: savedJobId, createdAt } = saved ?? {};
    if (!savedJobId || !createdAt || Date.now() - createdAt > Y_REPORT_JOB_TTL) {
      localStorage.removeItem(Y_REPORT_JOB_KEY);
      return;
    }
    // Validate status once before restoring polling
    fetchJob(savedJobId)
      .then(resp => {
        const job = normalizeJob(resp);
        if (job.status === 'pending' || job.status === 'processing') {
          setIsReconnecting(true);
          setJobId(savedJobId);
        } else {
          localStorage.removeItem(Y_REPORT_JOB_KEY);
        }
      })
      .catch(() => { localStorage.removeItem(Y_REPORT_JOB_KEY); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Job polling ───────────────────────────────────────────────────────
  const { status: pollStatus, progress, isPolling } = useJobPolling(jobId, {
    enabled: !!jobId,
    onCompleted: async (resultId) => {
      setIsReconnecting(false);
      localStorage.removeItem(Y_REPORT_JOB_KEY);
      setIsFetchingResult(true);
      try {
        const raw = await fetchYReportView(resultId);
        const norm = normalizeYReportView(raw);
        setYReportData(norm);
      } catch (err) {
        setCreateError({ message: getJobErrorMessage(err.code, err.message), code: err.code ?? null });
      } finally {
        setIsFetchingResult(false);
      }
    },
    onFailed: (message, code) => {
      setIsReconnecting(false);
      localStorage.removeItem(Y_REPORT_JOB_KEY);
      setCreateError({ message: getJobErrorMessage(code, message), code });
      setJobId(null);
    },
  });

  const isBusy = isCreating || isPolling || isFetchingResult;

  const handleCreate = async () => {
    if (isBusy) return;
    setCreateError(null);
    setYReportData(null);
    setIsCreating(true);

    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setYReportData(yReportMockData);
        setIsCreating(false);
      }, 2000);
      return;
    }

    const controller = new AbortController();
    try {
      const payload = {
        simulation_id: simId,
      };
      const result = await createYReport(payload, { signal: controller.signal });
      // Persist for TTL reconnect
      localStorage.setItem(Y_REPORT_JOB_KEY, JSON.stringify({
        jobId: result.jobId,
        createdAt: Date.now(),
      }));
      setJobId(result.jobId);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCreateError({ message: getJobErrorMessage(err.code, err.message), code: err.code ?? null });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setCreateError(null);
    setJobId(null);
    setYReportData(null);
    setIsReconnecting(false);
    localStorage.removeItem(Y_REPORT_JOB_KEY);
  };

  // ── Derived data (only when yReportData is available) ─────────────────
  const d = yReportData;
  const ratingLabels = { taste: '맛', value: '가성비', atmosphere: '분위기' };
  const currentRating = d?.ratingDistribution?.[activeRatingTab];
  const kdeChartData = currentRating?.sim1?.length
    ? currentRating.sim1.map((s1, i) => ({
      score: s1.score,
      sim1: s1.density,
      sim2: currentRating.sim2[i]?.density ?? 0,
    }))
    : [];

  const satisfactionData = d ? Object.keys(d.ratingDistribution).map(key => {
    const s1Scores = d.ratingDistribution[key].sim1;
    const s2Scores = d.ratingDistribution[key].sim2;
    if (!s1Scores.length || !s2Scores.length) return { name: ratingLabels[key], sim1: 0, sim2: 0 };
    const s1Sat = s1Scores.filter(s => s.score >= 4).reduce((a, b) => a + b.density, 0);
    const s2Sat = s2Scores.filter(s => s.score >= 4).reduce((a, b) => a + b.density, 0);
    const s1Total = s1Scores.reduce((a, b) => a + b.density, 0) || 1;
    const s2Total = s2Scores.reduce((a, b) => a + b.density, 0) || 1;
    return { name: ratingLabels[key], sim1: Math.round((s1Sat / s1Total) * 100), sim2: Math.round((s2Sat / s2Total) * 100) };
  }) : [];

  const visitChange = d && d.overview.sim1.totalVisits
    ? ((d.overview.sim2.totalVisits - d.overview.sim1.totalVisits) / d.overview.sim1.totalVisits * 100).toFixed(1)
    : '0';
  const shareChange = d ? (d.overview.sim2.marketShare - d.overview.sim1.marketShare).toFixed(2) : '0';
  const avgChange = d ? (d.ratingSummary.sim2.avg - d.ratingSummary.sim1.avg).toFixed(2) : '0';
  const satChange = d ? (d.ratingSummary.sim2.satisfaction - d.ratingSummary.sim1.satisfaction).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">Y-Report</h1>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">비교 분석</span>
          </div>
          <p className="text-gray-500 text-sm">전략 적용 전(Sim 1) vs 후(Sim 2) 시뮬레이션 비교 보고서  ·  96명 에이전트 × 7일</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <FileText size={16} className="text-red-500" />
            전문 보기
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">
            <Printer size={16} /> PDF 저장
          </button>
        </div>
      </div>

      {/* ══════════════════ Y-Report 생성 UI ══════════════════ */}
      {!d && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Sparkles size={28} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Y-Report 생성 준비 완료</h2>
            <p className="text-gray-500 text-sm">시뮬레이션 결과를 바탕으로 AI 비교 분석 리포트를 생성합니다.</p>
          </div>

          {/* Reconnect banner */}
          {isReconnecting && !createError && (
            <div className="w-full max-w-md flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <RefreshCw size={14} className="flex-shrink-0 animate-spin" />
              <span>진행 중인 작업이 있습니다 — 계속 확인 중…</span>
            </div>
          )}

          {/* Progress while polling */}
          {(isPolling || isFetchingResult) && (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>처리 중... ({pollStatus})</span>
                {progress !== null && <span>{progress}%</span>}
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: progress !== null ? `${progress}%` : '60%' }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {createError && (
            <div className="w-full max-w-md flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {createError.message}
                <button onClick={handleRetry} className="ml-2 underline text-red-500 hover:text-red-700">다시 시도</button>
              </div>
            </div>
          )}

          {!isBusy && !createError && (
            <button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Sparkles size={18} /> Y-Report 생성 시작
            </button>
          )}

          {isBusy && !createError && (
            <button disabled className="bg-gray-400 cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isCreating ? '생성 요청 중...' : '분석 중...'}
            </button>
          )}
        </div>
      )}

      {/* ══════════════════ 리포트 본문 (API 데이터 수신 후) ══════════════════ */}
      {d && <>

        {/* ══════════════════ 솔루션 안전성 진단 ══════════════════ */}

        {/* ── 리스크 스코어 ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">솔루션 안전성 진단</h2>
                <p className="text-gray-400 text-xs">시뮬레이션 11개 지표 기반 역효과 자동 탐지 결과</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-3xl font-bold font-space">{formatNumber(clamp(d.riskScore.score, 0, 100))}<span className="text-lg text-gray-400">/100</span></p>
                <p className={`text-xs font-bold ${clamp(d.riskScore.score, 0, 100) <= 33 ? 'text-emerald-400' : clamp(d.riskScore.score, 0, 100) <= 66 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {d.riskScore.level || (clamp(d.riskScore.score, 0, 100) <= 33 ? '낮은 위험' : clamp(d.riskScore.score, 0, 100) <= 66 ? '보통 위험' : '높은 위험')}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {/* 게이지 바 */}
            <div className="mb-4">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${clamp(d.riskScore.score, 0, 100) <= 33 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : clamp(d.riskScore.score, 0, 100) <= 66 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                  style={{ width: `${clamp(d.riskScore.score, 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-bold">
                <span>0 안전</span>
                <span>30</span>
                <span>60</span>
                <span>100 위험</span>
              </div>
            </div>
            {/* 지표 요약 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                <CheckCircle size={18} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-600">{formatNumber(d.riskScore.positive)}</p>
                <p className="text-[10px] text-emerald-600 font-bold">순기능</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                <AlertCircle size={18} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-600">{formatNumber(d.riskScore.watch)}</p>
                <p className="text-[10px] text-amber-600 font-bold">관찰 필요</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                <AlertTriangle size={18} className="text-red-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-600">{formatNumber(d.riskScore.negative)}</p>
                <p className="text-[10px] text-red-600 font-bold">역효과 감지</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 역효과 감지 경고 ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">역효과 감지 알림</h3>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{d.sideEffects.length}건</span>
          </div>
          {d.sideEffects.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 text-center">
              감지된 역효과 없음
            </div>
          )}
          {d.sideEffects.map((se, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 flex items-start gap-3 border ${se.type === 'warning' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${se.type === 'warning' ? 'bg-red-100' : 'bg-amber-100'}`}>
                {se.type === 'warning'
                  ? <AlertTriangle size={16} className="text-red-500" />
                  : <AlertCircle size={16} className="text-amber-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900">{se.metric}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${se.type === 'warning' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {se.change > 0 ? '+' : ''}{se.change}{se.unit}
                  </span>
                  <span className={`text-[10px] font-bold ${se.type === 'warning' ? 'text-red-500' : 'text-amber-500'}`}>
                    {se.type === 'warning' ? '⚠️ 역효과' : '🔍 관찰 필요'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{se.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 트레이드오프 시각화 (Gain vs Loss) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-700" />
            <h3 className="font-bold text-sm text-gray-900">전략 트레이드오프 — 얻은 것 vs 잃은 것</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                <th className="text-left py-2.5 px-4 font-bold text-emerald-600 w-5/12">
                  <span className="flex items-center gap-1"><ArrowUpRight size={14} /> 얻은 것 (Gain)</span>
                </th>
                <th className="text-center py-2.5 px-2 w-2/12"></th>
                <th className="text-right py-2.5 px-4 font-bold text-red-500 w-5/12">
                  <span className="flex items-center gap-1 justify-end">잃은 것 (Loss) <ArrowDownRight size={14} /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {d.tradeoffs.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900">{t.gain}</span>
                    <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{t.gainVal}</span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="text-gray-300 text-lg">⇄</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-gray-900">{t.loss}</span>
                    <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{t.lossVal}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-blue-50 border-t border-blue-100">
            <p className="text-xs text-blue-700">
              <strong>💡 판단 가이드:</strong> 좌측(순기능)이 우측(역효과)보다 크면 전략을 유지하되, 역효과 항목에 대한 <strong>보완 솔루션</strong>을 검토하세요. 역효과가 치명적이면 해당 솔루션만 제외 후 재시뮬레이션을 추천합니다.
            </p>
          </div>
        </div>

        {/* ────────────────── 지표 1: 기본 방문 지표 (Overview) ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 1 — 기본 방문 지표 (Overview)</h2>
              <p className="text-xs text-gray-400">전략 후 손님이 실제로 늘었는가?</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-1">총 방문 수 (전)</p>
              <p className="text-2xl font-bold text-gray-400">{formatNumber(d.overview.sim1.totalVisits)}건</p>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm shadow-emerald-50">
              <p className="text-xs text-emerald-600 font-medium mb-1">총 방문 수 (후)</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-emerald-600">{formatNumber(d.overview.sim2.totalVisits)}건</p>
                <ChangeBadge value={parseFloat(visitChange)} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-1">시장 점유율 (전)</p>
              <p className="text-2xl font-bold text-gray-400">{formatPercent(d.overview.sim1.marketShare, 1)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm shadow-emerald-50">
              <p className="text-xs text-emerald-600 font-medium mb-1">시장 점유율 (후)</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-emerald-600">{formatPercent(d.overview.sim2.marketShare, 1)}</p>
                <ChangeBadge value={parseFloat(shareChange)} suffix="%p" />
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────── 지표 2: 방문 키워드 & 평균 평점 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 2 — 방문 키워드 & 평균 평점</h2>
              <p className="text-xs text-gray-400">방문자 리뷰 키워드가 달라졌는가? 평점이 올랐는가?</p>
            </div>
          </div>

          {/* 평균 종합 평점 카드 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">평균 종합 평점</p>
              <p className="text-xl font-bold text-gray-600">{formatNumber(d.ratingSummary.sim1.avg, { maximumFractionDigits: 2 })}점 → <span className="text-emerald-600">{formatNumber(d.ratingSummary.sim2.avg, { maximumFractionDigits: 2 })}점</span></p>
            </div>
            <ChangeBadge value={parseFloat(avgChange)} suffix="" showPlus={true} />
          </div>

          {/* Word Cloud */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <MessageSquare size={16} className="text-purple-500" /> 방문 키워드 워드클라우드 비교
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <WordCloudVisual keywords={d.keywords.sim1} label="Sim 1 — 전략 전" accentColor="gray" />
              <div className="hidden md:flex items-center">
                <div className="w-px h-32 bg-gray-200"></div>
                <ArrowRight size={20} className="text-gray-300 mx-2" />
                <div className="w-px h-32 bg-gray-200"></div>
              </div>
              <WordCloudVisual keywords={d.keywords.sim2} label="Sim 2 — 전략 후" accentColor="emerald" />
            </div>
          </div>
        </div>

        {/* ────────────────── 지표 2-B: 평점 분포 (RatingDistribution) ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart2 size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 2-B — 평점 분포 (Rating Distribution)</h2>
              <p className="text-xs text-gray-400">항목별 전략 전후 가중 평균 평점 비교</p>
            </div>
          </div>

          {Object.keys(d.ratingDistribution).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              평점 분포 데이터 없음
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-600">지표</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-400">Sim 1 (가중 평균)</th>
                    <th className="text-center py-3 px-4 font-bold text-emerald-600">Sim 2 (가중 평균)</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-500">변화</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(d.ratingDistribution).map(([key, dist]) => {
                    const LABELS = { taste: '맛', value: '가성비', atmosphere: '분위기', service: '서비스', price: '가격' };
                    const s1 = Array.isArray(dist?.sim1) ? dist.sim1 : [];
                    const s2 = Array.isArray(dist?.sim2) ? dist.sim2 : [];
                    const wavg = (arr) => {
                      const nums = arr.filter(v => typeof v?.score === 'number' && typeof v?.density === 'number');
                      if (!nums.length) return 0;
                      const tot = nums.reduce((a, b) => a + b.density, 0) || 1;
                      return nums.reduce((a, b) => a + b.score * b.density, 0) / tot;
                    };
                    const a1 = wavg(s1);
                    const a2 = wavg(s2);
                    const delta = a2 - a1;
                    return (
                      <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{LABELS[key] ?? key}</td>
                        <td className="text-center py-3 px-4 text-gray-500">{formatNumber(a1, { maximumFractionDigits: 1 })}</td>
                        <td className="text-center py-3 px-4 font-bold text-emerald-600">{formatNumber(a2, { maximumFractionDigits: 1 })}</td>
                        <td className="text-center py-3 px-4">
                          <ChangeBadge value={parseFloat(delta.toFixed(1))} suffix="" showPlus={true} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ────────────────── 지표 3: 시간대별 손님 변화 (Hourly Traffic) ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 3 — 시간대별 손님 변화 (Hourly Traffic)</h2>
              <p className="text-xs text-gray-400">전략이 특정 시간대에만 효과가 있는가? 피크타임이 바뀌었는가?</p>
            </div>
          </div>

          {/* Peak Time Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">피크 타임슬롯 (전)</p>
              <p className="text-xl font-bold text-gray-500">{d.peakSlot.sim1}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-sm shadow-amber-50">
              <p className="text-xs text-amber-600 mb-1">피크 타임슬롯 (후)</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-amber-600">{d.peakSlot.sim2}</p>
                {d.peakSlot.sim1 !== d.peakSlot.sim2 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">피크 전환</span>
                )}
              </div>
            </div>
          </div>

          {/* Bar Chart — 이산 시간대이므로 바 차트가 정확 */}
          {d.hourlyTraffic.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">시간대별 트래픽 데이터 없음</div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">시간대별 방문 트래픽</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.hourlyTraffic} barGap={2} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="slot" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: '방문 횟수', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [`${val}회`, name === '전략 전' ? '전략 전' : '전략 후']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Bar dataKey="sim1" fill="#d1d5db" radius={[4, 4, 0, 0]} name="전략 전" barSize={18} />
                  <Bar dataKey="sim2" fill="#f59e0b" radius={[4, 4, 0, 0]} name="전략 후" barSize={18} />
                  <Legend
                    formatter={(val) => val === '전략 전' ? 'Sim 1 (전략 전)' : 'Sim 2 (전략 후)'}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700">
                  <strong>💡 인사이트:</strong> 피크 타임이 <strong>점심 → 저녁</strong>으로 전환됨. 2인 세트가 저녁 데이트 고객 유입에 기여하며, 저녁 방문이 <strong>+50%</strong> 증가.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ────────────────── 지표 4: 세대별 증감 분석 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 4 — 세대별 증감 분석 (Generation Impact)</h2>
              <p className="text-xs text-gray-400">어떤 세대의 방문이 늘었고, 어떤 세대에서 감소했는가?</p>
            </div>
          </div>

          {d.generation.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">세대별 데이터 없음</div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.generation} barGap={4} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="gen" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 'auto']} />
                  <Tooltip formatter={(val, name) => [`${val}%`, name === '전략 전' ? '전략 전' : '전략 후']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Bar dataKey="sim1" fill="#c7d2fe" radius={[4, 4, 0, 0]} name="전략 전" barSize={28} />
                  <Bar dataKey="sim2" fill="#6366f1" radius={[4, 4, 0, 0]} name="전략 후" barSize={28} />
                  <Legend formatter={(val) => val === '전략 전' ? 'Sim 1 (전략 전)' : 'Sim 2 (전략 후)'} wrapperStyle={{ fontSize: '12px' }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-700">
                  <strong>💡 인사이트:</strong> Z세대(Z1+Z2) 비율이 <strong>40.8% → 49.7%</strong>로 급증. 데이트코스·인스타감성 솔루션이 젊은 층 유입에 직접 기여.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ────────────────── 지표 5: 방문 목적별 분석 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 5 — 방문 목적별 상세 분석 (Purpose Analysis)</h2>
              <p className="text-xs text-gray-400">어떤 목적의 손님이 늘었고, 만족도는 어떻게 달라졌는가?</p>
            </div>
          </div>

          {d.purpose.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">방문 목적 데이터 없음</div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-600">방문 목적</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-400">비중(전)</th>
                    <th className="text-center py-3 px-4 font-bold text-emerald-600">비중(후)</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-400">만족도(전)</th>
                    <th className="text-center py-3 px-4 font-bold text-emerald-600">만족도(후)</th>
                  </tr>
                </thead>
                <tbody>
                  {d.purpose.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{p.type}</td>
                      <td className="text-center py-3 px-4 text-gray-400">{p.sim1Pct}%</td>
                      <td className="text-center py-3 px-4 font-bold text-gray-900">{p.sim2Pct}%
                        <ChangeBadge value={parseFloat((p.sim2Pct - p.sim1Pct).toFixed(1))} suffix="%p" />
                      </td>
                      <td className="text-center py-3 px-4 text-gray-400">{p.sim1Sat}</td>
                      <td className="text-center py-3 px-4 font-bold text-emerald-600">{p.sim2Sat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-rose-50 border-t border-rose-100">
                <p className="text-xs text-rose-700">
                  <strong>💡 인사이트:</strong> 사적모임형 비중이 <strong>+7.3%p</strong> 증가하며 가장 큰 변화. 2인 세트 메뉴가 데이트 수요 흡수에 효과적.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ────────────────── 지표 6: 재방문율 분석 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <RefreshCw size={18} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 6 — 재방문율 분석 (Retention)</h2>
              <p className="text-xs text-gray-400">기존 고객이 유지되었는가? 신규 유입 vs 이탈 비율은?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
              <p className="text-xs text-gray-400 mb-1">기존 고객 유지</p>
              <p className="text-2xl font-bold text-cyan-600">{formatNumber(d.retention.retained)}명</p>
              <p className="text-xs text-cyan-500 font-bold mt-1">유지율 {formatPercent(d.retention.retentionRate, 1)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm text-center">
              <p className="text-xs text-emerald-600 mb-1">신규 유입</p>
              <p className="text-2xl font-bold text-emerald-600">{formatNumber(d.retention.newUsers)}명</p>
              <p className="text-xs text-emerald-500 font-bold mt-1">Sim2의 {formatPercent(d.retention.newRatio, 1)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm text-center">
              <p className="text-xs text-red-500 mb-1">이탈 (Churn)</p>
              <p className="text-2xl font-bold text-red-500">{formatNumber(d.retention.churned)}명</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 p-5 rounded-xl border border-cyan-200 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">순 증가</p>
              <p className="text-2xl font-bold text-gray-900">+{formatNumber(d.retention.newUsers - d.retention.churned)}명</p>
              <p className="text-xs text-gray-400 mt-1">{formatNumber(d.retention.sim1Agents)} → {formatNumber(d.retention.sim2Agents)} 에이전트</p>
            </div>
          </div>
        </div>

        {/* ────────────────── 지표 7: 경쟁 매장 비교 (항목별 막대그래프) ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 7 — 경쟁 매장 비교 (Competitor Benchmark)</h2>
              <p className="text-xs text-gray-400">전략 전후 타겟 매장이 경쟁 매장 대비 어떻게 달라졌는가?</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            {/* 범례 — 매장명만 색상으로 구분 */}
            <div className="flex flex-wrap gap-3 mb-6 text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span> <span className="text-gray-500">류진 (전략 전)</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> <span className="text-emerald-600">류진 (전략 후)</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> <span className="text-blue-600">{d.radarStores.comp1}</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> <span className="text-purple-600">{d.radarStores.comp2}</span></span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> <span className="text-orange-600">{d.radarStores.comp3}</span></span>
            </div>

            {/* 항목별 개별 막대그래프 — 바 색상 통일 */}
            <div className="space-y-6">
              {d.radar.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-gray-700">{item.metric}</h4>
                    <span className="text-xs text-gray-400">단위: {item.unit}</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: '류진 (전)', value: item.target_before, nameColor: 'text-gray-500' },
                      { label: '류진 (후)', value: item.target_after, nameColor: 'text-emerald-600' },
                      { label: d.radarStores.comp1, value: item.comp1, nameColor: 'text-blue-600' },
                      { label: d.radarStores.comp2, value: item.comp2, nameColor: 'text-purple-600' },
                      { label: d.radarStores.comp3, value: item.comp3, nameColor: 'text-orange-600' },
                    ].map((bar, bi) => {
                      const maxVal = Math.max(item.target_before, item.target_after, item.comp1, item.comp2, item.comp3);
                      const pct = (bar.value / maxVal) * 100;
                      return (
                        <div key={bi} className="flex items-center gap-2">
                          <span className={`text-[11px] font-semibold w-24 text-right truncate ${bar.nameColor}`}>{bar.label}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                            <div
                              className="bg-teal-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-14 text-right">{bar.value}{item.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-xs text-teal-700">
                <strong>💡 인사이트:</strong> 전략 후 류진이 만족도·재방문율에서 경쟁 매장을 <strong>추월</strong>했습니다. 방문수는 아직 오시 망원본점에 다소 뒤처지나, 격차가 크게 축소됨.
              </p>
            </div>
          </div>
        </div>

        {/* ────────────────── 지표 9: 에이전트 유형 (상주/유동) ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 9 — 에이전트 유형별 분석 (Agent Type)</h2>
              <p className="text-xs text-gray-400">유동 인구 vs 상주 고객, 어느 쪽이 더 증가했는가?</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.agentType} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, 70]} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 13, fontWeight: 700 }} />
                <Tooltip formatter={(val, name) => [`${val}%`, name === '전략 전' ? '전략 전' : '전략 후']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="sim1" fill="#fed7aa" radius={[0, 4, 4, 0]} name="전략 전" barSize={20} />
                <Bar dataKey="sim2" fill="#f97316" radius={[0, 4, 4, 0]} name="전략 후" barSize={20} />
                <Legend formatter={(val) => val === '전략 전' ? 'Sim 1 (전략 전)' : 'Sim 2 (전략 후)'} wrapperStyle={{ fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ────────────────── 지표 10: 성별 구성 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 10 — 성별 구성 분석 (Gender Composition)</h2>
              <p className="text-xs text-gray-400">전략 전후 성별 비율이 달라졌는가?</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.gender} barGap={4} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 13, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 'auto']} />
                <Tooltip formatter={(val, name) => [`${val}%`, name === '전략 전' ? '전략 전' : '전략 후']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="sim1" fill="#fbb6ce" radius={[4, 4, 0, 0]} name="전략 전" barSize={32} />
                <Bar dataKey="sim2" fill="#ec4899" radius={[4, 4, 0, 0]} name="전략 후" barSize={32} />
                <Legend formatter={(val) => val === '전략 전' ? 'Sim 1 (전략 전)' : 'Sim 2 (전략 후)'} wrapperStyle={{ fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ────────────────── 지표 11: 세대×방문목적 크로스탭 히트맵 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지표 11 — 세대 × 방문목적 크로스탭 (Heatmap)</h2>
              <p className="text-xs text-gray-400">어떤 세대가 어떤 목적으로 방문했는가? 전략 후 분포.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-bold text-gray-600">세대 ↓ \ 목적 →</th>
                  {d.crosstab.purposes.map(p => (
                    <th key={p} className="text-center py-3 px-3 font-bold text-gray-600">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.crosstab.generations.map((gen, gi) => (
                  <tr key={gen} className="border-b border-gray-50">
                    <td className="py-3 px-3 font-bold text-gray-900">{gen}</td>
                    {d.crosstab.sim2[gi].map((val, pi) => {
                      const intensity = val / 50;
                      const bg = `rgba(239, 68, 68, ${Math.min(intensity, 1) * 0.6})`;
                      return (
                        <td key={pi} className="text-center py-3 px-3 font-bold text-sm" style={{ backgroundColor: bg, color: intensity > 0.5 ? '#fff' : '#374151' }}>
                          {val}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs text-red-700">
                <strong>💡 인사이트:</strong> Z1세대는 사적모임(40%)이 압도적, S세대는 생활베이스(50%)가 지배적. 세대별 맞춤 마케팅이 필요합니다.
              </p>
            </div>
          </div>
        </div>

        {/* ────────────────── 지표 8: LLM 종합 평가 ────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">종합 평가 — AI Summary (GPT-5.2)</h2>
              <p className="text-xs text-gray-400">모든 지표를 종합한 AI 전략 분석가의 총평</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI 전략 분석 리포트</p>
                <p className="text-white/70 text-xs">GPT-5.2 기반 자동 생성 · 시뮬레이션 데이터 근거</p>
              </div>
            </div>
            {d.llmSummary ? (
              <article className="p-6 bg-amber-50/40 rounded-b-2xl">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-4">AI 분석 결과</p>
                <p
                  className="text-sm text-gray-700"
                  style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}
                >
                  {d.llmSummary}
                </p>
              </article>
            ) : (
              <div className="p-6 text-sm text-gray-400 text-center">요약 내용이 없습니다.</div>
            )}
          </div>
        </div>

      </> /* end {d && <>} */}
    </div>
  );
};

const PricingView = () => {
  const creditPacks = [
    { credits: 10, price: '4,900원', color: 'bg-blue-50', text: 'text-blue-600' },
    { credits: 30, price: '12,900원', color: 'bg-purple-50', text: 'text-purple-600', popular: true },
    { credits: 50, price: '21,900원', color: 'bg-red-50', text: 'text-red-600' },
    { credits: 100, price: '39,900원', color: 'bg-gray-900', text: 'text-white' },
  ];

  const subscriptionPlans = [
    {
      name: 'Basic Plan',
      price: '29,000원',
      period: '/월',
      features: ['월 50 크레딧 제공', '기본 X-Report 분석', '시뮬레이션 기본형'],
      color: 'border-gray-100',
      buttonVariant: 'secondary'
    },
    {
      name: 'Premium Plan',
      price: '59,000원',
      period: '/월',
      features: ['월 150 크레딧 제공', '심층 X-Report 분석', '시뮬레이션 우선순위', '데이터 히스토리 보존'],
      color: 'border-red-100 bg-red-50/30',
      popular: true,
      buttonVariant: 'primary'
    },
    {
      name: 'Pro Plan',
      price: '99,000원',
      period: '/월',
      features: ['월 300 크레딧 제공', '모든 X/Y-Report 기능', '상권 변동 실시간 알림', '데이터 엑스포트 (CSV)'],
      color: 'border-gray-200',
      buttonVariant: 'primary'
    },
    {
      name: 'Master Plan',
      price: '199,000원',
      period: '/월',
      features: ['무제한 크레딧 활용', '1:1 상권 전략 컨설팅', '본사급 대시보드 제공', '모든 기능 우선 업데이트'],
      color: 'border-gray-900 bg-gray-900 text-white',
      buttonVariant: 'white'
    }
  ];

  return (
    <div className="space-y-20 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 font-space tracking-tight">요금제 선택</h1>
        <p className="text-gray-500">로벨롭의 AI 분석으로 매장의 미래를 가장 먼저 확인하세요.</p>
      </div>

      {/* 구독 플랜 섹션 */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-100"></div>
          <h2 className="text-xl font-bold text-gray-400 font-space uppercase tracking-widest">Subscription Plans</h2>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan, idx) => (
            <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${plan.color} ${plan.name === 'Master Plan' ? 'shadow-2xl shadow-gray-900/20' : 'bg-white shadow-xl shadow-gray-100 hover:border-red-500'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${plan.name === 'Master Plan' ? 'text-red-400' : 'text-red-600'}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-3xl font-black font-space">{plan.price}</span>
                <span className={`text-sm ${plan.name === 'Master Plan' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
              </div>

              <ul className={`space-y-3 mb-10 flex-1 ${plan.name === 'Master Plan' ? 'text-gray-300' : 'text-gray-500'} text-xs`}>
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <CheckCircle size={14} className={plan.name === 'Master Plan' ? 'text-red-400' : 'text-green-500'} /> {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.buttonVariant === 'white' ? 'bg-white text-gray-900 hover:bg-gray-100' :
                plan.buttonVariant === 'primary' ? 'bg-gray-900 text-white hover:bg-black' :
                  'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                구독 시작하기
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 크레딧 추가 섹션 */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-100"></div>
          <h2 className="text-xl font-bold text-gray-400 font-space uppercase tracking-widest">크레딧 추가</h2>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPacks.map((plan, idx) => (
            <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${plan.color === 'bg-gray-900' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-lg shadow-gray-100 hover:border-red-500'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Recommended
                </div>
              )}
              <div className={`w-12 h-12 rounded-2xl ${plan.color} ${plan.text} flex items-center justify-center mb-6`}>
                <Zap size={24} fill={plan.color === 'bg-gray-900' ? 'white' : 'currentColor'} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.credits} Credits</h3>
              <div className={`text-3xl font-black font-space mb-8 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.price}</div>

              <ul className={`space-y-3 mb-10 flex-1 ${plan.color === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> AI X-Report 생성</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 시뮬레이션 테스트</li>
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.color === 'bg-gray-900' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}`}>
                충전하기
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-gradient-to-r from-gray-900 to-black p-10 rounded-[2.5rem] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold text-white mb-2">기업용 커스텀 플랜</h4>
          <p className="text-gray-400 text-sm">프랜차이즈 본사 및 다점포 사장님을 위한 맞춤형 데이터 솔루션</p>
        </div>
        <button className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap">
          영업팀에 문의하기 <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading] = useState(false); // kept for layout guard; no longer set
  const [completedSteps, setCompletedSteps] = useState([]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    // Logic to mark previous steps as complete
    const steps = ['dashboard', 'verification', 'x-report', 'simulation', 'simulation_map', 'y-report'];
    const idx = steps.indexOf(tab);
    setCompletedSteps(steps.slice(0, idx));
  };

  /* --- Store Data (API) --- */
  const [stores, setStores] = useState([]);
  const [storeTotal, setStoreTotal] = useState(0);
  const [storeOffset, setStoreOffset] = useState(0);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [storeError, setStoreError] = useState(null); // { code, message } | null
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [xReportData, setXReportData] = useState(null);

  // Simulation job state — set in SimulationView, consumed in SimulationMap
  const [simJobId, setSimJobId] = useState(null);
  const [simTimeoutMs, setSimTimeoutMs] = useState(30 * 60 * 1000);
  const [simMaxRetries, setSimMaxRetries] = useState(450);
  const [simId, setSimId] = useState(null); // resultId from completed simulation job → Y-Report의 simulation_id

  // Initialise selectedStoreId to first store once data arrives
  useEffect(() => {
    if (stores.length > 0 && selectedStoreId === null) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // Debounced fetch with AbortController cleanup
  useEffect(() => {
    const controller = new AbortController();

    const doFetch = async () => {
      setIsLoadingStores(true);
      setStoreError(null);

      if (USE_MOCK_DATA) {
        setTimeout(() => {
          setStores(realData.stores);
          setStoreTotal(721);
          setIsLoadingStores(false);
        }, 500);
        return;
      }

      try {
        const resp = await fetchStores({
          q: storeSearchQuery || undefined,
          limit: 50,
          offset: 0,
          signal: controller.signal,
        });
        const norm = normalizeStoresResponse(resp);
        setStores(norm.items);
        setStoreTotal(norm.total);
        setStoreOffset(0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setStoreError({ code: err.code ?? null, message: err.message ?? '매장 데이터를 불러오지 못했습니다.' });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingStores(false);
        }
      }
    };

    // No delay on initial empty query; 300 ms debounce on search input
    const delay = storeSearchQuery ? 300 : 0;
    const timer = setTimeout(doFetch, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [storeSearchQuery]);

  // Load next page of stores and append
  const handleLoadMoreStores = useCallback(async () => {
    const nextOffset = storeOffset + 50;
    if (nextOffset >= storeTotal) return;

    const controller = new AbortController();
    setIsLoadingStores(true);
    try {
      const resp = await fetchStores({
        q: storeSearchQuery || undefined,
        limit: 50,
        offset: nextOffset,
        signal: controller.signal,
      });
      const norm = normalizeStoresResponse(resp);
      setStores(prev => [...prev, ...norm.items]);
      setStoreOffset(nextOffset);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStoreError({ code: err.code ?? null, message: err.message ?? '더 보기 로드 실패' });
      }
    } finally {
      setIsLoadingStores(false);
    }
  }, [storeSearchQuery, storeOffset, storeTotal]);

  // Derive summary stats from loaded stores
  const stats = useMemo(() => {
    // Hardcoded stats as per user request
    return {
      storeCount: '721', // '분석 매장 수' 721
      avgSentiment: '4.2',
      totalAgents: '720', // '(720개 매장 데이터 보유)'에 대응
      avgRevenue: '31,520', // '평균 객단가' 31,520
    };
  }, []);

  const selectedStoreData = (selectedStoreId && stores.find(s => s.id === selectedStoreId)) || stores[0] || null;
  // Safe fallback so downstream views never receive null
  const safeStoreData = selectedStoreData ?? {
    id: '', name: '—', address: '', lat: null, lng: null,
    sentiment: null, revenue: null, grade: null, rankPercent: null,
  };

  const handleAnalyze = () => {
    changeTab('verification');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex flex-col items-center justify-center animate-pulse">
          <div className="w-20 h-20 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-space">Analyzing Data...</h2>
          <p className="text-gray-500">{stats.totalAgents}개의 가상 에이전트가 매장을 방문하고 있습니다.</p>
        </div>
      );
    }

    const dashboardView = (
      <DashboardView
        stats={stats}
        stores={stores}
        storeTotal={storeTotal}
        onAnalyze={handleAnalyze}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        isLoadingStores={isLoadingStores}
        storeError={storeError}
        onSearchQueryChange={setStoreSearchQuery}
        onLoadMore={handleLoadMoreStores}
      />
    );

    switch (activeTab) {
      case 'dashboard': return dashboardView;
      case 'verification': return (
        <VerificationView
          data={safeStoreData}
          onVerified={() => changeTab('x-report')}
          onBack={() => changeTab('dashboard')}
        />
      );
      case 'x-report': return (
        <XReportView
          storeData={safeStoreData}
          onNext={() => changeTab('simulation')}
          selectedSolutions={selectedSolutions}
          onSelectSolution={setSelectedSolutions}
          xReportData={xReportData}
          onXReportDataChange={setXReportData}
        />
      );
      case 'simulation': return (
        <SimulationView
          data={safeStoreData}
          onJobCreated={(jobId, timeoutMs, maxRetries) => {
            setSimJobId(jobId);
            setSimTimeoutMs(timeoutMs);
            setSimMaxRetries(maxRetries);
            changeTab('simulation_map');
          }}
          selectedSolutions={selectedSolutions}
        />
      );
      case 'simulation_map': return (
        <SimulationMap
          storeData={safeStoreData}
          onComplete={(resultId) => { setSimId(resultId); changeTab('y-report'); }}
          jobId={simJobId}
          timeoutMs={simTimeoutMs}
          maxRetries={simMaxRetries}
        />
      );
      case 'mypage': return (
        <MyPageView
          data={safeStoreData}
          onBack={() => changeTab('dashboard')}
          onManageMembership={() => setActiveTab('pricing')}
        />
      );
      case 'y-report': return <YReportView storeData={safeStoreData} selectedSolutions={selectedSolutions} simId={simId} />;
      case 'pricing': return <PricingView />;
      default: return dashboardView;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative w-full flex justify-center z-10">
          {authView === 'login' ? (
            <LoginView onLogin={() => setIsLoggedIn(true)} onSignup={() => setAuthView('signup')} />
          ) : (
            <SignupView onSignup={() => { setAuthView('login'); alert('회원가입이 완료되었습니다. 로그인해주세요.'); }} onLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col bg-white z-10 hidden md:flex">
        <div className="p-6 pb-4">
          <div className="mb-6 cursor-pointer group flex flex-col items-center" onClick={() => changeTab('dashboard')}>
            <div className="flex items-center justify-center w-full">
              <img
                src={logo}
                alt="Lovelop"
                className="h-[152px] w-auto transform group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-3 tracking-wide text-center w-full">AI가 실험해주는 내 가게의 미래</p>
          </div>

          <nav className="space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="대시보드"
              active={activeTab === 'dashboard'}
              onClick={() => changeTab('dashboard')}
            />
            <SidebarItem
              icon={FileText}
              label="X-Report"
              active={activeTab === 'x-report'}
              onClick={() => changeTab('x-report')}
            />
            <SidebarItem
              icon={Sliders}
              label="시뮬레이션 설정"
              active={activeTab === 'simulation'}
              onClick={() => changeTab('simulation')}
            />
            <SidebarItem
              icon={Globe}
              label="시뮬레이션"
              active={activeTab === 'simulation_map'}
              onClick={() => changeTab('simulation_map')}
            />
            <SidebarItem
              icon={BarChart2}
              label="최종 리포트"
              active={activeTab === 'y-report'}
              onClick={() => changeTab('y-report')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeTab('mypage')}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <User size={14} /> 마이페이지
              </button>
            </div>
            <div className="text-xs font-bold text-gray-400 mb-2">CREDITS</div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">40 / 100</span>
              <button
                onClick={() => setActiveTab('pricing')}
                className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
              >
                Charge
              </button>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-red-500 h-full w-[40%]"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black flex items-center justify-center text-white font-bold text-sm shadow-md">
              CEO
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">김사장님</div>
              <div className="text-xs text-gray-400">Premium Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white relative">
        {/* Top Progress Bar for Mobile/Tablet context or visual cue */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 px-8 py-3 flex gap-4 overflow-x-auto no-scrollbar">
          <StepCard number="1" title="매장 입력" completed={completedSteps.includes('dashboard')} active={activeTab === 'dashboard'} onClick={() => changeTab('dashboard')} />
          <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
          <StepCard number="2" title="X-Report" completed={completedSteps.includes('x-report')} active={activeTab === 'x-report'} onClick={() => changeTab('x-report')} />
          <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
          <StepCard number="3" title="시뮬레이션 설정" completed={completedSteps.includes('simulation')} active={activeTab === 'simulation'} onClick={() => changeTab('simulation')} />
          <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
          <StepCard number="4" title="시뮬레이션" completed={completedSteps.includes('simulation_map')} active={activeTab === 'simulation_map'} onClick={() => changeTab('simulation_map')} />
          <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
          <StepCard number="5" title="최종 리포트" completed={completedSteps.includes('y-report')} active={activeTab === 'y-report'} onClick={() => changeTab('y-report')} />
        </div>

        <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-24">
          {renderContent()}
        </div>

        {/* Floating AI Agent */}
        <AIChatButton />
      </main>
    </div>
  );
};

export default App;
// Triggering redeploy for logo size verification
