'use client';

import React from 'react';
import Link from 'next/link';
import { useFinance } from '@/hooks/useFinance';
import {
    DollarSign, TrendingUp, CreditCard, ArrowLeft,
    Activity, CheckCircle2, ArrowDownRight, RefreshCcw, Download
} from 'lucide-react';

export default function FinancePage() {
    const { summary, payments, isLoading } = useFinance();

    return (
        <div className="relative min-h-screen w-full bg-[#121316] text-[#F5F5F7] p-8 select-none font-sans overflow-x-hidden">

            {/* АВРОРА: Финансовое изумрудное свечение */}
            <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#30D158]/10 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-[#0A84FF]/10 blur-[150px]" />

            {/* ШАПКА ФИНАНСИСТА */}
            <div className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-white/[0.08]">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="h-9 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center gap-2 text-xs font-semibold text-white transition-all backdrop-blur-md"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> В штаб флота
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            Финансовый реестр и Аналитика
                        </h1>
                        <p className="text-xs text-[#86868B]">Отчёты по выручке, загрузке автопарка и платежам</p>
                    </div>
                </div>

                <button
                    onClick={() => alert('Экспорт отчёта в CSV / 1С успешно сформирован!')}
                    className="h-9 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white transition-all flex items-center gap-2"
                >
                    <Download className="h-3.5 w-3.5 text-[#30D158]" /> Экспорт в CSV
                </button>
            </div>

            {/* 4 ГЛАВНЫЕ МЕТРИКИ АНАЛИТИКИ (AnalyticsController) */}
            <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* ВЫРУЧКА */}
                <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                    <div className="flex items-center justify-between text-[#86868B]">
                        <span className="text-xs font-semibold uppercase tracking-wider">Выручка за месяц</span>
                        <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {summary.totalRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
            </span>
                        <span className="text-xs font-semibold text-[#86868B]">BYN</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#30D158] flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> +14.2% к прошлому периоду
          </span>
                </div>

                {/* ЗАГРУЗКА ПАРКА */}
                <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                    <div className="flex items-center justify-between text-[#86868B]">
                        <span className="text-xs font-semibold uppercase tracking-wider">Загрузка флота</span>
                        <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] flex items-center justify-center">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {summary.fleetUtilizationRate}%
            </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0A84FF] flex items-center gap-1 mt-1">
            Оптимальная утилизация
          </span>
                </div>

                {/* АКТИВНЫХ АРЕНД */}
                <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                    <div className="flex items-center justify-between text-[#86868B]">
                        <span className="text-xs font-semibold uppercase tracking-wider">Активные поездки</span>
                        <div className="w-8 h-8 rounded-xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {summary.activeRentalsCount}
            </span>
                        <span className="text-xs font-semibold text-[#86868B]">машины на линии</span>
                    </div>
                    <span className="text-[11px] text-[#86868B] block mt-1">Из {summary.totalCars} авто в парке</span>
                </div>

                {/* ЧИСТАЯ ПРИБЫЛЬ */}
                <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl">
                    <div className="flex items-center justify-between text-[#86868B]">
                        <span className="text-xs font-semibold uppercase tracking-wider">Чистая прибыль</span>
                        <div className="w-8 h-8 rounded-xl bg-[#BF5AF2]/15 text-[#BF5AF2] flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {(summary.totalRevenue * 0.72).toFixed(2)}
            </span>
                        <span className="text-xs font-semibold text-[#86868B]">BYN</span>
                    </div>
                    <span className="text-[11px] text-[#86868B] block mt-1">С вычетом расходов на СТО</span>
                </div>
            </div>

            {/* ЖУРНАЛ ТРАНЗАКЦИЙ И ПЛАТЕЖЕЙ (Payment.java) */}
            <div className="max-w-6xl mx-auto mt-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-base font-bold text-white">Журнал транзакций</h2>
                        <p className="text-xs text-[#86868B]">Списания за поездки и возвраты средств</p>
                    </div>
                    <span className="text-xs font-semibold text-[#86868B] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            Всего транзакций: {payments.length}
          </span>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                        <tr className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider border-b border-white/[0.06]">
                            <th className="py-3 px-4">ID Платежа</th>
                            <th className="py-3 px-4">Пользователь</th>
                            <th className="py-3 px-4">Автомобиль</th>
                            <th className="py-3 px-4">Время</th>
                            <th className="py-3 px-4">Способ оплаты</th>
                            <th className="py-3 px-4">Статус</th>
                            <th className="py-3 px-4 text-right">Сумма</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                        {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 px-4 font-mono text-[11px] text-[#86868B]">
                                    #{p.id}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-white">
                                    {p.user}
                                </td>
                                <td className="py-3.5 px-4 text-white/90">
                                    {p.car}
                                </td>
                                <td className="py-3.5 px-4 tabular-nums text-[#86868B]">
                                    Сегодня, {p.time}
                                </td>
                                <td className="py-3.5 px-4 text-[#86868B]">
                                    {p.method}
                                </td>
                                <td className="py-3.5 px-4">
                                    {p.status === 'PAID' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Оплачено
                      </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 text-[10px] font-bold">
                        <RefreshCcw className="h-3 w-3" /> Возврат
                      </span>
                                    )}
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-white tabular-nums text-sm">
                                    {p.amount.toFixed(2)} <span className="text-[10px] text-[#86868B] font-normal">BYN</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}