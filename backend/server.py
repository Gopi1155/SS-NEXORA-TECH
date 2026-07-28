from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Models ----------
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str


class LoginInput(BaseModel):
    email: str
    password: str


class CourseInput(BaseModel):
    title: str
    description: str
    category: str = "General"
    duration: str = ""
    price: str = "Free"
    level: str = "Beginner"
    image: str = ""
    syllabus: List[str] = []


class InternshipInput(BaseModel):
    title: str
    description: str
    department: str = "Engineering"
    duration: str = ""
    stipend: str = ""
    location: str = "Remote"
    mode: str = "Remote"
    requirements: List[str] = []
    image: str = ""


class MediaInput(BaseModel):
    title: str
    type: str = "image"  # image | video
    url: str
    description: str = ""


class FeedbackInput(BaseModel):
    rating: int = 5
    message: str


class ContactInput(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str


class EnrollmentInput(BaseModel):
    course_id: str
    phone: str = ""
    note: str = ""


class ApplicationInput(BaseModel):
    internship_id: str
    phone: str = ""
    resume_link: str = ""
    message: str = ""


class StatusUpdate(BaseModel):
    status: str


class AboutInput(BaseModel):
    mission: str = ""
    vision: str = ""
    story: str = ""


class SettingsInput(BaseModel):
    contact_email: str = ""
    contact_phone: str = ""
    contact_address: str = ""
    hero_tagline: str = ""
    hero_line1: str = ""
    hero_line2: str = ""
    hero_line3: str = ""
    about_mission: str = ""
    about_vision: str = ""
    about_story: str = ""
    stat_enrolled: str = ""
    stat_projects: str = ""
    stat_course_completions: str = ""
    stat_internship_completions: str = ""


DEFAULT_SETTINGS = {
    "contact_email": "ssnexoratech.19@gmail.com",
    "contact_phone": "+91 XXXXX XXXXX",
    "contact_address": "Hyderabad, Telangana, India",
    "hero_tagline": "Industry-grade courses and real-world internships that turn ambition into careers. Learn, build, and lead with SS Nexora Tech.",
    "hero_line1": "Empowering",
    "hero_line2": "Future Tech",
    "hero_line3": "Leaders.",
    "about_mission": "To empower students and professionals with future-ready technology skills through courses and internships built on real industry needs.",
    "about_vision": "A world where every ambitious learner — regardless of background — can become a tech leader shaping tomorrow's innovation.",
    "about_story": "SS NEXORA TECH was founded with a single conviction: talent is everywhere, but opportunity is not. We bridge that gap with practical, affordable, industry-driven education and hands-on internships that convert learning into employment.",
    "stat_enrolled": "20+",
    "stat_projects": "10+",
    "stat_course_completions": "15+",
    "stat_internship_completions": "10+",
}


# ---------- Auth ----------
@api_router.post("/auth/register")
async def register(data: RegisterInput):
    email = data.email.strip().lower()
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {"id": str(uuid.uuid4()), "name": data.name.strip(), "email": email,
            "password_hash": hash_password(data.password), "role": "user", "created_at": now_iso()}
    await db.users.insert_one(dict(user))
    user.pop("password_hash")
    user.pop("_id", None)
    token = create_access_token(user["id"], email, "user")
    return {"user": user, "token": token}


@api_router.post("/auth/login")
async def login(data: LoginInput):
    email = data.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email, user.get("role", "user"))
    safe = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return {"user": safe, "token": token}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Public content ----------
@api_router.get("/courses")
async def list_courses():
    return await db.courses.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    doc = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Course not found")
    return doc


@api_router.get("/internships")
async def list_internships():
    return await db.internships.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/internships/{internship_id}")
