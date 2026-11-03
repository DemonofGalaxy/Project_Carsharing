package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.rental.RentalResponseDto;
import demonofgalaxy.project_carsharing.dto.user.UserLoginDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.payment.Payment;
import demonofgalaxy.project_carsharing.entity.payment.PaymentStatus;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.mapper.RentalMapper;
import demonofgalaxy.project_carsharing.mapper.UserMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.PaymentRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import demonofgalaxy.project_carsharing.strategy.TariffCalculatorStrategy;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalService {
    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final Map<String, TariffCalculatorStrategy> strategies;
    private final RentalMapper rentalMapper;
    private final PaymentRepository paymentRepository;


    @Transactional
    public RentalResponseDto startRental(Long userId, Long carId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with id:" + userId + " not found"));
        if (!user.getIsActive()) throw new IllegalStateException("Status is wrong");

        Optional<Rental> existingReservation = rentalRepository.findByUserIdAndCarIdAndStatus(userId, carId, RentalStatus.RESERVED);

        if (existingReservation.isPresent()) {
            Rental rental = existingReservation.get();
            rental.setStatus(RentalStatus.ACTIVE);
            rental.setStartTime(LocalDateTime.now());

            Car car = rental.getCar();
            car.setStatus(CarStatus.IN_USE);
            carRepository.save(car);

            Rental savedRental = rentalRepository.save(rental);
            log.info("Reservation ID={} converted to ACTIVE ride for user ID={}", savedRental.getId(), userId);
            return rentalMapper.toDto(savedRental);
        }

        if (rentalRepository.findAllByUserIdAndStatus(userId, RentalStatus.ACTIVE).isPresent()) {
            throw new IllegalStateException("The user has an active rental");
        }

        Car car = carRepository.findByIdWithlock(carId)
                .orElseThrow(() -> new NoSuchElementException("the car is not found"));
        if (!car.getIsActive()) throw new IllegalStateException("Car is blocked");
        if (car.getStatus() != CarStatus.AVAILABLE) throw new IllegalStateException("Car isn`t available");

        car.setStatus(CarStatus.IN_USE);
        carRepository.save(car);

        Rental rentalBuilder = Rental.builder()
                .user(user)
                .car(car)
                .startTime(LocalDateTime.now())
                .status(RentalStatus.ACTIVE)
                .startMileage(car.getMileAge() != null ? car.getMileAge() : 0)
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

        if(realTime<=0) realTime=1;
        TariffCalculatorStrategy strategy = strategies.get(tariffName);
        if (strategy == null) throw new IllegalArgumentException("Unknown strategy");
        BigDecimal check = strategy.finalPrice(rentalFind.getCar().getPricePerMinute(), realTime);
        rentalFind.setEndTime(endTime);
        rentalFind.setTotalPrice(check);
        rentalFind.setStatus(RentalStatus.COMPLETED);
        Car car = rentalFind.getCar();
        int drivenKm = (int) Math.max(1, realTime);
        int currentCarMileage = (car.getMileAge() != null) ? car.getMileAge() : 0;
        int finalMileage = currentCarMileage + drivenKm;

        car.setMileAge(finalMileage);

        rentalFind.setEndMileage(finalMileage);
        car.setStatus(CarStatus.AVAILABLE);
        carRepository.save(car);
        Rental rentalSave = rentalRepository.save(rentalFind);
        log.info("Rent ID={} is completed. The final cost: {} bel rub", rentalId, check);

        Payment payment = Payment.builder()
                .rental(rentalSave)
                .amount(check)
                .paymentTime(endTime)
                .paymentMethod("CREDIT_CARD")
                .status(PaymentStatus.PAID)
                .build();
        paymentRepository.save(payment);
        log.info("Payment ID={} recorded for rental ID={}", payment.getId(), rentalId);
        return rentalMapper.toDto(rentalSave);
    }

    @Transactional
    public List<RentalResponseDto> getHistoryByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User with id:" + userId + " not found"));
        List<Rental> rentalHistory = rentalRepository.findAllByUserIdOrderByStartTimeDesc(userId);
        return rentalHistory.stream().map(rentalMapper::toDto).toList();
    }

    @Transactional
    public RentalResponseDto reserveCar(Long userId, Long carId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with id: " + userId + " not found"));
        if (!user.getIsActive()) throw new IllegalStateException("User is blocked");

        if (rentalRepository.findAllByUserIdAndStatus(userId, RentalStatus.ACTIVE).isPresent() ||
                rentalRepository.findAllByUserIdAndStatus(userId, RentalStatus.RESERVED).isPresent()) {
            throw new IllegalStateException("The user already has an active rental or reservation");
        }

        Car car = carRepository.findByIdWithlock(carId)
                .orElseThrow(() -> new NoSuchElementException("Car not found with id:"+carId));
        if (!car.getIsActive()) throw new IllegalStateException("Car is deactivated");
        if (car.getStatus() != CarStatus.AVAILABLE)
            throw new IllegalStateException("Car is not available for reservation");

        car.setStatus(CarStatus.RESERVED);
        carRepository.save(car);

        Rental reservation = Rental.builder()
                .user(user)
                .car(car)
                .startTime(LocalDateTime.now())
                .status(RentalStatus.RESERVED)
                .build();

        Rental saved = rentalRepository.save(reservation);
        log.info("Car ID={} reserved by user ID={}, rental ID={}", carId, userId, saved.getId());
        return rentalMapper.toDto(saved);
    }

    @Transactional
    public RentalResponseDto cancelReservation(Long rentalId, Long userId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new NoSuchElementException("Rental with id " + rentalId + " not found"));

        if (rental.getStatus() != RentalStatus.RESERVED) {
            throw new IllegalStateException("Only RESERVED rentals can be cancelled");
        }
        if (!rental.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You cannot cancel someone else's reservation");
        }

        rental.setStatus(RentalStatus.CANCELLED);
        rental.setEndTime(LocalDateTime.now());

        Car car = rental.getCar();
        car.setStatus(CarStatus.AVAILABLE);
        carRepository.save(car);

        Rental saved = rentalRepository.save(rental);
        log.info("Reservation ID={} cancelled by user ID={}", rentalId, userId);
        return rentalMapper.toDto(saved);
    }


}
