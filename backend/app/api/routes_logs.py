from app.models.logs import ActivityLog
from fastapi import HTTPException

def log_action(db, user_id, action, entity, entity_id):
    
    try:
        log_entry = ActivityLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating new ActivityLog: {str(e)}"
        )