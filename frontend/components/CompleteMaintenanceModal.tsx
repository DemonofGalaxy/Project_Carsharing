'use client';

import React, { useState } from 'react';
import { CarResponseDto } from '@/types';
import { BYPlate } from './BYPlate';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    car: CarResponseDto | null;
    onSubmit: (actualCost?: number) => Promise<void>;
}

export function CompleteMaintenanceModal({ isOpen, onClose, car, onSubmit }: Props) {
    const [actualCost, setActualCost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !car) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(actualCost ? parseFloat(actualCost) : undefined);
            setActualCost('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">

            {/* КАРТОЧКА МОДАЛКИ */}
            <div className="relative w-full max-w-md rounded-3xl bg-[#18191E]/95 border border-white/[0.12] p-6 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200">

                {/* ВЕРХНЯЯ ЧАСТЬ */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center text-[#30D158]">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Завершение ремонта</h3>
                            <p className="text-[10px] text-[#86868B]">Выпуск автомобиля на линию</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#86868B] hover:text-white transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* АВТОМОБИЛЬ */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-[#86868B] block">{car.brand}</span>
                        <span className="text-sm font-bold text-white">{car.model}</span>
                    </div>
                    <BYPlate plate={car.plateNumber} />
                </div>

                {/* ФОРМА ФАКТИЧЕСКИХ ЗАТРАТ */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1.5">
                            Итоговая фактическая стоимость работ (BYN)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={actualCost}
                            onChange={(e) => setActualCost(e.target.value)}
                            placeholder="Например: 245.50"
                            className="w-full h-10 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#30D158] focus:bg-white/[0.08] transition-all font-mono"
                        />
                        <p className="text-[10px] text-[#86868B] mt-1.5">
                            Сумма будет учтена бухгалтерией в чистой прибыли автопарка
                        </p>
                    </div>

                    {/* КНОПКИ */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-all"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !actualCost}
                            className="h-9 px-5 rounded-xl bg-[#30D158] hover:bg-[#30D158]/90 disabled:opacity-50 text-black text-xs font-bold shadow-lg shadow-[#30D158]/25 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : null}
                            Выпустить на линию
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}