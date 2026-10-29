package demonofgalaxy.project_carsharing.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UserRegisterDto (

        @NotBlank(message = "Username cannot be empty")
        String username,
        @NotBlank(message = "Password cannot be empty")
        String password,
        @NotBlank(message = "First name cannot be empty")
        String firstName,
        @NotBlank(message = "last name cannot be empty")
        String lastName,
        @NotBlank(message = "Phone cannot be empty")
        String phone

){
}
