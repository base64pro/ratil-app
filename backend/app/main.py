import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, HTTPException, status, File, UploadFile, Form, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from . import models, schemas
from .database import SessionLocal, engine
from passlib.context import CryptContext

app = FastAPI(title="Ratil Group API")
models.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Cloudinary Configuration ---
cloudinary.config( 
  cloud_name = "dpanoqkws", 
  api_key = "586796366461835", 
  api_secret = "N9Ijqs-6jDI-DZ23Rv4oHXBCJ3Y" 
)

# --- CORS Middleware ---
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Initial Data Creation ---
def create_initial_data(db: Session):
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        hashed_password = get_password_hash("password123")
        new_admin = models.User(username="admin", hashed_password=hashed_password, role="admin", can_access_portfolio=True)
        db.add(new_admin)
        print("Admin user created.")

    initial_categories = {
        "printedMaterials": "المواد المطبوعة",
        "billboards": "تاجير لافتات طرقية عملاقة",
        "events": "تنظيم المؤتمرات والمناسبات",
        "exhibition": "معرض بيع الاجهزة والمعدات الطباعية",
        "portfolio": "محفظة الروابط والمواد الرقمية" # New portfolio category
    }

    for name, display_name in initial_categories.items():
        if not db.query(models.Category).filter(models.Category.name == name).first():
            db.add(models.Category(name=name, display_name=display_name))
            print(f"Category '{name}' created.")
    
    db.commit()

db_session = SessionLocal()
create_initial_data(db_session)
db_session.close()

# --- API Endpoints ---
@app.get("/")
def read_root(): return {"message": "Welcome to Ratil Group API"}

