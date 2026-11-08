'use client';

import React from 'react';

export function BYPlate({ plate }: { plate: string }) {
    const clean = plate.trim();
    const parts = clean.split(/[- ]/);
    const main = parts[0] + (parts[1] ? ` ${parts[1]}` : '');
    const region = parts[2] || '7';

    return (
        <div className="inline-flex items-center h-[24px] bg-[#E5E5EA] text-[#1D1D1F] rounded-[4px] px-2 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.6)] font-mono select-none">
            <div className="flex items-center gap-1 pr-1.5 mr-1.5 border-r border-black/20">
                <div className="flex flex-col w-2.5 h-2 rounded-[0.5px] overflow-hidden border border-black/10">
                    <div className="bg-[#D22630] h-[60%]" />
                    <div className="bg-[#009245] h-[40%]" />
                </div>
                <span className="text-[8px] font-extrabold tracking-tighter text-[#1D1D1F]">BY</span>
            </div>
            <span className="text-[11px] font-black tracking-normal text-[#1D1D1F]">
        {main}
      </span>
            <span className="text-[11px] font-bold text-[#1D1D1F]/70 ml-1">
        -{region}
      </span>
        </div>
    );
}