package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.CarDto;
import demonofgalaxy.project_carsharing.entity.Car.Car;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel="spring")
public interface CarMapper {
    CarDto toDto(Car car);

    List<CarDto> toDtoList(List<Car> cars);
}
