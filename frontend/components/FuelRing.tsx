'use client';

import React from 'react';

export function FuelRing({ level, size = 68 }: { level: number; size?: number }) {
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(level, 0), 100);
    const offset = circumference - (clamped / 100) * circumference;

    const color = clamped <= 15 ? '#FF453A' : clamped <= 30 ? '#FF9F0A' : '#30D158';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        filter: `drop-shadow(0 0 6px ${color}66)`,
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-black tracking-tight tabular-nums text-white">
          {clamped}
        </span>
                <span className="text-[8px] font-bold text-[#86868B] -mt-0.5">%</span>
            </div>
        </div>
    );
}