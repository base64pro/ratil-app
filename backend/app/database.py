import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. رابط الاتصال بقاعدة البيانات
# سيقرأ هذا الرابط من متغيرات البيئة في سيرفر Render
# وفي حال عدم وجوده (للعمل المحلي)، سيقوم بإنشاء ملف قاعدة بيانات SQLite بسيط
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./ratil_app.db')

# 2. إنشاء محرك SQLAlchemy
# 'connect_args' ضروري فقط لقواعد بيانات SQLite لتجنب مشاكل معينة
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# 3. إنشاء جلسة (Session) للتعامل مع قاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. إنشاء الفئة الأساسية التي سترث منها نماذجنا (جداولنا)
Base = declarative_base()