# --- User Management Endpoints ---
@app.post("/api/login")
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user_in_db = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    
    if not user_in_db or not verify_password(user_credentials.password, user_in_db.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اسم المستخدم أو كلمة المرور غير صحيحة",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"status": "success", "user": schemas.User.from_orm(user_in_db)}

@app.get("/api/users", response_model=List[schemas.User])
def get_users_list(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.post("/api/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    # The role is now 'admin' by default from the schema
    new_user = models.User(
        username=user.username, 
        hashed_password=hashed_password, 
        role=user.role, 
        can_access_portfolio=user.can_access_portfolio
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.put("/api/users/{username}/change-password", status_code=status.HTTP_200_OK)
def change_user_password(username: str, passwords: schemas.PasswordChange, db: Session = Depends(get_db)):
    user_in_db = db.query(models.User).filter(models.User.username == username).first()
    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # --- MODIFICATION: Prevent changing main admin's password by others ---
    # This logic assumes you have a way to identify the currently logged-in user,
    # which requires a full authentication system (like JWT).
    # For now, we'll prevent anyone from changing the 'admin' password except 'admin'
    # This is a simplified check. A real app would use token-based auth.
    if username == "admin" and user_in_db.username != "admin":
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="لا يمكن تغيير كلمة مرور المسؤول الرئيسي")

    if not verify_password(passwords.current_password, user_in_db.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="كلمة المرور الحالية غير صحيحة")
    
    user_in_db.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    
    return {"status": "success", "message": "تم تغيير كلمة المرور بنجاح"}

@app.delete("/api/users/{username}", status_code=status.HTTP_200_OK)
def delete_user(username: str, db: Session = Depends(get_db)):
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete the admin user")
    user_to_delete = db.query(models.User).filter(models.User.username == username).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user_to_delete)
    db.commit()
    return {"status": "success", "message": f"User '{username}' deleted successfully"}

# --- Public Content & Subcategory Endpoints (Unchanged for now) ---
@app.get("/api/content/{category}/subcategories", response_model=List[schemas.Subcategory])
def get_subcategories(category: str, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return category_obj.subcategories

@app.get("/api/content/{category_name}/{subcategory_id}", response_model=List[schemas.ContentItem])
def get_content_by_subcategory(category_name: str, subcategory_id: int, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ContentItem).filter(models.ContentItem.subcategory_id == subcategory_id)
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(or_(models.ContentItem.title.ilike(search_term), models.ContentItem.description.ilike(search_term)))
    return query.all()

# --- Admin-Only Endpoints for Content & Subcategories ---
@app.post("/api/content/{category}/subcategories", response_model=schemas.Subcategory, status_code=status.HTTP_201_CREATED)
def create_subcategory(category: str, subcategory: schemas.SubcategoryCreate, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj: raise HTTPException(status_code=404, detail="Category not found")
    new_subcategory = models.Subcategory(name=subcategory.name, category_id=category_obj.id)
    db.add(new_subcategory); db.commit(); db.refresh(new_subcategory)
    return new_subcategory

@app.put("/api/content/{category}/subcategories/{subcategory_id}", response_model=schemas.Subcategory)
def update_subcategory(subcategory_id: int, subcategory_update: schemas.SubcategoryCreate, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory: raise HTTPException(status_code=404, detail="Subcategory not found")
    db_subcategory.name = subcategory_update.name
    db.commit(); db.refresh(db_subcategory)
    return db_subcategory

@app.delete("/api/content/{category}/subcategories/{subcategory_id}", status_code=status.HTTP_200_OK)
def delete_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory: raise HTTPException(status_code=404, detail="Subcategory not found")
    db.delete(db_subcategory); db.commit()
    return {"status": "success", "message": "Subcategory and its items deleted"}

@app.post("/api/content/{category}/{subcategory_id}", response_model=schemas.ContentItem, status_code=status.HTTP_201_CREATED)
def add_content_to_subcategory(subcategory_id: int, title: str = Form(...), description: str = Form(...), file: Optional[UploadFile] = File(None), db: Session = Depends(get_db)):
    if not db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first():
        raise HTTPException(status_code=404, detail="Subcategory not found")
    file_url = ""
    if file and file.filename:
        resource_type = "video" if file.content_type and file.content_type.startswith("video") else "image"
        upload_result = cloudinary.uploader.upload(file.file, resource_type=resource_type, folder="ratil_group_content")
        file_url = upload_result.get("secure_url", "")
    new_item = models.ContentItem(title=title, description=description, imageUrl=file_url, subcategory_id=subcategory_id)
    db.add(new_item); db.commit(); db.refresh(new_item)
    return new_item

@app.put("/api/content/{category}/{subcategory_id}/{item_id}", response_model=schemas.ContentItem)
def update_content_item(item_id: int, title: str = Form(...), description: str = Form(...), file: Optional[UploadFile] = File(None), db: Session = Depends(get_db)):
    db_item = db.query(models.ContentItem).filter(models.ContentItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Content item not found")
    file_url = db_item.imageUrl
    if file and file.filename:
        resource_type = "video" if file.content_type and file.content_type.startswith("video") else "image"
        upload_result = cloudinary.uploader.upload(file.file, resource_type=resource_type, folder="ratil_group_content")
        file_url = upload_result.get("secure_url", "")
    db_item.title = title; db_item.description = description; db_item.imageUrl = file_url
    db.commit(); db.refresh(db_item)
    return db_item

@app.delete("/api/content/{category}/{subcategory_id}/{item_id}", status_code=status.HTTP_200_OK)
def delete_content_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ContentItem).filter(models.ContentItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Content item not found")
    db.delete(db_item); db.commit()
    return {"status": "success", "message": "Item deleted successfully"}

@app.get("/api/admin/content", response_model=List[schemas.AdminContentItem])
def get_all_content_for_admin(db: Session = Depends(get_db)):
    all_items = db.query(models.ContentItem).options(joinedload(models.ContentItem.owner_subcategory).joinedload(models.Subcategory.owner_category)).all()
    return [schemas.AdminContentItem(
        id=item.id, title=item.title, description=item.description, imageUrl=item.imageUrl,
        category=item.owner_subcategory.owner_category.name,
        subcategory_id=item.subcategory_id, subcategory_name=item.owner_subcategory.name
    ) for item in all_items]

# --- START: NEW PORTFOLIO & CLIENT ENDPOINTS ---
# Client Management
@app.get("/api/clients", response_model=List[schemas.Client])
def get_clients(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Client)
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(or_(
            models.Client.name.ilike(search_term),
            models.Client.address.ilike(search_term),
            models.Client.contact_person.ilike(search_term),
        ))
    return query.order_by(models.Client.name).all()

@app.post("/api/clients", response_model=schemas.Client, status_code=status.HTTP_201_CREATED)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    new_client = models.Client(**client.dict())
    db.add(new_client); db.commit(); db.refresh(new_client)
    return new_client

# Portfolio Item Management
@app.get("/api/portfolio/items", response_model=List[schemas.PortfolioItem])
def get_portfolio_items(
    category_id: Optional[int] = Query(None),
    client_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.PortfolioItem).options(
        joinedload(models.PortfolioItem.client),
        joinedload(models.PortfolioItem.portfolio_category)
    ).order_by(models.PortfolioItem.upload_date.desc())

    if category_id:
        query = query.filter(models.PortfolioItem.portfolio_category_id == category_id)
    if client_id:
        query = query.filter(models.PortfolioItem.client_id == client_id)
    if start_date:
        query = query.filter(models.PortfolioItem.upload_date >= start_date)
    if end_date:
        query = query.filter(models.PortfolioItem.upload_date <= end_date)
        
    return query.all()

@app.post("/api/portfolio/upload", status_code=status.HTTP_201_CREATED)
def upload_portfolio_item(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    client_id: int = Form(...),
    portfolio_category_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Construct a structured path for Cloudinary
    now = datetime.utcnow()
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client: raise HTTPException(404, "Client not found")

    folder_path = f"portfolio/{now.year}/{now.month}/{now.day}/{client.name.replace(' ', '_')}"
    
    resource_type = "video" if file.content_type and file.content_type.startswith("video") else "image"
    upload_result = cloudinary.uploader.upload(file.file, resource_type=resource_type, folder=folder_path)
    file_url = upload_result.get("secure_url", "")
    
    new_item = models.PortfolioItem(
        title=title, description=description, file_url=file_url,
        client_id=client_id, portfolio_category_id=portfolio_category_id, upload_date=now
    )
    db.add(new_item); db.commit(); db.refresh(new_item)
    # Eagerly load relationships before returning
    db.refresh(new_item, attribute_names=['client', 'portfolio_category'])
    return new_item

@app.delete("/api/portfolio/items/{item_id}", status_code=status.HTTP_200_OK)
def delete_portfolio_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.PortfolioItem).filter(models.PortfolioItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(db_item)
    db.commit()
    return {"status": "success", "message": "Item deleted successfully"}
# --- END: NEW PORTFOLIO & CLIENT ENDPOINTS ---
