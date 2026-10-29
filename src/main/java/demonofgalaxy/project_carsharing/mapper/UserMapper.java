package demonofgalaxy.project_carsharing.mapper;

import demonofgalaxy.project_carsharing.dto.user.UserRegisterDto;
import demonofgalaxy.project_carsharing.dto.user.UserResponseDto;
import demonofgalaxy.project_carsharing.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel="spring")
public interface UserMapper {
UserResponseDto toDto(User user);
@Mapping(target="id", ignore = true)
@Mapping(target="userStatus", ignore = true)
@Mapping(target="isActive", ignore = true)
@Mapping(target="createdAt", ignore = true)
User toEntity(UserRegisterDto dto);

List<UserResponseDto> toDtoList(List<User> users);
}
