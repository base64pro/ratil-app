from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime

from .database import Base

# --- START: MODIFICATION ---
# Added can_access_portfolio field and changed default role
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="admin") # Default role is now admin
    can_access_portfolio = Column(Boolean, default=True)

# --- END: MODIFICATION ---

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) 
    display_name = Column(String) 

    subcategories = relationship("Subcategory", back_populates="owner_category", cascade="all, delete-orphan")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    owner_category = relationship("Category", back_populates="subcategories")
    items = relationship("ContentItem", back_populates="owner_subcategory", cascade="all, delete-orphan")
    # --- START: MODIFICATION ---
    # Add relationship to PortfolioItem. This allows a subcategory to be a portfolio category.
    portfolio_items = relationship("PortfolioItem", back_populates="portfolio_category", cascade="all, delete-orphan")
    # --- END: MODIFICATION ---


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    imageUrl = Column(String)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))

    owner_subcategory = relationship("Subcategory", back_populates="items")

# --- START: NEW MODELS ---
class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    contact_person = Column(String)
    phone = Column(String)
    address = Column(String)
    email = Column(String, unique=True, index=True)
    
    portfolio_items = relationship("PortfolioItem", back_populates="client", cascade="all, delete-orphan")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    file_url = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    client_id = Column(Integer, ForeignKey("clients.id"))
    portfolio_category_id = Column(Integer, ForeignKey("subcategories.id"))

    client = relationship("Client", back_populates="portfolio_items")
    portfolio_category = relationship("Subcategory", back_populates="portfolio_items")
# --- END: NEW MODELS ---

