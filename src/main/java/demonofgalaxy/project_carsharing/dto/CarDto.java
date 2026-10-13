package demonofgalaxy.project_carsharing.dto;

import demonofgalaxy.project_carsharing.entity.Car.CarStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CarDto(
        @NotBlank(message = "Brand is not supposed to be empty")
        String brand,
        @NotBlank(message = "Model is not supposed to be empty")
        String model,
        @NotBlank(message = "Number plate is not supposed to be empty")
        String plateNumber,
        @Positive(message="Price per minute is supposed to be positive")
        BigDecimal pricePerMinute,
        @PositiveOrZero(message = "Fuel level is supposed to be 0 or higher")
        Integer fuelLevel,
        @PositiveOrZero(message="Latitude is supposed to be 00.00 or higher")
        Double latitude,
        @PositiveOrZero(message="Longitude is supposed to be 00.00 or higher")
        Double longitude,
        CarStatus status
        ) {
}
