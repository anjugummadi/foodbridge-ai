import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List

from backend.database import init_db, get_connection
from backend.services.ai_engine import ai_engine
from backend.services.matching_engine import matching_engine
from backend.services.inventory_service import InventoryService
from backend.services.pickup_service import PickupService
from backend.services.analytics_service import AnalyticsService

app = FastAPI(
    title="FoodBridge: AI-Based Food Redistribution System",
    description="Full-stack AI platform for inventory expiry tracking, waste risk prediction, donor-NGO matching, and pickup logistics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# ==================== SCHEMAS ====================
class InventoryItemCreate(BaseModel):
    name: str
    category: str
    business_id: Optional[str] = "biz_1"
    sku: Optional[str] = None
    barcode: Optional[str] = None
    quantity: float
    unit: Optional[str] = "kg"
    storage_type: Optional[str] = "Ambient"
    perishability_level: Optional[str] = "High"
    expiry_date: str
    cost_per_unit: Optional[float] = 2.5
    status: Optional[str] = "Active"
    batch_number: Optional[str] = None

class POSItemSold(BaseModel):
    sku: str
    quantity: float

class POSSyncRequest(BaseModel):
    business_id: str
    items_sold: List[POSItemSold]

class SurplusListingCreate(BaseModel):
    business_id: Optional[str] = "biz_1"
    food_type: str
    category: str
    quantity_kg: float
    portions_count: Optional[int] = 0
    dietary_type: Optional[str] = "Standard"
    storage_condition: Optional[str] = "Ambient"
    expiry_time: str
    pickup_window_start: Optional[str] = None
    pickup_window_end: Optional[str] = None
    pickup_address: Optional[str] = None

class ClaimRequest(BaseModel):
    listing_id: str
    ngo_id: str
    scheduled_time: Optional[str] = None
    driver_name: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    pickup_id: str
    status: str

# ==================== INVENTORY & POS ROUTES ====================
@app.get("/api/inventory/items")
def get_inventory(business_id: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    return InventoryService.list_items(business_id, category, status)

@app.post("/api/inventory/items")
def create_inventory_item(item: InventoryItemCreate):
    return InventoryService.add_item(item.dict())

@app.post("/api/inventory/bulk-upload")
async def bulk_upload_inventory(file: UploadFile = File(...), business_id: str = Form("biz_1")):
    content = await file.read()
    text = content.decode("utf-8")
    return InventoryService.bulk_upload_csv(text, business_id)

@app.get("/api/inventory/expiry-alerts")
def get_expiry_alerts(business_id: Optional[str] = None):
    return InventoryService.get_expiry_alerts(business_id)

@app.post("/api/pos/sync")
def sync_pos(req: POSSyncRequest):
    return InventoryService.pos_sync_transaction(req.business_id, [i.dict() for i in req.items_sold])

# ==================== AI PREDICTION ENGINE ROUTES ====================
@app.get("/api/ai/demand-forecast")
def get_demand_forecast(category: str = "Cooked", days: int = 3, stock: float = 40.0):
    return ai_engine.predict_demand(category, days_ahead=days, current_stock=stock)

@app.post("/api/ai/predict-waste")
def predict_waste_single(item: dict):
    return ai_engine.calculate_waste_risk_score(item)

@app.get("/api/ai/batch-predictions")
def get_batch_waste_predictions(business_id: Optional[str] = None):
    items = InventoryService.list_items(business_id=business_id)
    predictions = [ai_engine.calculate_waste_risk_score(it) for it in items]
    critical = [p for p in predictions if p["risk_level"] == "Critical"]
    high = [p for p in predictions if p["risk_level"] == "High"]
    return {
        "total_analyzed": len(predictions),
        "critical_waste_risk": len(critical),
        "high_waste_risk": len(high),
        "predicted_total_waste_kg": round(sum(p["predicted_waste_kg"] for p in predictions), 1),
        "predictions": predictions
    }

@app.get("/api/ai/reorder-recommendations")
def get_reorder_recommendations(business_id: Optional[str] = None):
    items = InventoryService.list_items(business_id=business_id)
    reorders = [ai_engine.generate_reorder_recommendation(it) for it in items]
    return {
        "total_items": len(reorders),
        "recommendations": reorders
    }

# ==================== MARKETPLACE & MATCHING ROUTES ====================
@app.get("/api/marketplace/listings")
def get_surplus_listings(status: Optional[str] = None):
    return PickupService.list_surplus_listings(status)

@app.post("/api/marketplace/listings")
def create_listing(listing: SurplusListingCreate):
    return PickupService.create_surplus_listing(listing.dict())

@app.post("/api/marketplace/match")
def match_listing(listing: dict):
    return matching_engine.match_listing_to_ngos(listing)

@app.post("/api/marketplace/claim")
def claim_listing(req: ClaimRequest):
    return PickupService.claim_and_schedule_pickup(req.listing_id, req.ngo_id, req.scheduled_time, req.driver_name)

# ==================== PICKUP LOGISTICS ROUTES ====================
@app.get("/api/pickups")
def get_pickups():
    return PickupService.list_pickups()

@app.post("/api/pickups/update-status")
def update_pickup_status(req: StatusUpdateRequest):
    return PickupService.update_pickup_status(req.pickup_id, req.status)

# ==================== ANALYTICS & DASHBOARD ROUTES ====================
@app.get("/api/analytics/dashboard")
def get_dashboard_summary():
    return AnalyticsService.get_dashboard_summary()

@app.get("/api/analytics/category-breakdown")
def get_category_breakdown():
    return AnalyticsService.get_category_breakdown()

@app.get("/api/analytics/top-donors")
def get_top_donors():
    return AnalyticsService.get_top_donors()

@app.get("/api/analytics/recent-operations")
def get_recent_operations(limit: int = 10):
    return AnalyticsService.get_recent_operations(limit)

@app.get("/api/analytics/sustainability")
def get_sustainability():
    return AnalyticsService.get_sustainability_impact()

# ==================== NGOS & BUSINESSES DIRECTORY ====================
@app.get("/api/ngos")
def get_ngos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ngos WHERE active_status = 1")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/businesses")
def get_businesses():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM businesses")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/download/project.zip")
def download_project_archive():
    zip_path = "/workspace/foodbridge_full_project.zip"
    if os.path.exists(zip_path):
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="foodbridge_full_project.zip"
        )
    raise HTTPException(status_code=404, detail="Archive not found")

# Serve frontend build if dist directory exists
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "FoodBridge API is live"}
