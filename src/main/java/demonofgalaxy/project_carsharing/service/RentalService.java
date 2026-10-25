package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.RentalResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.mapper.RentalMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import demonofgalaxy.project_carsharing.service.strategy.TariffCalculatorStrategy;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalService {
    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final Map<String, TariffCalculatorStrategy> strategies;
    private final RentalMapper rentalMapper;

    @Transactional
    public RentalResponseDto startRental(Long userId, Long carId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with id:" + userId + " not found"));
        if (!user.isActive()) throw new IllegalStateException("Status is wrong");
        if (rentalRepository.findAllByUserIdAndStatus(userId, RentalStatus.ACTIVE).isPresent()) {
            throw new IllegalStateException("The user has an active rental");
        }
        Car car = carRepository.findById(carId).orElseThrow(() -> new NoSuchElementException("the car is not found"));
        if (car.getStatus() == CarStatus.IN_USE) throw new IllegalStateException("Car is unavailable");
        car.setStatus(CarStatus.IN_USE);
        carRepository.save(car);
        Rental rentalBuilder = Rental.builder()
                .user(user)
                .car(car)
                .startTime(LocalDateTime.now())
                .status(RentalStatus.ACTIVE)
                .build();
        Rental savedRental = rentalRepository.save(rentalBuilder);
        log.info("Saved rental ID={} for user ID={}", savedRental.getId(), userId);
        return rentalMapper.toDto(savedRental);
    }

    @Transactional
    public RentalResponseDto endRental(Long rentalId, String tariffName) {
        Rental rentalFind = rentalRepository.findById(rentalId).orElseThrow(() -> new NoSuchElementException("Rental is not found"));
        if (rentalFind.getStatus() != RentalStatus.ACTIVE) throw new IllegalArgumentException("The rental is over yet");
        LocalDateTime endTime = LocalDateTime.now();
        long realTime = Duration.between(rentalFind.getStartTime(), endTime).toMinutes();
        TariffCalculatorStrategy strategy = strategies.get(tariffName);
        if (strategy == null) throw new IllegalArgumentException("Unknown strategy");
        BigDecimal check = strategy.finalPrice(rentalFind.getCar().getPricePerMinute(), realTime);
        rentalFind.setEndTime(endTime);
        rentalFind.setTotalPrice(check);
        rentalFind.setStatus(RentalStatus.COMPLETED);
        Car car = rentalFind.getCar();
        car.setStatus(CarStatus.AVAILABLE);
        carRepository.save(car);
        Rental rentalSave = rentalRepository.save(rentalFind);
        log.info("Rent ID={} is completed. The final cost: {} bel rub", rentalId, check);
        return rentalMapper.toDto(rentalSave);
    }

    @Transactional
    public List<RentalResponseDto> getHistoryByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with id:" + userId + " not found"));
        List<Rental> rentalHistory = rentalRepository.findAllByUserIdOrderByStartTimeDesc(userId);
        return rentalHistory.stream().map(rentalMapper::toDto).toList();
    }


}
