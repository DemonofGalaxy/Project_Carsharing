package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.car.CarCreateDto;
import demonofgalaxy.project_carsharing.dto.car.CarResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel="spring")
public interface CarMapper {
    CarResponseDto toDto(Car car);
    Car toEntity(CarCreateDto dto);

    List<CarResponseDto> toDtoList(List<Car> cars);
}
