import React from 'react';
import { Marker } from 'react-map-gl/mapbox';

export function AgentMarker({ agent }) {
    const isResident = agent.type === 'resident';
    const color = isResident ? '#10B981' : '#3B82F6'; // Green for resident, Blue for floating
    const size = isResident ? 10 : 8; // 상주 고객이 약간 더 큼

    return (
        <Marker longitude={agent.lng} latitude={agent.lat} anchor="center">
            <div className="group relative">
                {/* The Agent Dot — CSS transition으로 위치 변경 시 부드럽게 */}
                <div
                    className="rounded-full border border-white/30 transition-all duration-100 ease-linear"
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}80`,
                        opacity: 0.85,
                    }}
                />

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-36 bg-black/80 text-white text-xs p-2 rounded pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-gray-300">{agent.info}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                </div>
            </div>
        </Marker>
    );
}
