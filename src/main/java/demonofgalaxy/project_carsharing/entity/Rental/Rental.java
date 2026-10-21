package demonofgalaxy.project_carsharing.entity.Rental;

import demonofgalaxy.project_carsharing.entity.Car.Car;
import demonofgalaxy.project_carsharing.entity.User.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="rentals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="car_id",nullable = false)
    private Car car;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalPrice;
    @Enumerated(EnumType.STRING)
    private RentalStatus status;
    private Integer startMileage;
    private Integer endMileage;
}
