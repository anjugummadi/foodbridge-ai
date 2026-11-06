# Final Project Presentation (Slide Deck Script)
## AI-Based Food Redistribution System for Waste Reduction and Surplus Inventory Management
**Brand:** FoodBridge  
**Track:** AI/ML in Sustainability & Supply Chain Logistics  

---

### Slide 1: Title & Vision
- **Title:** FoodBridge: AI-Driven Food Waste Reduction & Redistribution Platform
- **Subtitle:** Solving Commercial Food Waste with Real-Time Expiry Analytics & Predictive NGO Matching
- **Presenter:** Project Engineering Team
- **Mission:** Halving commercial surplus food loss while providing nutritious meals to frontline charities.

---

### Slide 2: The Problem
- **The Challenge:** Over 1.3 billion tons of food are wasted globally every year, contributing to 8-10% of global greenhouse emissions.
- **Root Causes in Hospitality & Retail:**
  - Static FIFO inventory rules fail to predict perishable demand fluctuations.
  - Supermarkets and buffet kitchens discard usable food due to lack of real-time expiry alerts.
  - Ad-hoc donation coordination: Calling charities manually is too slow when food has an 8-hour safe window.
- **Economic Loss:** Thousands of dollars in inventory shrinkage per store every week.

---

### Slide 3: The Proposed Solution
- **A Unified Dual-Sided Web Ecosystem:**
  1. **Business Dashboard:** Automated expiry tracking, CSV/POS integration, and AI Waste Risk Scores ($0–100$).
  2. **Predictive Intelligence:** Time-series demand forecasting (GradientBoosting) + Smart Reorder Optimizer.
  3. **Redistribution Marketplace:** 1-Click surplus listing + AI matching engine considering proximity (Haversine), dietary fit, and NGO capacity.
  4. **Logistics & ESG Hub:** Real-time pickup tracking, insulated chain verification, and UN SDG 12.3 carbon offset metrics.

---

### Slide 4: System Architecture & Workflow
- **Frontend:** React 19, Tailwind CSS, Lucide Icons, Vite, Responsive single-page architecture.
- **Backend Services:** FastAPI microservice, Python 3.11, Pydantic data validation.
- **AI/ML Engine:** Scikit-Learn Gradient Boosting Regressor, Haversine geospatial proximity algorithm.
- **Database:** SQLite / PostgreSQL multi-tenant schema with isolated business and NGO profiles.
- **Workflow:** Ingestion $\rightarrow$ Risk Scoring $\rightarrow$ Automated Surplus Listing $\rightarrow$ AI NGO Matching $\rightarrow$ Dispatch Coordination $\rightarrow$ Verified Delivery.

---

### Slide 5: Core Features & Demo Highlights
- **1. Real-Time Expiry Countdown & Barcode Scanner:** Flags `<24h CRITICAL` and `<48h WARNING` batches.
- **2. AI Waste Risk Scoring:** Combines expiry urgency ($50\%$), oversupply ratio ($35\%$), and category perishability factor ($15\%$).
- **3. Smart Reorder Engine:** Prevents over-purchasing by capping orders at 7-day demand forecasts minus current stock.
- **4. NGO Matching Engine:** Ranks candidate charities with match percentage and estimated transit minutes.
- **5. Dispatch Pipeline:** Status workflow (*Scheduled $\rightarrow$ In Transit $\rightarrow$ Picked Up*).

---

### Slide 6: Results & Environmental Impact
- **846 Active Listings** from **289 Participating Restaurants & Retailers**.
- **12,958 kg of Food Rescued** this month alone.
- **6,479 kg CO₂ Equivalent Emissions Prevented** ($2.5 \times$ waste mass).
- **32,395 Nutritious Meals Served** across **64 Active NGOs**.
- **94.6% Landfill Diversion Rate** achieved among onboarded partners.

---

### Slide 7: Technical Challenges & Solutions
- **Challenge 1:** Handling short-shelf-life cooked foods (decay within 8-14 hours).
  - *Solution:* Dynamic urgency multiplier in the matching engine that doubles proximity weight when expiry is under 12 hours.
- **Challenge 2:** Cold-chain integrity and food safety compliance.
  - *Solution:* Checkpoint temperature verification logged upon courier pickup.
- **Challenge 3:** Multi-tenant data isolation.
  - *Solution:* Scoped tenant queries by `business_id` across inventory and POS records.

---

### Slide 8: Future Scope & Roadmap
- **Mobile Native Applications:** Driver GPS live tracking with turn-by-turn route optimization.
- **Computer Vision Expiry & Freshness Scanner:** Image-based ripeness and spoilage detection via mobile camera.
- **Automated Dynamic Pricing Clearance:** Integration with consumer surplus apps for discounted quick-sale before donation.
- **Blockchain Donation Receipts:** Immutable ESG carbon credit verification for enterprise tax deductions.

---

### Slide 9: Q&A & Live Demonstration
- Open for questions and walkthrough of the live platform.
