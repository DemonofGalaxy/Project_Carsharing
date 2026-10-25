package demonofgalaxy.project_carsharing.dto;

import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RentalResponseDto(
        Long id,
        Long userId,
        String username,
        Long carId,
        String carBrand,
        String carModel,
        String plateNumber,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal totalPrice,
        RentalStatus status,
        Integer startMileage,
        Integer endMileage

) {}
