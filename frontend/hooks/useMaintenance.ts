'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MaintenanceCreateDto, MaintenanceResponseDto } from '@/types';

export function useMaintenance() {
    const queryClient = useQueryClient();

    // 1. Получить все записи ремонта
    const recordsQuery = useQuery<MaintenanceResponseDto[]>({
        queryKey: ['maintenanceRecords'],
        queryFn: () => api.get<MaintenanceResponseDto[]>('/maintenance'),
        refetchInterval: 10000,
    });

    // 2. Отправить авто на ТО (/api/maintenance/start)
    const startMutation = useMutation({
        mutationFn: (dto: MaintenanceCreateDto) =>
            api.post<MaintenanceResponseDto>('/maintenance/start', dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    // 3. Завершить ТО (/api/maintenance/{id}/complete?actualCost=...)
    const completeMutation = useMutation({
        mutationFn: ({ id, actualCost }: { id: number; actualCost?: number }) => {
            const url = actualCost !== undefined
                ? `/maintenance/${id}/complete?actualCost=${actualCost}`
                : `/maintenance/${id}/complete`;
            return api.patch<MaintenanceResponseDto>(url);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    return {
        records: recordsQuery.data || [],
        isLoading: recordsQuery.isLoading,
        startMaintenance: startMutation.mutateAsync,
        completeMaintenance: completeMutation.mutateAsync,
    };
}