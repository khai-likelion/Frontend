import React, { useState, useEffect } from 'react';
import {
    Search,
    CheckCircle,
    MapPin,
    Zap,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

const StatCard = ({ label, value, subtext, icon: Icon, trend, trendValue }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
                <Icon size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-900 font-space tracking-tight">{value}</h3>
            <p className="text-gray-400 text-xs font-medium">{label}</p>
            <div className="pt-2 border-t border-gray-50 mt-2">
                <p className="text-[10px] text-gray-400 leading-tight">{subtext}</p>
            </div>
        </div>
    </div>
);

const Dashboard = ({ stats, stores, onAnalyze, selectedStoreId, onSelectStore }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

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

    const filteredStores = searchTerm.length >= 2
        ? stores.filter(store =>
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (store.address && store.address.includes(searchTerm))
        )
        : [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-space tracking-tight mb-2">로벨롭 대시보드</h1>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">Step 1</span>
                        <p className="text-gray-500 text-sm">AI 기반 소상공인 솔루션 플랫폼 — 망원동 상권 <span className="text-gray-900 font-bold">{stores.length}개 매장 데이터 보유</span></p>
                    </div>
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

export default Dashboard;
