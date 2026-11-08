'use client';

import React, { useState } from 'react';
import { CarResponseDto } from '@/types';
import { BYPlate } from './BYPlate';
import { Wrench, X, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    car: CarResponseDto | null;
    onSubmit: (description: string, estimatedCost?: number) => Promise<void>;
}

export function StartMaintenanceModal({ isOpen, onClose, car, onSubmit }: Props) {
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !car) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(
                description.trim(),
                cost ? parseFloat(cost) : undefined
            );
            setDescription('');
            setCost('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">

            {/* КАРТОЧКА МОДАЛКИ (ТИХОЕ МАТОВОЕ СТЕКЛО) */}
            <div className="relative w-full max-w-md rounded-3xl bg-[#18191E]/95 border border-white/[0.12] p-6 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200">

                {/* ВЕРХНЯЯ ЧАСТЬ */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/30 flex items-center justify-center text-[#BF5AF2]">
                            <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Заказ-наряд на СТО</h3>
                            <p className="text-[10px] text-[#86868B]">Перевод авто в сервисный режим</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#86868B] hover:text-white transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ДАННЫЕ ВЫБРАННОГО АВТОМОБИЛЯ */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-[#86868B] block">{car.brand}</span>
                        <span className="text-sm font-bold text-white">{car.model}</span>
                    </div>
                    <BYPlate plate={car.plateNumber} />
                </div>

                {/* ФОРМА ВВОДА */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1.5">
                            Причина ремонта / Описание работ *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Например: Замена тормозных колодок, плановое ТО-2..."
                            className="w-full p-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#BF5AF2] focus:bg-white/[0.08] transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1.5">
                            Ориентировочная стоимость (BYN)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#BF5AF2] focus:bg-white/[0.08] transition-all"
                        />
                    </div>

                    {/* КНОПКИ ДЕЙСТВИЯ */}
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
                            disabled={isSubmitting || !description.trim()}
                            className="h-9 px-5 rounded-xl bg-[#BF5AF2] hover:bg-[#BF5AF2]/90 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#BF5AF2]/25 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Отправить на СТО
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}