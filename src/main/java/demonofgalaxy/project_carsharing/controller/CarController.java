package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.CarCreateDto;
import demonofgalaxy.project_carsharing.dto.CarMileAgeUpdateDto;
import demonofgalaxy.project_carsharing.dto.CarResponseDto;
import demonofgalaxy.project_carsharing.dto.CarStatusUpdateDto;
import demonofgalaxy.project_carsharing.entity.car.Car;
import demonofgalaxy.project_carsharing.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@CrossOrigin(origins="*")//Обязательно исправить на нормальный адрес фронта
@Slf4j
public class CarController {
    private final CarService carService;

@GetMapping("/available")
   public ResponseEntity<List<CarResponseDto>> getAvailableCars(){
    log.info("GET /api/cars/available - запрос каталога свободных авто");
    List<CarResponseDto> availableCars=carService.getAvailableCars();
    return ResponseEntity.ok(availableCars);
}

@GetMapping("")
    public ResponseEntity<List<CarResponseDto>> getAllCars(){
    List<CarResponseDto> allCars=carService.getAllCars();
    return ResponseEntity.ok(allCars);
}

@GetMapping("/{carId}")
    public ResponseEntity<CarResponseDto> getCarById(@PathVariable Long carId){
    CarResponseDto car=carService.getCarById(carId);
    return ResponseEntity.ok(car);
}

@PostMapping("")
    public ResponseEntity<CarResponseDto> createCar(@RequestParam @Valid CarCreateDto dto){
    CarResponseDto createDto=carService.addCar(dto);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(createDto);
}

@PatchMapping("/{carId}/status")
    public ResponseEntity<CarResponseDto> updateCarStatus(@PathVariable Long carId, @RequestBody CarStatusUpdateDto statusUpdateDto){
    CarResponseDto carDto=carService.updateCarStatus(carId,statusUpdateDto);
    return ResponseEntity.ok(carDto);
}

@PatchMapping("/{carId}/mileage")
    public ResponseEntity<CarResponseDto> updateMileage(@PathVariable Long carId, @RequestBody CarMileAgeUpdateDto mileAge){
    CarResponseDto carDto=carService.updateMileage(carId,mileAge);
    return ResponseEntity.ok(carDto);
}

@PatchMapping("/{carId}/deactivate")
    public ResponseEntity<CarResponseDto> deactivateCar(@PathVariable Long carId){
    CarResponseDto carDto=carService.deactivateCar(carId);
    return ResponseEntity.ok(carDto);
}
}
