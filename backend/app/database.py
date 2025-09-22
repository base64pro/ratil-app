import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. رابط الاتصال بقاعدة البيانات
DATABASE_URL = os.environ.get('DATABASE_URL')

# --- START: MODIFICATION ---
# This is the crucial fix. Render provides a URL starting with "postgres://" 
# but SQLAlchemy's psycopg2 driver requires "postgresql://".
# This code automatically corrects the URL if needed.
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
# --- END: MODIFICATION ---

# 2. إنشاء محرك SQLAlchemy
# 'connect_args' is only needed for SQLite, which we are no longer using on Render.
engine = create_engine(
    DATABASE_URL, 
    connect_args={} # This is now always empty for PostgreSQL
)

# 3. إنشاء جلسة (Session) للتعامل مع قاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. إنشاء الفئة الأساسية التي سترث منها نماذجنا (جداولنا)
Base = declarative_base()
