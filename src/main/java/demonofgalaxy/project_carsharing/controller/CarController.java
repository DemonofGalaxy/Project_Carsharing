package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.CarResponseDto;
import demonofgalaxy.project_carsharing.service.CarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


}
