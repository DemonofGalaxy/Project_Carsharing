package demonofgalaxy.project_carsharing.entity.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, unique = true)
    private String username;
    @Column(nullable = false, length = 60)
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    @Enumerated(EnumType.STRING)
    private UserStatus userStatus;
    private boolean isActive;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
