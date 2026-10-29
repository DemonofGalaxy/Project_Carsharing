package demonofgalaxy.project_carsharing.dto.car;

import jakarta.validation.constraints.PositiveOrZero;

public record CarMileAgeUpdateDto(
        @PositiveOrZero(message = "0 or more")
        Integer mileAge
) {
}
