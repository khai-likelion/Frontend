import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    FileText,
    BarChart2,
    TrendingUp,
    ChevronRight,
    Printer,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Shield,
    ArrowDownRight,
    ArrowUpRight,
    Sparkles,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { yReportMockData } from '../data/mock_y_report';

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

const YReport = () => {
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

            {/* 리스크 스코어 섹션 */}
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
                    <div className="mb-4">
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${d.riskScore.score <= 30 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : d.riskScore.score <= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                                style={{ width: `${d.riskScore.score}%` }}
                            ></div>
                        </div>
                    </div>
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

            {/* 역효과 및 트레이드오프 상세 (생략 가능하나 기능 유지를 위해 포함) */}
            <div className="space-y-6">
                {/* ... (Trade-off 및 LLM Summary는 App.jsx 로직과 동일) ... */}
                {/* 실제 App.jsx에서 추출한 전체 JSX 코드를 여기에 삽입 */}
                {/* 시뮬레이션 분석 지표 상세 */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-8 space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">시뮬레이션 분석 지표</h2>
                        <p className="text-sm text-gray-500">기본 방문 지표부터 평점 분포, 시간대별 트래픽까지 상세 비교 데이터를 제공합니다.</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">총 방문수</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{d.overview.sim2.totalVisits}</span>
                                <span className="text-sm text-gray-400 pb-1">명</span>
                                <ChangeBadge value={visitChange} />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">마켓 쉐어</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{d.overview.sim2.marketShare}%</span>
                                <ChangeBadge value={shareChange} suffix="pt" />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">평균 평점</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{d.ratingSummary.sim2.avg}</span>
                                <ChangeBadge value={avgChange} suffix="" />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">긍정 만족도</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">{d.ratingSummary.sim2.satisfaction}%</span>
                                <ChangeBadge value={satChange} suffix="pt" />
                            </div>
                        </div>
                    </div>

                    {/* Keywords WordCloud */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare className="text-emerald-500" size={20} /> 키워드 변화 분석
                        </h3>
                        <div className="flex flex-col lg:flex-row gap-8">
                            <WordCloudVisual keywords={d.keywords.sim1} label="적용 전 (Sim 1)" accentColor="gray" />
                            <div className="flex items-center justify-center">
                                <ChevronRight size={32} className="text-gray-300 hidden lg:block" />
                            </div>
                            <WordCloudVisual keywords={d.keywords.sim2} label="적용 후 (Sim 2)" accentColor="emerald" />
                        </div>
                    </div>

                    {/* Rating KDE Chart & Satisfaction Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">평점 분포 비교 (KDE)</h3>
                                <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
                                    {Object.keys(ratingLabels).map(key => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveRatingTab(key)}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeRatingTab === key ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {ratingLabels[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={kdeChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="score" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="sim1" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.1} strokeWidth={2} name="Sim 1" />
                                        <Area type="monotone" dataKey="sim2" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} name="Sim 2" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-lg font-bold mb-6">긍정 답변 비중 (4점 이상)</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={satisfactionData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="sim1" fill="#d1d5db" radius={[0, 4, 4, 0]} barSize={20} name="적용 전" />
                                        <Bar dataKey="sim2" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="적용 후" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Traffic Chart */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">시간대별 트래픽 변화</h3>
                            <div className="text-xs text-gray-400">
                                피크 시간대: <span className="font-bold text-gray-600">{d.peakSlot.sim1}</span> → <span className="font-bold text-emerald-600">{d.peakSlot.sim2}</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={d.hourlyTraffic}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="slot" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="sim1" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Sim 1" />
                                    <Bar dataKey="sim2" fill="#10b981" radius={[4, 4, 0, 0]} name="Sim 2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* LLM 종합 평가 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Sparkles size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">종합 평가 — AI Summary (GPT-5.2)</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
        </div>
    );
};

export default YReport;
