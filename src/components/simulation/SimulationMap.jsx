import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AgentMarker } from './AgentMarker';
import { ArrowRight, MapPin, TrendingUp, Zap } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MANGWON_COORDS = {
    latitude: 37.556,
    longitude: 126.906,
    zoom: 15,
    pitch: 60,
    bearing: -17.6,
};

// ── 한강 북안 실제 위도 (망원/합정 기준 — 이 아래가 한강) ──
const ACTUAL_RIVER_LAT = 37.543;

// ── 에이전트가 진입 불가한 위도를 동적으로 계산 ──
// 매장이 강에서 멀면 경계를 신경 쓸 필요 없음
function getRiverBoundary(centerLat) {
    // 매장이 한강에서 충분히 멀면 (500m+), 경계 제한 없음
    if (centerLat > ACTUAL_RIVER_LAT + 0.006) return Infinity;
    // 매장이 한강 근처면, 실제 강 위도를 경계로 사용
    return ACTUAL_RIVER_LAT;
}

// ── 에이전트 생성: 극좌표 기반 원형 분포 ──
function spawnAgent(id, centerLat, centerLng) {
    const isResident = Math.random() < 0.5;
    const type = isResident ? 'resident' : 'floating';

    // resident: 매장 반경 ~200m 이내 / floating: ~400m 이내
    const maxRadius = isResident ? 0.002 : 0.004;
    const riverBound = getRiverBoundary(centerLat);

    let lat, lng;
    let attempts = 0;

    // 안전 영역 내에 생성될 때까지 재시도 (클램핑 X)
    do {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.sqrt(Math.random()) * maxRadius; // sqrt로 균일 분포
        lat = centerLat + radius * Math.sin(angle);
        lng = centerLng + radius * Math.cos(angle) * 1.25; // 경도 보정 (위도에 따른 비율)
        attempts++;
    } while (lat >= riverBound && attempts < 20);

    // 만약 20번 시도 후에도 한강 위면, 남쪽으로 배치
    if (lat >= riverBound) {
        lat = centerLat - Math.random() * maxRadius;
    }

    // 목적지 생성
    const target = generateTarget(centerLat, centerLng, type);

    // 에이전트별 이동 속도 다양성 (0.3 ~ 1.0)
    const moveSpeed = 0.3 + Math.random() * 0.7;

    return {
        id,
        type,
        lat,
        lng,
        targetLat: target.lat,
        targetLng: target.lng,
        moveSpeed,
        name: `Agent-${id}`,
        info: isResident ? '상주 고객 (Resident)' : '유동 고객 (Floating)',
    };
}

// ── 목적지 생성 (안전 영역 내) ──
function generateTarget(centerLat, centerLng, type) {
    const maxRadius = type === 'resident' ? 0.002 : 0.004;
    const riverBound = getRiverBoundary(centerLat);
    let lat, lng;
    let attempts = 0;

    do {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.sqrt(Math.random()) * maxRadius;
        lat = centerLat + radius * Math.sin(angle);
        lng = centerLng + radius * Math.cos(angle) * 1.25;
        attempts++;
    } while (lat >= riverBound && attempts < 20);

    if (lat >= riverBound) {
        lat = centerLat - Math.random() * maxRadius;
    }

    return { lat, lng };
}

// ── lerp 보간 이동 ──
function lerp(current, target, t) {
    return current + (target - current) * t;
}

const AGENT_COUNT = 160;

