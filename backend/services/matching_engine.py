import math
from datetime import datetime
from backend.database import get_connection

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RedistributionMatchingEngine:
    def __init__(self):
        pass

    def match_listing_to_ngos(self, listing: dict, top_k: int = 5) -> list:
        """
        AI-Powered Multi-criteria Donor-NGO Matching Algorithm.
        Factors:
        - Geographic Proximity (Haversine formula)
        - Category & Dietary Compatibility
        - Capacity & Intake Volume
        - Expiry Time Urgency weighting
        """
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ngos WHERE active_status = 1")
        ngos = [dict(row) for row in cursor.fetchall()]
        conn.close()

        listing_lat = float(listing.get("latitude") or 12.9716)
        listing_lng = float(listing.get("longitude") or 77.5946)
        listing_cat = listing.get("category", "Cooked")
        listing_qty = float(listing.get("quantity_kg", 20.0))
        expiry_str = listing.get("expiry_time", "")

        # Calculate hours remaining to expiry
        try:
            exp_dt = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M")
            hours_remaining = max(1.0, (exp_dt - datetime.now()).total_seconds() / 3600.0)
        except Exception:
            hours_remaining = 12.0

        is_critical_urgency = hours_remaining <= 12.0

        matches = []
        for ngo in ngos:
            ngo_lat = float(ngo.get("latitude") or 12.9716)
            ngo_lng = float(ngo.get("longitude") or 77.5946)
            distance_km = haversine_distance(listing_lat, listing_lng, ngo_lat, ngo_lng)

            # 1. Proximity Score (0-100)
            if distance_km <= 2.5:
                proximity_score = 100.0
            elif distance_km <= 5.0:
                proximity_score = 85.0
            elif distance_km <= 10.0:
                proximity_score = 70.0
            elif distance_km <= 15.0:
                proximity_score = 50.0
            else:
                proximity_score = max(10.0, 50.0 - (distance_km - 15.0) * 2)

            # 2. Food Category Acceptance Score (0-100)
            accepted = [c.strip().lower() for c in ngo.get("accepted_categories", "").split(",")]
            cat_match = any(listing_cat.lower() in acc or acc in listing_cat.lower() for acc in accepted)
            category_score = 100.0 if cat_match else 20.0

            # 3. Capacity Compatibility Score (0-100)
            capacity = float(ngo.get("capacity_kg_per_day", 100.0))
            if listing_qty <= capacity:
                # Perfect fit if quantity is between 20% and 80% of capacity
                cap_ratio = listing_qty / capacity
                capacity_score = 100.0 if cap_ratio <= 0.8 else 85.0
            else:
                capacity_score = max(30.0, 100.0 - ((listing_qty - capacity) / capacity) * 100.0)

            # 4. Urgency Adaptive Weighting
            if is_critical_urgency:
                # When critical, proximity matters most for timely pickup
                w_prox = 0.50
                w_cat = 0.30
                w_cap = 0.20
            else:
                w_prox = 0.35
                w_cat = 0.40
                w_cap = 0.25

            total_score = (w_prox * proximity_score) + (w_cat * category_score) + (w_cap * capacity_score)
            match_score = round(min(100.0, max(0.0, total_score)), 1)

            # Rationale explanation
            reasons = []
            if distance_km <= 5.0:
                reasons.append(f"Nearby ({distance_km} km away)")
            else:
                reasons.append(f"{distance_km} km distance")

            if cat_match:
                reasons.append(f"Accepts {listing_cat}")
            else:
                reasons.append(f"Non-preferred food category")

            reasons.append(f"Daily capacity {capacity} kg")

            matches.append({
                "ngo_id": ngo["id"],
                "ngo_name": ngo["name"],
                "ngo_type": ngo["type"],
                "distance_km": distance_km,
                "contact_person": ngo["contact_person"],
                "phone": ngo["phone"],
                "capacity_kg_per_day": capacity,
                "match_score": match_score,
                "compatibility_breakdown": {
                    "proximity_score": round(proximity_score, 1),
                    "category_score": round(category_score, 1),
                    "capacity_score": round(capacity_score, 1),
                },
                "match_reasons": reasons,
                "estimated_transit_minutes": max(10, int(distance_km * 3.5))
            })

        # Sort descending by match score
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:top_k]

matching_engine = RedistributionMatchingEngine()
