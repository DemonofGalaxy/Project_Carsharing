package demonofgalaxy.project_carsharing.entity.payment;

import demonofgalaxy.project_carsharing.entity.rental.Rental;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime paymentTime;

    private String paymentMethod; // "CREDIT_CARD", "BONUS_POINTS" и т.д.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
}