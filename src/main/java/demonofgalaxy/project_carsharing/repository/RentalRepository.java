package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.Rental.Rental;
import demonofgalaxy.project_carsharing.entity.Rental.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental,Long> {
Optional<Rental> findAllByUserIdAndStatus(Long userId,RentalStatus status);
List<Rental> findAllByUserIdOrderByStartTimeDesc(Long userId);
List<Rental> findAllByStatus(RentalStatus status);

}

