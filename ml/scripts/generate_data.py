import pandas as pd 
import numpy as np
import os

np.random.seed(42)

def generate_data(n_users=60, cycles_per_user=12):
    records = []
    for user_id in range(1, n_users + 1):
        personal_baseline = np.random.randint(21, 36)
        personal_variability = np.random.choice([1, 2, 3, 4, 5])
        for cycle_num in range(1, cycles_per_user + 1):
            stress_level = np.random.randint(1, 6)
            sleep_hours = round(np.random.uniform(4, 9), 1)
            exercise_intensity = np.random.randint(1, 4)
            illness_flag = np.random.choice([0, 1], p=[0.85, 0.15])

            stress_effect = (stress_level - 3) * 0.8
            sleep_effect = (6.5 - sleep_hours) * 0.5
            exercise_effect = (exercise_intensity - 2) * -0.3
            illness_effect = illness_flag * np.random.randint(2, 6)
            noise = np.random.normal(0, personal_variability)

            raw_cycle_length = (
                personal_baseline
                + stress_effect
                + sleep_effect
                + exercise_effect
                + illness_effect
                + noise
            )
            cycle_length = int(np.clip(round(raw_cycle_length), 18, 45))

            records.append({
                'user_id': user_id,
                'cycle_num': cycle_num,
                'personal_baseline': personal_baseline,
                'stress_level': stress_level,
                'sleep_hours': sleep_hours,
                'exercise_intensity': exercise_intensity,
                'illness_flag': illness_flag,
                'cycle_length': cycle_length
            })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_data()
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/synthetic_menstrual_cycle_data.csv', index=False)
    print(f"Dataset created: {len(df)} rows, {df['user_id'].nunique()} users")
    print(df.head(10))
    print(df.describe())