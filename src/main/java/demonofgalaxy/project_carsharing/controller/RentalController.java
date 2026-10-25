package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.entity.rental.Rental;
import demonofgalaxy.project_carsharing.service.RentalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals/")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class RentalController {
    private final RentalService rentalService;

    @PostMapping("/start")
    public ResponseEntity<Rental> startRide(@RequestParam Long userId, @RequestParam Long carId){
       Rental rental= rentalService.startRental(userId, carId);
       return ResponseEntity.ok(rental);
    }

    @PostMapping("/{id}/end")
    public void endRide(@PathVariable Long id, @RequestParam(defaultValue = "minuteTariffStrategy") String tariffName){
    rentalService.endRental(id,tariffName);
    ResponseEntity.ok();
    }
}
