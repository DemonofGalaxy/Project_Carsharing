'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CarResponseDto, CarStatus, CarCreateDto } from '@/types';
export function useCars() {
    const queryClient = useQueryClient();

    // 5. Добавление нового авто (POST /api/cars)
    const createMutation = useMutation({
        mutationFn: (dto: CarCreateDto) => api.post<CarResponseDto>('/cars', dto),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });

    // 1. Получение всех авто из CarController.java
    const carsQuery = useQuery<CarResponseDto[]>({
        queryKey: ['cars'],
        queryFn: () => api.get<CarResponseDto[]>('/cars'),
        refetchInterval: 10000, // Автообновление каждые 10 сек
    });

    // 2. Активация авто (/api/cars/{id}/activate)
    const activateMutation = useMutation({
        mutationFn: (id: number) => api.patch<CarResponseDto>(`/cars/${id}/activate`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });

    // 3. Деактивация авто (/api/cars/{id}/deactivate)
    const deactivateMutation = useMutation({
        mutationFn: (id: number) => api.patch<CarResponseDto>(`/cars/${id}/deactivate`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });

    // 4. Смена статуса авто (/api/cars/{id}/status)
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: CarStatus }) =>
            api.patch<CarResponseDto>(`/cars/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });

    return {
        cars: carsQuery.data || [],
        isLoading: carsQuery.isLoading,
        isError: carsQuery.isError,
        activateCar: activateMutation.mutateAsync,
        deactivateCar: deactivateMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        createCar: createMutation.mutateAsync,
    };
}