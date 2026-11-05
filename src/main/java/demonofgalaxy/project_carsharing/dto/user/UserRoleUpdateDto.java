package demonofgalaxy.project_carsharing.dto.user;
import demonofgalaxy.project_carsharing.entity.user.UserStatus;
import jakarta.validation.constraints.NotNull;
public record UserRoleUpdateDto(
        @NotNull(message = "Role is required")
        UserStatus userStatus
) {
}