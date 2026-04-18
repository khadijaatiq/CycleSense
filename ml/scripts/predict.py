import joblib 
import os
import numpy as np 
import pandas as pd 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODULE_PATH = os.path.join(BASE_DIR, '..', 'saved_models', 'random_forest_model.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, '..', 'saved_models', 'feature_names.pkl')

model = joblib.load(MODULE_PATH)
features = joblib.load(FEATURES_PATH)

def predict_next_cycle(user_history: list) -> dict:
    if len(user_history) == 0:
        return {
            'predicted_days':   28,
            'confidence_range': 5,
            'method':           'default - no cycles logged yet',
            'reliable':         False
        }
    """Predicts the next menstrual cycle length for a user.

    Parameters:
        user_history: list of dicts, oldest cycle first.
        Each dict must contain:
            - cycle_length      (int)
            - stress_level      (int, 1-5)
            - sleep_hours       (float)
            - exercise_intensity (int, 1-3)
            - illness_flag      (int, 0 or 1)

    Returns:
        dict with keys:
            - predicted_days    (int)
            - confidence_range  (int)
            - method            (str)
            - reliable          (bool)"""
    if len(user_history) < 3:
        avg = np.mean([c['cycle_length'] for c in user_history])
        return{
            'predicted_days': round(avg),
            'confidence_range': 0.5,
            'method': 'average',
            'reliable': False
        }
    lengths = [c['cycle_length'] for c in user_history]
    last = user_history[-1]
    second_last = user_history[-2]
    #rebuilding the same features as of during the training  
    #order and nmes must match as in model training
    rolling_avg_3 = np.mean(lengths[-3:]) #average of last 3 cycles
    rolling_avg_5 = np.mean(lengths[-5:]) if len(lengths) >= 5 else np.mean(lengths) #average of last 5 cycles or simple mean of all if less 
    cycle_variance = np.std(lengths[-3:]) #std of last 3 cycles
    prev_cycle_length = last['cycle_length']
    stress_trend = last['stress_level'] - second_last['stress_level']
    deviation_from_baseline = last['cycle_length'] - np.mean(lengths) #deviation of last cycle from overall mean
    sleep_deficit = 1 if last['sleep_hours'] < 6 else 0 #binary feature for sleep deficit
    
    input_data = pd.DataFrame([{
        'prev_cycle_length':        prev_cycle_length,
        'rolling_avg_3':            rolling_avg_3,
        'rolling_avg_5':            rolling_avg_5,
        'cycle_variance':           cycle_variance,
        'stress_level':             last['stress_level'],
        'stress_trend':             stress_trend,
        'sleep_hours':              last['sleep_hours'],
        'sleep_deficit':            sleep_deficit,
        'exercise_intensity':       last['exercise_intensity'],
        'illness_flag':             last['illness_flag'],
        'deviation_from_baseline':  deviation_from_baseline
    }])
    input_data = input_data[features] #ensure correct feature order
    predicted_days = round(float(model.predict(input_data)[0]))
    #confidence estimation based on variance of last 3 cycles
    confidence_range = max(2, round(cycle_variance)) #at least 2 days confidence range
    return{
        'predicted_days': predicted_days,
        'confidence_range': confidence_range,
        'method': 'random_forest',
        'reliable': True
    }
    #test block - when this script is run directly, it will execute this block
    #during normal import, this block will be ignored
if __name__ == "__main__":    #example user history for testing
   
    print("Test 1: Normal user with 4 cycles logged")
    history_normal = [
        {'cycle_length': 28, 'stress_level': 2, 'sleep_hours': 7.5, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 30, 'stress_level': 3, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 27, 'stress_level': 2, 'sleep_hours': 8.0, 'exercise_intensity': 3, 'illness_flag': 0},
        {'cycle_length': 29, 'stress_level': 2, 'sleep_hours': 7.5, 'exercise_intensity': 2, 'illness_flag': 0},
    ]
    result = predict_next_cycle(history_normal)
    print(f"   Predicted : {result['predicted_days']} days")
    print(f"   Confidence: ± {result['confidence_range']} days")
    print(f"   Reliable  : {result['reliable']}")

    print("\nTest 2: Stressed user who was sick last cycle")
    history_stressed = [
        {'cycle_length': 28, 'stress_level': 2, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 31, 'stress_level': 4, 'sleep_hours': 5.5, 'exercise_intensity': 1, 'illness_flag': 0},
        {'cycle_length': 35, 'stress_level': 5, 'sleep_hours': 4.5, 'exercise_intensity': 1, 'illness_flag': 1},
    ]
    result = predict_next_cycle(history_stressed)
    print(f"   Predicted : {result['predicted_days']} days")
    print(f"   Confidence: ± {result['confidence_range']} days")
    print(f"   Reliable  : {result['reliable']}")

    print("\nTest 3: Cold start — only 2 cycles logged")
    history_cold = [
        {'cycle_length': 28, 'stress_level': 3, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
        {'cycle_length': 30, 'stress_level': 3, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
    ]
    result = predict_next_cycle(history_cold)
    print(f"   Predicted : {result['predicted_days']} days")
    print(f"   Confidence: ± {result['confidence_range']} days")
    print(f"   Reliable  : {result['reliable']}")
    print(f"   Method    : {result['method']}")  

    print("\nTest 4: User with very irregular cycles")
    history_irregular = [
        {'cycle_length': 21, 'stress_level': 5, 'sleep_hours': 4.0, 'exercise_intensity': 1, 'illness_flag': 1},
        {'cycle_length': 38, 'stress_level': 5, 'sleep_hours': 4.5, 'exercise_intensity': 1, 'illness_flag': 0},
        {'cycle_length': 24, 'stress_level': 4, 'sleep_hours': 5.0, 'exercise_intensity': 2, 'illness_flag': 1},
        {'cycle_length': 40, 'stress_level': 5, 'sleep_hours': 4.0, 'exercise_intensity': 1, 'illness_flag': 1},
    ]
    result = predict_next_cycle(history_irregular)
    print(f"   Predicted : {result['predicted_days']} days")
    print(f"   Confidence: ± {result['confidence_range']} days")

    print("\nTest 5: Single cycle — cold start")
    history_one = [
        {'cycle_length': 28, 'stress_level': 3, 'sleep_hours': 7.0, 'exercise_intensity': 2, 'illness_flag': 0},
    ]
    result = predict_next_cycle(history_one)
    print(f"   Predicted : {result['predicted_days']} days")
    print(f"   Reliable  : {result['reliable']}")

    print("\nTest 6: Empty history — should not crash")
    try:
        result = predict_next_cycle([])
        print(f"   Predicted : {result['predicted_days']} days")
        print(f"   Reliable  : {result['reliable']}")
    except Exception as e:
        print(f"   ERROR: {e}")  