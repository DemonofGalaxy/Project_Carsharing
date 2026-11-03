package demonofgalaxy.project_carsharing.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MaintenanceCreateDto(
        @NotNull(message = "Car ID is required")
        Long carId,

        @NotBlank(message = "Description cannot be empty")
        String description,

        BigDecimal estimatedCost
) {}