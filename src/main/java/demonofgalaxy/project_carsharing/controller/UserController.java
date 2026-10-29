package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.mapper.UserMapper;
import demonofgalaxy.project_carsharing.service.UserService;
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
@CrossOrigin(origins="*")
@Slf4j
public class UserController {
    private final UserMapper userMapper;
    private final UserService userService;

@PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@RequestBody @Valid UserRegisterDto dto){
    UserResponseDto userResponseDto=userService.registerUser(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDto);
}

@GetMapping("")
    public ResponseEntity<List<UserResponseDto>> getAllResponse(){
    return ResponseEntity.ok(userService.getAllUsers());
}

@GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> findById(@PathVariable Long userId){
    return ResponseEntity.ok(userService.findUserById(userId));
}

@PatchMapping("/{userId}/deactivate")
    public ResponseEntity<UserResponseDto> deactivate(@PathVariable Long userId){
    return ResponseEntity.ok(userService.deactivateUser(userId));
}

    @PatchMapping("/{userId}/activate")
    public ResponseEntity<UserResponseDto> activate(@PathVariable Long userId){
        return ResponseEntity.ok(userService.activateUser(userId));
    }



}
