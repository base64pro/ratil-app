from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "admin"
    can_access_portfolio: bool = True

class User(BaseModel):
    username: str
    role: str
    can_access_portfolio: bool
    
    model_config = ConfigDict(from_attributes=True)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# --- Content Schemas ---
class ContentItemBase(BaseModel):
    title: str
    description: str
    imageUrl: str

class ContentItem(ContentItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AdminContentItem(ContentItem):
    category: str
    subcategory_id: int
    subcategory_name: str
    model_config = ConfigDict(from_attributes=True)

class SubcategoryBase(BaseModel):
    name: str

class SubcategoryCreate(SubcategoryBase):
    pass

class Subcategory(SubcategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class Category(BaseModel):
    id: int
    name: str
    display_name: str
    
    model_config = ConfigDict(from_attributes=True)

# --- Client and Portfolio Schemas ---
class ClientBase(BaseModel):
    # --- START: MODIFICATION ---
    # Client name is now optional
    name: Optional[str] = None
    # --- END: MODIFICATION ---
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class Client(ClientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PortfolioItemBase(BaseModel):
    title: str
    description: Optional[str] = None

class PortfolioItemCreate(PortfolioItemBase):
    client_id: int
    category_id: int

class PortfolioItem(PortfolioItemBase):
    id: int
    file_url: str
    upload_date: datetime
    client: Client
    category: Category

    model_config = ConfigDict(from_attributes=True)