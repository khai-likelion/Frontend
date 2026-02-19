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
  Sparkles // Added Sparkles icon
} from 'lucide-react';
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

const MyPageView = ({ data, onBack }) => {
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
            <button className="w-full bg-white text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6 text-red-600">
          <Zap size={32} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 font-space mb-2">장사 돋보기</h2>
        <p className="text-gray-500">지능형 상권 분석 솔루션</p>
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
        <h2 className="text-2xl font-bold text-gray-900 font-space mb-2">회원가입</h2>
        <p className="text-gray-500">사장님의 성공 파트너, 장사 돋보기</p>
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
          <MessageSquare size={20} fill="currentColor" />
          카카오톡으로 시작하기
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

const YReportView = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Header */}
    <div className="flex justify-between items-end border-b border-gray-100 pb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">Y-Report: 결과 예측</h1>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">최종 분석</span>
        </div>
        <p className="text-gray-500 text-sm">설정된 변수(영업일 4일, 회전율 1.2) 기반 예측 리포트</p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black">
          <Printer size={16} /> PDF 저장
        </button>
      </div>
    </div>

    {/* Before & After Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Before */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-70">
        <div className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded mb-6">BEFORE</div>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-500 text-sm">총 방문 수</span>
            <span className="text-xl font-bold text-gray-900">127회</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-500 text-sm">추정 매출</span>
            <span className="text-xl font-bold text-gray-900">₩951,995</span>
          </div>
        </div>
      </div>

      {/* After */}
      <div className="bg-white p-6 rounded-2xl border-2 border-green-500 shadow-xl shadow-green-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">Optimized</div>
        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-6">AFTER</div>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">총 방문 수</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">189회</span>
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">+48.8%</span>
            </div>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">추정 매출</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">₩1,417,905</span>
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">+49%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Conclusion Banner */}
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <CheckCircle className="text-green-400" size={20} />
          성장 로드맵이 준비되었습니다.
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed opacity-90">
          사장님께서 설정하신 전략대로 실행할 경우,
          다음 달 예상 순수익은 약 <strong>+120만원</strong> 증가할 것으로 보입니다.
        </p>
      </div>
      <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 whitespace-nowrap">
        실행 계획서 보기
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

const PricingView = () => {
  const plans = [
    { credits: 10, price: '4,900원', color: 'bg-blue-50', text: 'text-blue-600' },
    { credits: 30, price: '12,900원', color: 'bg-purple-50', text: 'text-purple-600', popular: true },
    { credits: 50, price: '21,900원', color: 'bg-red-50', text: 'text-red-600' },
    { credits: 100, price: '39,900원', color: 'bg-gray-900', text: 'text-white' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 font-space">요금제 선택</h1>
        <p className="text-gray-500">로벨롭의 AI 분석을 위한 크레딧을 충전하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${plan.color === 'bg-gray-900' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-lg shadow-gray-100 hover:border-red-500'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            <div className={`w-12 h-12 rounded-2xl ${plan.color} ${plan.text} flex items-center justify-center mb-6`}>
              <Zap size={24} fill={plan.color === 'bg-gray-900' ? 'white' : 'currentColor'} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.credits} Credits</h3>
            <div className={`text-3xl font-black font-space mb-8 ${plan.color === 'bg-gray-900' ? 'text-white' : 'text-gray-900'}`}>{plan.price}</div>

            <ul className={`space-y-3 mb-10 flex-1 ${plan.color === 'bg-gray-900' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> AI X-Report 생성</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 시뮬레이션 무제한 테스트</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 실시간 상권 데이터 반영</li>
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.color === 'bg-gray-900' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}`}>
              구매하기
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">엔터프라이즈 맞춤형 플랜</h4>
          <p className="text-sm text-gray-500">프랜차이즈 본사 및 다점포 사장님을 위한 대용량 플랜이 필요하신가요?</p>
        </div>
        <button className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
          문의하기 <ArrowRight size={18} />
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 text-white transform group-hover:rotate-12 transition-all duration-300">
                <Sparkles size={20} fill="currentColor" className="text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold font-space text-gray-900 tracking-tight">Lovelop</span>
              </div>
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
