package demonofgalaxy.project_carsharing.service.strategy;

import java.math.BigDecimal;

public interface TariffCalculatorStrategy {
    public BigDecimal finalPrice(BigDecimal pricePerMinute,long durationMinutes);
}
