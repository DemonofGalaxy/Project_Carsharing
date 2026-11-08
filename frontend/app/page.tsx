'use client';

import { CreateCarModal } from '@/components/CreateCarModal';
import { useMaintenance } from '@/hooks/useMaintenance';
import { StartMaintenanceModal } from '@/components/StartMaintenanceModal';
import { CompleteMaintenanceModal } from '@/components/CompleteMaintenanceModal';
import React, { useState } from 'react';
import { useCars } from '@/hooks/useCars';
import { CarResponseDto, CarStatus } from '@/types';
import { BYPlate } from '@/components/BYPlate';
import { FuelRing } from '@/components/FuelRing';
import {
    Fuel, Gauge, MapPin, Search, Power,
    Radio, X, AlertTriangle, User, ChevronDown, ShieldCheck, LogOut, Sparkles,
    Link, Wrench
} from 'lucide-react';

const MOCK_CARS: CarResponseDto[] = [
    { id: 1, brand: 'Volkswagen', model: 'Polo VI', plateNumber: '5678 BX-7', status: 'AVAILABLE', fuelLevel: 65, mileAge: 48200, location: 'пр-т Победителей, 9', pricePerMinute: 0.35, isActive: true },
    { id: 2, brand: 'Tesla', model: 'Model 3 Performance', plateNumber: '9999 MI-7', status: 'RENTED', fuelLevel: 92, mileAge: 8100, location: 'ТЦ Дана Молл', pricePerMinute: 0.89, isActive: true },
    { id: 3, brand: 'Kia', model: 'Rio X-Line', plateNumber: '1122 TT-7', status: 'MAINTENANCE', fuelLevel: 14, mileAge: 95000, location: 'СТО Малиновка', pricePerMinute: 0.30, isActive: false },
    { id: 4, brand: 'Geely', model: 'Coolray Flagship', plateNumber: '1234 AB-7', status: 'AVAILABLE', fuelLevel: 84, mileAge: 12500, location: 'ул. Немига, 5', pricePerMinute: 0.45, isActive: true },
    { id: 5, brand: 'BMW', model: '320d xDrive M-Sport', plateNumber: '7711 MH-7', status: 'BLOCKED', fuelLevel: 8, mileAge: 34000, location: 'ул. Зыбицкая, 2', pricePerMinute: 0.75, isActive: false },
];

