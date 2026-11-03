package demonofgalaxy.project_carsharing.controller;

import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceCreateDto;
import demonofgalaxy.project_carsharing.dto.maintenance.MaintenanceResponseDto;
import demonofgalaxy.project_carsharing.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/start")
    public ResponseEntity<MaintenanceResponseDto> startMaintenance(@RequestBody @Valid MaintenanceCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.startMaintenance(dto));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<MaintenanceResponseDto> completeMaintenance(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal actualCost) {
        return ResponseEntity.ok(maintenanceService.completeMaintenance(id, actualCost));
    }

    @GetMapping("")
    public ResponseEntity<List<MaintenanceResponseDto>> getAll() {
        return ResponseEntity.ok(maintenanceService.getAllRecords());
    }
}