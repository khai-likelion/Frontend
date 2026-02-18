import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AgentMarker } from './AgentMarker';

// Fallback to empty string if not set, user will need to add it later
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MANGWON_COORDS = {
    latitude: 37.556,
    longitude: 126.906,
    zoom: 15,
    pitch: 60, // 3D effect
    bearing: -17.6,
};

export default function SimulationMap() {
    const [viewState, setViewState] = useState(MANGWON_COORDS);
    const [agents, setAgents] = useState([]);
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    // Mock Data Generation (Temporary)
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());

            // Simulate moving agents
            setAgents(prevAgents => {
                if (prevAgents.length === 0) {
                    // Initialize random agents
                    return Array.from({ length: 50 }).map((_, i) => ({
                        id: i,
                        type: i % 2 === 0 ? 'resident' : 'floating',
                        lat: 37.556 + (Math.random() - 0.5) * 0.01,
                        lng: 126.906 + (Math.random() - 0.5) * 0.01,
                        name: `Agent-${i}`,
                        info: i % 2 === 0 ? 'Resident (Z-Gen)' : 'Floating (Tourist)',
                    }));
                }

                // Move existing agents slightly
                return prevAgents.map(agent => ({
                    ...agent,
                    lat: agent.lat + (Math.random() - 0.5) * 0.0001,
                    lng: agent.lng + (Math.random() - 0.5) * 0.0001,
                }));
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const markers = useMemo(() => agents.map(agent => (
        <AgentMarker key={agent.id} agent={agent} />
    )), [agents]);

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
            <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-md border border-white/10">
                <h3 className="text-lg font-bold">Mangwon Digital Twin</h3>
                <div className="text-sm text-gray-300">
                    <p>Time: <span className="font-mono text-green-400">{time}</span></p>
                    <p>Active Agents: <span className="font-mono text-blue-400">{agents.length}</span></p>
                </div>
            </div>
        </div>
    );
}
