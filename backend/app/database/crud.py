from sqlalchemy.orm import Session
from . import models


# ---------------------------
# Create a new travel group
# ---------------------------
def create_group(db: Session, group_name: str):
    group = models.Group(group_name=group_name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


# ---------------------------
# Add member to a group
# ---------------------------
def add_member(db: Session, group_id: int, name: str, budget: str, pace: str):
    member = models.Member(
        name=name,
        budget=budget,
        pace=pace,
        group_id=group_id
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


# ---------------------------
# Add preference for member (UPDATED WITH VIBE)
# ---------------------------
def add_preference(db: Session, member_id: int, destination: str, activity: str, vibe: str):
    pref = models.Preference(
        member_id=member_id,
        destination=destination,
        activity=activity,
        vibe=vibe   # ✅ NEW FIELD
    )
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref


# ---------------------------
# Save PackVote result
# ---------------------------
def save_result(db: Session, group_id: int, destination: str, happiness: float):
    result = models.Result(
        group_id=group_id,
        destination=destination,
        group_happiness=happiness
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


# ---------------------------
# Get group members
# ---------------------------
def get_group_members(db: Session, group_id: int):
    return db.query(models.Member).filter(models.Member.group_id == group_id).all()


# ---------------------------
# Get member preferences
# ---------------------------
def get_member_preferences(db: Session, member_id: int):
    return db.query(models.Preference).filter(models.Preference.member_id == member_id).all()