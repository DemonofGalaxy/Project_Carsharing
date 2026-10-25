package demonofgalaxy.project_carsharing.config;

import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.user.User;
import demonofgalaxy.project_carsharing.entity.user.UserStatus;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInititalizer implements CommandLineRunner {
    private final CarRepository carRepository;
    private final UserRepository userRepository;
@Override
public void run(String... args) throws Exception{
    if(carRepository.count()==0) {
        Car car1 = Car.builder()
                .brand("Geely")
                .model("Coolray")
                .plateNumber("1234 АВ-7")
                .pricePerMinute(BigDecimal.valueOf(0.45))
                .fuelLevel(85)
                .mileAge(12500)
                .location("ул. Немига, 5")
                .status(CarStatus.AVAILABLE)
                .isActive(true)
                .build();

        Car car2 = Car.builder()
                .brand("Volkswagen")
                .model("Polo")
                .plateNumber("5678 BX-7")
                .pricePerMinute(BigDecimal.valueOf(0.35))
                .fuelLevel(60)
                .mileAge(48200)
                .location("пр-т Победителей, 9")
                .status(CarStatus.AVAILABLE)
                .isActive(true)
                .build();


        Car car3 = Car.builder()
                .brand("Tesla")
                .model("Model 3")
                .plateNumber("9999 MI-7")
                .pricePerMinute(BigDecimal.valueOf(0.89))
                .fuelLevel(90)
                .mileAge(8100)
                .location("ТЦ Дана Молл")
                .status(CarStatus.IN_USE)
                .isActive(true)
                .build();

        Car car4 = Car.builder()
                .brand("Kia")
                .model("Rio")
                .plateNumber("1122 TT-7")
                .pricePerMinute(BigDecimal.valueOf(0.30))
                .fuelLevel(15)
                .mileAge(95000)
                .location("СТО Малиновка")
                .status(CarStatus.MAINTENANCE)
                .isActive(true)
                .build();

        carRepository.saveAll(List.of(car1,car2,car3,car4));
        log.info("Демонстрационные автомобили успешно загружены в базу данных: {} шт.", carRepository.count());
    }
    if(userRepository.count()==0) {
        User user1 = User.builder()
                .username("client1")
                .password("12345")
                .firstname("Ivan")
                .lastName("Иванов")
                .phone("375191234567")
                .userStatus(UserStatus.ROLE_CLIENT)
                .isActive(true)
                .build();

        userRepository.save(user1);
        log.info("Test user created ID: {}", user1.getId());
    }
}
}
