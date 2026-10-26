package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.CarCreateDto;
import demonofgalaxy.project_carsharing.dto.CarResponseDto;
import demonofgalaxy.project_carsharing.dto.CarStatusUpdateDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.mapper.CarMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarService {
    private final CarRepository carRepository;
    private final CarMapper carMapper;
    public final List<CarResponseDto> getAvailableCars(){
    List<Car> cars=carRepository.findAllByStatus(CarStatus.AVAILABLE);
    return cars.stream().map(carMapper::toDto).toList();
    }

    public final List<CarResponseDto> getAllCars(){
        List<Car> cars=carRepository.findAll();
        return cars.stream().map(carMapper::toDto).toList();
    }

    public final CarResponseDto updateCarStatus(Long carId, CarStatusUpdateDto newStatus){
        CarStatus status=newStatus.status();
        Car car=carRepository.findById(carId).orElseThrow(()->new EntityNotFoundException("Impossible to find the object with id: "+carId));
        if(!car.getIsActive()) throw new IllegalStateException("The car isn`t active");
       if(status!=CarStatus.AVAILABLE && status!=CarStatus.MAINTENANCE && status!=CarStatus.BLOCKED) throw new IllegalStateException("Wrong status");
        car.setStatus(status);
        carRepository.save(car);
        return carMapper.toDto(car);
    }

    public final CarResponseDto getCarById(Long carId){
        return carMapper.toDto(carRepository.findById(carId).orElseThrow(()->new NoSuchElementException("Car with id:"+carId+" not found")));
    }
@Transactional
    public CarResponseDto addCar(CarCreateDto dto){
        if(carRepository.existsByPlateNumber(dto.plateNumber())) throw new IllegalStateException("The car already exists");
        Car car=carMapper.toEntity(dto);
        car.setStatus(CarStatus.AVAILABLE);
        car.setIsActive(true);
        carRepository.save(car);
        return carMapper.toDto(car);
    }

}
