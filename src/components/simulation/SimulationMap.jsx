import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AgentMarker } from './AgentMarker';
import { ArrowRight, MapPin, TrendingUp, Zap } from 'lucide-react';

// Fallback to empty string if not set, user will need to add it later
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MANGWON_COORDS = {
    latitude: 37.556,
    longitude: 126.906,
    zoom: 15,
    pitch: 60, // 3D effect
    bearing: -17.6,
};

export default function SimulationMap({ storeData, onComplete }) {
    const [viewState, setViewState] = useState({
        ...MANGWON_COORDS,
        latitude: storeData?.lat || MANGWON_COORDS.latitude,
        longitude: storeData?.lng || MANGWON_COORDS.longitude,
    });

    // Update viewState when storeData changes
    useEffect(() => {
        if (storeData) {
            setViewState(prev => ({
                ...prev,
                latitude: storeData.lat,
                longitude: storeData.lng,
                zoom: 15, // Reset zoom or keep current? Let's reset to ensure visibility
                transitionDuration: 1000 // Smooth fly-to
            }));
            // Reset agents to force regeneration at new location
            setAgents([]);
        }
    }, [storeData]);
    const [agents, setAgents] = useState([]);
    const [speed, setSpeed] = useState(1); // 1x, 10x, 60x, etc.
    const [simTime, setSimTime] = useState(new Date());

    // Mock Data Generation (Temporary)
    useEffect(() => {
        const interval = setInterval(() => {
            // Increment simulation time based on speed
            setSimTime(prevTime => new Date(prevTime.getTime() + 1000 * speed));

            // Simulate moving agents
            setAgents(prevAgents => {
                const centerLat = storeData?.lat || 37.556;
                const centerLng = storeData?.lng || 126.906;
                // 한강 경계 — 실제 한강 북안 기준 위도
                // 매장 위치에 상관없이 항상 이 값 이상으로 진입 불가
                const ACTUAL_RIVER_LAT = 37.5625;
                // 매장이 한강에 가까울수록 경계선을 매장 기준으로 약간 남쪽으로 당겨낌
                const RIVER_BOUNDARY_LAT = Math.min(ACTUAL_RIVER_LAT, centerLat - 0.002);

                if (prevAgents.length === 0) {
                    // Initialize random agents (160 agents for simulation)
                    return Array.from({ length: 160 }).map((_, i) => {
                        // 남쪽 편향 — 매장 주변 상권에 밀집 (-0.6 편향으로 더 남쪽에 분산)
                        const lat = centerLat + (Math.random() - 0.6) * 0.012;
                        const lng = centerLng + (Math.random() - 0.5) * 0.015;
                        return {
                            id: i,
                            type: i % 2 === 0 ? 'resident' : 'floating',
                            lat: Math.min(lat, RIVER_BOUNDARY_LAT),
                            lng,
                            name: `Agent-${i}`,
                            info: i % 2 === 0 ? 'Resident (Z-Gen)' : 'Floating (Tourist)',
                        };
                    });
                }

                // Move existing agents — 한강 넘어가지 않도록 클램핑
                const movementScale = 0.0001 * (1 + Math.log10(speed));
                return prevAgents.map(agent => {
                    const newLat = agent.lat + (Math.random() - 0.5) * movementScale;
                    const newLng = agent.lng + (Math.random() - 0.5) * movementScale;
                    return {
                        ...agent,
                        lat: Math.min(newLat, RIVER_BOUNDARY_LAT),
                        lng: newLng,
                    };
                });
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [speed, storeData]);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("시뮬레이션 중입니다...");

    useEffect(() => {
        console.log("[Lovelop] SimulationMap mounted - loading starts");
        const textTimer = setTimeout(() => {
            setLoadingText("완료되면 알려드릴게요!");
        }, 1500);

        const loadingTimer = setTimeout(() => {
            console.log("[Lovelop] SimulationMap loading finished");
            setIsLoading(false);
        }, 3000);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(loadingTimer);
        };
    }, []);

    const formattedTime = simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const markers = useMemo(() => ([
        // Moving Agents
        ...agents.map(agent => (
            <AgentMarker key={agent.id} agent={agent} />
        )),

        // Selected Store Marker (Red Pin)
        storeData && (
            <Marker
                key="store-marker" // Added a key for the store marker
                latitude={storeData.lat}
                longitude={storeData.lng}
                anchor="bottom"
            >
                <div className="flex flex-col items-center">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1 shadow-lg whitespace-nowrap border border-white">
                        {storeData.name}
                    </div>
                    <div className="relative">
                        <MapPin size={32} className="text-red-600 fill-white stroke-[2.5px] drop-shadow-md" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full blur-[1px] opacity-50" />
                    </div>
                </div>
            </Marker>
        )
    ]), [agents, storeData]); // Added storeData to dependency array

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center p-8 border border-red-500 rounded-lg bg-gray-800">
                    <h2 className="text-2xl font-bold mb-4">⚠️ Mapbox Token Required</h2>
                    <p className="mb-4">Please add VITE_MAPBOX_TOKEN to your .env file.</p>
                    <a
                        href="https://account.mapbox.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        Get a token from Mapbox
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Map Container */}
            <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-gray-100 shadow-2xl">
                {/* 3초 로딩 오바레이 - 확실한 반영 확인을 위해 z-index와 배경 강화 */}
                {isLoading && (
                    <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                        <div className="relative mb-8">
                            <div className="w-20 h-20 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 font-space tracking-tight animate-pulse">
                            {loadingText}
                        </h2>
                        <p className="text-gray-400 text-sm">망원동 디지털 트윈 엔진 가동 중...</p>
                    </div>
                )}

                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                >
                    <NavigationControl position="top-right" />
                    {markers}
                </Map>

                {/* Simulation Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/70 text-white p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl min-w-[240px]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold font-space tracking-tight">Mangwon Digital Twin</h3>
                            <p className="text-xs text-gray-400">Generative Agents Simulation</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-sm text-gray-400">Current Time</span>
                            <span className="font-mono text-xl font-bold text-green-400">{formattedTime}</span>
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-sm text-gray-400">Total Agents</span>
                            <span className="font-mono text-xl font-bold text-blue-400">{agents.length}</span>
                        </div>

                        <div className="pt-2">
                            <div className="text-[10px] font-bold text-gray-500 mb-2 tracking-widest uppercase">Simulation Speed</div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 10, 60].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSpeed(s)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${speed === s
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                            }`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={onComplete}
                                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                            >
                                결과 리포트 보기 <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 동종 업계 성공 사례 - 지도 아래 독립 섹션 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                {/* 섹션 헤더 */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp size={16} className="text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">동종 업계 성공 사례</h3>
                        <p className="text-xs text-gray-400">망원동 인근 유사 업종의 개선 전략 및 성과</p>
                    </div>
                </div>

                {/* 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 성공 사례 1 */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full border border-green-100 tracking-wide">성공 사례 01</span>
                            <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp size={14} />
                                <span className="text-[11px] font-bold">+35%</span>
                            </div>
                        </div>
                        <h4 className="text-gray-900 font-bold text-base mb-1.5 group-hover:text-green-600 transition-colors">오시 망원본점</h4>
                        <p className="text-gray-500 text-xs leading-relaxed mb-3">
                            인스타 감성 인테리어 + 디지털 웨이팅 도입으로 <span className="text-green-600 font-semibold">Z세대 방문 +35%</span>, 재방문율 42% 달성
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100 font-medium">#SNS바이럴</span>
                            <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100 font-medium">#디지털웨이팅</span>
                            <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100 font-medium">#공간개선</span>
                        </div>
                    </div>

                    {/* 성공 사례 2 */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 tracking-wide">성공 사례 02</span>
                            <div className="flex items-center gap-1 text-blue-600">
                                <Zap size={14} />
                                <span className="text-[11px] font-bold">+28%</span>
                            </div>
                        </div>
                        <h4 className="text-gray-900 font-bold text-base mb-1.5 group-hover:text-blue-600 transition-colors">마마무식당 합정점</h4>
                        <p className="text-gray-500 text-xs leading-relaxed mb-3">
                            프리미엄 런치 세트 구성 + 가족 테이블 확대로 <span className="text-blue-600 font-semibold">점심 매출 +28%</span>, 고객 만족도 4.2점 기록
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 font-medium">#런치세트</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 font-medium">#가족고객</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 font-medium">#메뉴개편</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
