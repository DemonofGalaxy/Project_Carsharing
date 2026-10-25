package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.RentalResponseDto;
import demonofgalaxy.project_carsharing.entity.rental.Rental;
import org.mapstruct.Mapper;

@Mapper(componentModel ="spring")
public interface RentalMapper {
    RentalResponseDto toDto(Rental rental);
}
