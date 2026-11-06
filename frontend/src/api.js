const API_BASE = "/api";

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  return res.json();
}

export async function fetchCategoryBreakdown() {
  const res = await fetch(`${API_BASE}/analytics/category-breakdown`);
  return res.json();
}

export async function fetchTopDonors() {
  const res = await fetch(`${API_BASE}/analytics/top-donors`);
  return res.json();
}

export async function fetchRecentOperations() {
  const res = await fetch(`${API_BASE}/analytics/recent-operations`);
  return res.json();
}

export async function fetchInventoryItems(businessId = null) {
  const url = businessId ? `${API_BASE}/inventory/items?business_id=${businessId}` : `${API_BASE}/inventory/items`;
  const res = await fetch(url);
  return res.json();
}

export async function createInventoryItem(item) {
  const res = await fetch(`${API_BASE}/inventory/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function uploadInventoryCsv(file, businessId = "biz_1") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("business_id", businessId);
  const res = await fetch(`${API_BASE}/inventory/bulk-upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchExpiryAlerts(businessId = null) {
  const url = businessId ? `${API_BASE}/inventory/expiry-alerts?business_id=${businessId}` : `${API_BASE}/inventory/expiry-alerts`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchBatchWastePredictions(businessId = null) {
  const url = businessId ? `${API_BASE}/ai/batch-predictions?business_id=${businessId}` : `${API_BASE}/ai/batch-predictions`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchReorderRecommendations(businessId = null) {
  const url = businessId ? `${API_BASE}/ai/reorder-recommendations?business_id=${businessId}` : `${API_BASE}/ai/reorder-recommendations`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchSurplusListings(status = null) {
  const url = status ? `${API_BASE}/marketplace/listings?status=${status}` : `${API_BASE}/marketplace/listings`;
  const res = await fetch(url);
  return res.json();
}

export async function createSurplusListing(listing) {
  const res = await fetch(`${API_BASE}/marketplace/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  return res.json();
}

export async function runAiMatching(listing) {
  const res = await fetch(`${API_BASE}/marketplace/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  return res.json();
}

export async function claimListing(listingId, ngoId, scheduledTime = null, driverName = null) {
  const res = await fetch(`${API_BASE}/marketplace/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id: listingId, ngo_id: ngoId, scheduled_time: scheduledTime, driver_name: driverName }),
  });
  return res.json();
}

export async function fetchPickups() {
  const res = await fetch(`${API_BASE}/pickups`);
  return res.json();
}

export async function updatePickupStatus(pickupId, status) {
  const res = await fetch(`${API_BASE}/pickups/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pickup_id: pickupId, status }),
  });
  return res.json();
}

export async function fetchSustainabilityImpact() {
  const res = await fetch(`${API_BASE}/analytics/sustainability`);
  return res.json();
}

export async function fetchNgos() {
  const res = await fetch(`${API_BASE}/ngos`);
  return res.json();
}

export async function fetchBusinesses() {
  const res = await fetch(`${API_BASE}/businesses`);
  return res.json();
}
