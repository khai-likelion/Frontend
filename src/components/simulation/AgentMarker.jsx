import React from 'react';
import { Marker } from 'react-map-gl/mapbox';

export function AgentMarker({ agent }) {
    const isResident = agent.type === 'resident';
    const color = isResident ? '#10B981' : '#3B82F6';
    const size = isResident ? 7 : 6; // 더 작게 — 건물 겹침 시각적 완화

    return (
        <Marker longitude={agent.lng} latitude={agent.lat} anchor="center">
            <div
                className="rounded-full transition-all duration-100 ease-linear"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                    boxShadow: `0 0 5px ${color}60`,
                    opacity: 0.55,
                }}
            />
        </Marker>
    );
}
