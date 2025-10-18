from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # Basic sanity: each activity has participants and max_participants
    for name, details in data.items():
        assert "participants" in details
        assert "max_participants" in details


def test_signup_and_unregister_flow():
    activity = "Chess Club"
    email = "test_student@example.com"

    # Ensure email isn't already present
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    # Signup
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert resp.json()["message"].startswith("Signed up")
    assert email in activities[activity]["participants"]

    # Duplicate signup should fail
    resp_dup = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp_dup.status_code == 400

    # Unregister
    resp_un = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert resp_un.status_code == 200
    assert resp_un.json()["message"].startswith("Unregistered")
    assert email not in activities[activity]["participants"]


def test_signup_full_activity():
    # Create a temporary activity that's full
    activities["Temp Full"] = {
        "description": "Temp",
        "schedule": "Now",
        "max_participants": 1,
        "participants": ["already@exists"]
    }

    resp = client.post("/activities/Temp%20Full/signup?email=new@student.com")
    assert resp.status_code == 400

    # cleanup
    del activities["Temp Full"]
