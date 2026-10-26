package demonofgalaxy.project_carsharing.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DiscountTariffStrategy implements TariffCalculatorStrategy{
    @Override
    public BigDecimal finalPrice(BigDecimal pricePerMinute,long durationMinutes){
        return pricePerMinute.multiply(BigDecimal.valueOf(durationMinutes).multiply(BigDecimal.valueOf(0.9)));
    }

}
