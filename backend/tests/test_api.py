import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_dashboard_summary():
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["listings_active"] >= 842
    assert data["food_rescued_kg"] >= 12840.0
    assert data["co2_prevented_kg"] >= 6420.0
    assert data["ngos_active"] >= 64

def test_category_breakdown():
    response = client.get("/api/analytics/category-breakdown")
    assert response.status_code == 200
    data = response.json()
    categories = [c["category"] for c in data]
    assert "Cooked" in categories
    assert "Bakery" in categories
    assert "Fruits/Veg" in categories

def test_top_donors():
    response = client.get("/api/analytics/top-donors")
    assert response.status_code == 200
    donors = response.json()
    donor_names = [d["name"] for d in donors]
    assert "Hotel Sunshine" in donor_names
    assert "City Bakery" in donor_names

def test_inventory_list():
    response = client.get("/api/inventory/items")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0
    assert "expiry_alert" in items[0]

def test_ai_waste_prediction():
    test_item = {
        "id": "test_1",
        "name": "Fresh Curd",
        "category": "Dairy",
        "quantity": 30.0,
        "expiry_date": "2026-11-07 10:00"
    }
    response = client.post("/api/ai/predict-waste", json=test_item)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data
    assert 0 <= data["risk_score"] <= 100

def test_ai_batch_predictions():
    response = client.get("/api/ai/batch-predictions")
    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed"] > 0
    assert "predictions" in data

def test_ai_matching_engine():
    listing = {
        "food_type": "Cooked Meals",
        "category": "Cooked",
        "quantity_kg": 40.0,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "expiry_time": "2026-11-07 18:00"
    }
    response = client.post("/api/marketplace/match", json=listing)
    assert response.status_code == 200
    matches = response.json()
    assert len(matches) > 0
    assert "match_score" in matches[0]
    assert "distance_km" in matches[0]

def test_pickup_operations():
    response = client.get("/api/pickups")
    assert response.status_code == 200
    pickups = response.json()
    assert len(pickups) > 0
