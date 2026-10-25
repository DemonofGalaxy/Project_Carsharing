package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.RentalResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel ="spring")
public interface RentalMapper {
    @Mapping(source="user.id", target = "userId")
    @Mapping(source = "user.username",target="username")
    @Mapping(source = "car.id",target="carId")
    @Mapping(source = "car.brand",target="carBrand")
    @Mapping(source = "car.model",target = "carModel")
    @Mapping(source = "car.plateNumber",target="plateNumber")

    RentalResponseDto toDto(Rental rental);
}
