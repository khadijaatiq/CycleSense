import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split, cross_val_score
df = pd.read_csv('../data/processed_menstrual_cycle_data.csv')
FEATURES=[
    'prev_cycle_length',
    'rolling_avg_3',
    'rolling_avg_5',
    'cycle_variance',
    'stress_level',
    'stress_trend',
    'sleep_hours',
    'sleep_deficit',
    'exercise_intensity',
    'illness_flag',
    'deviation_from_baseline'
]
TARGET = 'target_cycle_length'
X = df[FEATURES]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"training samples: {len(X_train)}, testing samples: {len(X_test)}")

baseline_pred = np.full(len(y_test), y_train.mean())
baseline_mae = mean_absolute_error(y_test, baseline_pred)
print(f"Baseline (Calendar Average)")
print(f"    Predicts {y_train.mean():.2f} days for everyone")
print(f"    MAE: {baseline_mae:.2f} days <- this is our baseline to beat")
#2 models se testing - from linear regression and random forest regression
#linear regression 
lr = LinearRegression()
lr.fit(X_train, y_train)
lr_pred = lr.predict(X_test)
lr_mae = mean_absolute_error(y_test, lr_pred)
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
lr_r2 = r2_score(y_test, lr_pred)
lr_improvement = ((baseline_mae - lr_mae) / baseline_mae) * 100
print(f"\n\tLinear Regression")
print(f"    MAE: {lr_mae:.2f} days")
print(f"    RMSE: {lr_rmse:.2f} days")
print(f"    R²: {lr_r2:.2f}")
print(f"    Improvement over Baseline: {lr_improvement:.2f}% days")
#random forest regression
#100 est-> 10 trees and  evg their predictions
#max depth -> how deep the tree can grow - to prevent overfitting - 8 
#min samples leaf -> minimum number of samples required to be at a leaf node - 3
rf = RandomForestRegressor(n_estimators=100, max_depth=8, min_samples_leaf=3, random_state=42)
rf.fit(X_train, y_train)
rf_pred = rf.predict(X_test)
rf_mae = mean_absolute_error(y_test, rf_pred)
rf_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))
rf_r2 = r2_score(y_test, rf_pred)
rf_improvement = ((baseline_mae - rf_mae) / baseline_mae) * 100
print(f"\n\tRandom Forest Regression")
print(f"    MAE: {rf_mae:.2f} days")
print(f"    RMSE: {rf_rmse:.2f} days")
print(f"    R²: {rf_r2:.2f}")
print(f"    Improvement over Baseline: {rf_improvement:.2f}% days") 
#cross validation - splitting the data into 5 folds and training/testing on different combinations to get a more robust estimate of model performance
cv_scores = cross_val_score(rf, X, y, cv=5, scoring='neg_mean_absolute_error')
#neg_mean_absolute_error -> because cross_val_score expects a score to be maximized, we use the negative of MAE so that higher values are better
cv_mae = -cv_scores.mean()
print(f"\n\tRandom Forest Regression (Cross-Validated)")
print(f"    CV MAE: {cv_mae:.2f} +- {cv_scores.std() * 100:.2f} days")
print(f"    Each fold: {[-round(score, 2) for score in cv_scores]} days")
#feature importance - random forest can give us insights into which features are most important for making predictions
importance_df = pd.DataFrame({
    'feature': FEATURES,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False).reset_index(drop=True)
print(f"\n\tFeature Importance")
print(importance_df.to_string(index=False))
#summary 
print(f"\nSummary:")
print(f"Baseline MAE: {baseline_mae:.2f} days")
print(f"Linear Regression MAE: {lr_mae:.2f} days (Improvement: {lr_improvement:.2f}%)")
print(f"Random Forest MAE: {rf_mae:.2f} days (Improvement: {rf_improvement:.2f}%)")
print(f"Random Forest CV MAE: {cv_mae:.2f} days (± {cv_scores.std() * 100:.2f}%)")      
print(f"target met : {'YES ' if rf_mae < 2 else 'NO'} (MAE < 2 days)")
print(f"25% improvement over baseline : {'YES ' if rf_improvement > 25 else 'NO'} (Improvement: {rf_improvement:.2f}%)")


os.makedirs('../saved_models', exist_ok=True)
joblib.dump(rf, '../saved_models/random_forest_model.pkl')
joblib.dump(FEATURES, '../saved_models/feature_names.pkl')
print("\nModel and feature names saved to ../saved_models/")
#feature names are saved to ensure we use the same features during inference as we did during training