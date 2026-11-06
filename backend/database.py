import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "foodbridge.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        contact_email TEXT,
        phone TEXT,
        total_donated_kg REAL DEFAULT 0.0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ngos (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        capacity_kg_per_day REAL NOT NULL,
        accepted_categories TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        contact_person TEXT,
        phone TEXT,
        meals_served INTEGER DEFAULT 0,
        active_status INTEGER DEFAULT 1
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        sku TEXT,
        barcode TEXT,
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'kg',
        storage_type TEXT DEFAULT 'Ambient',
        perishability_level TEXT DEFAULT 'Medium',
        purchase_date TEXT,
        expiry_date TEXT NOT NULL,
        cost_per_unit REAL DEFAULT 0.0,
        status TEXT DEFAULT 'Active',
        batch_number TEXT,
        FOREIGN KEY (business_id) REFERENCES businesses (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS waste_predictions (
        id TEXT PRIMARY KEY,
        inventory_item_id TEXT NOT NULL,
        business_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        current_stock REAL NOT NULL,
        forecasted_demand_3d REAL NOT NULL,
        days_to_expiry REAL NOT NULL,
        risk_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        predicted_waste_kg REAL NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS surplus_listings (
        id TEXT PRIMARY KEY,
        listing_code TEXT UNIQUE NOT NULL,
        business_id TEXT NOT NULL,
        business_name TEXT NOT NULL,
        food_type TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        portions_count INTEGER DEFAULT 0,
        dietary_type TEXT DEFAULT 'Standard',
        storage_condition TEXT DEFAULT 'Ambient',
        prepared_at TEXT,
        expiry_time TEXT NOT NULL,
        pickup_window_start TEXT NOT NULL,
        pickup_window_end TEXT NOT NULL,
        pickup_address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        status TEXT DEFAULT 'Available',
        matched_ngo_id TEXT,
        matched_ngo_name TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses (id),
        FOREIGN KEY (matched_ngo_id) REFERENCES ngos (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pickups (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        listing_code TEXT NOT NULL,
        business_name TEXT NOT NULL,
        ngo_name TEXT NOT NULL,
        driver_name TEXT,
        vehicle_number TEXT,
        scheduled_time TEXT NOT NULL,
        pickup_status TEXT NOT NULL,
        food_temperature_verified INTEGER DEFAULT 1,
        notes TEXT,
        completed_at TEXT,
        FOREIGN KEY (listing_id) REFERENCES surplus_listings (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historical_demand (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_id TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        demand_units REAL NOT NULL,
        waste_units REAL NOT NULL,
        stock_units REAL NOT NULL
    );
    """)

    conn.commit()
    seed_if_empty(conn)
    conn.close()

def seed_if_empty(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM businesses")
    if cursor.fetchone()[0] > 0:
        return

    # Seed Businesses exactly matching the document and dashboard
    businesses = [
        ("biz_1", "Hotel Sunshine", "Hotel & Buffet", "45 Brigade Road, Central District", 12.9716, 77.5946, "manager@hotelsunshine.com", "+1-555-0191", 1840.0),
        ("biz_2", "City Bakery", "Bakery", "12 Baker Street, West End", 12.9780, 77.6010, "orders@citybakery.com", "+1-555-0192", 980.0),
        ("biz_3", "FreshMart Chain", "Supermarket", "88 Market Square, North Park", 12.9352, 77.6245, "supply@freshmart.com", "+1-555-0193", 840.0),
        ("biz_4", "Spice Garden Rest.", "Restaurant", "21 Cuisine Blvd, South Gate", 12.9279, 77.6271, "chef@spicegarden.com", "+1-555-0194", 720.0),
        ("biz_5", "Campus Canteen", "Institutional Dining", "University Center, Tech Hub", 12.9345, 77.6101, "canteen@campusdining.edu", "+1-555-0195", 640.0),
        ("biz_6", "Green Grocers Hub", "Organic Market", "15 Eco Lane, Eastside", 12.9510, 77.6400, "contact@greengrocers.org", "+1-555-0196", 450.0),
    ]
    cursor.executemany("INSERT INTO businesses VALUES (?,?,?,?,?,?,?,?,?)", businesses)

    # Seed NGOs matching the document and sample dashboard
    ngos = [
        ("ngo_1", "Hope Foundation", "Shelter & Feeding Program", 150.0, "Cooked, Bakery, Grains, Dairy", 12.9650, 77.6000, "10 Hope Avenue, Central", "Sarah Jenkins", "+1-555-0210", 3400, 1),
        ("ngo_2", "Annapoorna NGO", "Community Kitchen", 200.0, "Cooked, Fruits & Veg, Grains", 12.9810, 77.5950, "4 Community Lane, West End", "Rajesh Patel", "+1-555-0211", 4100, 1),
        ("ngo_3", "Green Hands", "Food Bank", 300.0, "Fruits & Veg, Packaged, Dairy, Grains", 12.9400, 77.6200, "77 Eco Center, North Park", "Elena Rostova", "+1-555-0212", 2800, 1),
        ("ngo_4", "Seva Trust", "Community Kitchen", 100.0, "Cooked, Bakery, Packaged", 12.9300, 77.6150, "9 Peace Boulevard, South Gate", "Michael Chang", "+1-555-0213", 1950, 1),
        ("ngo_5", "City Relief", "Emergency Shelter", 120.0, "Cooked, Bakery, Packaged, Dairy", 12.9250, 77.6300, "33 Relief Point, Tech Hub", "Amina Nour", "+1-555-0214", 2200, 1),
        ("ngo_6", "Harbor Food Rescue", "Mobile Pantry", 180.0, "Cooked, Fruits & Veg, Bakery", 12.9550, 77.6350, "8 Harbor Way, Eastside", "David Miller", "+1-555-0215", 1600, 1),
    ]
    cursor.executemany("INSERT INTO ngos VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ngos)

    # Seed Inventory items across categories with expiry dates
    today = datetime.now()
    inventory = [
        ("inv_1", "biz_1", "Steamed Basmati Rice & Dal", "Cooked", "CK-01", "89012340001", 35.0, "kg", "Chilled", "High", (today - timedelta(days=1)).strftime("%Y-%m-%d"), (today + timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"), 3.5, "Waste Risk", "B-901"),
        ("inv_2", "biz_1", "Grilled Herb Chicken Portions", "Cooked", "CK-02", "89012340002", 25.0, "kg", "Chilled", "High", (today - timedelta(days=1)).strftime("%Y-%m-%d"), (today + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"), 6.2, "Waste Risk", "B-902"),
        ("inv_3", "biz_2", "Artisan Sourdough Loaves", "Bakery", "BK-01", "89012340003", 28.0, "kg", "Ambient", "High", today.strftime("%Y-%m-%d"), (today + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"), 2.8, "Active", "B-903"),
        ("inv_4", "biz_2", "Butter Croissants & Danishes", "Bakery", "BK-02", "89012340004", 16.0, "kg", "Ambient", "High", today.strftime("%Y-%m-%d"), (today + timedelta(hours=18)).strftime("%Y-%m-%d %H:%M"), 3.1, "Waste Risk", "B-904"),
        ("inv_5", "biz_3", "Organic Fresh Spinach & Greens", "Fruits & Veg", "FV-01", "89012340005", 42.0, "kg", "Chilled", "High", (today - timedelta(days=2)).strftime("%Y-%m-%d"), (today + timedelta(days=2)).strftime("%Y-%m-%d %H:%M"), 1.9, "Active", "B-905"),
        ("inv_6", "biz_3", "Ripe Bananas & Seasonal Apples", "Fruits & Veg", "FV-02", "89012340006", 55.0, "kg", "Ambient", "Medium", (today - timedelta(days=3)).strftime("%Y-%m-%d"), (today + timedelta(days=2)).strftime("%Y-%m-%d %H:%M"), 1.5, "Active", "B-906"),
        ("inv_7", "biz_3", "Whole Pasteurized Milk 1L", "Dairy", "DY-01", "89012340007", 60.0, "kg", "Chilled", "High", (today - timedelta(days=3)).strftime("%Y-%m-%d"), (today + timedelta(days=3)).strftime("%Y-%m-%d %H:%M"), 1.2, "Active", "B-907"),
        ("inv_8", "biz_3", "Greek Yogurt & Cottage Cheese", "Dairy", "DY-02", "89012340008", 22.0, "kg", "Chilled", "Medium", (today - timedelta(days=4)).strftime("%Y-%m-%d"), (today + timedelta(days=4)).strftime("%Y-%m-%d %H:%M"), 2.4, "Active", "B-908"),
        ("inv_9", "biz_4", "Vegetable Biryani Pots", "Cooked", "CK-03", "89012340009", 40.0, "kg", "Chilled", "High", today.strftime("%Y-%m-%d"), (today + timedelta(hours=10)).strftime("%Y-%m-%d %H:%M"), 4.0, "Waste Risk", "B-909"),
        ("inv_10", "biz_5", "Assorted Lunch Thali Meals", "Cooked", "CK-04", "89012340010", 30.0, "kg", "Chilled", "High", today.strftime("%Y-%m-%d"), (today + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"), 2.9, "Waste Risk", "B-910"),
        ("inv_11", "biz_1", "Bulk Jasmine Rice Sacks", "Grains", "GR-01", "89012340011", 120.0, "kg", "Ambient", "Low", (today - timedelta(days=20)).strftime("%Y-%m-%d"), (today + timedelta(days=90)).strftime("%Y-%m-%d %H:%M"), 1.1, "Active", "B-911"),
        ("inv_12", "biz_3", "Canned Legumes & Pasta", "Packaged", "PK-01", "89012340012", 80.0, "kg", "Ambient", "Low", (today - timedelta(days=15)).strftime("%Y-%m-%d"), (today + timedelta(days=120)).strftime("%Y-%m-%d %H:%M"), 2.0, "Active", "B-912"),
    ]
    cursor.executemany("INSERT INTO inventory_items VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", inventory)

    # Seed Surplus Listings matching Image 1: LST-4821, LST-4820, LST-4819, LST-4818, LST-4817
    listings = [
        ("list_1", "LST-4821", "biz_1", "Hotel Sunshine", "Cooked Meals", "Cooked", 48.0, 120, "Non-Veg", "Chilled", today.strftime("%Y-%m-%d 11:30"), (today + timedelta(hours=12)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"), "45 Brigade Road, Central District", 12.9716, 77.5946, "Picked Up", "ngo_1", "Hope Foundation", (today - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M")),
        ("list_2", "LST-4820", "biz_2", "City Bakery", "Bread & Pastry", "Bakery", 32.0, 80, "Veg", "Ambient", today.strftime("%Y-%m-%d 08:00"), (today + timedelta(hours=16)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M"), "12 Baker Street, West End", 12.9780, 77.6010, "In Transit", "ngo_2", "Annapoorna NGO", (today - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")),
        ("list_3", "LST-4819", "biz_3", "FreshMart Chain", "Fruits & Veg", "Fruits & Veg", 64.0, 160, "Vegan", "Ambient", today.strftime("%Y-%m-%d 07:00"), (today + timedelta(days=1)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"), "88 Market Square, North Park", 12.9352, 77.6245, "Scheduled", "ngo_3", "Green Hands", (today - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M")),
        ("list_4", "LST-4818", "biz_5", "Campus Canteen", "Rice & Curry", "Cooked", 28.0, 70, "Veg", "Chilled", today.strftime("%Y-%m-%d 12:00"), (today + timedelta(hours=10)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M"), "University Center, Tech Hub", 12.9345, 77.6101, "Picked Up", "ngo_4", "Seva Trust", (today - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")),
        ("list_5", "LST-4817", "biz_4", "Spice Garden Rest.", "Mixed Cooked", "Cooked", 42.0, 105, "Non-Veg", "Chilled", today.strftime("%Y-%m-%d 10:00"), (today + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=3)).strftime("%Y-%m-%d %H:%M"), "21 Cuisine Blvd, South Gate", 12.9279, 77.6271, "Picked Up", "ngo_5", "City Relief", (today - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M")),
        ("list_6", "LST-4822", "biz_1", "Hotel Sunshine", "Fresh Pastas & Sauces", "Cooked", 36.0, 90, "Veg", "Chilled", today.strftime("%Y-%m-%d 13:00"), (today + timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=4)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"), "45 Brigade Road, Central District", 12.9716, 77.5946, "Available", None, None, today.strftime("%Y-%m-%d %H:%M")),
        ("list_7", "LST-4823", "biz_3", "FreshMart Chain", "Dairy Packaged Crates", "Dairy", 50.0, 100, "Veg", "Chilled", today.strftime("%Y-%m-%d 09:00"), (today + timedelta(days=2)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=5)).strftime("%Y-%m-%d %H:%M"), (today + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"), "88 Market Square, North Park", 12.9352, 77.6245, "Available", None, None, today.strftime("%Y-%m-%d %H:%M")),
    ]
    cursor.executemany("INSERT INTO surplus_listings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", listings)

    # Seed Pickups matching the recent operations table
    pickups = [
        ("pk_1", "list_1", "LST-4821", "Hotel Sunshine", "Hope Foundation", "Marcus Vance", "KA-01-AB-1029", (today - timedelta(hours=3)).strftime("%Y-%m-%d 13:30"), "Picked Up", 1, "Delivered to shelter pantry in good chilled condition.", (today - timedelta(hours=3)).strftime("%Y-%m-%d 14:15")),
        ("pk_2", "list_2", "LST-4820", "City Bakery", "Annapoorna NGO", "Ravi Kumar", "KA-02-CD-4421", (today - timedelta(hours=1)).strftime("%Y-%m-%d 15:00"), "In Transit", 1, "En route to community kitchen center. ETA 20 mins.", None),
        ("pk_3", "list_3", "LST-4819", "FreshMart Chain", "Green Hands", "Samantha Ray", "KA-05-EF-9011", (today + timedelta(hours=2)).strftime("%Y-%m-%d 16:30"), "Scheduled", 1, "Vehicle assigned, insulated boxes ready.", None),
        ("pk_4", "list_4", "LST-4818", "Campus Canteen", "Seva Trust", "Sunil Joshi", "KA-03-GH-2211", (today - timedelta(hours=4)).strftime("%Y-%m-%d 12:45"), "Picked Up", 1, "Distributed to 70 day laborers.", (today - timedelta(hours=4)).strftime("%Y-%m-%d 13:30")),
        ("pk_5", "list_5", "LST-4817", "Spice Garden Rest.", "City Relief", "Dev Anand", "KA-04-IJ-7733", (today - timedelta(hours=5)).strftime("%Y-%m-%d 11:15"), "Picked Up", 1, "Evening meal service completed.", (today - timedelta(hours=5)).strftime("%Y-%m-%d 12:00")),
    ]
    cursor.executemany("INSERT INTO pickups VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", pickups)

    # Seed 90 days of historical demand for ML training per category
    categories = ["Cooked", "Bakery", "Fruits & Veg", "Dairy", "Grains", "Packaged"]
    hist_records = []
    base_demands = {"Cooked": 50, "Bakery": 30, "Fruits & Veg": 40, "Dairy": 25, "Grains": 20, "Packaged": 15}
    for day_offset in range(90, 0, -1):
        dt = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        day_of_week = (today - timedelta(days=day_offset)).weekday()
        # Weekend boost
        multiplier = 1.3 if day_of_week in [4, 5, 6] else 0.95
        for cat in categories:
            base = base_demands[cat] * multiplier
            demand = max(5.0, round(random.gauss(base, base * 0.15), 1))
            stock = max(demand, round(demand * random.uniform(1.05, 1.4), 1))
            waste = max(0.0, round(stock - demand if random.random() < 0.3 else 0.0, 1))
            hist_records.append(("biz_1", cat, dt, demand, waste, stock))
            hist_records.append(("biz_2", cat, dt, demand * 0.8, waste * 0.7, stock * 0.8))

    cursor.executemany("INSERT INTO historical_demand (business_id, category, date, demand_units, waste_units, stock_units) VALUES (?,?,?,?,?,?)", hist_records)
    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