export default function SimulationMap({ storeData, onComplete }) {
    const [viewState, setViewState] = useState({
        ...MANGWON_COORDS,
        latitude: storeData?.lat || MANGWON_COORDS.latitude,
        longitude: storeData?.lng || MANGWON_COORDS.longitude,
    });

    useEffect(() => {
        if (storeData) {
            setViewState(prev => ({
                ...prev,
                latitude: storeData.lat,
                longitude: storeData.lng,
                zoom: 15,
                transitionDuration: 1000,
            }));
            setAgents([]);
        }
    }, [storeData]);

    const [agents, setAgents] = useState([]);
    const [simTime, setSimTime] = useState(new Date());

    // ── 시뮬레이션 상태: 'running' → 'done' ──
    const [simStatus, setSimStatus] = useState('running');
    const [statusText, setStatusText] = useState('시뮬레이션 중입니다...');

    // ── 5초 후 시뮬레이션 완료 타이머 ──
    useEffect(() => {
        const textTimer = setTimeout(() => {
            setStatusText('완료되면 알려드릴게요!');
        }, 2000);

        const doneTimer = setTimeout(() => {
            setSimStatus('done');
            setStatusText('최종 보고서가 준비되었습니다!');
        }, 5000);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(doneTimer);
        };
    }, []);

    // ── 메인 시뮬레이션 루프 (simStatus === 'running'일 때만 이동) ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (simStatus === 'done') return; // 완료되면 이동 중지

            setSimTime(prevTime => new Date(prevTime.getTime() + 1000));

            setAgents(prevAgents => {
                const centerLat = storeData?.lat || 37.556;
                const centerLng = storeData?.lng || 126.906;

                if (prevAgents.length === 0) {
                    return Array.from({ length: AGENT_COUNT }).map((_, i) =>
                        spawnAgent(i, centerLat, centerLng)
                    );
                }

                const lerpSpeed = 0.02;

                return prevAgents.map(agent => {
                    const t = lerpSpeed * agent.moveSpeed;
                    let newLat = lerp(agent.lat, agent.targetLat, t);
                    let newLng = lerp(agent.lng, agent.targetLng, t);

                    newLat += (Math.random() - 0.5) * 0.00003;
                    newLng += (Math.random() - 0.5) * 0.00003;

                    const distToTarget = Math.sqrt(
                        Math.pow(newLat - agent.targetLat, 2) +
                        Math.pow(newLng - agent.targetLng, 2)
                    );

                    let targetLat = agent.targetLat;
                    let targetLng = agent.targetLng;

                    if (distToTarget < 0.0001) {
                        const newTarget = generateTarget(centerLat, centerLng, agent.type);
                        targetLat = newTarget.lat;
                        targetLng = newTarget.lng;
                    }

                    return {
                        ...agent,
                        lat: newLat,
                        lng: newLng,
                        targetLat,
                        targetLng,
                    };
                });
            });
        }, 100);

        return () => clearInterval(interval);
    }, [simStatus, storeData]);

    const formattedTime = simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const markers = useMemo(() => ([
        ...agents.map(agent => (
            <AgentMarker key={agent.id} agent={agent} />
        )),

        storeData && (
            <Marker
                key="store-marker"
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
    ]), [agents, storeData]);

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

                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                    scrollZoom={false}
                    doubleClickZoom={false}
                    touchZoomRotate={false}
                >
                    {markers}
                </Map>

                {/* Simulation Info Overlay — 좌측 상단 */}
                <div className="absolute top-4 left-4 bg-black/70 text-white p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl min-w-[260px]">
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

                        {/* 에이전트 타입 범례 */}
                        <div className="flex gap-4 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></span>
                                상주 고객
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_#3B82F6]"></span>
                                유동 고객
                            </span>
                        </div>

                        {/* 시뮬레이션 상태 표시 */}
                        <div className="pt-4 border-t border-white/10">
                            {simStatus === 'running' ? (
                                <div className="text-center space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white/20 border-t-green-400 rounded-full animate-spin"></div>
                                        <span className="text-sm font-bold text-green-400 animate-pulse">{statusText}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">Y-Report 생성을 위해 데이터를 수집하고 있습니다</p>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-green-400 mb-1">✅ {statusText}</div>
                                    </div>
                                    <button
                                        onClick={onComplete}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        최종 보고서 보러 가기 <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
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
