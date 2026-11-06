import uuid
import csv
import io
from datetime import datetime, timedelta
from backend.database import get_connection

class InventoryService:
    @staticmethod
    def list_items(business_id: str = None, category: str = None, status: str = None):
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM inventory_items WHERE 1=1"
        params = []
        if business_id:
            query += " AND business_id = ?"
            params.append(business_id)
        if category:
            query += " AND category = ?"
            params.append(category)
        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY expiry_date ASC"
        cursor.execute(query, params)
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # Augment with days_to_expiry and expiry alert
        now = datetime.now()
        for item in items:
            exp_str = item["expiry_date"]
            try:
                if " " in exp_str:
                    exp_dt = datetime.strptime(exp_str, "%Y-%m-%d %H:%M")
                else:
                    exp_dt = datetime.strptime(exp_str, "%Y-%m-%d")
                hours = (exp_dt - now).total_seconds() / 3600.0
                item["hours_to_expiry"] = round(hours, 1)
                item["days_to_expiry"] = round(hours / 24.0, 1)
                if hours <= 24:
                    item["expiry_alert"] = "CRITICAL"
                elif hours <= 48:
                    item["expiry_alert"] = "WARNING"
                elif hours <= 72:
                    item["expiry_alert"] = "WATCH"
                else:
                    item["expiry_alert"] = "HEALTHY"
            except Exception:
                item["hours_to_expiry"] = 72.0
                item["days_to_expiry"] = 3.0
                item["expiry_alert"] = "HEALTHY"

        return items

    @staticmethod
    def add_item(data: dict):
        conn = get_connection()
        cursor = conn.cursor()
        item_id = data.get("id") or f"inv_{uuid.uuid4().hex[:8]}"
        business_id = data.get("business_id", "biz_1")
        name = data["name"]
        category = data.get("category", "Cooked")
        sku = data.get("sku") or f"SKU-{uuid.uuid4().hex[:6].upper()}"
        barcode = data.get("barcode") or str(uuid.uuid4().int)[:12]
        quantity = float(data.get("quantity", 10.0))
        unit = data.get("unit", "kg")
        storage_type = data.get("storage_type", "Chilled")
        perishability_level = data.get("perishability_level", "High")
        purchase_date = data.get("purchase_date") or datetime.now().strftime("%Y-%m-%d")
        expiry_date = data.get("expiry_date")
        cost_per_unit = float(data.get("cost_per_unit", 2.5))
        status = data.get("status", "Active")
        batch_number = data.get("batch_number") or f"B-{uuid.uuid4().hex[:4].upper()}"

        cursor.execute("""
            INSERT INTO inventory_items (id, business_id, name, category, sku, barcode, quantity, unit, storage_type, perishability_level, purchase_date, expiry_date, cost_per_unit, status, batch_number)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (item_id, business_id, name, category, sku, barcode, quantity, unit, storage_type, perishability_level, purchase_date, expiry_date, cost_per_unit, status, batch_number))
        conn.commit()
        conn.close()
        return {"id": item_id, "name": name, "status": "Created", "sku": sku, "barcode": barcode}

    @staticmethod
    def bulk_upload_csv(csv_content: str, business_id: str = "biz_1"):
        """Parse CSV rows and insert into inventory."""
        conn = get_connection()
        cursor = conn.cursor()
        reader = csv.DictReader(io.StringIO(csv_content))
        inserted = 0
        for row in reader:
            item_id = f"inv_{uuid.uuid4().hex[:8]}"
            name = row.get("name") or row.get("Item Name") or "Inventory Item"
            category = row.get("category") or row.get("Category") or "Cooked"
            quantity = float(row.get("quantity") or row.get("Quantity") or 10.0)
            unit = row.get("unit") or row.get("Unit") or "kg"
            storage_type = row.get("storage_type") or row.get("Storage") or "Ambient"
            expiry_date = row.get("expiry_date") or row.get("Expiry Date") or (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d %H:%M")
            sku = row.get("sku") or f"SKU-{uuid.uuid4().hex[:6].upper()}"
            barcode = row.get("barcode") or str(uuid.uuid4().int)[:12]
            cost = float(row.get("cost_per_unit") or 2.0)

            cursor.execute("""
                INSERT INTO inventory_items (id, business_id, name, category, sku, barcode, quantity, unit, storage_type, perishability_level, purchase_date, expiry_date, cost_per_unit, status, batch_number)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (item_id, business_id, name, category, sku, barcode, quantity, unit, storage_type, "Medium", datetime.now().strftime("%Y-%m-%d"), expiry_date, cost, "Active", f"CSV-{inserted+1}"))
            inserted += 1

        conn.commit()
        conn.close()
        return {"status": "Success", "records_imported": inserted}

    @staticmethod
    def pos_sync_transaction(business_id: str, items_sold: list):
        """Simulates POS checkout sync decrements stock and flags waste if shelf expired."""
        conn = get_connection()
        cursor = conn.cursor()
        updated = []
        for sale in items_sold:
            sku = sale.get("sku")
            qty_sold = float(sale.get("quantity", 1.0))
            cursor.execute("SELECT * FROM inventory_items WHERE business_id = ? AND (sku = ? OR barcode = ?) LIMIT 1", (business_id, sku, sku))
            row = cursor.fetchone()
            if row:
                current_qty = row["quantity"]
                new_qty = max(0.0, current_qty - qty_sold)
                new_status = "Out of Stock" if new_qty == 0 else row["status"]
                cursor.execute("UPDATE inventory_items SET quantity = ?, status = ? WHERE id = ?", (new_qty, new_status, row["id"]))
                updated.append({"id": row["id"], "name": row["name"], "previous_qty": current_qty, "remaining_qty": new_qty})
        conn.commit()
        conn.close()
        return {"status": "Synced", "items_updated": updated}

    @staticmethod
    def get_expiry_alerts(business_id: str = None):
        """Retrieves items requiring immediate redistribution or waste prevention."""
        items = InventoryService.list_items(business_id=business_id)
        critical = [i for i in items if i["expiry_alert"] == "CRITICAL"]
        warning = [i for i in items if i["expiry_alert"] == "WARNING"]
        watch = [i for i in items if i["expiry_alert"] == "WATCH"]
        return {
            "total_at_risk": len(critical) + len(warning) + len(watch),
            "critical_count": len(critical),
            "warning_count": len(warning),
            "watch_count": len(watch),
            "critical_items": critical,
            "warning_items": warning,
            "watch_items": watch
        }
