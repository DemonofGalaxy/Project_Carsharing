package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.config.PasswordConfig;
import demonofgalaxy.project_carsharing.dto.user.UserLoginDto;
import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.entity.user.UserStatus;
import demonofgalaxy.project_carsharing.mapper.UserMapper;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDto registerUser(UserRegisterDto dto) {
        if (userRepository.existsByUsername(dto.username())) {
            throw new IllegalStateException("User already taken: " + dto.username());
        }
        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setUserStatus(UserStatus.ROLE_CLIENT);
        user.setIsActive(true);
        User savedUser = userRepository.save(user);
        log.info("Saved user with id={}, username={}", user.getId(), user.getUsername());
        return userMapper.toDto(savedUser);
    }

    public List<UserResponseDto> getAllUsers() {
        return userMapper.toDtoList(userRepository.findAll());
    }

    public UserResponseDto findUserById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with id={" + userId + "} not found"));
        return userMapper.toDto(user);
    }

    public UserResponseDto deactivateUser(Long userId){
        User user=userRepository.findById(userId).orElseThrow(()->new NoSuchElementException("User not found with id: "+userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User with id={} deactivated",userId);
        return userMapper.toDto(user);
    }

    public UserResponseDto activateUser(Long userId){
        User user=userRepository.findById(userId).orElseThrow(()->new NoSuchElementException("User not found with id: "+userId));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User with id={} activated",userId);
        return userMapper.toDto(user);
    }

    public UserResponseDto login(UserLoginDto dto) {
        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!user.getIsActive()) {
            throw new IllegalStateException("User account is deactivated");
        }

        log.info("User ID={} ({}) successfully logged in", user.getId(), user.getUsername());
        return userMapper.toDto(user);
    }


}
