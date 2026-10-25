package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car,Long> {
    List<Car> findAllByStatus(CarStatus status);

    Optional<Car> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

}
