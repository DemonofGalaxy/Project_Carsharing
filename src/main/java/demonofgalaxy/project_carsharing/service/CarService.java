package demonofgalaxy.project_carsharing.service;

import demonofgalaxy.project_carsharing.dto.car.CarCreateDto;
import demonofgalaxy.project_carsharing.dto.car.CarMileAgeUpdateDto;
import demonofgalaxy.project_carsharing.dto.car.CarResponseDto;
import demonofgalaxy.project_carsharing.dto.car.CarStatusUpdateDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.entity.car.CarStatus;
import demonofgalaxy.project_carsharing.mapper.CarMapper;
import demonofgalaxy.project_carsharing.repository.CarRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarService {
    private final CarRepository carRepository;
    private final CarMapper carMapper;
    public List<CarResponseDto> getAvailableCars(){
    List<Car> cars=carRepository.findAllByStatus(CarStatus.AVAILABLE);
    return cars.stream().filter(car -> car.getIsActive()==true).map(carMapper::toDto).toList();
    }

    public List<CarResponseDto> getAllCars(){
        List<Car> cars=carRepository.findAll();
        return cars.stream().map(carMapper::toDto).toList();
    }
@Transactional
    public CarResponseDto updateCarStatus(Long carId, CarStatusUpdateDto newStatus){
        CarStatus status=newStatus.status();
        Car car=carRepository.findById(carId).orElseThrow(()->new EntityNotFoundException("Impossible to find the object with id: "+carId));
        if(!car.getIsActive()) throw new IllegalStateException("The car isn`t active");
        if(status==CarStatus.IN_USE) throw new IllegalStateException("IN_USE status");
       if(status!=CarStatus.AVAILABLE && status!=CarStatus.MAINTENANCE && status!=CarStatus.BLOCKED) throw new IllegalStateException("Wrong status");
        car.setStatus(status);
        carRepository.save(car);
        return carMapper.toDto(car);
    }

    public CarResponseDto getCarById(Long carId){
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

    @Transactional
    public CarResponseDto updateMileage(Long carId, CarMileAgeUpdateDto mileAge){
        Car car=carRepository.findById(carId).orElseThrow(()->new NoSuchElementException("Car with id: "+carId+"don`t exist"));
        if(!car.getIsActive()) throw new IllegalStateException("Wrong status");
        Integer mileage=mileAge.mileAge();
        if(mileage<=car.getMileAge()) throw new IllegalArgumentException("A new mileage must be more than old");
        car.setMileAge(mileage);
        carRepository.save(car);
        return carMapper.toDto(car);
    }
@Transactional
    public CarResponseDto deactivateCar(Long carId){
        Car car=carRepository.findById(carId).orElseThrow(()->new NoSuchElementException("Car with id:"+carId+" not found"));
        if(car.getStatus()==CarStatus.IN_USE) throw new IllegalStateException("Car is working");
        car.setIsActive(false);
        car.setStatus(CarStatus.BLOCKED);
        carRepository.save(car);
        return carMapper.toDto(car);
    }



}
