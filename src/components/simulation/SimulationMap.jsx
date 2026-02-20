import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AgentMarker } from './AgentMarker';
import { ArrowRight, MapPin } from 'lucide-react';

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
                // 한강 경계 — 이 위도보다 북쪽은 강이므로 에이전트 진입 금지
                const RIVER_BOUNDARY_LAT = 37.5615;

                if (prevAgents.length === 0) {
                    // Initialize random agents (160 agents for simulation)
                    return Array.from({ length: 160 }).map((_, i) => {
                        // 남쪽으로 더 넓게, 북쪽은 한강 경계까지만
                        const lat = centerLat + (Math.random() - 0.6) * 0.015;
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
        <div className="relative w-full h-screen">
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
    );
}
