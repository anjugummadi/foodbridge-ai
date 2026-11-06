import math
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from backend.database import get_connection

class FoodWasteAIEngine:
    def __init__(self):
        self.models = {}
        self.category_weights = {
            "Cooked": {"perishability": 1.25, "safety_margin": 1.10, "shelf_life_days": 1.5},
            "Bakery": {"perishability": 1.15, "safety_margin": 1.15, "shelf_life_days": 2.0},
            "Fruits & Veg": {"perishability": 1.10, "safety_margin": 1.20, "shelf_life_days": 5.0},
            "Dairy": {"perishability": 1.05, "safety_margin": 1.15, "shelf_life_days": 7.0},
            "Grains": {"perishability": 0.80, "safety_margin": 1.25, "shelf_life_days": 60.0},
            "Packaged": {"perishability": 0.75, "safety_margin": 1.30, "shelf_life_days": 90.0},
        }
        self._train_default_models()

    def _train_default_models(self):
        """Train lightweight regression models on seeded historical demand data."""
        try:
            conn = get_connection()
            query = "SELECT category, date, demand_units, waste_units, stock_units FROM historical_demand"
            df = pd.read_sql_query(query, conn)
            conn.close()

            if df.empty:
                return

            df['date'] = pd.to_datetime(df['date'])
            df['dayofweek'] = df['date'].dt.dayofweek
            df['day'] = df['date'].dt.day

            for category, group in df.groupby('category'):
                if len(group) >= 10:
                    X = group[['dayofweek', 'day', 'stock_units']].values
                    y = group['demand_units'].values
                    model = GradientBoostingRegressor(n_estimators=50, random_state=42)
                    model.fit(X, y)
                    self.models[category] = model
        except Exception as e:
            print(f"Model training initialization notice: {e}")

    def predict_demand(self, category: str, days_ahead: int = 3, current_stock: float = 50.0) -> dict:
        """Forecast demand for the next N days based on category trends and seasonality."""
        cat_info = self.category_weights.get(category, {"perishability": 1.0, "safety_margin": 1.15})
        today = datetime.now()
        forecast_daily = []

        model = self.models.get(category)
        for i in range(1, days_ahead + 1):
            future_date = today + pd.Timedelta(days=i)
            dow = future_date.weekday()
            day = future_date.day

            if model:
                pred = model.predict([[dow, day, current_stock]])[0]
            else:
                base = 35.0
                weekend_boost = 1.3 if dow in [4, 5, 6] else 0.95
                pred = base * weekend_boost

            daily_val = max(5.0, round(float(pred), 1))
            forecast_daily.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "day_name": future_date.strftime("%A"),
                "forecast_demand_kg": daily_val
            })

        total_demand = round(sum(d["forecast_demand_kg"] for d in forecast_daily), 1)
        avg_daily = round(total_demand / days_ahead, 1)

        return {
            "category": category,
            "forecast_days": days_ahead,
            "daily_forecast": forecast_daily,
            "total_forecast_demand_kg": total_demand,
            "average_daily_demand_kg": avg_daily,
            "model_type": "GradientBoosting + Seasonality Engine"
        }

    def calculate_waste_risk_score(self, item: dict) -> dict:
        """
        Combines days-to-expiry, current stock, and forecasted demand into an actionable risk score (0-100).
        """
        category = item.get("category", "Cooked")
        current_stock = float(item.get("quantity", 0.0))
        expiry_str = item.get("expiry_date", "")

        # Compute days or hours to expiry
        try:
            if " " in expiry_str:
                exp_dt = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M")
            else:
                exp_dt = datetime.strptime(expiry_str, "%Y-%m-%d")
            delta = exp_dt - datetime.now()
            hours_to_expiry = max(0.1, delta.total_seconds() / 3600.0)
            days_to_expiry = hours_to_expiry / 24.0
        except Exception:
            days_to_expiry = 2.0
            hours_to_expiry = 48.0

        # Forecast demand for the remaining shelf life
        forecast_days = max(1, math.ceil(min(days_to_expiry, 5)))
        demand_forecast = self.predict_demand(category, days_ahead=forecast_days, current_stock=current_stock)
        predicted_demand = demand_forecast["total_forecast_demand_kg"]

        # 1. Expiry Urgency (0-100)
        if hours_to_expiry <= 12:
            expiry_urgency = 100.0
        elif hours_to_expiry <= 24:
            expiry_urgency = 90.0
        elif days_to_expiry <= 2:
            expiry_urgency = 75.0
        elif days_to_expiry <= 4:
            expiry_urgency = 45.0
        elif days_to_expiry <= 7:
            expiry_urgency = 25.0
        else:
            expiry_urgency = max(0.0, 10.0 - (days_to_expiry * 0.1))

        # 2. Oversupply Ratio (Stock vs forecasted consumption)
        if current_stock > 0:
            surplus_potential = max(0.0, current_stock - predicted_demand)
            oversupply_ratio = min(100.0, (surplus_potential / current_stock) * 100.0)
        else:
            oversupply_ratio = 0.0
            surplus_potential = 0.0

        # 3. Category Perishability Factor
        cat_info = self.category_weights.get(category, {"perishability": 1.0})
        p_factor = cat_info["perishability"]

        # Composite Waste Risk Score
        raw_score = (0.50 * expiry_urgency) + (0.35 * oversupply_ratio) + (0.15 * (p_factor * 20))
        risk_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Risk Classification & Action
        if risk_score >= 75.0:
            risk_level = "Critical"
            action = "Donate to NGO immediately (High waste risk within 24h)"
        elif risk_score >= 50.0:
            risk_level = "High"
            action = "Post surplus listing or initiate 50% discount clearance"
        elif risk_score >= 25.0:
            risk_level = "Moderate"
            action = "Monitor shelf consumption; prepare for redistribution"
        else:
            risk_level = "Low"
            action = "Inventory levels healthy; no immediate intervention needed"

        predicted_waste = round(min(current_stock, max(0.0, surplus_potential)), 1)

        return {
            "inventory_item_id": item.get("id"),
            "item_name": item.get("name"),
            "category": category,
            "current_stock": current_stock,
            "days_to_expiry": round(days_to_expiry, 2),
            "hours_to_expiry": round(hours_to_expiry, 1),
            "forecasted_demand": round(predicted_demand, 1),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommended_action": action,
            "predicted_waste_kg": predicted_waste,
            "metrics": {
                "expiry_urgency_factor": round(expiry_urgency, 1),
                "oversupply_percentage": round(oversupply_ratio, 1),
                "perishability_multiplier": p_factor
            }
        }

    def generate_reorder_recommendation(self, item: dict, storage_capacity_kg: float = 200.0) -> dict:
        """Calculates optimal purchase quantities based on demand forecasts and storage capacity."""
        category = item.get("category", "Cooked")
        current_stock = float(item.get("quantity", 0.0))
        cat_info = self.category_weights.get(category, {"safety_margin": 1.15})

        forecast = self.predict_demand(category, days_ahead=7, current_stock=current_stock)
        forecast_7d = forecast["total_forecast_demand_kg"]

        # Safety factor buffer
        buffered_demand = forecast_7d * cat_info["safety_margin"]

        # Ideal reorder is what's needed to cover next 7 days minus usable current stock
        net_needed = max(0.0, buffered_demand - current_stock)

        # Cap by available storage capacity
        available_space = max(0.0, storage_capacity_kg - current_stock)
        optimal_order = min(net_needed, available_space)

        reorder_urgency = "High" if current_stock < (forecast["average_daily_demand_kg"] * 1.5) else "Normal"
        if optimal_order == 0:
            reorder_urgency = "Overstocked"

        return {
            "item_id": item.get("id"),
            "item_name": item.get("name"),
            "category": category,
            "current_stock_kg": current_stock,
            "forecasted_7d_demand_kg": round(forecast_7d, 1),
            "safety_stock_buffer_kg": round(buffered_demand - forecast_7d, 1),
            "storage_capacity_kg": storage_capacity_kg,
            "available_storage_kg": round(available_space, 1),
            "recommended_reorder_qty_kg": round(optimal_order, 1),
            "reorder_urgency": reorder_urgency,
            "estimated_stockout_days": round(current_stock / max(1.0, forecast["average_daily_demand_kg"]), 1)
        }

ai_engine = FoodWasteAIEngine()
