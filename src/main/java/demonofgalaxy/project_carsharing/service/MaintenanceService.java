package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceCreateDto;
import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.maintenance.MaintenanceRecord;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.MaintenanceRecordRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final CarRepository carRepository;
    private final RentalRepository rentalRepository; // ВНЕДРИЛИ РЕПОЗИТОРИЙ АРЕНДЫ!

    @Transactional
    public MaintenanceResponseDto startMaintenance(MaintenanceCreateDto dto) {
        Car car = carRepository.findById(dto.carId())
                .orElseThrow(() -> new NoSuchElementException("Автомобиль с ID " + dto.carId() + " не найден"));

        // 1. Проверка: не деактивирован ли автомобиль
        if (!car.getIsActive()) {
            throw new IllegalStateException("Нельзя отправить на СТО: автомобиль заблокирован или выведен из эксплуатации");
        }

        // 2. Проверка: не на СТО ли он уже
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            throw new IllegalStateException("Автомобиль уже находится на сервисном обслуживании в ремонтной зоне");
        }

        // 3. Проверка статуса: не в поездке ли он
        if (car.getStatus() == CarStatus.IN_USE) {
            throw new IllegalStateException("Нельзя отправить на СТО: автомобиль сейчас находится в активной поездке у клиента!");
        }

        // 4. Проверка статуса: не забронирован ли он
        if (car.getStatus() == CarStatus.RESERVED) {
            throw new IllegalStateException("Нельзя отправить на СТО: автомобиль забронирован клиентом и ожидает посадки!");
        }

        // 5. ЖЕЛЕЗОБЕТОННАЯ ПРОВЕРКА ПО ТАБЛИЦЕ АРЕНДЫ (на случай рассинхрона):
        // Проверяем, нет ли в базе незавершенных аренд со статусом ACTIVE или RESERVED для этой машины
        boolean isCarBusy = rentalRepository.existsByCarIdAndStatusIn(
                car.getId(),
                List.of(RentalStatus.ACTIVE, RentalStatus.RESERVED)
        );

        if (isCarBusy) {
            throw new IllegalStateException("Нельзя отправить на СТО: для автомобиля существует активная сессия аренды или бронирования!");
        }

        // Переводим машину в статус ТО
        car.setStatus(CarStatus.MAINTENANCE);
        carRepository.save(car);

        MaintenanceRecord record = MaintenanceRecord.builder()
                .car(car)
                .description(dto.description())
                .cost(dto.estimatedCost())
                .startDate(LocalDateTime.now())
                .isCompleted(false)
                .build();

        MaintenanceRecord saved = maintenanceRepository.save(record);
        log.info("Car ID={} sent to maintenance, record ID={}", car.getId(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public MaintenanceResponseDto completeMaintenance(Long recordId, BigDecimal actualCost) {
        MaintenanceRecord record = maintenanceRepository.findById(recordId)
                .orElseThrow(() -> new NoSuchElementException("Заказ-наряд ТО с ID " + recordId + " не найден"));

        if (Boolean.TRUE.equals(record.getIsCompleted())) {
            throw new IllegalStateException("Данный заказ-наряд уже был закрыт ранее");
        }

        record.setEndDate(LocalDateTime.now());
        record.setIsCompleted(true);
        if (actualCost != null) {
            record.setCost(actualCost);
        }

        // Возвращаем машину на линию
        Car car = record.getCar();
        car.setStatus(CarStatus.AVAILABLE);
        carRepository.save(car);

        MaintenanceRecord saved = maintenanceRepository.save(record);
        log.info("Maintenance ID={} completed. Car ID={} is AVAILABLE again", recordId, car.getId());
        return toDto(saved);
    }

    public List<MaintenanceResponseDto> getAllRecords() {
        return maintenanceRepository.findAll().stream().map(this::toDto).toList();
    }

    private MaintenanceResponseDto toDto(MaintenanceRecord record) {
        return new MaintenanceResponseDto(
                record.getId(),
                record.getCar().getId(),
                record.getCar().getBrand(),
                record.getCar().getModel(),
                record.getCar().getPlateNumber(),
                record.getDescription(),
                record.getCost(),
                record.getStartDate(),
                record.getEndDate(),
                record.getIsCompleted()
        );
    }
}