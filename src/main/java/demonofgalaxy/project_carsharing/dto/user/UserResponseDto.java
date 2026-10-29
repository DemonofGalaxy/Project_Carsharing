package demonofgalaxy.project_carsharing.dto.user;

import demonofgalaxy.project_carsharing.entity.user.UserStatus;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String username,
        String firstname,
        String lastName,
        String phone,
        UserStatus userStatus,
        boolean isActive,
        LocalDateTime createdAt
) {
}
