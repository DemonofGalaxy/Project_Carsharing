package demonofgalaxy.project_carsharing.dto;

import demonofgalaxy.project_carsharing.entity.car.CarStatus;

public record CarStatusUpdateDto(
        CarStatus status
) {
}
