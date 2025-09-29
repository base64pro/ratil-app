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
        "exhibition": "بيع الاجهزة والمعدات الطباعية",
        "portfolio": "محفظة الروابط والمواد الرقمية" 
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    return {"status": "success", "user": schemas.User.from_orm(user_in_db)}

@app.get("/api/users", response_model=List[schemas.User])
def get_users_list(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/api/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role, can_access_portfolio=user.can_access_portfolio)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

@app.put("/api/users/{username}/change-password", status_code=status.HTTP_200_OK)
def change_user_password(username: str, passwords: schemas.PasswordChange, db: Session = Depends(get_db)):
    user_in_db = db.query(models.User).filter(models.User.username == username).first()
    if not user_in_db: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if username == "admin" and user_in_db.username != "admin": raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="لا يمكن تغيير كلمة مرور المسؤول الرئيسي")
    if not verify_password(passwords.current_password, user_in_db.hashed_password): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="كلمة المرور الحالية غير صحيحة")
    user_in_db.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    return {"status": "success", "message": "تم تغيير كلمة المرور بنجاح"}

@app.delete("/api/users/{username}", status_code=status.HTTP_200_OK)
def delete_user(username: str, db: Session = Depends(get_db)):
    if username == "admin": raise HTTPException(status_code=400, detail="Cannot delete the admin user")
    user_to_delete = db.query(models.User).filter(models.User.username == username).first()
    if not user_to_delete: raise HTTPException(status_code=404, detail="User not found")
    db.delete(user_to_delete); db.commit()
    return {"status": "success", "message": f"User '{username}' deleted successfully"}

