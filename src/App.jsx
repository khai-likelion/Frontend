import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';
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

const DashboardView = ({ stats, stores, onAnalyze, selectedStoreId, onSelectStore }) => (
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
        <div className="flex-1 space-y-2 w-full">
          <label className="text-gray-300 text-sm font-medium">분석할 매장 선택 ({stores.length}개 매장 데이터 보유)</label>
          <div className="relative group">
            <select
              value={selectedStoreId}
              onChange={(e) => onSelectStore(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm group-hover:bg-white/15 appearance-none cursor-pointer"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id} className="text-gray-900">
                  {store.name}
                </option>
              ))}
            </select>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" size={20} />
          </div>
        </div>
        <button
          onClick={onAnalyze}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/30 whitespace-nowrap hover:shadow-red-900/50 hover:-translate-y-0.5"
        >
          <Zap size={18} fill="currentColor" />
          AI 분석 시작
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="분석 매장 수" value={stats.storeCount} subtext="망원동 전체 카페·음식점" icon={TrendingUp} trend="up" trendValue="12%" />
      <StatCard label="평균 감성 점수" value={stats.avgSentiment} subtext="상권 평균 대비 우수" icon={Zap} trend="up" trendValue="5.2%" />
      <StatCard label="시뮬레이션 에이전트" value={stats.totalAgents} subtext="가상 페르소나 기반 검증" icon={Users} trend="up" trendValue="Live" />
      <StatCard label="평균 객단가" value={stats.avgRevenue} subtext="개선 잠재력 보유" icon={DollarSign} trend="up" trendValue="9%" />
    </div>
  </div>
);

// --- Real Data Import ---
import realData from './data/real_data.json';

