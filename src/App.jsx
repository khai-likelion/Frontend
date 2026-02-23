import React, { useState, useEffect } from 'react'; // Force rebuild for Vercel
import ReactMarkdown from 'react-markdown';
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
import logo from './assets/images/lovelop_logo_v2.png';
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

import realData from './data/real_data.json';

// --- Mock Data ---

// --- Mock Data ---

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
  // Initialize Kakao Map with retry logic (similar to VerificationView)
  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = document.getElementById('mypage-map'); // Unique ID for MyPage map
          if (container) {
            const options = {
              center: new window.kakao.maps.LatLng(data.lat, data.lng),
              level: 3
            };
            const map = new window.kakao.maps.Map(container, options);

            // Marker
            const markerPosition = new window.kakao.maps.LatLng(data.lat, data.lng);
            const marker = new window.kakao.maps.Marker({
              position: markerPosition
            });
            marker.setMap(map);
          }
        });
        return true;
      }
      return false;
    };

    // Try loading immediately
    if (!loadMap()) {
      let attempts = 0;
      const intervalId = setInterval(() => {
        attempts++;
        if (loadMap() || attempts >= 10) {
          clearInterval(intervalId);
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
              <div id="mypage-map" className="w-full h-full"></div>
              {/* Fallback for no API key */}
              {!window.kakao && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
                  <span className="text-xs text-gray-500 font-medium">지도 로딩 중... (API 키 확인 필요)</span>
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
            style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
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
        <div className="inline-flex items-center justify-center mb-6">
          <img
            src={logo}
            alt="Lovelop"
            className="h-56 w-auto"
            style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">회원가입</h2>
        <p className="text-gray-500">AI가 실험해주는 내 가게의 미래</p>
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

const DashboardView = ({ stats, stores, onAnalyze, selectedStoreId, onSelectStore }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Initialize searchTerm with selected store name
  useEffect(() => {
    if (selectedStoreId) {
      const store = stores.find(s => s.id === selectedStoreId);
      if (store) setSearchTerm(store.name);
    }
  }, [selectedStoreId, stores]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  const handleSelectResult = (store) => {
    onSelectStore(store.id);
    setSearchTerm(store.name);
    setShowResults(false);
  };

  // Filter stores: show results only if 2+ characters typed
  const filteredStores = searchTerm.length >= 2
    ? stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.address && store.address.includes(searchTerm))
    ).slice(0, 10)
    : [];

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
            <label className="text-gray-300 text-sm font-medium">분석할 매장 검색 ({stores.length}개 매장 데이터 보유)</label>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                placeholder="매장명 검색 (2글자 이상 입력)"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm placeholder-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" size={20} />

              {/* Autocomplete Dropdown */}
              {showResults && searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {filteredStores.length > 0 ? (
                    filteredStores.map(store => (
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
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Close dropdown when clicking outside could be handled by a backdrop or ref, omitting for simplicity/MVP as per request */}
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


const VerificationView = ({ data, onVerified, onBack }) => {
  const [bizNum, setBizNum] = useState('');
  const [error, setError] = useState('');

  // Initialize Kakao Map with retry logic
  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = document.getElementById('kakao-map');
          if (container) {
            const options = {
              center: new window.kakao.maps.LatLng(data.lat, data.lng),
              level: 3
            };
            const map = new window.kakao.maps.Map(container, options);

            // Marker
            const markerPosition = new window.kakao.maps.LatLng(data.lat, data.lng);
            const marker = new window.kakao.maps.Marker({
              position: markerPosition
            });
            marker.setMap(map);
          }
        });
        return true;
      }
      return false;
    };

    // Try loading immediately
    if (!loadMap()) {
      // If not loaded, retry every 500ms for 5 seconds
      let attempts = 0;
      const intervalId = setInterval(() => {
        attempts++;
        if (loadMap() || attempts >= 10) {
          clearInterval(intervalId);
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
          <div id="kakao-map" className="w-full h-full"></div>

          {/* Overlay info - only show if map might not load (e.g. no API key) */}
          {!window.kakao && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 pointer-events-none">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-gray-700">
                <MapPin className="text-red-500" size={18} />
                <span>{data.address || '주소 정보 없음'} (API 키 확인 필요)</span>
              </div>
            </div>
          )}

          {/* Always visible address badge */}
          {window.kakao && (
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

const XReportView = ({ data, onNext, selectedSolutions = [], onSelectSolution }) => {
  const [selectedMetric, setSelectedMetric] = useState(data.radarData[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update selectedMetric when data changes (e.g. store switching)
  useEffect(() => {
    setSelectedMetric(data.radarData[0]);
  }, [data]);

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
              <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">X-Report: {data.name}</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">진단 완료</span>
            </div>
            <p className="text-gray-500 text-sm">GPT-5.2 기반 AI 분석 리포트 — 매장 전략 처방전</p>
          </div>
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
              <div className="text-4xl font-bold font-space text-gray-900">{data.grade}<span className="text-lg text-gray-400 font-normal ml-1">/ S</span></div>
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                <div className="flex justify-between mb-1"><span>S</span> <span className="text-gray-400">최상</span></div>
                <div className="flex justify-between mb-1"><span>A</span> <span className="text-gray-400">상</span></div>
                <div className="flex justify-between mb-1"><span>B</span> <span className="text-gray-400">중</span></div>
                <div className="flex justify-between mb-1"><span>C</span> <span className="text-gray-400">하</span></div>
                <div className="flex justify-between"><span>D</span> <span className="text-gray-400">최하</span></div>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">상위</div>
              <div className="text-4xl font-bold font-space text-red-600">{data.rankPercent}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Interactive Radar Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2">역량 분석 (Deep-Dive)</h3>
            <p className="text-sm text-gray-400 mb-6">항목을 클릭하여 상세 분석을 확인하세요.</p>
            <div className="flex-1 min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
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
                        onClick={() => setSelectedMetric(data.radarData.find(d => d.subject === payload.value))}
                      >
                        {payload.value}
                      </text>
                    )}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={data.name}
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
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{selectedMetric?.subject} <span className="text-red-600">{selectedMetric?.A}점</span></h3>
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
                    {data.keywords.slice(0, 8).map(k => {
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
                  {data.description}
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
                data.solutions.reduce((acc, sol) => {
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
                          className={`relative bg-white p-4 rounded-xl border hover:shadow-lg cursor-pointer transition-all duration-300 group flex flex-col h-full hover:z-50 
                          ${isSelected
                              ? 'border-red-500 ring-2 ring-red-100 bg-red-50/10'
                              : 'border-gray-200'}
                          ${catIdx === 0 && !isSelected ? 'hover:border-red-400' : ''}
                          ${catIdx === 1 && !isSelected ? 'hover:border-blue-400' : ''}
                          ${catIdx === 2 && !isSelected ? 'hover:border-green-400' : ''}
                        `}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-red-600 bg-white rounded-full p-1 shadow-sm z-30">
                              <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                            </div>
                          )}
                          <div className="font-bold text-gray-900 mb-2 text-sm leading-snug relative z-10">{sol.title}</div>
                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-50 mt-auto relative z-10 group-hover:opacity-0 transition-opacity">{sol.desc}</div>

                          {/* Hover Overlay */}
                          <div className={`absolute left-[-1px] top-[-1px] w-[calc(100%+2px)] min-h-[calc(100%+2px)] h-auto bg-white p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 rounded-xl border shadow-xl ${catIdx === 0 ? 'border-red-400 shadow-red-100' : catIdx === 1 ? 'border-blue-400 shadow-blue-100' : 'border-green-400 shadow-green-100'}`}>
                            <div className="space-y-3">
                              {sol.execution && (
                                <div>
                                  <div className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 ${catIdx === 0 ? 'text-red-600' : catIdx === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                                    <span className="text-lg">💡</span> 이렇게 실행해보세요
                                  </div>
                                  <div className="text-xs text-gray-800 leading-relaxed font-medium">
                                    <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                                      {sol.execution}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {sol.effect && (
                                <div>
                                  <div className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 ${catIdx === 0 ? 'text-red-600' : catIdx === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                                    <span className="text-lg">📈</span> 기대되는 변화
                                  </div>
                                  <div className="text-xs text-gray-600 leading-relaxed">
                                    <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span> }}>
                                      {sol.effect}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
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
              <div className="p-8 overflow-y-auto prose prose-red max-w-none text-left">
                <ReactMarkdown>{data.fullReport}</ReactMarkdown>
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
const SimulationView = ({ data, onComplete, selectedSolutions = [] }) => {
  const [simValues, setSimValues] = useState({});
  const [duration, setDuration] = useState('1week');

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

  const durationOptions = [
    { id: '1week', label: '1주일', credits: 10 },
    { id: '2weeks', label: '2주일', credits: 20 },
    { id: '1month', label: '1개월', credits: 35 },
    { id: '3months', label: '3개월', credits: 100 },
    { id: '6months', label: '6개월', credits: 180 },
    { id: '1year', label: '1년', credits: 330 },
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
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${duration === opt.id ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                    {duration === opt.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className={`font-medium ${duration === opt.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </div>
                <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
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
            <button
              onClick={onComplete}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              시뮬레이션 시작하기 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Y-Report: 비교 분석 리포트 (지표 1~3) ──────────────────────────────
const yReportMockData = {
  // 지표 1: 기본 방문 지표
  overview: {
    sim1: { totalVisits: 142, marketShare: 8.2 },
    sim2: { totalVisits: 189, marketShare: 10.45 },
  },
  // 워드클라우드 키워드
  keywords: {
    sim1: [
      { text: '가성비', weight: 18 }, { text: '맛있다', weight: 15 },
      { text: '점심특선', weight: 12 }, { text: '직장인', weight: 11 },
      { text: '혼밥', weight: 10 }, { text: '가까워서', weight: 9 },
      { text: '빠른식사', weight: 8 }, { text: '편의성', weight: 7 },
      { text: '웨이팅길다', weight: 14 }, { text: '메뉴다양', weight: 6 },
    ],
    sim2: [
      { text: '분위기맛집', weight: 22 }, { text: '원격줄서기', weight: 19 },
      { text: '2인세트', weight: 17 }, { text: '데이트코스', weight: 15 },
      { text: '맛커스텀', weight: 13 }, { text: '깔끔한매장', weight: 11 },
      { text: '가성비', weight: 10 }, { text: '직장인', weight: 9 },
      { text: '인스타감성', weight: 8 }, { text: '재방문의사', weight: 7 },
    ],
  },
  // 지표 2: 평점 분포 (KDE-like data points)
  ratingDistribution: {
    taste: {
      sim1: [
        { score: 1, density: 0.05 }, { score: 1.5, density: 0.08 }, { score: 2, density: 0.15 },
        { score: 2.5, density: 0.22 }, { score: 3, density: 0.35 }, { score: 3.5, density: 0.42 },
        { score: 4, density: 0.30 }, { score: 4.5, density: 0.15 }, { score: 5, density: 0.06 },
      ],
      sim2: [
        { score: 1, density: 0.02 }, { score: 1.5, density: 0.04 }, { score: 2, density: 0.08 },
        { score: 2.5, density: 0.14 }, { score: 3, density: 0.25 }, { score: 3.5, density: 0.38 },
        { score: 4, density: 0.48 }, { score: 4.5, density: 0.32 }, { score: 5, density: 0.12 },
      ],
    },
    value: {
      sim1: [
        { score: 1, density: 0.08 }, { score: 1.5, density: 0.12 }, { score: 2, density: 0.22 },
        { score: 2.5, density: 0.30 }, { score: 3, density: 0.38 }, { score: 3.5, density: 0.28 },
        { score: 4, density: 0.18 }, { score: 4.5, density: 0.10 }, { score: 5, density: 0.04 },
      ],
      sim2: [
        { score: 1, density: 0.03 }, { score: 1.5, density: 0.05 }, { score: 2, density: 0.10 },
        { score: 2.5, density: 0.16 }, { score: 3, density: 0.28 }, { score: 3.5, density: 0.40 },
        { score: 4, density: 0.45 }, { score: 4.5, density: 0.28 }, { score: 5, density: 0.10 },
      ],
    },
    atmosphere: {
      sim1: [
        { score: 1, density: 0.06 }, { score: 1.5, density: 0.10 }, { score: 2, density: 0.18 },
        { score: 2.5, density: 0.28 }, { score: 3, density: 0.36 }, { score: 3.5, density: 0.32 },
        { score: 4, density: 0.22 }, { score: 4.5, density: 0.12 }, { score: 5, density: 0.05 },
      ],
      sim2: [
        { score: 1, density: 0.04 }, { score: 1.5, density: 0.06 }, { score: 2, density: 0.12 },
        { score: 2.5, density: 0.18 }, { score: 3, density: 0.30 }, { score: 3.5, density: 0.38 },
        { score: 4, density: 0.42 }, { score: 4.5, density: 0.25 }, { score: 5, density: 0.10 },
      ],
    },
  },
  ratingSummary: {
    sim1: { avg: 3.42, satisfaction: 31.0 },
    sim2: { avg: 3.81, satisfaction: 54.5 },
  },
  // 지표 3: 시간대별 트래픽
  hourlyTraffic: [
    { slot: '아침(07)', sim1: 8, sim2: 12 },
    { slot: '점심(12)', sim1: 52, sim2: 68 },
    { slot: '저녁(18)', sim1: 48, sim2: 72 },
    { slot: '야식(22)', sim1: 34, sim2: 37 },
  ],
  peakSlot: { sim1: '점심(12)', sim2: '저녁(18)' },
  // 지표 4: 세대별 증감
  generation: [
    { gen: 'Z1', sim1: 12.5, sim2: 18.2 },
    { gen: 'Z2', sim1: 28.3, sim2: 31.5 },
    { gen: 'Y', sim1: 35.2, sim2: 30.1 },
    { gen: 'X', sim1: 18.0, sim2: 14.8 },
    { gen: 'S', sim1: 6.0, sim2: 5.4 },
  ],
  // 지표 5: 방문 목적
  purpose: [
    { type: '생활베이스형', sim1Pct: 42.3, sim2Pct: 35.8, sim1Sat: 3.2, sim2Sat: 3.9 },
    { type: '사적모임형', sim1Pct: 25.1, sim2Pct: 32.4, sim1Sat: 3.5, sim2Sat: 4.1 },
    { type: '공적모임형', sim1Pct: 18.7, sim2Pct: 19.0, sim1Sat: 3.4, sim2Sat: 3.7 },
    { type: '가족모임형', sim1Pct: 13.9, sim2Pct: 12.8, sim1Sat: 3.6, sim2Sat: 3.8 },
  ],
  // 지표 6: 재방문율
  retention: {
    sim1Agents: 68, sim2Agents: 89,
    retained: 42, newUsers: 47, churned: 26,
    retentionRate: 61.8, newRatio: 52.8,
  },
  // 지표 9: 에이전트 유형
  agentType: [
    { type: '유동', sim1: 58.2, sim2: 52.3 },
    { type: '상주', sim1: 41.8, sim2: 47.7 },
  ],
  // 지표 10: 성별 구성
  gender: [
    { label: '남', sim1: 45.2, sim2: 42.8 },
    { label: '여', sim1: 38.5, sim2: 41.6 },
    { label: '혼성', sim1: 16.3, sim2: 15.6 },
  ],
  // 지표 7: 경쟁 매장 비교 — 항목별 원본 단위 막대그래프용
  radar: [
    { metric: '방문수', unit: '명', target_before: 142, target_after: 189, comp1: 210, comp2: 165, comp3: 130 },
    { metric: '평점', unit: '점', target_before: 3.42, target_after: 3.81, comp1: 3.65, comp2: 3.90, comp3: 3.30 },
    { metric: '재방문율', unit: '%', target_before: 31, target_after: 44, comp1: 38, comp2: 42, comp3: 28 },
    { metric: '만족도', unit: '%', target_before: 31, target_after: 55, comp1: 45, comp2: 52, comp3: 35 },
    { metric: 'Z세대비율', unit: '%', target_before: 41, target_after: 50, comp1: 55, comp2: 48, comp3: 32 },
  ],
  radarStores: { comp1: '오시 망원본점', comp2: '마마무식당', comp3: '홍익돈까스' },
  // 지표 11: 크로스탭 (세대 × 방문목적) — 비율
  crosstab: {
    generations: ['Z1', 'Z2', 'Y', 'X', 'S'],
    purposes: ['생활베이스형', '사적모임형', '공적모임형', '가족모임형'],
    sim2: [
      [30, 40, 20, 10],
      [25, 35, 25, 15],
      [40, 20, 25, 15],
      [45, 15, 20, 20],
      [50, 10, 15, 25],
    ],
  },
  // 지표 8: LLM 요약
  // ═══ 역효과 감지 데이터 ═══
  sideEffects: [
    { type: 'warning', metric: 'Y세대 방문 비중', change: -5.1, unit: '%p', detail: '2인 세트 메뉴 도입이 1인 직장인(Y세대) 방문을 감소시킬 수 있음' },
    { type: 'warning', metric: '점심 시간대 트래픽', change: -12, unit: '%', detail: '피크타임이 저녁으로 전환되며 점심 매출 공백 발생 위험' },
    { type: 'watch', metric: '가성비 인식', change: -0.3, unit: '점', detail: '인테리어 개선 후 "비싸 보인다"는 인식이 소폭 증가' },
  ],
  tradeoffs: [
    { gain: 'Z세대(Z1+Z2) 유입', gainVal: '+8.9%p', loss: 'Y세대 이탈', lossVal: '-5.1%p' },
    { gain: '사적모임형 방문', gainVal: '+7.3%p', loss: '생활베이스형 감소', lossVal: '-6.5%p' },
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
  llmSummary: `**전략의 효과 분석**\n\n전략 적용 후 '류진'의 방문 수는 +33.1%로 유의미한 증가를 보였습니다. 평균 평점은 3.42점에서 3.81점으로 0.39점 상승하였으며, 만족도(4점 이상)는 31.0%에서 54.5%로 23.5%p 급증하였습니다.\n\n**바뀐 주 고객층의 특성**\n\nZ세대(Z1+Z2) 비율이 40.8%에서 49.7%로 확대되며 젊은 고객층 유입이 두드러졌습니다. 사적모임형 방문이 25.1%→32.4%로 증가하며, 데이트·모임 수요를 성공적으로 흡수했습니다.\n\n**재방문율 및 고객 충성도**\n\n기존 고객 유지율 61.8%로 양호하며, 신규 유입 47명이 이탈 26명을 크게 상회합니다. 장기 충성도 강화를 위해 포인트/쿠폰 제도 도입을 권장합니다.\n\n**향후 권장 사항**\n\n1. 저녁 시간대 집중 프로모션으로 신규 피크타임 매출을 극대화하세요.\n2. Z세대 타겟 SNS 마케팅(인스타감성, 분위기맛집)을 지속 강화하세요.\n3. 점심 시간대 방문 유지를 위해 직장인 대상 신속 서비스 유지가 필요합니다.`,
};

// 워드클라우드 시각화 컴포넌트
const WordCloudVisual = ({ keywords, label, accentColor }) => {
  const maxWeight = Math.max(...keywords.map(k => k.weight));
  return (
    <div className="flex-1">
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${accentColor === 'gray' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-[140px] p-4 rounded-xl bg-gray-50/50">
        {keywords.map((kw, i) => {
          const ratio = kw.weight / maxWeight;
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

const YReportView = () => {
  const d = yReportMockData;
  const [activeRatingTab, setActiveRatingTab] = useState('taste');

  // KDE 차트 데이터 결합
  const ratingLabels = { taste: '맛', value: '가성비', atmosphere: '분위기' };
  const currentRating = d.ratingDistribution[activeRatingTab];
  const kdeChartData = currentRating.sim1.map((s1, i) => ({
    score: s1.score,
    sim1: s1.density,
    sim2: currentRating.sim2[i].density,
  }));

  // 만족도 바 차트 데이터
  const satisfactionData = Object.keys(d.ratingDistribution).map(key => {
    const s1Scores = d.ratingDistribution[key].sim1;
    const s2Scores = d.ratingDistribution[key].sim2;
    const s1Sat = s1Scores.filter(s => s.score >= 4).reduce((a, b) => a + b.density, 0);
    const s2Sat = s2Scores.filter(s => s.score >= 4).reduce((a, b) => a + b.density, 0);
    const s1Total = s1Scores.reduce((a, b) => a + b.density, 0);
    const s2Total = s2Scores.reduce((a, b) => a + b.density, 0);
    return {
      name: ratingLabels[key],
      sim1: Math.round((s1Sat / s1Total) * 100),
      sim2: Math.round((s2Sat / s2Total) * 100),
    };
  });

  const visitChange = ((d.overview.sim2.totalVisits - d.overview.sim1.totalVisits) / d.overview.sim1.totalVisits * 100).toFixed(1);
  const shareChange = (d.overview.sim2.marketShare - d.overview.sim1.marketShare).toFixed(2);
  const avgChange = (d.ratingSummary.sim2.avg - d.ratingSummary.sim1.avg).toFixed(2);
  const satChange = (d.ratingSummary.sim2.satisfaction - d.ratingSummary.sim1.satisfaction).toFixed(1);

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
              <p className="text-white text-3xl font-bold font-space">{d.riskScore.score}<span className="text-lg text-gray-400">/100</span></p>
              <p className={`text-xs font-bold ${d.riskScore.score <= 30 ? 'text-emerald-400' : d.riskScore.score <= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {d.riskScore.level}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {/* 게이지 바 */}
          <div className="mb-4">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${d.riskScore.score <= 30 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : d.riskScore.score <= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                style={{ width: `${d.riskScore.score}%` }}
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
              <p className="text-xl font-bold text-emerald-600">{d.riskScore.positive}</p>
              <p className="text-[10px] text-emerald-600 font-bold">순기능</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
              <AlertCircle size={18} className="text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-amber-600">{d.riskScore.watch}</p>
              <p className="text-[10px] text-amber-600 font-bold">관찰 필요</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
              <AlertTriangle size={18} className="text-red-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-red-600">{d.riskScore.negative}</p>
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
            <p className="text-2xl font-bold text-gray-400">{d.overview.sim1.totalVisits}건</p>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm shadow-emerald-50">
            <p className="text-xs text-emerald-600 font-medium mb-1">총 방문 수 (후)</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-emerald-600">{d.overview.sim2.totalVisits}건</p>
              <ChangeBadge value={parseFloat(visitChange)} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-1">시장 점유율 (전)</p>
            <p className="text-2xl font-bold text-gray-400">{d.overview.sim1.marketShare}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm shadow-emerald-50">
            <p className="text-xs text-emerald-600 font-medium mb-1">시장 점유율 (후)</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-emerald-600">{d.overview.sim2.marketShare}%</p>
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
            <p className="text-xl font-bold text-gray-600">{d.ratingSummary.sim1.avg}점 → <span className="text-emerald-600">{d.ratingSummary.sim2.avg}점</span></p>
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
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-700">
              <strong>💡 인사이트:</strong> 전략 전 <span className="font-bold">#웨이팅길다</span>(14회)가 상위 키워드였으나, 전략 후 <span className="font-bold">#원격줄서기</span>(19회), <span className="font-bold">#분위기맛집</span>(22회)으로 전환. 솔루션이 고객 인식에 직접 반영됨.
            </p>
          </div>
        </div>
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
            <p className="text-2xl font-bold text-cyan-600">{d.retention.retained}명</p>
            <p className="text-xs text-cyan-500 font-bold mt-1">유지율 {d.retention.retentionRate}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm text-center">
            <p className="text-xs text-emerald-600 mb-1">신규 유입</p>
            <p className="text-2xl font-bold text-emerald-600">{d.retention.newUsers}명</p>
            <p className="text-xs text-emerald-500 font-bold mt-1">Sim2의 {d.retention.newRatio}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm text-center">
            <p className="text-xs text-red-500 mb-1">이탈 (Churn)</p>
            <p className="text-2xl font-bold text-red-500">{d.retention.churned}명</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 p-5 rounded-xl border border-cyan-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">순 증가</p>
            <p className="text-2xl font-bold text-gray-900">+{d.retention.newUsers - d.retention.churned}명</p>
            <p className="text-xs text-gray-400 mt-1">{d.retention.sim1Agents} → {d.retention.sim2Agents} 에이전트</p>
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
          <div className="p-6">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-sm text-gray-700 leading-relaxed mb-4">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              }}
            >
              {d.llmSummary}
            </ReactMarkdown>
          </div>
        </div>
      </div>
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
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    // Logic to mark previous steps as complete
    const steps = ['dashboard', 'verification', 'x-report', 'simulation', 'simulation_map', 'y-report'];
    const idx = steps.indexOf(tab);
    setCompletedSteps(steps.slice(0, idx));
  };

  /* --- Data Loading --- */
  const { stats, stores } = realData;
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const selectedStoreData = stores.find(s => s.id === selectedStoreId) || stores[0];
  const [selectedSolutions, setSelectedSolutions] = useState([]); // Lifted state for selected solutions

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      changeTab('verification');
    }, 1500);
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

    switch (activeTab) {
      case 'dashboard': return (
        <DashboardView
          stats={stats}
          stores={stores}
          onAnalyze={handleAnalyze}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />
      );
      case 'verification': return (
        <VerificationView
          data={selectedStoreData}
          onVerified={() => changeTab('x-report')}
          onBack={() => changeTab('dashboard')}
        />
      );
      case 'x-report': return (
        <XReportView
          data={selectedStoreData}
          onNext={() => changeTab('simulation')}
          selectedSolutions={selectedSolutions}
          onSelectSolution={setSelectedSolutions}
        />
      );
      case 'simulation': return (
        <SimulationView
          data={selectedStoreData}
          onComplete={() => changeTab('simulation_map')}
          selectedSolutions={selectedSolutions}
        />
      );
      case 'simulation_map': return (
        <SimulationMap
          storeData={selectedStoreData}
          onComplete={() => changeTab('y-report')}
        />
      );
      case 'mypage': return (
        <MyPageView
          data={selectedStoreData}
          onBack={() => changeTab('dashboard')}
          onManageMembership={() => setActiveTab('pricing')}
        />
      );
      case 'y-report': return <YReportView />;
      case 'pricing': return <PricingView />;
      default: return (
        <DashboardView
          stats={stats}
          stores={stores}
          onAnalyze={handleAnalyze}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />
      );
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
        <div className="p-8 pb-4">
          <div className="mb-10 cursor-pointer group" onClick={() => changeTab('dashboard')}>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Lovelop"
                className="h-24 w-auto transform group-hover:scale-105 transition-all duration-300"
                style={{ filter: 'invert(21%) sepia(100%) saturate(3501%) hue-rotate(352deg) brightness(97%) contrast(92%)' }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-3 tracking-wide pl-1">AI가 실험해주는 내 가게의 미래</p>
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
