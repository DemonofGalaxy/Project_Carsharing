package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.CarResponseDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.mapper.CarMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public final void updateCarStatus(Long carId, CarStatus newStatus){
        Car car=carRepository.findById(carId).orElseThrow(()->new EntityNotFoundException("Impossible to find the object with id: "+carId));
        car.setStatus(newStatus);
        carRepository.save(car);
    }

}
