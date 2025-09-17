from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base

# جدول المستخدمين
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer")

# جدول الأقسام الرئيسية
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    # اسم القسم الرئيسي بالإنجليزية لسهولة التعامل معه في الكود
    name = Column(String, unique=True, index=True) 
    # الاسم المعروض باللغة العربية
    display_name = Column(String) 

    subcategories = relationship("Subcategory", back_populates="owner_category")

# جدول الأقسام الفرعية
class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    owner_category = relationship("Category", back_populates="subcategories")
    items = relationship("ContentItem", back_populates="owner_subcategory")

# جدول المحتوى
class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    imageUrl = Column(String)
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))

    owner_subcategory = relationship("Subcategory", back_populates="items")