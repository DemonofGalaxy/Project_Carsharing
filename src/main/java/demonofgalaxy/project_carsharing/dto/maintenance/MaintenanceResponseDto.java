package demonofgalaxy.project_carsharing.dto.maintenance;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MaintenanceResponseDto(
        Long id,
        Long carId,
        String carBrand,
        String carModel,
        String plateNumber,
        String description,
        BigDecimal cost,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Boolean isCompleted
) {}