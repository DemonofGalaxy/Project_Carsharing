package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.config.PasswordConfig;
import demonofgalaxy.project_carsharing.dto.user.UserLoginDto;
import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.entity.user.UserStatus;
import demonofgalaxy.project_carsharing.mapper.UserMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;

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

            List<Rental> reservedRentals = rentalRepository.findByUserIdAndStatus(userId, RentalStatus.RESERVED);
            for (Rental r : reservedRentals) {
                r.setStatus(RentalStatus.CANCELLED);
                r.setEndTime(LocalDateTime.now());
                Car car = r.getCar();
                car.setStatus(CarStatus.AVAILABLE);
                carRepository.save(car);
                rentalRepository.save(r);
                log.info("Auto-cancelled reservation ID={} for banned user ID={}, car ID={} is AVAILABLE", r.getId(), userId, car.getId());
            }

            List<Rental> activeRentals = rentalRepository.findByUserIdAndStatus(userId, RentalStatus.ACTIVE);
            for (Rental r : activeRentals) {
                r.setStatus(RentalStatus.COMPLETED);
                r.setEndTime(LocalDateTime.now());
                r.setTotalPrice(BigDecimal.valueOf(1.00));
                Car car = r.getCar();
                car.setStatus(CarStatus.AVAILABLE);
                carRepository.save(car);
                rentalRepository.save(r);
                log.info("Force-completed ride ID={} for banned user ID={}, car ID={} is AVAILABLE", r.getId(), userId, car.getId());
            }

            log.info("User ID={} deactivated and all held vehicles freed", userId);
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
