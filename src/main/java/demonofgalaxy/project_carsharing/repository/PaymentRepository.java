package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.payment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByRentalId(Long rentalId);
}