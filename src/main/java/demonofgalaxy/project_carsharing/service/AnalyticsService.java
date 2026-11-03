package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.analytics.AnalyticsSummaryDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.entity.maintenance.MaintenanceRecord;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.rental.RentalStatus;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import demonofgalaxy.project_carsharing.repository.MaintenanceRecordRepository;
import demonofgalaxy.project_carsharing.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final MaintenanceRecordRepository maintenanceRepository;

    public AnalyticsSummaryDto getFleetAnalytics() {
        List<Rental> completedRentals = rentalRepository.findAllByStatus(RentalStatus.COMPLETED);

        BigDecimal totalRevenue = completedRentals.stream()
                .map(Rental::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalRides = completedRentals.size();

        List<MaintenanceRecord> maintenanceRecords = maintenanceRepository.findAll();
        BigDecimal totalMaintenanceCost = maintenanceRecords.stream()
                .map(MaintenanceRecord::getCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalRevenue.subtract(totalMaintenanceCost);

        List<Car> allCars = carRepository.findAll();
        double utilizationRate = 0.0;
        if (!allCars.isEmpty()) {
            long activeCarsCount = allCars.stream()
                    .filter(c -> c.getStatus() == CarStatus.IN_USE || c.getStatus() == CarStatus.RESERVED)
                    .count();
            utilizationRate = BigDecimal.valueOf((double) activeCarsCount / allCars.size() * 100)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        String topBrand = completedRentals.stream()
                .filter(r -> r.getCar() != null && r.getTotalPrice() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getCar().getBrand(),
                        Collectors.reducing(BigDecimal.ZERO, Rental::getTotalPrice, BigDecimal::add)
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Нет данных");

        log.info("Analytics calculated: Revenue={}, Rides={}, NetProfit={}, Utilization={}%",
                totalRevenue, totalRides, netProfit, utilizationRate);

        return AnalyticsSummaryDto.builder()
                .totalRevenue(totalRevenue)
                .totalRides(totalRides)
                .totalMaintenanceCost(totalMaintenanceCost)
                .netProfit(netProfit)
                .fleetUtilizationRate(utilizationRate)
                .topRevenueBrand(topBrand)
                .build();
    }
}