async def get_internship(internship_id: str):
    doc = await db.internships.find_one({"id": internship_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Internship not found")
    return doc


@api_router.get("/media")
async def list_media():
    return await db.media.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.get("/feedback")
async def list_approved_feedback():
    return await db.feedback.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.post("/contact")
async def submit_contact(data: ContactInput):
    doc = {"id": str(uuid.uuid4()), **data.model_dump(), "read": False, "created_at": now_iso()}
    await db.contacts.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


# ---------- User actions ----------
@api_router.post("/feedback")
async def submit_feedback(data: FeedbackInput, user: dict = Depends(get_current_user)):
    doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "name": user["name"],
           "rating": max(1, min(5, data.rating)), "message": data.message,
           "approved": False, "created_at": now_iso()}
    await db.feedback.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api_router.post("/enrollments")
async def enroll(data: EnrollmentInput, user: dict = Depends(get_current_user)):
    course = await db.courses.find_one({"id": data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = await db.enrollments.find_one({"course_id": data.course_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    doc = {"id": str(uuid.uuid4()), "course_id": data.course_id, "course_title": course["title"],
           "user_id": user["id"], "name": user["name"], "email": user["email"],
           "phone": data.phone, "note": data.note, "status": "pending", "created_at": now_iso()}
    await db.enrollments.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api_router.post("/applications")
async def apply(data: ApplicationInput, user: dict = Depends(get_current_user)):
    internship = await db.internships.find_one({"id": data.internship_id}, {"_id": 0})
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    existing = await db.applications.find_one({"internship_id": data.internship_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this internship")
    doc = {"id": str(uuid.uuid4()), "internship_id": data.internship_id, "internship_title": internship["title"],
           "user_id": user["id"], "name": user["name"], "email": user["email"], "phone": data.phone,
           "resume_link": data.resume_link, "message": data.message, "status": "pending", "created_at": now_iso()}
    await db.applications.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api_router.get("/my/enrollments")
async def my_enrollments(user: dict = Depends(get_current_user)):
    return await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.get("/my/applications")
async def my_applications(user: dict = Depends(get_current_user)):
    return await db.applications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.get("/my/feedback")
async def my_feedback(user: dict = Depends(get_current_user)):
    return await db.feedback.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


# ---------- Admin: generic CRUD ----------
COLLECTIONS = {"courses": CourseInput, "internships": InternshipInput, "media": MediaInput}


async def _create(coll: str, payload: dict):
    doc = {"id": str(uuid.uuid4()), **payload, "created_at": now_iso()}
    await getattr(db, coll).insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


async def _update(coll: str, item_id: str, payload: dict):
    res = await getattr(db, coll).update_one({"id": item_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return await getattr(db, coll).find_one({"id": item_id}, {"_id": 0})


async def _delete(coll: str, item_id: str):
    res = await getattr(db, coll).delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}


@api_router.post("/admin/courses")
async def admin_create_course(data: CourseInput, admin: dict = Depends(require_admin)):
    return await _create("courses", data.model_dump())


@api_router.put("/admin/courses/{item_id}")
async def admin_update_course(item_id: str, data: CourseInput, admin: dict = Depends(require_admin)):
    return await _update("courses", item_id, data.model_dump())


@api_router.delete("/admin/courses/{item_id}")
async def admin_delete_course(item_id: str, admin: dict = Depends(require_admin)):
    return await _delete("courses", item_id)


@api_router.post("/admin/internships")
async def admin_create_internship(data: InternshipInput, admin: dict = Depends(require_admin)):
    return await _create("internships", data.model_dump())


@api_router.put("/admin/internships/{item_id}")
async def admin_update_internship(item_id: str, data: InternshipInput, admin: dict = Depends(require_admin)):
    return await _update("internships", item_id, data.model_dump())


@api_router.delete("/admin/internships/{item_id}")
async def admin_delete_internship(item_id: str, admin: dict = Depends(require_admin)):
    return await _delete("internships", item_id)


@api_router.post("/admin/media")
async def admin_create_media(data: MediaInput, admin: dict = Depends(require_admin)):
    return await _create("media", data.model_dump())


@api_router.put("/admin/media/{item_id}")
async def admin_update_media(item_id: str, data: MediaInput, admin: dict = Depends(require_admin)):
    return await _update("media", item_id, data.model_dump())


@api_router.delete("/admin/media/{item_id}")
async def admin_delete_media(item_id: str, admin: dict = Depends(require_admin)):
    return await _delete("media", item_id)


# ---------- Admin: feedback / contacts / enrollments / applications / users ----------
@api_router.get("/admin/feedback")
async def admin_list_feedback(admin: dict = Depends(require_admin)):
    return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)


@api_router.put("/admin/feedback/{item_id}/approve")
async def admin_approve_feedback(item_id: str, admin: dict = Depends(require_admin)):
    doc = await db.feedback.find_one({"id": item_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Feedback not found")
    await db.feedback.update_one({"id": item_id}, {"$set": {"approved": not doc.get("approved", False)}})
    return await db.feedback.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/admin/feedback/{item_id}")
async def admin_delete_feedback(item_id: str, admin: dict = Depends(require_admin)):
    return await _delete("feedback", item_id)


@api_router.get("/admin/contacts")
async def admin_list_contacts(admin: dict = Depends(require_admin)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)


@api_router.put("/admin/contacts/{item_id}/read")
async def admin_mark_contact_read(item_id: str, admin: dict = Depends(require_admin)):
    return await _update("contacts", item_id, {"read": True})


@api_router.delete("/admin/contacts/{item_id}")
async def admin_delete_contact(item_id: str, admin: dict = Depends(require_admin)):
    return await _delete("contacts", item_id)


@api_router.get("/admin/enrollments")
async def admin_list_enrollments(admin: dict = Depends(require_admin)):
    return await db.enrollments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/admin/enrollments/{item_id}/status")
async def admin_enrollment_status(item_id: str, data: StatusUpdate, admin: dict = Depends(require_admin)):
    return await _update("enrollments", item_id, {"status": data.status})


@api_router.get("/admin/applications")
async def admin_list_applications(admin: dict = Depends(require_admin)):
    return await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/admin/applications/{item_id}/status")
async def admin_application_status(item_id: str, data: StatusUpdate, admin: dict = Depends(require_admin)):
    return await _update("applications", item_id, {"status": data.status})


@api_router.get("/admin/users")
async def admin_list_users(admin: dict = Depends(require_admin)):
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    keys = ["courses", "internships", "media", "feedback", "contacts", "enrollments", "applications", "users"]
    stats = {}
    for k in keys:
        stats[k] = await getattr(db, k).count_documents({})
    stats["pending_feedback"] = await db.feedback.count_documents({"approved": False})
    stats["unread_contacts"] = await db.contacts.count_documents({"read": False})
    return stats


@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"id": "site"}, {"_id": 0, "id": 0})
    return {**DEFAULT_SETTINGS, **(doc or {})}


@api_router.put("/admin/settings")
async def update_settings(data: SettingsInput, admin: dict = Depends(require_admin)):
    await db.settings.update_one({"id": "site"}, {"$set": data.model_dump()}, upsert=True)
    return await get_settings()


@api_router.get("/")
async def root():
    return {"message": "SS NEXORA TECH API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    admin_email = os.environ['ADMIN_EMAIL'].lower()
    admin_password = os.environ['ADMIN_PASSWORD']
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"id": str(uuid.uuid4()), "name": "Admin", "email": admin_email,
                                   "password_hash": hash_password(admin_password), "role": "admin",
                                   "created_at": now_iso()})
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
