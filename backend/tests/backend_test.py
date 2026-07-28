"""Backend API tests for SS NEXORA TECH."""
import os
import time
from pathlib import Path
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")

ADMIN_EMAIL = "gopichnadunukala@gmail.com"
ADMIN_PASSWORD = "Sipayi@143"
TS = str(int(time.time()))
USER_EMAIL = f"testuser_{TS}@example.com"
USER_PASSWORD = "Test@123"
USER_NAME = f"TEST User {TS}"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def user_token(s):
    r = s.post(f"{BASE_URL}/api/auth/register", json={"name": USER_NAME, "email": USER_EMAIL, "password": USER_PASSWORD})
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    return r.json()["token"]


def ah(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ---------- Health / Root ----------
class TestHealth:
    def test_root(self, s):
        r = s.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    def test_admin_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 10

    def test_register_and_login_user(self, s, user_token):
        # login with same creds
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": USER_EMAIL, "password": USER_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == USER_EMAIL
        assert r.json()["user"]["role"] == "user"

    def test_invalid_login(self, s):
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": USER_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_duplicate_register(self, s):
        r = s.post(f"{BASE_URL}/api/auth/register", json={"name": "x", "email": USER_EMAIL, "password": USER_PASSWORD})
        assert r.status_code == 400

    def test_short_password(self, s):
        r = s.post(f"{BASE_URL}/api/auth/register", json={"name": "x", "email": f"z{TS}@t.com", "password": "123"})
        assert r.status_code == 400

    def test_me(self, s, user_token):
        r = s.get(f"{BASE_URL}/api/auth/me", headers=ah(user_token))
        assert r.status_code == 200
        assert r.json()["email"] == USER_EMAIL

    def test_admin_endpoint_forbidden_for_user(self, s, user_token):
        r = s.get(f"{BASE_URL}/api/admin/stats", headers=ah(user_token))
        assert r.status_code == 403

    def test_admin_endpoint_unauthenticated(self, s):
        r = s.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401


# ---------- Public content ----------
class TestPublic:
    def test_list_courses(self, s):
        r = s.get(f"{BASE_URL}/api/courses")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_internships(self, s):
        r = s.get(f"{BASE_URL}/api/internships")
        assert r.status_code == 200

    def test_list_media(self, s):
        r = s.get(f"{BASE_URL}/api/media")
        assert r.status_code == 200

    def test_list_feedback(self, s):
        r = s.get(f"{BASE_URL}/api/feedback")
        assert r.status_code == 200

    def test_course_not_found(self, s):
        r = s.get(f"{BASE_URL}/api/courses/nonexistent-id")
        assert r.status_code == 404


# ---------- Admin CRUD flows ----------
class TestAdminCRUD:
    created = {"course": None, "internship": None, "media": None}

    def test_create_course(self, s, admin_token):
        payload = {"title": f"TEST Course {TS}", "description": "d", "category": "Cat",
                   "duration": "4w", "price": "Free", "level": "Beginner",
                   "image": "https://example.com/x.png", "syllabus": ["a", "b"]}
        r = s.post(f"{BASE_URL}/api/admin/courses", json=payload, headers=ah(admin_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == payload["title"]
        assert data["syllabus"] == ["a", "b"]
        assert "id" in data
        TestAdminCRUD.created["course"] = data["id"]

        # verify GET
        g = s.get(f"{BASE_URL}/api/courses/{data['id']}")
        assert g.status_code == 200
        assert g.json()["title"] == payload["title"]

    def test_update_course(self, s, admin_token):
        cid = TestAdminCRUD.created["course"]
        assert cid
        upd = {"title": f"TEST Course {TS} Updated", "description": "d2", "category": "Cat2",
               "duration": "5w", "price": "$10", "level": "Advanced", "image": "", "syllabus": ["c"]}
        r = s.put(f"{BASE_URL}/api/admin/courses/{cid}", json=upd, headers=ah(admin_token))
        assert r.status_code == 200
        g = s.get(f"{BASE_URL}/api/courses/{cid}")
        assert g.json()["title"] == upd["title"]
        assert g.json()["level"] == "Advanced"

    def test_create_internship(self, s, admin_token):
        payload = {"title": f"TEST Intern {TS}", "description": "d", "department": "Eng",
                   "duration": "3m", "stipend": "5000", "location": "Remote", "mode": "Remote",
                   "requirements": ["Python"], "image": ""}
        r = s.post(f"{BASE_URL}/api/admin/internships", json=payload, headers=ah(admin_token))
        assert r.status_code == 200
        TestAdminCRUD.created["internship"] = r.json()["id"]
        g = s.get(f"{BASE_URL}/api/internships/{r.json()['id']}")
        assert g.status_code == 200

    def test_create_media_image_and_video(self, s, admin_token):
        img = {"title": f"TEST Media Img {TS}", "type": "image", "url": "https://example.com/1.jpg", "description": ""}
        r = s.post(f"{BASE_URL}/api/admin/media", json=img, headers=ah(admin_token))
        assert r.status_code == 200
        TestAdminCRUD.created["media"] = r.json()["id"]

        vid = {"title": f"TEST Media Vid {TS}", "type": "video",
               "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "description": ""}
        r2 = s.post(f"{BASE_URL}/api/admin/media", json=vid, headers=ah(admin_token))
        assert r2.status_code == 200

    def test_user_cannot_create_course(self, s, user_token):
        r = s.post(f"{BASE_URL}/api/admin/courses",
                   json={"title": "hack", "description": "x"}, headers=ah(user_token))
        assert r.status_code == 403


# ---------- User actions ----------
class TestUserActions:
    def test_enroll_flow(self, s, user_token, admin_token):
        cid = TestAdminCRUD.created["course"]
        assert cid
        r = s.post(f"{BASE_URL}/api/enrollments", json={"course_id": cid, "phone": "123"}, headers=ah(user_token))
        assert r.status_code == 200
        eid = r.json()["id"]
        # duplicate
        r2 = s.post(f"{BASE_URL}/api/enrollments", json={"course_id": cid}, headers=ah(user_token))
        assert r2.status_code == 400
        # admin list
        lst = s.get(f"{BASE_URL}/api/admin/enrollments", headers=ah(admin_token))
        assert lst.status_code == 200
        assert any(e["id"] == eid for e in lst.json())
        # status update
        up = s.put(f"{BASE_URL}/api/admin/enrollments/{eid}/status",
                   json={"status": "approved"}, headers=ah(admin_token))
        assert up.status_code == 200
        assert up.json()["status"] == "approved"

    def test_apply_flow(self, s, user_token, admin_token):
        iid = TestAdminCRUD.created["internship"]
        assert iid
        r = s.post(f"{BASE_URL}/api/applications",
                   json={"internship_id": iid, "phone": "1", "resume_link": "http://x", "message": "hi"},
                   headers=ah(user_token))
        assert r.status_code == 200
        aid = r.json()["id"]
        r2 = s.post(f"{BASE_URL}/api/applications", json={"internship_id": iid}, headers=ah(user_token))
        assert r2.status_code == 400
        lst = s.get(f"{BASE_URL}/api/admin/applications", headers=ah(admin_token))
        assert any(a["id"] == aid for a in lst.json())
        up = s.put(f"{BASE_URL}/api/admin/applications/{aid}/status",
                   json={"status": "approved"}, headers=ah(admin_token))
        assert up.status_code == 200

    def test_feedback_approval_flow(self, s, user_token, admin_token):
        r = s.post(f"{BASE_URL}/api/feedback",
                   json={"rating": 5, "message": f"TEST feedback {TS}"}, headers=ah(user_token))
        assert r.status_code == 200
        fid = r.json()["id"]
        assert r.json()["approved"] is False
        # should NOT appear in public list
        pub = s.get(f"{BASE_URL}/api/feedback").json()
        assert not any(f["id"] == fid for f in pub)
        # admin approve
        ap = s.put(f"{BASE_URL}/api/admin/feedback/{fid}/approve", headers=ah(admin_token))
        assert ap.status_code == 200
        assert ap.json()["approved"] is True
        pub2 = s.get(f"{BASE_URL}/api/feedback").json()
        assert any(f["id"] == fid for f in pub2)
        # cleanup
        s.delete(f"{BASE_URL}/api/admin/feedback/{fid}", headers=ah(admin_token))

    def test_contact_flow(self, s, admin_token):
        r = s.post(f"{BASE_URL}/api/contact",
                   json={"name": "TEST c", "email": "c@t.com", "subject": "s", "message": "m"})
        assert r.status_code == 200
        cid = r.json()["id"]
        lst = s.get(f"{BASE_URL}/api/admin/contacts", headers=ah(admin_token))
        assert any(c["id"] == cid for c in lst.json())
        rd = s.put(f"{BASE_URL}/api/admin/contacts/{cid}/read", headers=ah(admin_token))
        assert rd.status_code == 200
        assert rd.json()["read"] is True
        dl = s.delete(f"{BASE_URL}/api/admin/contacts/{cid}", headers=ah(admin_token))
        assert dl.status_code == 200


# ---------- Admin stats & users ----------
class TestAdminMisc:
    def test_stats(self, s, admin_token):
        r = s.get(f"{BASE_URL}/api/admin/stats", headers=ah(admin_token))
        assert r.status_code == 200
        data = r.json()
        for k in ["courses", "internships", "media", "users", "enrollments",
                  "applications", "pending_feedback", "unread_contacts"]:
            assert k in data
            assert isinstance(data[k], int)

    def test_admin_users(self, s, admin_token):
        r = s.get(f"{BASE_URL}/api/admin/users", headers=ah(admin_token))
        assert r.status_code == 200
        users = r.json()
        assert any(u["email"] == USER_EMAIL for u in users)
        # ensure no password_hash leaks
        for u in users:
            assert "password_hash" not in u
            assert "_id" not in u


# ---------- Cleanup ----------
class TestZCleanup:
    def test_delete_created(self, s, admin_token):
        for kind, key in [("courses", "course"), ("internships", "internship"), ("media", "media")]:
            iid = TestAdminCRUD.created[key]
            if iid:
                r = s.delete(f"{BASE_URL}/api/admin/{kind}/{iid}", headers=ah(admin_token))
                assert r.status_code == 200
        # verify course deleted
        cid = TestAdminCRUD.created["course"]
        if cid:
            g = s.get(f"{BASE_URL}/api/courses/{cid}")
            assert g.status_code == 404
