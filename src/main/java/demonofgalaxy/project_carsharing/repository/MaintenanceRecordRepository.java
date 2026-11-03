package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.maintenance.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findAllByCarId(Long carId);
}