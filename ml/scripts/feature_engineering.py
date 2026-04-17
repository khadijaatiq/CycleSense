import pandas as pd
import numpy as np
import os 
def engineer_features(df):
    #new features added,,,train 
    df = df.copy()
    df = df.sort_values(['user_id', 'cycle_num']).reset_index(drop=True)
    #feature 1 - avg of last 3 cycles 
    df['rolling_avg_3'] = (
        df.groupby('user_id')['cycle_length'].transform(lambda x: x.shift(1).rolling(window=3, min_periods=1).mean())
    )
    #feature 2 - rolling avg of last 5 cycles 
    df['rolling_avg_5'] = (
        df.groupby('user_id')['cycle_length'].transform(lambda x: x.shift(1).rolling(window=5, min_periods=1).mean())
    )
    #feature 3 - cycle variance 
    df['cycle_variance'] = (
        df.groupby('user_id')['cycle_length'].transform(lambda x: x.shift(1).rolling(window=3, min_periods=2).std().fillna(0))
    )
    #feature 4 - previous cycle length 
    df['prev_cycle_length'] = (
        df.groupby('user_id')['cycle_length'].shift(1)
    )
    #feature 5 - stress trend 
    df['stress_trend'] = (
        df.groupby('user_id')['stress_level'].transform(lambda x: x.diff().fillna(0))
    )
    #feature 6 - deviation from personal baseline
    user_mean = df.groupby('user_id')['cycle_length'].transform('mean')
    df['deviation_from_baseline'] = df['cycle_length'] - user_mean
    #feature 7 - sleep d eficit 
    df['sleep_deficit'] = (df['sleep_hours'] < 6).astype(int)
    #feature 8 - target variable 
    df['target_cycle_length'] = df.groupby('user_id')['cycle_length'].shift(-1)
    df = df.dropna(subset=['target_cycle_length', 'prev_cycle_length'])
    df = df.reset_index(drop=True)
    return df
if __name__ == "__main__":
    raw = pd.read_csv('../data/synthetic_menstrual_cycle_data.csv')
    processed = engineer_features(raw)
    os.makedirs('../data', exist_ok=True)
    processed.to_csv('../data/processed_menstrual_cycle_data.csv', index=False)
    print(f"Processed dataset created: {len(processed)} rows, {processed['user_id'].nunique()} users")
    print(processed.head(10))
    
