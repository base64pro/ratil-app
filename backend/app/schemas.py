from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime

# --- START: MODIFICATION ---
# User schemas updated for new logic and fields
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "admin" # Default role is now admin
    can_access_portfolio: bool = True

class User(BaseModel):
    username: str
    role: str
    can_access_portfolio: bool
    
    model_config = ConfigDict(from_attributes=True)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
# --- END: MODIFICATION ---


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

# --- START: NEW SCHEMAS for Portfolio ---
class ClientBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PortfolioItemBase(BaseModel):
    title: str
    description: Optional[str] = None

class PortfolioItemCreate(PortfolioItemBase):
    client_id: int
    portfolio_category_id: int

class PortfolioItem(PortfolioItemBase):
    id: int
    file_url: str
    upload_date: datetime
    client: Client
    portfolio_category: Subcategory

    model_config = ConfigDict(from_attributes=True)
# --- END: NEW SCHEMAS ---

