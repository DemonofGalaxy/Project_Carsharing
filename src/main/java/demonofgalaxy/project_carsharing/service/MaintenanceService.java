package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceCreateDto;
import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.maintenance.MaintenanceRecord;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.MaintenanceRecordRepository;
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

    @Transactional
    public MaintenanceResponseDto startMaintenance(MaintenanceCreateDto dto) {
        Car car = carRepository.findById(dto.carId())
                .orElseThrow(() -> new NoSuchElementException("Car with id " + dto.carId() + " not found"));

        if (car.getStatus() == CarStatus.IN_USE) {
            throw new IllegalStateException("Cannot send car to maintenance while it is IN_USE");
        }

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
                .orElseThrow(() -> new NoSuchElementException("Maintenance record not found"));

        if (Boolean.TRUE.equals(record.getIsCompleted())) {
            throw new IllegalStateException("Maintenance is already completed");
        }

        record.setEndDate(LocalDateTime.now());
        record.setIsCompleted(true);
        if (actualCost != null) {
            record.setCost(actualCost);
        }

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