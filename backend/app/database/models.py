from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from .db import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, index=True)

    members = relationship("Member", back_populates="group")
    results = relationship("Result", back_populates="group")


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    budget = Column(String)
    pace = Column(String)

    group_id = Column(Integer, ForeignKey("groups.id"))

    group = relationship("Group", back_populates="members")
    preferences = relationship("Preference", back_populates="member")


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    destination = Column(String)
    activity = Column(String)
    vibe = Column(String)   # ✅ VIBE FIELD

    member = relationship("Member", back_populates="preferences")  # ✅ IMPORTANT FIX


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String)
    group_happiness = Column(Float)

    group_id = Column(Integer, ForeignKey("groups.id"))

    group = relationship("Group", back_populates="results")