package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.user.UserLoginDto;
import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.dto.user.UserRoleUpdateDto;
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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
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
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

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

    @Transactional
    public UserResponseDto deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("User with id={} deactivated", userId);

        // 1. Снимаем все активные бронирования (RESERVED) заблокированного пользователя
        List<Rental> reservedRentals = rentalRepository.findByUserIdAndStatus(userId, RentalStatus.RESERVED);
        for (Rental r : reservedRentals) {
            r.setStatus(RentalStatus.CANCELLED);
            r.setEndTime(LocalDateTime.now());

            Car car = r.getCar();
            car.setStatus(CarStatus.AVAILABLE);
            carRepository.save(car);

            rentalRepository.save(r);
            log.info("Auto-cancelled reservation ID={} for banned user ID={}, car ID={} is AVAILABLE",
                    r.getId(), userId, car.getId());
        }

        // 2. Принудительно завершаем активные поездки (ACTIVE) с честным расчетом стоимости
        List<Rental> activeRentals = rentalRepository.findByUserIdAndStatus(userId, RentalStatus.ACTIVE);
        for (Rental r : activeRentals) {
            r.setStatus(RentalStatus.COMPLETED);
            LocalDateTime now = LocalDateTime.now();
            r.setEndTime(now);

            // Считаем фактическое время и цену
            long minutes = Math.max(1, Duration.between(r.getStartTime(), now).toMinutes());
            BigDecimal rate = (r.getCar() != null && r.getCar().getPricePerMinute() != null)
                    ? r.getCar().getPricePerMinute()
                    : BigDecimal.valueOf(0.45);
            BigDecimal totalCost = rate.multiply(BigDecimal.valueOf(minutes));
            r.setTotalPrice(totalCost);

            // Обновляем пробег автомобиля (минимум 1 км за минуту)
            Car car = r.getCar();
            int currentMileage = (car.getMileAge() != null) ? car.getMileAge() : 0;
            int finalMileage = currentMileage + (int) minutes;
            car.setMileAge(finalMileage);
            r.setEndMileage(finalMileage);

            car.setStatus(CarStatus.AVAILABLE);
            carRepository.save(car);

            rentalRepository.save(r);
            log.info("Force-completed ride ID={} for banned user ID={}, actual cost: {} BYN, car ID={} is AVAILABLE",
                    r.getId(), userId, totalCost, car.getId());
        }

        log.info("User ID={} deactivated and all held vehicles successfully freed", userId);
        return userMapper.toDto(user);
    }


    public UserResponseDto activateUser(Long userId){
        User user=userRepository.findById(userId).orElseThrow(()->new NoSuchElementException("User not found with id: "+userId));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User with id={} activated",userId);
        return userMapper.toDto(user);
    }

    public UserResponseDto login(UserLoginDto dto, HttpServletRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);
        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            throw new IllegalArgumentException("Invalid username or password");
        } catch (DisabledException ex) {
            throw new IllegalStateException("User account is deactivated");
        }

        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        log.info("User ID={} ({}) successfully logged in", user.getId(), user.getUsername());
        return userMapper.toDto(user);
    }

    @Transactional
    public UserResponseDto changeRole(Long userId, UserRoleUpdateDto dto, Long currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new IllegalStateException("Нельзя менять роль самому себе");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
        user.setUserStatus(dto.userStatus());
        userRepository.save(user);
        log.info("User ID={} role changed to {}", userId, dto.userStatus());
        return userMapper.toDto(user);
    }


}
