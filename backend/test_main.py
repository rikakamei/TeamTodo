from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_hello():
    res = client.get("/hello")
    assert res.status_code == 200
    assert res.json() == {"message": "Hello, FastAPI!"}

def test_create_and_get_task():
    task = {"id": 1, "title": "テストタスク", "done": False}
    res = client.post("/tasks", json=task)
    assert res.status_code == 200
    get_res = client.get("/tasks")
    assert any(t["id"] == 1 for t in get_res.json())
