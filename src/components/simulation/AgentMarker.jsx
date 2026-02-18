import React from 'react';
import { Marker } from 'react-map-gl/mapbox';

export function AgentMarker({ agent }) {
    const color = agent.type === 'resident' ? '#10B981' : '#3B82F6'; // Green for resident, Blue for floating

    return (
        <Marker longitude={agent.lng} latitude={agent.lat} anchor="bottom">
            <div className="group relative">
                {/* The Agent Dot */}
                <div
                    className="w-3 h-3 rounded-full shadow-lg border border-white/20 transition-transform duration-300 ease-in-out"
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`,
                    }}
                />

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 bg-black/80 text-white text-xs p-2 rounded pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-gray-300">{agent.info}</div>
                    {/* Triangle Pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                </div>
            </div>
        </Marker>
    );
}
