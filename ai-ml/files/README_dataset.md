# KaryaSahyog — AI/ML

This module focuses on **booking demand prediction** for the KaryaSahyog platform.

## What I Did

- Performed **EDA and data analysis** on 58,400 records.
- Engineered time-series features such as **lag-1, lag-7, 14-day and 30-day rolling averages**, and worker-demand ratio.
- Used a **time-based train/test split** to prevent data leakage.
- Applied **One-Hot Encoding** to categorical features.
- Compared **Random Forest and XGBoost** regression models.
- Performed **hyperparameter tuning** using `RandomizedSearchCV` with `TimeSeriesSplit`.
- Conducted **error and high-demand analysis**.
- Improved high-demand predictions using **Weighted XGBoost**, giving demand ≥8 a higher training weight.
- Selected the final **Weighted XGBoost model**.


**A time-based holdout consisting of October–December 2024 was used as an unseen test set. The final weighted XGBoost model achieved an MAE of 1.232 and RMSE of 1.611. To address systematic underprediction during high-demand periods, observations with demand ≥8 were assigned three times the training weight. This reduced high-demand MAE from 4.057 to 3.756 while maintaining comparable overall performance.**


## Final Performance

```text
MAE:  1.2319

RMSE: 1.6113

High-Demand MAE: 3.7558
```
