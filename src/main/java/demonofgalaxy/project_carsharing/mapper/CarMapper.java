package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.CarResponseDto;
import demonofgalaxy.project_carsharing.entity.Car.Car;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel="spring")
public interface CarMapper {
    CarResponseDto toDto(Car car);

    List<CarResponseDto> toDtoList(List<Car> cars);
}
