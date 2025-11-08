"""
Database Models and Setup

Example using SQLAlchemy for database operations.
Replace with your preferred database solution.
"""

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecorewards.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ========== DATABASE MODELS ==========

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    daily_commute_mode = Column(String)
    home_ownership = Column(String)
    diet_preference = Column(String)
    wallet_balance = Column(Integer, default=0)
    total_impact = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    challenges = relationship("UserChallenge", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    onboarding = relationship("OnboardingData", back_populates="user", uselist=False)


class OnboardingData(Base):
    __tablename__ = "onboarding_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    location_type = Column(String)
    daily_commute_mode = Column(String)
    home_ownership = Column(String)
    outdoor_space = Column(String)
    diet_preference = Column(String)
    waste_segregation = Column(String)
    appliance_upgrade = Column(String)
    travel_habits = Column(String)
    ev_interest = Column(String)
    community_involvement = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="onboarding")


class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    category = Column(String)
    reward = Column(Integer)
    impact_score = Column(Integer)
    duration = Column(String)
    icon = Column(String)
    
    user_challenges = relationship("UserChallenge", back_populates="challenge")


class UserChallenge(Base):
    __tablename__ = "user_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    challenge_id = Column(String, ForeignKey("challenges.id"))
    is_active = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    user = relationship("User", back_populates="challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    type = Column(String)  # 'earned' or 'redeemed'
    amount = Column(Integer)
    description = Column(String)
    challenge_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")


class RedemptionOption(Base):
    __tablename__ = "redemption_options"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    coins_required = Column(Integer)
    category = Column(String)
    is_active = Column(Boolean, default=True)


# ========== DATABASE FUNCTIONS ==========

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Example usage functions

def create_user(db, user_data: dict):
    """Create a new user"""
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db, user_id: str):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def save_onboarding(db, user_id: str, onboarding_data: dict):
    """Save onboarding responses"""
    onboarding = OnboardingData(user_id=user_id, **onboarding_data)
    db.add(onboarding)
    db.commit()
    return onboarding


def get_user_challenges(db, user_id: str):
    """Get all challenges for a user"""
    return db.query(UserChallenge).filter(UserChallenge.user_id == user_id).all()


def add_transaction(db, user_id: str, transaction_data: dict):
    """Add a transaction"""
    transaction = Transaction(user_id=user_id, **transaction_data)
    db.add(transaction)
    db.commit()
    return transaction