const XReportView = ({ data, onNext }) => {
  const [selectedMetric, setSelectedMetric] = useState(data.radarData[0]);

  // Update selectedMetric when data changes (e.g. store switching)
  useEffect(() => {
    setSelectedMetric(data.radarData[0]);
  }, [data]);

  return (
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
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">종합 등급</div>
            <div className="text-4xl font-bold font-space text-gray-900">A<span className="text-lg text-gray-400 font-normal ml-1">/ S</span></div>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">상위</div>
            <div className="text-4xl font-bold font-space text-red-600">5%</div>
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
                  {data.keywords.slice(0, 8).map(k => (
                    <span key={k} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{k}</span>
                  ))}
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

          <div className="flex items-center justify-between pt-4">
            <h4 className="font-bold text-gray-900">추천 필살기 (Solutions)</h4>
            <button onClick={onNext} className="flex items-center gap-2 text-red-600 font-medium hover:underline">
              전체 시뮬레이션으로 이동 <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-md cursor-pointer transition-all group">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">접점 확대</span>
                <Play size={16} className="text-gray-300 group-hover:text-red-500" />
              </div>
              <div className="font-bold text-gray-900 mb-1">영업일 확장 전략</div>
              <div className="text-xs text-gray-500">주 2회 → 주 4회 변경 시</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">공간 효율</span>
                <Play size={16} className="text-gray-300 group-hover:text-blue-500" />
              </div>
              <div className="font-bold text-gray-900 mb-1">테이블 회전 최적화</div>
              <div className="text-xs text-gray-500">피크타임 이용 제한 도입 시</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Component: Interactive Simulation Lab ---
const SimulationView = ({ onComplete }) => {
  const [days, setDays] = useState(3);
  const [turnover, setTurnover] = useState(1.2);
  const [marketing, setMarketing] = useState(50);

  // Simple calculation for visual effect
  const predictedRevenue = Math.floor(3500000 + (days * 500000) + (turnover * 800000) + (marketing * 1000));
  const baseRevenue = 3500000;
  const growth = ((predictedRevenue - baseRevenue) / baseRevenue * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight">Interactive Lab</h1>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">실험실</span>
          </div>
          <p className="text-gray-500 text-sm">변수를 직접 조정하여 미래 매출을 예측해보세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sliders size={18} /> 변수 설정
            </h3>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">주간 영업일 수</label>
                  <span className="text-sm font-bold text-red-600">{days}일</span>
                </div>
                <input
                  type="range" min="1" max="7" step="1" value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1일</span><span>7일</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">테이블 회전율 (목표)</label>
                  <span className="text-sm font-bold text-blue-600">{turnover}회</span>
                </div>
                <input
                  type="range" min="0.5" max="3.0" step="0.1" value={turnover}
                  onChange={(e) => setTurnover(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">마케팅 예산 (월)</label>
                  <span className="text-sm font-bold text-gray-900">{marketing}만원</span>
                </div>
                <input
                  type="range" min="0" max="200" step="10" value={marketing}
                  onChange={(e) => setMarketing(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
              </div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            이 설정으로 최종 리포트 생성 <ArrowRight size={18} />
          </button>
        </div>

        {/* Real-time Preview */}
        <div className="lg:col-span-8 bg-gray-50 p-8 rounded-2xl border border-gray-200 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

          <div className="text-center z-10 space-y-2 mb-10">
            <h4 className="text-gray-500 font-medium">예상 월 매출</h4>
            <div className="text-6xl font-bold font-space text-gray-900 tracking-tighter">
              ₩{predictedRevenue.toLocaleString()}
            </div>
            <div className={`text-lg font-bold ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center justify-center gap-1`}>
              {Number(growth) >= 0 ? <TrendingUp size={20} /> : <TrendingUp size={20} className="rotate-180" />}
              현재 대비 {growth}% {Number(growth) >= 0 ? '성장' : '하락'} 예상
            </div>
          </div>

          <div className="w-full h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: '1주', current: 100, predicted: 100 + (growth / 4) },
                { name: '2주', current: 105, predicted: 105 + (growth / 3) },
                { name: '3주', current: 110, predicted: 110 + (growth / 2) },
                { name: '4주', current: 108, predicted: 108 + (growth / 1.5) },
              ]}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E42313" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#E42313" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="predicted" stroke="#E42313" fillOpacity={1} fill="url(#colorPred)" strokeWidth={3} />
                <Area type="monotone" dataKey="current" stroke="#9ca3af" fillOpacity={0} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">회색 점선: 현재 추이 / 붉은 실선: 시뮬레이션 예측</p>
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

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    // Logic to mark previous steps as complete
    const steps = ['dashboard', 'x-report', 'simulation', 'y-report'];
    const idx = steps.indexOf(tab);
    setCompletedSteps(steps.slice(0, idx));
  };

  /* --- Data Loading --- */
  const { stats, stores } = realData;
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const selectedStoreData = stores.find(s => s.id === selectedStoreId) || stores[0];

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      changeTab('x-report');
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
      case 'x-report': return (
        <XReportView
          data={selectedStoreData}
          onNext={() => changeTab('simulation')}
        />
      );
      case 'simulation': return <SimulationView onComplete={() => changeTab('y-report')} />;
      case 'y-report': return <YReportView />;
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

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col bg-white z-10 hidden md:flex">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2.5 text-red-600 mb-10 cursor-pointer" onClick={() => changeTab('dashboard')}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-white font-bold text-lg">l</span>
            </div>
            <span className="text-xl font-bold font-space text-gray-900 tracking-tight">lovelop</span>
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
              icon={Play}
              label="시뮬레이션"
              active={activeTab === 'simulation'}
              onClick={() => changeTab('simulation')}
            />
            <SidebarItem
              icon={BarChart2}
              label="Y-Report"
              active={activeTab === 'y-report'}
              onClick={() => changeTab('y-report')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
            <div className="text-xs font-bold text-gray-400 mb-2">CREDITS</div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">240 / 500</span>
              <span className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">Charge</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-red-500 h-full w-[48%]"></div>
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
          <StepCard number="3" title="시뮬레이션" completed={completedSteps.includes('simulation')} active={activeTab === 'simulation'} onClick={() => changeTab('simulation')} />
          <ChevronRight className="text-gray-300 flex-shrink-0 self-center" size={16} />
          <StepCard number="4" title="Y-Report" completed={completedSteps.includes('y-report')} active={activeTab === 'y-report'} onClick={() => changeTab('y-report')} />
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