export default function FleetPage() {
    const { startMaintenance, completeMaintenance, records } = useMaintenance();
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Горячая клавиша: нажатие Ctrl + K сразу фокусирует поиск
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const { cars: realCars, activateCar, deactivateCar, updateStatus, createCar } = useCars();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const cars = realCars.length > 0 ? realCars : MOCK_CARS;


    const [selectedCar, setSelectedCar] = useState<CarResponseDto | null>(null);
    const [filter, setFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const filteredCars = cars.filter((c) => {
        const matchesFilter = filter === 'ALL' || c.status === filter;
        const matchesSearch =
            c.brand.toLowerCase().includes(search.toLowerCase()) ||
            c.model.toLowerCase().includes(search.toLowerCase()) ||
            c.plateNumber.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const availableCount = cars.filter(c => c.status === 'AVAILABLE').length;
    const rentedCount = cars.filter(c => c.status === 'RENTED').length;
    const lowFuelCount = cars.filter(c => c.fuelLevel < 20).length;

    const statusBadges: Record<CarStatus, { label: string; dot: string; glow: string; text: string }> = {
        AVAILABLE: { label: 'Свободен', dot: 'bg-[#30D158]', glow: 'shadow-[0_0_8px_#30D158]', text: 'text-[#30D158]' },
        RENTED: { label: 'В поездке', dot: 'bg-[#0A84FF]', glow: 'shadow-[0_0_8px_#0A84FF]', text: 'text-[#0A84FF]' },
        RESERVED: { label: 'Бронь', dot: 'bg-[#FF9F0A]', glow: 'shadow-[0_0_8px_#FF9F0A]', text: 'text-[#FF9F0A]' },
        MAINTENANCE: { label: 'Сервис', dot: 'bg-[#BF5AF2]', glow: 'shadow-[0_0_8px_#BF5AF2]', text: 'text-[#BF5AF2]' },
        BLOCKED: { label: 'Блок', dot: 'bg-[#FF453A]', glow: 'shadow-[0_0_8px_#FF453A]', text: 'text-[#FF453A]' },
    };

    return (
        <div className="relative flex h-screen w-full bg-[#121316] text-[#F5F5F7] overflow-hidden select-none font-sans">

            {/* АВРОРА: Мягкие световые пятна, дающие эффект объема сквозь стекло */}
            <div className="pointer-events-none absolute -top-32 left-1/4 h-[550px] w-[550px] rounded-full bg-[#0A84FF]/15 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-[-100px] right-1/3 h-[450px] w-[450px] rounded-full bg-[#BF5AF2]/12 blur-[150px]" />
            <div className="pointer-events-none absolute top-1/2 left-10 h-[300px] w-[300px] rounded-full bg-[#30D158]/8 blur-[130px]" />

            {/* ОСНОВНАЯ ЧАСТЬ СО СТЕКЛОМ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-white/[0.08] backdrop-blur-3xl bg-white/[0.02]">

                {/* ВЕРХНЯЯ ШАПКА: ЧИСТАЯ И БЕЗ ЛИШНЕГО */}
                <header className="h-16 px-8 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.04] backdrop-blur-2xl shrink-0 z-20">

                    {/* СЛЕВА: ЛОГОТИП + КНОПКА ВОДИТЕЛЯ */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#30D158] shadow-[0_0_8px_#30D158]" />
              </span>
                            <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                                Nexus Fleet Command
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.href = '/drive'}
                            className="h-9 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center gap-2 text-xs font-semibold text-white transition-all backdrop-blur-md shrink-0 cursor-pointer"
                        >

                            <span>Режим водителя</span>
                        </button>
                    </div>

                    {/* КНОПКА ДОБАВЛЕНИЯ АВТОМОБИЛЯ */}
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-9 px-3.5 rounded-xl bg-white text-black hover:bg-[#E5E5EA] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                        <span className="text-sm leading-none">+</span>
                        <span>Автомобиль</span>
                    </button>

                    {/* СПРАВА: ТОЛЬКО ПОИСК И ПРОФИЛЬ */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868B]" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Поиск по госномеру, марке..."
                                className="w-full h-8 pl-8 pr-16 text-xs rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-[#86868B] focus:outline-none focus:border-white/30 focus:bg-white/[0.1] transition-all shadow-inner"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-[#A1A1A6] bg-white/[0.08] border border-white/[0.12] rounded-md shadow-sm">
                                    Ctrl
                                </kbd>
                                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-[#A1A1A6] bg-white/[0.08] border border-white/[0.12] rounded-md shadow-sm">
                                    K
                                </kbd>
                            </div>
                        </div>

                        {/* АВАТАРКА + МЕНЮ ПЕРЕКЛЮЧЕНИЯ РОЛЕЙ */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="h-9 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] shadow-sm flex items-center gap-2.5 transition-all active:scale-95 backdrop-blur-md cursor-pointer"
                            >
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5E5CE6] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    И
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold leading-none text-white">Иван (Admin)</span>
                                    <span className="text-[9px] text-[#A1A1A6] leading-none mt-0.5">Переключить роль</span>
                                </div>
                                <ChevronDown className="h-3 w-3 text-[#A1A1A6]" />
                            </button>

                            {/* САМО ВЫПАДАЮЩЕЕ МЕНЮ */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1C1D22]/95 backdrop-blur-3xl border border-white/[0.12] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-2 border-b border-white/[0.08]">
                                        <p className="text-xs font-bold text-white">Иван Иванов</p>
                                        <p className="text-[11px] text-[#86868B]">admin@nexus-drive.by</p>
                                    </div>

                                    <div className="py-2 space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#86868B] px-3 block mb-1">
                      Рабочие станции:
                    </span>

                                        {/* 1. ДИСПЕТЧЕР */}
                                        <button
                                            onClick={() => { setIsProfileOpen(false); window.location.href = '/'; }}
                                            className="w-full px-3 py-2 text-xs text-left text-white hover:bg-white/[0.08] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                                        >
                                            <span> Штаб флота (Диспетчер)</span>
                                            <span className="text-[9px] bg-[#30D158]/20 text-[#30D158] px-1.5 py-0.5 rounded font-bold">Активен</span>
                                        </button>

                                        {/* 2. ФИНАНСИСТ */}
                                        <button
                                            onClick={() => { setIsProfileOpen(false); window.location.href = '/finance'; }}
                                            className="w-full px-3 py-2 text-xs text-left text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                             Касса и Выручка (Финансист)
                                        </button>

                                        {/* 3. ВОДИТЕЛЬ */}
                                        <button
                                            onClick={() => { setIsProfileOpen(false); window.location.href = '/drive'; }}
                                            className="w-full px-3 py-2 text-xs text-left text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                             Режим клиента (Водитель)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* СКОЛЬЗЯЩИЕ СТЕКЛЯННЫЕ ПИЛЮЛИ (ФИЛЬТРЫ) */}
                <div className="px-8 py-3 border-b border-white/[0.06] flex items-center gap-1.5 shrink-0 bg-white/[0.02]">
                    {['ALL', 'AVAILABLE', 'RENTED', 'MAINTENANCE', 'BLOCKED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                                filter === st
                                    ? 'bg-white/20 text-white shadow-md border border-white/25 backdrop-blur-md'
                                    : 'text-[#86868B] hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            {st === 'ALL' ? 'Все автомобили' : statusBadges[st as CarStatus]?.label}
                        </button>
                    ))}
                </div>

                {/* СТЕКЛЯННАЯ ТАБЛИЦА */}
                <div className="flex-1 overflow-y-auto px-6 py-3">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                        <tr className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider border-b border-white/[0.08]">
                            <th className="py-3 px-4">Модель</th>
                            <th className="py-3 px-4">Госномер</th>
                            <th className="py-3 px-4">Статус</th>
                            <th className="py-3 px-4">Энергия / Бак</th>
                            <th className="py-3 px-4">Пробег</th>
                            <th className="py-3 px-4">Локация</th>
                            <th className="py-3 px-4 text-right">Тариф</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                        {filteredCars.map((car) => {
                            const badge = statusBadges[car.status];
                            const isSelected = selectedCar?.id === car.id;
                            return (
                                <tr
                                    key={car.id}
                                    onClick={() => setSelectedCar(car)}
                                    className={`cursor-pointer transition-all rounded-xl ${
                                        isSelected
                                            ? 'bg-white/[0.12] border-y border-white/10 text-white shadow-lg'
                                            : 'hover:bg-white/[0.04] text-[#D1D1D6]'
                                    }`}
                                >
                                    <td className="py-3.5 px-4 font-bold text-white">
                                        {car.brand} {car.model}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <BYPlate plate={car.plateNumber} />
                                    </td>
                                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${badge.glow}`} />
                        <span className={`text-[11px] font-semibold ${badge.text}`}>
                          {badge.label}
                        </span>
                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 tabular-nums font-semibold">
                      <span className={car.fuelLevel < 20 ? 'text-[#FF453A]' : 'text-white'}>
                        {car.fuelLevel}%
                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 tabular-nums text-[#86868B] font-medium">
                                        {car.mileAge.toLocaleString('ru-RU')} км
                                    </td>
                                    <td className="py-3.5 px-4 text-[#86868B] font-medium truncate max-w-[150px]">
                                        {car.location}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-bold text-white tabular-nums">
                                        {Number(car.pricePerMinute).toFixed(2)} <span className="text-[10px] text-[#86868B] font-normal">BYN/мин</span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ПРАВЫЙ ИНСПЕКТОР (МАТОВОЕ СТЕКЛО VISION OS) */}
            {selectedCar && (
                <aside className="w-96 h-full bg-[#18191E]/80 border-l border-white/[0.1] flex flex-col justify-between p-6 backdrop-blur-3xl shrink-0 shadow-2xl transition-all">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-[#30D158]" /> Телеметрия #{selectedCar.id}
              </span>
                            <button
                                onClick={() => setSelectedCar(null)}
                                className="h-6 w-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#86868B] hover:text-white transition-all"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* КАРТОЧКА ВЫБРАННОГО АВТО */}
                        <div className="mt-6 flex items-start justify-between">
                            <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#86868B]">
                  {selectedCar.brand}
                </span>
                                <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
                                    {selectedCar.model}
                                </h2>
                                <div className="mt-3">
                                    <BYPlate plate={selectedCar.plateNumber} />
                                </div>
                            </div>
                            <FuelRing level={selectedCar.fuelLevel} size={76} />
                        </div>

                        {/* МЕТРИКИ С МЯГКИМ СТЕКЛОМ */}
                        <div className="mt-8 space-y-2.5">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
                <span className="text-xs text-[#86868B] flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-[#0A84FF]" /> Пробег
                </span>
                                <span className="text-xs font-bold text-white tabular-nums">
                  {selectedCar.mileAge.toLocaleString('ru-RU')} км
                </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
                <span className="text-xs text-[#86868B] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#0A84FF]" /> Локация
                </span>
                                <span className="text-xs font-semibold text-white">
                  {selectedCar.location}
                </span>
                            </div>
                        </div>
                    </div>

                        {/* ОПЕРАТИВНОЕ СОСТОЯНИЕ И СЕРВИС */}
                        <div className="mt-8">
              <span className="text-отуп[10px] font-bold uppercase tracking-widest text-[#86868B] block mb-2.5">
                Оперативное состояние
              </span>

                            {/* Если машина УЖЕ на ремонте — показываем кнопку завершения */}
                            {selectedCar.status === 'MAINTENANCE' ? (
                                <div className="p-3.5 rounded-2xl bg-[#BF5AF2]/10 border border-[#BF5AF2]/25">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#BF5AF2] mb-1">
                                        <Wrench className="h-4 w-4" /> Автомобиль на обслуживании
                                    </div>
                                    <p className="text-[11px] text-[#86868B] mb-3">
                                        Требуется подтверждение завершения работ и списание затрат
                                    </p>
                                    <button
                                        onClick={() => setIsCompleteModalOpen(true)}
                                        className="w-full py-2 px-3 rounded-xl bg-[#30D158] hover:bg-[#30D158]/90 text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Завершить ТО и выпустить
                                    </button>
                                </div>
                            ) : (
                                /* Если машина на линии — стандартные кнопки статусов */
                                <div className="grid grid-cols-2 gap-2">
                                    {(['AVAILABLE', 'MAINTENANCE', 'BLOCKED'] as CarStatus[]).map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => {
                                                if (st === 'MAINTENANCE') {
                                                    setIsStartModalOpen(true); // Открываем модалку наряда
                                                } else {
                                                    updateStatus({ id: selectedCar.id, status: st });
                                                }
                                            }}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                                selectedCar.status === st
                                                    ? 'bg-white text-black border-white shadow-lg'
                                                    : 'border-white/[0.08] bg-white/[0.03] text-[#86868B] hover:text-white hover:bg-white/[0.08]'
                                            }`}
                                        >
                                            {statusBadges[st].label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    {/* КНОПКА ЗАЖИГАНИЯ / АКТИВНОСТИ */}
                    <div className="pt-4 border-t border-white/[0.08]">
                        <button
                            onClick={() =>
                                selectedCar.isActive
                                    ? deactivateCar(selectedCar.id)
                                    : activateCar(selectedCar.id)
                            }
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                selectedCar.isActive
                                    ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/25 hover:bg-[#FF453A]/25'
                                    : 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/25 hover:bg-[#30D158]/25'
                            }`}
                        >
                            <Power className="h-4 w-4" />
                            {selectedCar.isActive ? 'Деактивировать в системе' : 'Активировать на линии'}
                        </button>
                    </div>
                </aside>
            )}
            {/* МОДАЛКА ОТКРЫТИЯ ЗАКАЗ-НАРЯДА */}
            <StartMaintenanceModal
                isOpen={isStartModalOpen}
                onClose={() => setIsStartModalOpen(false)}
                car={selectedCar}
                onSubmit={async (description, cost) => {
                    if (!selectedCar) return;
                    await startMaintenance({ carId: selectedCar.id, description, cost });
                    updateStatus({ id: selectedCar.id, status: 'MAINTENANCE' });
                }}
            />

            {/* МОДАЛКА ВЫПУСКА С РЕМОНТА */}
            <CompleteMaintenanceModal
                isOpen={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                car={selectedCar}
                onSubmit={async (actualCost) => {
                    if (!selectedCar) return;
                    // Ищем последнюю запись ТО для этой машины или шлем id=1 для демо
                    const record = records.find(r => r.carId === selectedCar.id && !r.isCompleted);
                    await completeMaintenance({ id: record?.id || 1, actualCost });
                    updateStatus({ id: selectedCar.id, status: 'AVAILABLE' });
                }}
            />

            {/* МОДАЛКА ДОБАВЛЕНИЯ АВТОМОБИЛЯ */}
            <CreateCarModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={async (dto) => {
                    await createCar(dto);
                }}
            />
        </div>
    );
}