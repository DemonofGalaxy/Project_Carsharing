package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import demonofgalaxy.project_carsharing.service.strategy.MinuteTariffStrategy;
import demonofgalaxy.project_carsharing.service.strategy.TariffCalculatorStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RentalIntegrationTest {

    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private CarRepository carRepository;
    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("Интеграционный тест: взаимодействие RentalService с реальным компонентом MinuteTariffStrategy")
    void testRentalService_WithRealStrategyComponent() {
        // ИСПОЛЬЗУЕМ НАСТОЯЩИЙ РЕАЛЬНЫЙ ОБЪЕКТ СТРАТЕГИИ (не мок!)
        TariffCalculatorStrategy realStrategy = new MinuteTariffStrategy();

        RentalService service = new RentalService(
                rentalRepository,
                carRepository,
                userRepository,
                Map.of("minuteTariffStrategy", realStrategy)
        );

        Car car = Car.builder()
                .pricePerMinute(BigDecimal.valueOf(0.40))
                .status(CarStatus.IN_USE)
                .build();

        Rental rental = Rental.builder()
                .id(1L)
                .car(car)
                .startTime(LocalDateTime.now().minusMinutes(15))
                .status(RentalStatus.ACTIVE)
                .build();

        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Выполняем расчет через реальный калькулятор
        Rental completed = service.endRental(1L, "minuteTariffStrategy");

        // 15 минут * 0.40 = 6.00 руб
        assertEquals(0, BigDecimal.valueOf(6.00).compareTo(completed.getTotalPrice()));
        assertEquals(RentalStatus.COMPLETED, completed.getStatus());
        assertEquals(CarStatus.AVAILABLE, car.getStatus());
    }
}