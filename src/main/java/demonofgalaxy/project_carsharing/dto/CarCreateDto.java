package demonofgalaxy.project_carsharing.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CarCreateDto(@NotBlank(message = "Not null string")
                           String brand,
                           @NotBlank(message = "Not null")
                           String model,
                           @NotBlank(message = "Not null")
                           String plateNumber,
                           @Positive(message = "More than 0")
                           BigDecimal pricePerMinute,
                           @Min(value = 0,message = "Fuel level can`t be less than 0")
                           @Max(value = 100,message = "Fuel level can`t be more than 100")
                           Integer fuelLevel,
                           @PositiveOrZero(message = "Mileage can be 0 or more")
                           Integer mileAge,
                           @NotBlank(message = "Not null")
                           String location
) {
}
