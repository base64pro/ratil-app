from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# --- Pydantic Models ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"

class User(BaseModel):
    username: str
    role: str
    
    model_config = ConfigDict(from_attributes=True)

# --- START: New Model for Password Change ---
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
# --- END: New Model for Password Change ---

class ContentItem(BaseModel):
    id: int
    title: str
    description: str
    imageUrl: str
    
    model_config = ConfigDict(from_attributes=True)


class AdminContentItem(ContentItem):
    category: str
    subcategory_id: int
    subcategory_name: str

    model_config = ConfigDict(from_attributes=True)


class Subcategory(BaseModel):
    id: int
    name: str
    
    model_config = ConfigDict(from_attributes=True)


class SubcategoryCreate(BaseModel):
    name: str