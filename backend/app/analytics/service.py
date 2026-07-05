import math
from collections.abc import Sequence


class AnalyticsService:
    @staticmethod
    def moving_average(values: Sequence[float], window: int) -> list[float]:
        if window < 1 or not values:
            return []
        result = []
        for i in range(len(values)):
            start = max(0, i - window + 1)
            result.append(sum(values[start:i + 1]) / (i - start + 1))
        return result

    @staticmethod
    def rms(values: Sequence[float]) -> float:
        if not values:
            return 0.0
        return math.sqrt(sum(v * v for v in values) / len(values))

    @staticmethod
    def peak(values: Sequence[float]) -> float:
        return max(abs(v) for v in values) if values else 0.0

    @staticmethod
    def crest_factor(values: Sequence[float]) -> float:
        if not values:
            return 0.0
        rms_val = AnalyticsService.rms(values)
        if rms_val == 0:
            return 0.0
        return AnalyticsService.peak(values) / rms_val

    @staticmethod
    def kurtosis(values: Sequence[float]) -> float:
        n = len(values)
        if n < 4:
            return 0.0
        mean = sum(values) / n
        variance = sum((v - mean) ** 2 for v in values) / n
        if variance == 0:
            return 0.0
        m4 = sum((v - mean) ** 4 for v in values) / n
        return m4 / (variance * variance) - 3.0

    @staticmethod
    def trend(values: Sequence[float]) -> float:
        n = len(values)
        if n < 2:
            return 0.0
        xs = list(range(n))
        mean_x = (n - 1) / 2.0
        mean_y = sum(values) / n
        num = sum((x - mean_x) * (v - mean_y) for x, v in enumerate(values))
        den = sum((x - mean_x) ** 2 for x in xs)
        return num / den if den != 0 else 0.0
