package demonofgalaxy.project_carsharing.repository;

import demonofgalaxy.project_carsharing.entity.User.UserStatus;
import demonofgalaxy.project_carsharing.entity.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    List<User> findAllByRole(UserStatus userStatus);
}
