package demonofgalaxy.project_carsharing.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MinuteTariffStrategy implements  TariffCalculatorStrategy{
    @Override
   public BigDecimal finalPrice(BigDecimal pricePerMinute,long durationMinutes){
        return pricePerMinute.multiply(BigDecimal.valueOf(durationMinutes));    }

}
