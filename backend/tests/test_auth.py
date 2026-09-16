from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_worker_success():
    res = client.post("/auth/login", json={"email": "worker@arcare.demo", "password": "worker123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "worker"

def test_login_specialist_success():
    res = client.post("/auth/login", json={"email": "doctor@arcare.demo", "password": "doctor123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "specialist"

def test_login_invalid_password():
    res = client.post("/auth/login", json={"email": "worker@arcare.demo", "password": "wrongpassword"})
    assert res.status_code == 401
