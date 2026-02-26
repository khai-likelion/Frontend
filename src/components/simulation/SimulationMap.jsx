import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AgentMarker } from './AgentMarker';
import { ArrowRight, MapPin } from 'lucide-react';
import { useJobPolling } from '../../hooks/useJobPolling';

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

export default function SimulationMap({ storeData, onComplete, jobId, onRetry, timeoutMs = 2 * 60 * 60 * 1000, maxRetries = Infinity }) {
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

    // ── 시뮬레이션 상태: 'running' → 'done' | 'error' ──
    const [simStatus, setSimStatus] = useState('running');
    const [statusText, setStatusText] = useState('시뮬레이션 중입니다...');
    const [pollError, setPollError] = useState(null);
    const [simResultId, setSimResultId] = useState(null);
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const [lastPolledAt, setLastPolledAt] = useState(null);

    // ── 5초 후 상태 텍스트 업데이트 (항상) ──
    useEffect(() => {
        const textTimer = setTimeout(() => {
            setStatusText('완료되면 알려드릴게요!');
        }, 5000);
        return () => clearTimeout(textTimer);
    }, []);

    // ── 데모 폴백 타이머 (jobId가 없을 때만) ──
    useEffect(() => {
        if (jobId) return;
        const doneTimer = setTimeout(() => {
            setSimStatus('done');
            setStatusText('최종 보고서가 준비되었습니다!');
        }, 3000);
        return () => clearTimeout(doneTimer);
    }, [jobId]);

    // ── 실제 잡 폴링 (jobId가 있을 때) ──
    const { attempt } = useJobPolling(jobId, {
        enabled: !!jobId && pollingEnabled,
        timeoutMs,
        maxRetries,
        onCompleted: (resultId) => {
            setSimResultId(resultId);
            setSimStatus('done');
            setStatusText('최종 보고서가 준비되었습니다!');
            // Auto-advance after 1.5s so user doesn't miss the small overlay button
            setTimeout(() => onComplete(resultId), 1500);
        },
        onFailed: (message, code) => {
            if (code === 'TIMEOUT' || code === 'MAX_RETRIES_EXCEEDED') {
                setSimStatus('timeout');
                setStatusText('예상보다 오래 걸리고 있습니다.');
            } else {
                setPollError(message);
                setSimStatus('error');
                setStatusText('시뮬레이션 오류가 발생했습니다.');
            }
        },
    });

    // ── lastPolledAt: 폴링 시도마다 갱신 ──
    useEffect(() => {
        if (attempt > 0) setLastPolledAt(new Date());
    }, [attempt]);

    // ── 계속 대기: pollingEnabled false → true 토글로 훅 재시작 ──
    useEffect(() => {
        if (!pollingEnabled) {
            const t = setTimeout(() => setPollingEnabled(true), 100);
            return () => clearTimeout(t);
        }
    }, [pollingEnabled]);

    const handleContinueWaiting = useCallback(() => {
        setSimStatus('running');
        setStatusText('계속 대기 중입니다...');
        setPollingEnabled(false);
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
                                    {jobId && (
                                        <p className="text-[9px] text-gray-600">
                                            Job #{jobId} · 폴링 {attempt}회
                                        </p>
                                    )}
                                    {lastPolledAt && (
                                        <p className="text-[9px] text-gray-600">
                                            마지막 확인: {lastPolledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            ) : simStatus === 'timeout' ? (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-yellow-400 mb-1">⏱ {statusText}</div>
                                        <p className="text-[10px] text-gray-400">시뮬레이션이 아직 진행 중일 수 있습니다.</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={handleContinueWaiting}
                                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-xl text-xs font-bold transition-all"
                                        >
                                            계속 대기
                                        </button>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                새로고침
                                            </button>
                                            <button
                                                onClick={onRetry || handleContinueWaiting}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                다시 시도
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : simStatus === 'error' ? (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-red-400 mb-1">❌ {statusText}</div>
                                    </div>
                                    {pollError && (
                                        <p className="text-[10px] text-red-300 text-center">{pollError}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-green-400 mb-1">✅ {statusText}</div>
                                    </div>
                                    <button
                                        onClick={() => onComplete(simResultId)}
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
        </div>
    );
}
