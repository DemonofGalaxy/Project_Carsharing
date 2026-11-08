'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RentalResponseDto, CarResponseDto } from '@/types';

export function useRentals(userId: number = 1) {
    const queryClient = useQueryClient();

    // 1. Получить только доступные авто (CarController: /api/cars/available)
    const availableCarsQuery = useQuery<CarResponseDto[]>({
        queryKey: ['availableCars'],
        queryFn: () => api.get<CarResponseDto[]>('/cars/available'),
        refetchInterval: 10000,
    });

    // 2. Забронировать авто (RentalController: /api/rentals/reserve)
    const reserveMutation = useMutation({
        mutationFn: (carId: number) =>
            api.post<RentalResponseDto>(`/rentals/reserve?userId=${userId}&carId=${carId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    // 3. Начать поездку (RentalController: /api/rentals/start)
    const startRideMutation = useMutation({
        mutationFn: (carId: number) =>
            api.post<RentalResponseDto>(`/rentals/start?userId=${userId}&carId=${carId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    // 4. Завершить поездку (RentalController: /api/rentals/{id}/end)
    const endRideMutation = useMutation({
        mutationFn: ({ rentalId, tariffName = 'minuteTariffStrategy' }: { rentalId: number; tariffName?: string }) =>
            api.post<RentalResponseDto>(`/rentals/${rentalId}/end?tariffName=${tariffName}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    // 5. Отменить бронь (RentalController: /api/rentals/{id}/cancel)
    const cancelReservationMutation = useMutation({
        mutationFn: (rentalId: number) =>
            api.patch<RentalResponseDto>(`/rentals/${rentalId}/cancel?userId=${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    return {
        availableCars: availableCarsQuery.data || [],
        isLoading: availableCarsQuery.isLoading,
        reserveCar: reserveMutation.mutateAsync,
        startRide: startRideMutation.mutateAsync,
        endRide: endRideMutation.mutateAsync,
        cancelReservation: cancelReservationMutation.mutateAsync,
    };
}