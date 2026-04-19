import joblib
import os
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "random_forest_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "feature_names.pkl")

model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)


def predict_next_cycle(user_history: list) -> dict:

    if len(user_history) == 0:
        return {
            'predicted_days': 28,
            'confidence_range': 5,
            'method': 'default - no cycles logged yet',
            'reliable': False
        }

    if len(user_history) < 3:
        avg = np.mean([c['cycle_length'] for c in user_history])
        return {
            'predicted_days': round(avg),
            'confidence_range': 2,
            'method': 'average',
            'reliable': False
        }

    lengths = [c['cycle_length'] for c in user_history]
    last = user_history[-1]
    second_last = user_history[-2]

    rolling_avg_3 = np.mean(lengths[-3:])
    rolling_avg_5 = np.mean(lengths[-5:]) if len(lengths) >= 5 else np.mean(lengths)
    cycle_variance = np.std(lengths[-3:])
    prev_cycle_length = last['cycle_length']

    stress_trend = last['stress_level'] - second_last['stress_level']
    deviation_from_baseline = last['cycle_length'] - np.mean(lengths)
    sleep_deficit = 1 if last['sleep_hours'] < 6 else 0

    input_data = pd.DataFrame([{
        'prev_cycle_length': prev_cycle_length,
        'rolling_avg_3': rolling_avg_3,
        'rolling_avg_5': rolling_avg_5,
        'cycle_variance': cycle_variance,
        'stress_level': last['stress_level'],
        'stress_trend': stress_trend,
        'sleep_hours': last['sleep_hours'],
        'sleep_deficit': sleep_deficit,
        'exercise_intensity': last['exercise_intensity'],
        'illness_flag': last['illness_flag'],
        'deviation_from_baseline': deviation_from_baseline
    }])

    input_data = input_data[features]

    predicted_days = round(float(model.predict(input_data)[0]))

    confidence_range = max(2, round(cycle_variance))

    return {
        'predicted_days': predicted_days,
        'confidence_range': confidence_range,
        'method': 'random_forest',
        'reliable': True
    }


# ---------------- TEST BLOCK ----------------
if __name__ == "__main__":

    print("Running tests...")

    history = [
        {'cycle_length': 28, 'stress_level': 2, 'sleep_hours': 7.5, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 30, 'stress_level': 3, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 27, 'stress_level': 2, 'sleep_hours': 8.0, 'exercise_intensity': 3, 'illness_flag': 0},
    ]

    result = predict_next_cycle(history)

    print(result)