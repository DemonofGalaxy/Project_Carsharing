package demonofgalaxy.project_carsharing.dto.analytics;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record AnalyticsSummaryDto(
        BigDecimal totalRevenue,
        long totalRides,
        BigDecimal totalMaintenanceCost,
        BigDecimal netProfit,
        double fleetUtilizationRate,
        String topRevenueBrand
) {}