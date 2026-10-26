package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import demonofgalaxy.project_carsharing.strategy.TariffCalculatorStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private CarRepository carRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TariffCalculatorStrategy minuteTariffStrategy;

    private RentalService rentalService;

    private User testUser;
    private Car testCar;

    @BeforeEach
    void setUp() {
        Map<String, TariffCalculatorStrategy> strategies = Map.of(
                "minuteTariffStrategy", minuteTariffStrategy
        );
        rentalService = new RentalService(rentalRepository, carRepository, userRepository, strategies);

        testUser = User.builder()
                .id(1L)
                .username("test_driver")
                .isActive(true)
                .build();

        testCar = Car.builder()
                .id(10L)
                .brand("Geely")
                .model("Coolray")
                .plateNumber("1234 AB-7")
                .pricePerMinute(BigDecimal.valueOf(0.50))
                .status(CarStatus.AVAILABLE)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Успешный старт аренды: машина переводится в IN_USE и сохраняется аренда")
    void startRental_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(carRepository.findById(10L)).thenReturn(Optional.of(testCar));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental result = rentalService.startRental(1L, 10L);

        assertNotNull(result);
        assertEquals(RentalStatus.ACTIVE, result.getStatus());
        assertEquals(CarStatus.IN_USE, testCar.getStatus());
        verify(carRepository).save(testCar);
        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    @DisplayName("Ошибка старта: пользователь не найден в базе (NoSuchElementException)")
    void startRental_ThrowsException_WhenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> rentalService.startRental(999L, 10L));
        verify(rentalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ошибка старта: пользователь заблокирован (isActive = false)")
    void startRental_ThrowsException_WhenUserIsBlocked() {
        testUser.setActive(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalStateException.class, () -> rentalService.startRental(1L, 10L));
        verify(rentalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ошибка старта: у пользователя уже есть активная аренда")
    void startRental_ThrowsException_WhenUserAlreadyHasActiveRental() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        Rental activeRental = Rental.builder().build();
        lenient().when(rentalRepository.findByUserIdAndStatus(1L, RentalStatus.ACTIVE))
                .thenReturn(List.of(activeRental));
        assertThrows(Throwable.class, () -> rentalService.startRental(1L, 10L));
        verify(carRepository, never()).save(any());
    }
    @Test
    @DisplayName("Ошибка старта: автомобиль уже занят или на ТО (статус != AVAILABLE)")
    void startRental_ThrowsException_WhenCarIsNotAvailable() {
        testCar.setStatus(CarStatus.IN_USE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(carRepository.findById(10L)).thenReturn(Optional.of(testCar));

        assertThrows(IllegalStateException.class, () -> rentalService.startRental(1L, 10L));
        verify(rentalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Успешное завершение поездки: расчет суммы через стратегию и возврат машины в AVAILABLE")
    void endRental_Success() {
        Rental activeRental = Rental.builder()
                .id(100L)
                .user(testUser)
                .car(testCar)
                .startTime(LocalDateTime.now().minusMinutes(20))
                .status(RentalStatus.ACTIVE)
                .build();
        testCar.setStatus(CarStatus.IN_USE);

        when(rentalRepository.findById(100L)).thenReturn(Optional.of(activeRental));
        when(minuteTariffStrategy.finalPrice(any(), anyLong())).thenReturn(BigDecimal.valueOf(10.00));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental completed = rentalService.endRental(100L, "minuteTariffStrategy");

        assertEquals(RentalStatus.COMPLETED, completed.getStatus());
        assertEquals(BigDecimal.valueOf(10.00), completed.getTotalPrice());
        assertEquals(CarStatus.AVAILABLE, testCar.getStatus());
        verify(carRepository).save(testCar);
        verify(rentalRepository).save(activeRental);
    }

    @Test
    @DisplayName("Ошибка завершения: поездка с указанным ID не найдена")
    void endRental_ThrowsException_WhenRentalNotFound() {
        when(rentalRepository.findById(555L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> rentalService.endRental(555L, "minuteTariffStrategy"));
    }

    @Test
    @DisplayName("Ошибка завершения: аренда уже была закрыта ранее (status != ACTIVE)")
    void endRental_ThrowsException_WhenRentalAlreadyCompleted() {
        Rental closedRental = Rental.builder()
                .id(100L)
                .status(RentalStatus.COMPLETED)
                .build();
        when(rentalRepository.findById(100L)).thenReturn(Optional.of(closedRental));

        assertThrows(Throwable.class, () -> rentalService.endRental(100L, "minuteTariffStrategy"));
    }

    @Test
    @DisplayName("Ошибка завершения: передано неизвестное имя стратегии тарифа")
    void endRental_ThrowsException_WhenStrategyUnknown() {
        Rental activeRental = Rental.builder()
                .id(100L)
                .car(testCar)
                .startTime(LocalDateTime.now().minusMinutes(5))
                .status(RentalStatus.ACTIVE)
                .build();
        when(rentalRepository.findById(100L)).thenReturn(Optional.of(activeRental));

        assertThrows(IllegalArgumentException.class, () -> rentalService.endRental(100L, "nonExistentStrategy"));
    }

    @Test
    @DisplayName("Граничный случай: поездка длилась 0 секунд, должна быть округлена минимум до 1 минуты")
    void endRental_Boundary_ZeroMinutesRoundedToOne() {
        Rental zeroSecRental = Rental.builder()
                .id(100L)
                .car(testCar)
                .startTime(LocalDateTime.now())
                .status(RentalStatus.ACTIVE)
                .build();

        when(rentalRepository.findById(100L)).thenReturn(Optional.of(zeroSecRental));
        when(minuteTariffStrategy.finalPrice(any(), anyLong())).thenReturn(BigDecimal.valueOf(0.50));
        when(rentalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Rental result = rentalService.endRental(100L, "minuteTariffStrategy");

        verify(minuteTariffStrategy).finalPrice(any(), anyLong());
        assertEquals(BigDecimal.valueOf(0.50), result.getTotalPrice());
    }
}