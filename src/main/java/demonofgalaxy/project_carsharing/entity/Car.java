package demonofgalaxy.project_carsharing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "cars")
@Getter
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
    private Double latitude;
    private Double longitude;
    @Enumerated(EnumType.STRING)
    private CarStatus status;
    private boolean isActive=true;

}
