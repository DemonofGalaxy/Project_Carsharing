package demonofgalaxy.project_carsharing.service.strategy;

import demonofgalaxy.project_carsharing.strategy.DiscountTariffStrategy;
import demonofgalaxy.project_carsharing.strategy.MinuteTariffStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TariffStrategyTest {

    private final MinuteTariffStrategy minuteTariffStrategy = new MinuteTariffStrategy();
    private final DiscountTariffStrategy discountTariffStrategy = new DiscountTariffStrategy();

    @ParameterizedTest(name = "Минутный тариф: {0} руб/мин * {1} мин = {2} руб")
    @CsvSource({
            "0.50, 10, 5.00",
            "0.40, 30, 12.00",
            "1.00, 1,  1.00",
            "0.35, 60, 21.00"
    })
    @DisplayName("Параметризованный тест: расчет минутного тарифа")
    void finalPrice_MinuteTariff_Parameterized(double price, long minutes, double expected) {
        BigDecimal basePrice = BigDecimal.valueOf(price);
        BigDecimal result = minuteTariffStrategy.finalPrice(basePrice, minutes);

        assertEquals(0, BigDecimal.valueOf(expected).compareTo(result));
    }

    @ParameterizedTest(name = "Тариф со скидкой 10%: {0} руб/мин * {1} мин = {2} руб")
    @CsvSource({
            "1.00, 10, 9.00",
            "0.50, 20, 9.00",
            "2.00, 5,  9.00"
    })
    @DisplayName("Параметризованный тест: расчет тарифа со скидкой 10%")
    void finalPrice_DiscountTariff_Parameterized(double price, long minutes, double expected) {
        BigDecimal basePrice = BigDecimal.valueOf(price);
        BigDecimal result = discountTariffStrategy.finalPrice(basePrice, minutes);

        assertEquals(0, BigDecimal.valueOf(expected).compareTo(result));
    }
}