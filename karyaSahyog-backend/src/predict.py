import os
import joblib
import pandas as pd



BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "xgb_demand_model.pkl"
)

PREPROCESSOR_PATH = os.path.join(
    BASE_DIR,
    "models",
    "preprocessor.pkl"
)


model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)



categorical_features = [
    "day_of_week",
    "zone_id",
    "zone_density_tier",
    "service_type",
    "price_tier",
    "weather_condition"
]

numerical_features = [
    "is_weekend",
    "month",
    "is_holiday_or_festival",
    "temperature_c",
    "num_available_workers",
    "avg_zone_worker_rating",
    "promo_active",
    "past_7day_avg_bookings",
    "avg_response_time_min",
    "cancellation_rate",
    "lag_1",
    "lag_7",
    "rolling_14",
    "rolling_30",
    "worker_demand_ratio"
]

FEATURES = categorical_features + numerical_features




def predict_demand(data: dict) -> float:

   
    input_df = pd.DataFrame([data])

    
    input_df = input_df[FEATURES]

    processed_data = preprocessor.transform(input_df)

    prediction = model.predict(processed_data)[0]

    
    prediction = max(0, prediction)

    return round(float(prediction), 2)