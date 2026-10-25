package demonofgalaxy.project_carsharing.dto;

import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CarResponseDto(
        @Positive(message = "Id isn`t supposed to be less than 1")
        Long id,
        @NotBlank(message = "Brand is not supposed to be empty")
        String brand,
        @NotBlank(message = "Model is not supposed to be empty")
        String model,
        @NotBlank(message = "Number plate is not supposed to be empty")
        String plateNumber,
        @Positive(message="Price per minute is supposed to be positive")
        BigDecimal pricePerMinute,
        @PositiveOrZero(message = "Fuel level is supposed to be 0 or higher")
        @Max(value=100,message = "Fuel level is supposed to be 0 or higher")
        Integer fuelLevel,
//        @NotNull(message="Latitude is required")
//        Double latitude,
//        @NotNull(message="Longitude is required")
//        Double longitude,
        @NotBlank(message = "Location is not supposed to be empty")
        String location,
        CarStatus status
        ) {
}
