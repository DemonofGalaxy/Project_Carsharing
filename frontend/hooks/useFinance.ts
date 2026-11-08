'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnalyticsSummaryDto, PaymentDto } from '@/types';

// ДЕМО-ДАННЫЕ БУХГАЛТЕРИИ (пока бэкенд выключен)
const MOCK_ANALYTICS: AnalyticsSummaryDto = {
    totalCars: 5,
    activeRentalsCount: 2,
    totalRevenue: 14850.50, // Выручка в BYN
    fleetUtilizationRate: 68.4, // Процент загрузки парка
};

const MOCK_PAYMENTS = [
    { id: 1001, rentalId: 201, user: 'Иван Иванов', amount: 21.36, method: 'Apple Pay', time: '14:24', status: 'PAID', car: 'Tesla Model 3' },
    { id: 1002, rentalId: 202, user: 'Алексей Смирнов', amount: 8.40, method: 'Mastercard •• 4242', time: '13:50', status: 'PAID', car: 'VW Polo' },
    { id: 1003, rentalId: 203, user: 'Ольга Кузнецова', amount: 45.00, method: 'Баллы лояльности', time: '12:15', status: 'PAID', car: 'BMW 320d' },
    { id: 1004, rentalId: 204, user: 'Дмитрий Попов', amount: 12.80, method: 'Visa •• 8819', time: '11:05', status: 'PAID', car: 'Geely Coolray' },
    { id: 1005, rentalId: 205, user: 'Екатерина Новик', amount: 4.20, method: 'Mastercard •• 1102', time: '09:40', status: 'REFUNDED', car: 'VW Polo' },
];

export function useFinance() {
    // Запрос в AnalyticsController: /api/analytics/summary
    const summaryQuery = useQuery<AnalyticsSummaryDto>({
        queryKey: ['analyticsSummary'],
        queryFn: () => api.get<AnalyticsSummaryDto>('/analytics/summary'),
        retry: false,
    });

    return {
        summary: summaryQuery.data || MOCK_ANALYTICS,
        payments: MOCK_PAYMENTS,
        isLoading: summaryQuery.isLoading,
    };
}