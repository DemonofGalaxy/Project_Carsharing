'use client';

import React, { useState } from 'react';
import { CarCreateDto } from '@/types';
import { BYPlate } from './BYPlate';
import { PlusCircle, X, Loader2, Car, Sparkles } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (dto: CarCreateDto) => Promise<void>;
}

export function CreateCarModal({ isOpen, onClose, onSubmit }: Props) {
    const [formData, setFormData] = useState<CarCreateDto>({
        brand: '',
        model: '',
        plateNumber: '',
        pricePerMinute: 0.40,
        fuelLevel: 100,
        mileAge: 0,
        location: 'Минск, Центральный паркинг',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.brand || !formData.model || !formData.plateNumber) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                pricePerMinute: Number(formData.pricePerMinute),
                fuelLevel: Number(formData.fuelLevel),
                mileAge: Number(formData.mileAge),
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">

            {/* МАТОВЫЙ СТЕКЛЯННЫЙ КОРПУС */}
            <div className="relative w-full max-w-lg rounded-3xl bg-[#18191E]/95 border border-white/[0.12] p-6 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200">

                {/* ШАПКА */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
                            <Car className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Добавить новый автомобиль</h3>
                            <p className="text-[10px] text-[#86868B]">Регистрация транспортного средства в базе флота</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#86868B] hover:text-white transition-all cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ЖИВОЙ ПРЕДПРОСМОТР НОМЕРА ПРИ ВВОДЕ */}
                <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-[#86868B] block">Предпросмотр</span>
                        <span className="text-sm font-bold text-white">
              {formData.brand || 'Марка'} {formData.model || 'Модель'}
            </span>
                    </div>
                    <BYPlate plate={formData.plateNumber || '0000 AA-7'} />
                </div>

                {/* ФОРМА */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Марка *</label>
                            <input
                                required
                                type="text"
                                placeholder="Например: Geely"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Модель *</label>
                            <input
                                required
                                type="text"
                                placeholder="Например: Monjaro"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Госномер *</label>
                            <input
                                required
                                type="text"
                                placeholder="7777 AB-7"
                                value={formData.plateNumber}
                                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all font-mono uppercase"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Тариф (BYN/мин) *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.45"
                                value={formData.pricePerMinute}
                                onChange={(e) => setFormData({ ...formData, pricePerMinute: parseFloat(e.target.value) || 0 })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Бак / Заряд (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.fuelLevel}
                                onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Начальный пробег (км)</label>
                            <input
                                type="number"
                                value={formData.mileAge}
                                onChange={(e) => setFormData({ ...formData, mileAge: parseInt(e.target.value) || 0 })}
                                className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-[#86868B] uppercase block mb-1">Локация</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full h-9 px-3 text-xs rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-[#0A84FF] transition-all"
                        />
                    </div>

                    {/* КНОПКИ */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-all cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-9 px-5 rounded-xl bg-white text-black hover:bg-[#E5E5EA] text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                            Добавить в парк
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}