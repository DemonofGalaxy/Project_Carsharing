package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.RentalResponseDto;
import demonofgalaxy.project_carsharing.service.RentalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class RentalController {
    private final RentalService rentalService;

    @PostMapping("/start")
    public ResponseEntity<RentalResponseDto> startRide(@RequestParam Long userId, @RequestParam Long carId){
       RentalResponseDto savedRentalDto= rentalService.startRental(userId, carId);
       return ResponseEntity
               .status(HttpStatus.CREATED)
               .body(savedRentalDto);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<RentalResponseDto> endRide(@PathVariable Long id, @RequestParam(defaultValue = "minuteTariffStrategy") String tariffName){
    RentalResponseDto endRentalDto=rentalService.endRental(id,tariffName);
    return ResponseEntity.ok(endRentalDto);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RentalResponseDto>> getRentalHistory(@PathVariable Long userId){
        List<RentalResponseDto> getRentals=rentalService.getHistoryByUserId(userId);
       return ResponseEntity.ok(getRentals);
    }
}
