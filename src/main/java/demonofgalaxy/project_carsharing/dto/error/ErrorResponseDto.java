package demonofgalaxy.project_carsharing.dto.error;

import java.time.LocalDateTime;

public record ErrorResponseDto(
        int status,
        String message,
        LocalDateTime timestamp
) {
}
