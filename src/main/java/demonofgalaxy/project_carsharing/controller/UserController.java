package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.user.UserLoginDto;
import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.dto.user.UserRoleUpdateDto;
import demonofgalaxy.project_carsharing.security.CurrentUserService;
import demonofgalaxy.project_carsharing.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    private final UserService userService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@RequestBody @Valid UserRegisterDto dto,
                                                    HttpServletRequest request,
                                                    HttpServletResponse response) {
        userService.registerUser(dto);
        UserResponseDto loggedIn = userService.login(new UserLoginDto(dto.username(), dto.password()), request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(loggedIn);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(@RequestBody @Valid UserLoginDto dto,
                                                 HttpServletRequest request,
                                                 HttpServletResponse response) {
        return ResponseEntity.ok(userService.login(dto, request, response));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> me() {
        Long id = currentUserService.requireUser().getId();
        return ResponseEntity.ok(userService.findUserById(id));
    }

    @GetMapping("")
    public ResponseEntity<List<UserResponseDto>> getAllResponse() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> findById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.findUserById(userId));
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<UserResponseDto> deactivate(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.deactivateUser(userId));
    }

    @PatchMapping("/{userId}/activate")
    public ResponseEntity<UserResponseDto> activate(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.activateUser(userId));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponseDto> changeRole(@PathVariable Long userId,
                                                      @RequestBody @Valid UserRoleUpdateDto dto) {
        Long currentId = currentUserService.requireUser().getId();
        return ResponseEntity.ok(userService.changeRole(userId, dto, currentId));
    }
}
