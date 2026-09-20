# Demand Forecasting Dataset — Cooperative Gig Services Platform

**File:** `demand_forecasting_dataset.csv`
**Rows:** 58,400 | **Granularity:** 1 row = one zone × one service × one day
**Time span:** 2023-01-01 to 2024-12-30 (2 years, daily), across 10 zones and 8 service types.

Synthetic but designed with realistic seasonality: weekend spikes, monsoon effects on
plumbing/electrical, festival-season boosts on cooking/babysitting, extreme-heat effects,
a slow platform-growth trend, and a supply ceiling (bookings capped by available workers).

## Columns

| Column | Type | Description |
|---|---|---|
| `date` | date | Booking date |
| `day_of_week` | categorical | Monday–Sunday |
| `is_weekend` | binary | 1 if Sat/Sun |
| `month` | int | 1–12 |
| `is_holiday_or_festival` | binary | Falls on a festival/holiday date |
| `zone_id` / `zone_name` | categorical | One of 10 service zones |
| `zone_density_tier` | categorical | Low/Medium/High population density |
| `service_type` | categorical | One of 8 services (Cleaning, Plumbing, Electrical, Cooking/Catering, Elderly Care, Babysitting, Gardening, Laundry) |
| `price_tier` | categorical | Low/Medium/High price bracket for that service |
| `weather_condition` | categorical | Sunny/Cloudy/Rainy/Extreme_Heat/Foggy |
| `temperature_c` | float | Approx. daily temperature |
| `num_available_workers` | int | Workers available in that zone that day |
| `avg_zone_worker_rating` | float | Average worker rating in that zone (1–5) |
| `promo_active` | binary | Whether a promo campaign ran that day |
| `past_7day_avg_bookings` | float | Trailing 7-day average bookings (lag feature) |
| `avg_response_time_min` | float | Average worker response time (minutes) |
| `cancellation_rate` | float | Fraction of bookings cancelled that day |
| `bookings_demand` | int | **Target** — number of bookings for that zone/service/day |

## Suggested modeling approach
- **Baseline:** Gradient boosting (XGBoost/LightGBM) or Random Forest regression on the
  tabular features above — fast, handles categoricals well, good first benchmark.
- **Time-series specific:** Facebook Prophet or a SARIMA per zone-service series if you
  want pure date-driven seasonality without other features.
- **Deep learning:** LSTM/GRU or Temporal Fusion Transformer if you want to model
  sequences of `past_7day_avg_bookings` style lag windows directly, useful once you have
  real historical data at scale.
- **Feature engineering ideas to add:** rolling 14/30-day averages, day-of-month,
  distance to nearest festival, worker-to-booking ratio, previous week's cancellation rate.
- **Evaluation:** MAE / RMSE on a held-out last-3-months-per-zone split (time-based split,
  not random, since this is a forecasting task).

## Notes
This is synthetic data meant to let you build and validate your pipeline (EDA, feature
engineering, train/test split, model training, evaluation) before real booking data is
available. Once live data starts flowing from the platform, swap this file for the real
extract — the schema above should map directly onto real event/booking logs.