# --- Public READ-ONLY Content Endpoints ---
@app.get("/api/content/{category}/subcategories", response_model=List[schemas.Subcategory])
def get_subcategories(category: str, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj: raise HTTPException(status_code=404, detail="Category not found")
    return category_obj.subcategories

@app.get("/api/content/{category_name}/{subcategory_id}", response_model=List[schemas.ContentItem])
def get_content_by_subcategory(category_name: str, subcategory_id: int, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ContentItem).filter(models.ContentItem.subcategory_id == subcategory_id)
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(or_(models.ContentItem.title.ilike(search_term), models.ContentItem.description.ilike(search_term)))
    return query.all()

# --- Admin WRITE endpoints for Public Content ---
@app.post("/api/admin/content/{category}/subcategories", response_model=schemas.Subcategory, status_code=status.HTTP_201_CREATED)
def create_subcategory_admin(category: str, subcategory: schemas.SubcategoryCreate, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj: raise HTTPException(status_code=404, detail="Category not found")
    new_subcategory = models.Subcategory(name=subcategory.name, category_id=category_obj.id)
    db.add(new_subcategory); db.commit(); db.refresh(new_subcategory)
    return new_subcategory

@app.delete("/api/admin/content/{category}/subcategories/{subcategory_id}", status_code=status.HTTP_200_OK)
def delete_subcategory_admin(subcategory_id: int, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory: raise HTTPException(status_code=404, detail="Subcategory not found")
    db.delete(db_subcategory); db.commit()
    return {"status": "success", "message": "Subcategory and its items deleted"}

@app.post("/api/admin/content/{category}/{subcategory_id}", response_model=schemas.ContentItem, status_code=status.HTTP_201_CREATED)
def add_content_to_subcategory_admin(subcategory_id: int, title: str = Form(...), description: str = Form(...), file: Optional[UploadFile] = File(None), db: Session = Depends(get_db)):
    if not db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first(): raise HTTPException(status_code=404, detail="Subcategory not found")
    file_url = ""
    if file and file.filename:
        upload_result = cloudinary.uploader.upload(file.file, resource_type="auto", folder="ratil_group_content")
        file_url = upload_result.get("secure_url", "")
    new_item = models.ContentItem(title=title, description=description, imageUrl=file_url, subcategory_id=subcategory_id)
    db.add(new_item); db.commit(); db.refresh(new_item)
    return new_item

@app.delete("/api/admin/content/{category}/{subcategory_id}/{item_id}", status_code=status.HTTP_200_OK)
def delete_content_item_admin(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ContentItem).filter(models.ContentItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Content item not found")
    db.delete(db_item); db.commit()
    return {"status": "success", "message": "Item deleted successfully"}

@app.get("/api/admin/content", response_model=List[schemas.AdminContentItem])
def get_all_content_for_admin(db: Session = Depends(get_db)):
    all_items = db.query(models.ContentItem).options(joinedload(models.ContentItem.owner_subcategory).joinedload(models.Subcategory.owner_category)).all()
    response_items = []
    for item in all_items:
        response_items.append(schemas.AdminContentItem(
            id=item.id, title=item.title, description=item.description, imageUrl=item.imageUrl,
            category=item.owner_subcategory.owner_category.name,
            subcategory_id=item.subcategory_id, subcategory_name=item.owner_subcategory.name
        ))
    return response_items

# --- Portfolio & Client Endpoints ---
@app.get("/api/clients", response_model=List[schemas.Client])
def get_clients(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Client)
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(or_(models.Client.name.ilike(search_term), models.Client.address.ilike(search_term), models.Client.contact_person.ilike(search_term)))
    return query.order_by(models.Client.name).all()

@app.post("/api/clients", response_model=schemas.Client, status_code=status.HTTP_201_CREATED)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    client_data = client.dict()
    # If name is not provided, create a default one
    if not client_data.get("name"):
        client_data["name"] = f"عميل غير مسمى - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    new_client = models.Client(**client_data)
    db.add(new_client); db.commit(); db.refresh(new_client)
    return new_client
    
@app.put("/api/clients/{client_id}", response_model=schemas.Client)
def update_client(client_id: int, client_update: schemas.ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
        
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.delete("/api/clients/{client_id}", status_code=status.HTTP_200_OK)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client: raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client); db.commit()
    return {"status": "success", "message": "Client deleted successfully"}

@app.get("/api/portfolio/items", response_model=List[schemas.PortfolioItem])
def get_portfolio_items(
    q: Optional[str] = Query(None), 
    category_id: Optional[int]=Query(None), 
    client_id: Optional[int]=Query(None), 
    start_date: Optional[str]=Query(None), 
    end_date: Optional[str]=Query(None), 
    db: Session=Depends(get_db)
):
    query = db.query(models.PortfolioItem).options(joinedload(models.PortfolioItem.client), joinedload(models.PortfolioItem.category)).order_by(models.PortfolioItem.upload_date.desc())
    
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(or_(
            models.PortfolioItem.title.ilike(search_term),
            models.PortfolioItem.description.ilike(search_term)
        ))
    
    if category_id: query = query.filter(models.PortfolioItem.category_id == category_id)
    if client_id: query = query.filter(models.PortfolioItem.client_id == client_id)
    if start_date: query = query.filter(models.PortfolioItem.upload_date >= datetime.fromisoformat(start_date))
    if end_date: query = query.filter(models.PortfolioItem.upload_date <= datetime.fromisoformat(end_date))
    return query.all()

# --- START: MODIFICATION ---
@app.post("/api/portfolio/upload", response_model=schemas.PortfolioItem, status_code=status.HTTP_201_CREATED)
def upload_portfolio_item(
    title: str=Form(...), 
    category_id: int=Form(...),
    description: Optional[str]=Form(None), 
    client_id: Optional[int] = Form(None), 
    link_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None), 
    db: Session=Depends(get_db)
):
    if not file and not link_url:
        raise HTTPException(status_code=400, detail="يجب رفع ملف أو إضافة رابط.")

    # Validate client if provided
    client = None
    if client_id:
        client = db.query(models.Client).filter(models.Client.id == client_id).first()
        if not client: raise HTTPException(404, "Client not found")
    
    # Validate category
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category: raise HTTPException(404, "Category not found")
    
    now = datetime.utcnow()
    file_url = ""

    if link_url:
        file_url = link_url
    elif file and file.filename:
        client_name_for_path = client.name.replace(' ', '_') if client else "General"
        folder_path = f"portfolio/{now.year}/{now.month:02d}/{now.day:02d}/{client_name_for_path}"
        upload_result = cloudinary.uploader.upload(file.file, resource_type="auto", folder=folder_path)
        file_url = upload_result.get("secure_url", "")
    
    new_item = models.PortfolioItem(
        title=title, 
        description=description, 
        file_url=file_url, 
        client_id=client_id, 
        category_id=category_id, 
        upload_date=now
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item, attribute_names=['client', 'category'])
    return new_item
# --- END: MODIFICATION ---

@app.delete("/api/portfolio/items/{item_id}", status_code=status.HTTP_200_OK)
def delete_portfolio_item(item_id: int, db: Session=Depends(get_db)):
    db_item = db.query(models.PortfolioItem).filter(models.PortfolioItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(db_item); db.commit()
    return {"status": "success", "message": "Item deleted successfully"}