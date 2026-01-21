from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime, timezone
from app.core.database_postgres import Base
from sqlalchemy.orm import relationship
from app.models.user import User

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(255))
    entity = Column(String(50))
    entity_id = Column(Integer)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="activity_logs")