import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, HTTPException, status, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

# قم باستيراد النماذج الجديدة من ملفاتها الخاصة
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine
from passlib.context import CryptContext

app = FastAPI(title="Ratil Group API")
models.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- دوال مساعدة لكلمات المرور (تم نقلها هنا) ---
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

# --- START: دالة لإنشاء البيانات الأولية ---
def create_initial_data(db: Session):
    # تحقق مما إذا كان المستخدم المسؤول موجودًا
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        hashed_password = get_password_hash("password123")
        new_admin = models.User(username="admin", hashed_password=hashed_password, role="admin")
        db.add(new_admin)
        print("Admin user created.")

    # قائمة الأقسام الرئيسية
    initial_categories = {
        "printedMaterials": "المواد المطبوعة",
        "billboards": "تاجير لافتات طرقية عملاقة",
        "events": "تنظيم المؤتمرات والمناسبات",
        "exhibition": "معرض بيع الاجهزة والمعدات الطباعية"
    }

    for name, display_name in initial_categories.items():
        category_exists = db.query(models.Category).filter(models.Category.name == name).first()
        if not category_exists:
            new_category = models.Category(name=name, display_name=display_name)
            db.add(new_category)
            print(f"Category '{name}' created.")
    
    db.commit()

# قم بإنشاء البيانات الأولية عند بدء تشغيل التطبيق
db = SessionLocal()
create_initial_data(db)
db.close()
# --- END: دالة لإنشاء البيانات الأولية ---

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
    
    return {"status": "success", "user": { "username": user_in_db.username, "role": user_in_db.role }}

@app.get("/api/users", response_model=List[schemas.User])
def get_users_list(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.post("/api/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.put("/api/users/{username}/change-password", status_code=status.HTTP_200_OK)
def change_user_password(username: str, passwords: schemas.PasswordChange, db: Session = Depends(get_db)):
    user_in_db = db.query(models.User).filter(models.User.username == username).first()
    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

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

# --- Subcategory Management Endpoints ---
@app.get("/api/content/{category}/subcategories", response_model=List[schemas.Subcategory])
def get_subcategories(category: str, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    return category_obj.subcategories

@app.post("/api/content/{category}/subcategories", response_model=schemas.Subcategory, status_code=status.HTTP_201_CREATED)
def create_subcategory(category: str, subcategory: schemas.SubcategoryCreate, db: Session = Depends(get_db)):
    category_obj = db.query(models.Category).filter(models.Category.name == category).first()
    if not category_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    
    new_subcategory = models.Subcategory(name=subcategory.name, category_id=category_obj.id)
    db.add(new_subcategory)
    db.commit()
    db.refresh(new_subcategory)
    return new_subcategory

@app.put("/api/content/{category}/subcategories/{subcategory_id}", response_model=schemas.Subcategory)
def update_subcategory(category: str, subcategory_id: int, subcategory_update: schemas.SubcategoryCreate, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
        
    db_subcategory.name = subcategory_update.name
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

@app.delete("/api/content/{category}/subcategories/{subcategory_id}", status_code=status.HTTP_200_OK)
def delete_subcategory(category: str, subcategory_id: int, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    deleted_name = db_subcategory.name
    db.delete(db_subcategory)
    db.commit()
        
    return {"status": "success", "message": f"Subcategory '{deleted_name}' and all its items deleted successfully"}

# --- Content Management Endpoints ---
@app.get("/api/content/{category_name}/{subcategory_id}", response_model=List[schemas.ContentItem])
def get_content_by_subcategory(category_name: str, subcategory_id: int, q: Optional[str] = None, db: Session = Depends(get_db)):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory:
        return []
    
    if q:
        search_term = f"%{q.lower()}%"
        return db.query(models.ContentItem).filter(
            models.ContentItem.subcategory_id == subcategory_id,
            (models.ContentItem.title.ilike(search_term) | models.ContentItem.description.ilike(search_term))
        ).all()
        
    return db_subcategory.items

@app.post("/api/content/{category}/{subcategory_id}", response_model=schemas.ContentItem, status_code=status.HTTP_201_CREATED)
def add_content_to_subcategory(
    category: str, 
    subcategory_id: int, 
    title: str = Form(...), 
    description: str = Form(...), 
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_subcategory = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not db_subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    file_url = ""
    if file and file.filename:
        try:
            resource_type = "video" if file.content_type and file.content_type.startswith("video") else "image"
            upload_result = cloudinary.uploader.upload(file.file, resource_type=resource_type, folder="ratil_group_content")
            file_url = upload_result.get("secure_url", "")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {e}")

    new_item = models.ContentItem(title=title, description=description, imageUrl=file_url, subcategory_id=subcategory_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/api/content/{category}/{subcategory_id}/{item_id}", response_model=schemas.ContentItem)
def update_content_item(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_item = db.query(models.ContentItem).filter(models.ContentItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Content item not found")

    file_url = db_item.imageUrl
    if file and file.filename:
        try:
            resource_type = "video" if file.content_type and file.content_type.startswith("video") else "image"
            upload_result = cloudinary.uploader.upload(file.file, resource_type=resource_type, folder="ratil_group_content")
            file_url = upload_result.get("secure_url", "")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {e}")
    
    db_item.title = title
    db_item.description = description
    db_item.imageUrl = file_url
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/content/{category}/{subcategory_id}/{item_id}", status_code=status.HTTP_200_OK)
def delete_content_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ContentItem).filter(models.ContentItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    deleted_item_title = db_item.title
    db.delete(db_item)
    db.commit()
    return {"status": "success", "message": f"Item '{deleted_item_title}' deleted successfully"}

@app.get("/api/admin/content", response_model=List[schemas.AdminContentItem])
def get_all_content_for_admin(db: Session = Depends(get_db)):
    all_items = db.query(models.ContentItem).all()
    
    admin_items = []
    for item in all_items:
        admin_item = schemas.AdminContentItem(
            id=item.id,
            title=item.title,
            description=item.description,
            imageUrl=item.imageUrl,
            category=item.owner_subcategory.owner_category.name,
            subcategory_id=item.subcategory_id,
            subcategory_name=item.owner_subcategory.name
        )
        admin_items.append(admin_item)
    return admin_items