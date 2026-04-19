from pydantic import BaseModel


class CycleLog(BaseModel):
    cycle_start_date:    str
    cycle_length:        int
    stress_level:        int
    sleep_hours:         float
    exercise_intensity:  int
    illness_flag:        int
