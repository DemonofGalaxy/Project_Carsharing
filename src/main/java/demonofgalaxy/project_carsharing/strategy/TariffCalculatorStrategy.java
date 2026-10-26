package demonofgalaxy.project_carsharing.strategy;

import java.math.BigDecimal;

public interface TariffCalculatorStrategy {
    public BigDecimal finalPrice(BigDecimal pricePerMinute,long durationMinutes);
}
