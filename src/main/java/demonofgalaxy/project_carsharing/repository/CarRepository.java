package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car,Long> {
    List<Car> findAllByStatus(CarStatus status);

    Optional<Car> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT c FROM Car c WHERE c.id=:id")
    Optional<Car> findByIdWithlock(@Param("id") Long id);

}
