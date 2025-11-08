from pydantic import BaseModel
from typing import List

class DashboardSummary(BaseModel):
    value: List[float]
    change: List[float]