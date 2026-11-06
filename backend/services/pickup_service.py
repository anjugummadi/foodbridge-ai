import uuid
from datetime import datetime, timedelta
from backend.database import get_connection

class PickupService:
    @staticmethod
    def list_surplus_listings(status: str = None):
        conn = get_connection()
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM surplus_listings WHERE status = ? ORDER BY created_at DESC", (status,))
        else:
            cursor.execute("SELECT * FROM surplus_listings ORDER BY created_at DESC")
        listings = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return listings

    @staticmethod
    def create_surplus_listing(data: dict):
        conn = get_connection()
        cursor = conn.cursor()
        listing_id = f"list_{uuid.uuid4().hex[:8]}"
        listing_code = f"LST-{datetime.now().strftime('%M%S')}"
        business_id = data.get("business_id", "biz_1")

        cursor.execute("SELECT name, address, latitude, longitude FROM businesses WHERE id = ?", (business_id,))
        biz = cursor.fetchone()
        biz_name = biz["name"] if biz else data.get("business_name", "Food Business")
        biz_addr = biz["address"] if biz else data.get("pickup_address", "100 Market St")
        lat = biz["latitude"] if biz else data.get("latitude", 12.9716)
        lng = biz["longitude"] if biz else data.get("longitude", 77.5946)

        food_type = data.get("food_type", "Cooked Meals")
        category = data.get("category", "Cooked")
        quantity_kg = float(data.get("quantity_kg", 25.0))
        portions_count = int(data.get("portions_count", int(quantity_kg * 2.5)))
        dietary_type = data.get("dietary_type", "Standard")
        storage_condition = data.get("storage_condition", "Chilled")
        prepared_at = data.get("prepared_at") or (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")
        expiry_time = data.get("expiry_time") or (datetime.now() + timedelta(hours=14)).strftime("%Y-%m-%d %H:%M")
        pickup_start = data.get("pickup_window_start") or (datetime.now() + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M")
        pickup_end = data.get("pickup_window_end") or (datetime.now() + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M")
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

        cursor.execute("""
            INSERT INTO surplus_listings (
                id, listing_code, business_id, business_name, food_type, category,
                quantity_kg, portions_count, dietary_type, storage_condition,
                prepared_at, expiry_time, pickup_window_start, pickup_window_end,
                pickup_address, latitude, longitude, status, matched_ngo_id, matched_ngo_name, created_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            listing_id, listing_code, business_id, biz_name, food_type, category,
            quantity_kg, portions_count, dietary_type, storage_condition,
            prepared_at, expiry_time, pickup_start, pickup_end,
            biz_addr, lat, lng, "Available", None, None, created_at
        ))
        conn.commit()
        conn.close()

        return {
            "id": listing_id,
            "listing_code": listing_code,
            "status": "Available",
            "business_name": biz_name,
            "food_type": food_type,
            "quantity_kg": quantity_kg
        }

    @staticmethod
    def claim_and_schedule_pickup(listing_id: str, ngo_id: str, scheduled_time: str = None, driver_name: str = None):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM surplus_listings WHERE id = ? OR listing_code = ?", (listing_id, listing_id))
        listing = cursor.fetchone()
        if not listing:
            conn.close()
            raise ValueError("Surplus listing not found")

        cursor.execute("SELECT name FROM ngos WHERE id = ?", (ngo_id,))
        ngo = cursor.fetchone()
        ngo_name = ngo["name"] if ngo else "Assigned NGO"

        if not scheduled_time:
            scheduled_time = (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")

        pickup_id = f"pk_{uuid.uuid4().hex[:8]}"
        driver = driver_name or "Express Food Courier"
        vehicle = f"KA-0{uuid.uuid4().int % 9 + 1}-XY-{uuid.uuid4().int % 9000 + 1000}"

        cursor.execute("UPDATE surplus_listings SET status = 'Scheduled', matched_ngo_id = ?, matched_ngo_name = ? WHERE id = ?",
                       (ngo_id, ngo_name, listing["id"]))

        cursor.execute("""
            INSERT INTO pickups (
                id, listing_id, listing_code, business_name, ngo_name,
                driver_name, vehicle_number, scheduled_time, pickup_status,
                food_temperature_verified, notes, completed_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            pickup_id, listing["id"], listing["listing_code"], listing["business_name"], ngo_name,
            driver, vehicle, scheduled_time, "Scheduled", 1, "Scheduled via automated matching.", None
        ))

        conn.commit()
        conn.close()

        return {
            "pickup_id": pickup_id,
            "listing_code": listing["listing_code"],
            "status": "Scheduled",
            "ngo_name": ngo_name,
            "driver_name": driver,
            "vehicle_number": vehicle,
            "scheduled_time": scheduled_time
        }

    @staticmethod
    def update_pickup_status(pickup_id: str, new_status: str):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM pickups WHERE id = ? OR listing_code = ?", (pickup_id, pickup_id))
        pk = cursor.fetchone()
        if not pk:
            conn.close()
            raise ValueError("Pickup record not found")

        completed_at = datetime.now().strftime("%Y-%m-%d %H:%M") if new_status == "Picked Up" else None
        cursor.execute("UPDATE pickups SET pickup_status = ?, completed_at = ? WHERE id = ?", (new_status, completed_at, pk["id"]))
        cursor.execute("UPDATE surplus_listings SET status = ? WHERE id = ?", (new_status, pk["listing_id"]))

        # If completed, update business donation tally
        if new_status == "Picked Up":
            cursor.execute("SELECT business_id, quantity_kg FROM surplus_listings WHERE id = ?", (pk["listing_id"],))
            s = cursor.fetchone()
            if s:
                cursor.execute("UPDATE businesses SET total_donated_kg = total_donated_kg + ? WHERE id = ?", (s["quantity_kg"], s["business_id"]))

        conn.commit()
        conn.close()
        return {"status": "Success", "pickup_id": pk["id"], "new_status": new_status}

    @staticmethod
    def list_pickups():
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pickups ORDER BY scheduled_time DESC")
        pickups = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return pickups
