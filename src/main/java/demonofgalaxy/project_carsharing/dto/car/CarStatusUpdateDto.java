package demonofgalaxy.project_carsharing.dto.car;

import demonofgalaxy.project_carsharing.entity.car.CarStatus;

public record CarStatusUpdateDto(
        CarStatus status
) {
}
