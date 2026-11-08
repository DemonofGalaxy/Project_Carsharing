'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRentals } from '@/hooks/useRentals';
import { CarResponseDto, RentalResponseDto } from '@/types';
import { BYPlate } from '@/components/BYPlate';
import { FuelRing } from '@/components/FuelRing';
import {
    Zap, Fuel, MapPin, Gauge, Shield, ArrowLeft,
    CheckCircle, Clock, XCircle, Play, StopCircle
} from 'lucide-react';

const MOCK_AVAILABLE_CARS: CarResponseDto[] = [
    { id: 1, brand: 'Volkswagen', model: 'Polo VI', plateNumber: '5678 BX-7', status: 'AVAILABLE', fuelLevel: 65, mileAge: 48200, location: 'пр-т Победителей, 9', pricePerMinute: 0.35, isActive: true },
    { id: 4, brand: 'Geely', model: 'Coolray Flagship', plateNumber: '1234 AB-7', status: 'AVAILABLE', fuelLevel: 84, mileAge: 12500, location: 'ул. Немига, 5', pricePerMinute: 0.45, isActive: true },
];

export default function DriveClientPage() {
    const { availableCars: realCars, reserveCar, startRide, endRide, cancelReservation } = useRentals(1);
    const cars = realCars.length > 0 ? realCars : MOCK_AVAILABLE_CARS;

    // Состояния активного бронирования и поездки
    const [activeReservation, setActiveReservation] = useState<{ id: number; car: CarResponseDto; secondsLeft: number } | null>(null);
    const [activeTrip, setActiveTrip] = useState<{ id: number; car: CarResponseDto; elapsedSeconds: number } | null>(null);

    // Таймер 15 минут брони
    useEffect(() => {
        if (!activeReservation) return;
        const interval = setInterval(() => {
            setActiveReservation((prev) => {
                if (!prev || prev.secondsLeft <= 1) return null;
                return { ...prev, secondsLeft: prev.secondsLeft - 1 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [activeReservation]);

    // Таймер активной поездки (секундомер + расчет цены)
    useEffect(() => {
        if (!activeTrip) return;
        const interval = setInterval(() => {
            setActiveTrip((prev) => prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTrip]);

    // Хэндлеры для Spring Boot
    const handleReserve = async (car: CarResponseDto) => {
        try {
            const res = await reserveCar(car.id);
            setActiveReservation({ id: res?.id || 101, car, secondsLeft: 15 * 60 });
        } catch {
            setActiveReservation({ id: 101, car, secondsLeft: 15 * 60 }); // Демо-фоллбэк
        }
    };

    const handleStartTrip = async () => {
        if (!activeReservation) return;
        const car = activeReservation.car;
        try {
            const res = await startRide(car.id);
            setActiveReservation(null);
            setActiveTrip({ id: res?.id || 202, car, elapsedSeconds: 0 });
        } catch {
            setActiveReservation(null);
            setActiveTrip({ id: 202, car, elapsedSeconds: 0 });
        }
    };

    const handleEndTrip = async () => {
        if (!activeTrip) return;
        try {
            await endRide({ rentalId: activeTrip.id, tariffName: 'minuteTariffStrategy' });
        } finally {
            setActiveTrip(null);
        }
    };

    const handleCancelReservation = async () => {
        if (!activeReservation) return;
        try {
            await cancelReservation(activeReservation.id);
        } finally {
            setActiveReservation(null);
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="relative min-h-screen w-full bg-[#121316] text-[#F5F5F7] p-6 sm:p-10 select-none overflow-x-hidden font-sans">

            {/* АВРОРА: Фоновые блики */}
            <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#0A84FF]/12 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-[#30D158]/8 blur-[150px]" />

            {/* ШАПКА КЛИЕНТА */}
            <div className="max-w-5xl mx-auto flex items-center justify-between pb-8 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center gap-2 text-xs font-semibold text-white transition-all backdrop-blur-md"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> В штаб флота
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Доступные автомобили</h1>
                        <p className="text-xs text-[#86868B]">Минск • Бесплатная бронь 15 минут</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_6px_#30D158]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
            {cars.length} авто на линии
          </span>
                </div>
            </div>

            {/* ДИНАМИЧЕСКИЙ ОСТРОВОК: АКТИВНАЯ БРОНЬ (Apple Dynamic Island) */}
            {activeReservation && !activeTrip && (
                <div className="max-w-5xl mx-auto mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#FF9F0A]/20 via-[#FF9F0A]/10 to-transparent border border-[#FF9F0A]/30 backdrop-blur-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A]/20 flex items-center justify-center text-[#FF9F0A]">
                            <Clock className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9F0A]">Автомобиль забронирован</span>
                            <h3 className="text-lg font-bold text-white">
                                {activeReservation.car.brand} {activeReservation.car.model}
                            </h3>
                            <p className="text-xs text-[#86868B]">Бесплатное ожидание: <strong className="text-white font-mono">{formatTime(activeReservation.secondsLeft)}</strong></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleCancelReservation}
                            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                        >
                            <XCircle className="h-4 w-4 text-[#FF453A]" /> Отменить
                        </button>
                        <button
                            onClick={handleStartTrip}
                            className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-white text-black hover:bg-[#E5E5EA] text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Play className="h-4 w-4 fill-black" /> Начать поездку
                        </button>
                    </div>
                </div>
            )}

            {/* ДИНАМИЧЕСКИЙ ОСТРОВОК: АКТИВНАЯ ПОЕЗДКА (HUD ТАЙМЕРА И СУММЫ) */}
            {activeTrip && (
                <div className="max-w-5xl mx-auto mt-6 p-6 rounded-3xl bg-gradient-to-r from-[#0A84FF]/25 via-[#0A84FF]/10 to-transparent border border-[#0A84FF]/40 backdrop-blur-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#0A84FF] text-white flex items-center justify-center shadow-lg shadow-[#0A84FF]/40">
                            <Zap className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A84FF]">Поездка активна</span>
                            </div>
                            <h3 className="text-xl font-black text-white mt-0.5">
                                {activeTrip.car.brand} {activeTrip.car.model}
                            </h3>
                            <p className="text-xs text-[#86868B]">{activeTrip.car.plateNumber} • Тариф {activeTrip.car.pricePerMinute} BYN/мин</p>
                        </div>
                    </div>

                    {/* ЖИВОЙ СЧЁТЧИК РУБЛЕЙ И ВРЕМЕНИ */}
                    <div className="flex items-center gap-8 bg-black/30 border border-white/[0.08] px-6 py-3 rounded-2xl">
                        <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-[#86868B] block">Время</span>
                            <span className="text-xl font-black text-white font-mono tracking-tight">
                {formatTime(activeTrip.elapsedSeconds)}
              </span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/[0.1]" />
                        <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-[#86868B] block">К оплате</span>
                            <span className="text-xl font-black text-[#30D158] tabular-nums">
                {(Math.ceil(activeTrip.elapsedSeconds / 60) * activeTrip.car.pricePerMinute).toFixed(2)}{' '}
                                <span className="text-xs text-[#86868B] font-normal">BYN</span>
              </span>
                        </div>
                    </div>

                    <button
                        onClick={handleEndTrip}
                        className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#FF453A] hover:bg-[#FF453A]/90 text-white text-xs font-black shadow-lg shadow-[#FF453A]/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <StopCircle className="h-4 w-4" /> Завершить поездку
                    </button>
                </div>
            )}

            {/* СЕТКА ДОСТУПНЫХ АВТОМОБИЛЕЙ */}
            <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {cars.map((car) => (
                    <div
                        key={car.id}
                        className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-6 shadow-xl hover:border-white/[0.16] transition-all flex flex-col justify-between h-[280px]"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">{car.brand}</span>
                                    <h3 className="text-2xl font-black tracking-tight text-white mt-0.5">{car.model}</h3>
                                    <div className="mt-2.5">
                                        <BYPlate plate={car.plateNumber} />
                                    </div>
                                </div>
                                <FuelRing level={car.fuelLevel} size={64} />
                            </div>

                            <div className="mt-6 flex items-center gap-4 text-xs text-[#86868B]">
                <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">
                  <MapPin className="h-3.5 w-3.5 text-[#0A84FF]" /> {car.location}
                </span>
                                <span className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">
                  <Gauge className="h-3.5 w-3.5" /> {car.mileAge.toLocaleString('ru-RU')} км
                </span>
                            </div>
                        </div>

                        {/* НИЖНЯЯ ПАНЕЛЬ: ТАРИФ + КНОПКА БРОНИ */}
                        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                            <div>
                                <span className="text-[9px] uppercase font-bold text-[#86868B] block">Тариф</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white tabular-nums">{Number(car.pricePerMinute).toFixed(2)}</span>
                                    <span className="text-xs text-[#86868B]">BYN/мин</span>
                                </div>
                            </div>

                            <button
                                disabled={!!activeReservation || !!activeTrip}
                                onClick={() => handleReserve(car)}
                                className={`h-10 px-5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md ${
                                    activeReservation || activeTrip
                                        ? 'bg-white/[0.04] text-[#86868B] border border-white/[0.06] cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-[#E5E5EA]'
                                }`}
                            >
                                Забронировать
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}