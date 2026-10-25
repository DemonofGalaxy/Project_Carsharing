package demonofgalaxy.project_carsharing.entity.car;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String brand;
    @Column(nullable = false)
    private String model;
    @Column(nullable = false, unique = true)
    private String plateNumber;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerMinute;
    private Integer fuelLevel;
    private Integer mileAge;
    private String location;
//    private Double latitude;
//    private Double longitude;
    @Enumerated(EnumType.STRING)
    private CarStatus status;
    private boolean isActive;


}
