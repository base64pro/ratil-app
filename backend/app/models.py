from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="admin") 
    can_access_portfolio = Column(Boolean, default=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) 
    display_name = Column(String) 

    # --- START: CORRECTION ---
    # Corrected typo from "back_pop_ulates" to "back_populates"
    subcategories = relationship("Subcategory", back_populates="owner_category", cascade="all, delete-orphan")
    # --- END: CORRECTION ---
    portfolio_items = relationship("PortfolioItem", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    owner_category = relationship("Category", back_populates="subcategories")
    items = relationship("ContentItem", back_populates="owner_subcategory", cascade="all, delete-orphan")

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    imageUrl = Column(String)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))

    owner_subcategory = relationship("Subcategory", back_populates="items")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True)
    contact_person = Column(String)
    phone = Column(String)
    address = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    
    portfolio_items = relationship("PortfolioItem", back_populates="client", cascade="all, delete-orphan")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    file_url = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    client = relationship("Client", back_populates="portfolio_items")
    category = relationship("Category", back_populates="portfolio_items")