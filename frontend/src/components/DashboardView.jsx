import React, { useState, useEffect } from 'react';
import {
  fetchDashboardSummary,
  fetchCategoryBreakdown,
  fetchTopDonors,
  fetchRecentOperations,
  fetchInventoryItems,
  fetchSurplusListings,
  claimListing
} from '../api';
import {
  Store,
  Heart,
  Clock,
  Truck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Users2,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function DashboardView({ currentRole = 'admin', onNavigateToListing }) {
  const [summary, setSummary] = useState({
    listings_active: 846,
    participating_restaurants: 289,
    food_rescued_kg: 12958,
    food_rescued_period: 'this month',
    co2_prevented_kg: 6479,
    co2_label: 'est. impact',
    ngos_active: 64,
    meals_label: 'serving 8,200 meals'
  });

  const [categories, setCategories] = useState([
    { category: 'Cooked', weight_kg: 4820, color: '#f97316' },
    { category: 'Bakery', weight_kg: 2410, color: '#eab308' },
    { category: 'Fruits/Veg', weight_kg: 2180, color: '#22c55e' },
    { category: 'Dairy', weight_kg: 1420, color: '#38bdf8' },
    { category: 'Grains', weight_kg: 980, color: '#b45309' },
    { category: 'Packaged', weight_kg: 1030, color: '#6366f1' },
  ]);

  const [topDonors, setTopDonors] = useState([
    { name: 'Hotel Sunshine', donated_kg: 1840, color: '#f97316' },
    { name: 'City Bakery', donated_kg: 980, color: '#eab308' },
    { name: 'FreshMart Chain', donated_kg: 840, color: '#22c55e' },
    { name: 'Spice Garden Rest.', donated_kg: 720, color: '#ef4444' },
    { name: 'Campus Canteen', donated_kg: 640, color: '#6366f1' },
  ]);

  const [operations, setOperations] = useState([
    { listing_id: 'LST-4821', donor: 'Hotel Sunshine', food_type: 'Cooked Meals', qty_kg: 48, ngo_assigned: 'Hope Foundation', status: 'Picked Up' },
    { listing_id: 'LST-4820', donor: 'City Bakery', food_type: 'Bread & Pastry', qty_kg: 32, ngo_assigned: 'Annapoorna NGO', status: 'In Transit' },
    { listing_id: 'LST-4819', donor: 'FreshMart', food_type: 'Fruits & Veg', qty_kg: 64, ngo_assigned: 'Green Hands', status: 'Scheduled' },
    { listing_id: 'LST-4818', donor: 'Campus Canteen', food_type: 'Rice & Curry', qty_kg: 28, ngo_assigned: 'Seva Trust', status: 'Picked Up' },
    { listing_id: 'LST-4817', donor: 'Spice Garden', food_type: 'Mixed Cooked', qty_kg: 42, ngo_assigned: 'City Relief', status: 'Picked Up' },
  ]);

  const [donorInventory, setDonorInventory] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);
  const [claimedNotice, setClaimedNotice] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const sum = await fetchDashboardSummary();
        if (sum) setSummary(sum);
        const cats = await fetchCategoryBreakdown();
        if (cats && cats.length) setCategories(cats);
        const donors = await fetchTopDonors();
        if (donors && donors.length) setTopDonors(donors);
        const ops = await fetchRecentOperations();
        if (ops && ops.length) setOperations(ops);

        // Load donor inventory items
        const inv = await fetchInventoryItems('biz_1');
        if (inv) setDonorInventory(inv.slice(0, 4));

        // Load available listings for NGO
        const list = await fetchSurplusListings();
        if (list) setAvailableListings(list.filter(l => l.status === 'Available'));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }
    loadData();
  }, [currentRole]);

  const maxCategoryWeight = Math.max(...categories.map(c => c.weight_kg), 5000);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Picked Up':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#22c55e] text-white">Picked Up</span>;
      case 'In Transit':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#fef3c7] text-[#b45309]">In Transit</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#e0e7ff] text-[#4338ca]">Scheduled</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const handleNgoClaim = async (listing) => {
    try {
      await claimListing(listing.id, 'ngo_1', null, 'Hope Shelter Van #1');
      setClaimedNotice(`Successfully claimed ${listing.food_type} (${listing.quantity_kg} kg)! Driver dispatched.`);
      setAvailableListings(prev => prev.filter(l => l.id !== listing.id));
    } catch (err) {
      alert("Claim failed: " + err.message);
    }
  };

  // ==================== 1. DONOR VIEW (HOTEL SUNSHINE) ====================
  if (currentRole === 'donor') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Donor Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">Hotel Sunshine — Kitchen Portal</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  #1 Top Donor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                45 Brigade Road, Central District • Contact: manager@hotelsunshine.com
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToListing}
            className="inline-flex items-center px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            + List Surplus Food
          </button>
        </div>

        {/* Donor Specific 4 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500"></div>
            <p className="text-xs font-medium text-slate-500">Total Donated by Us</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">1,840 kg</p>
            <p className="text-xs font-semibold text-orange-600 mt-1">Leading partner this month</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <p className="text-xs font-medium text-slate-500">Inventory Shrinkage Salvaged</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">$7,820</p>
            <p className="text-xs font-semibold text-emerald-600 mt-1">IRS Sec 170(e)(3) valuation</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500"></div>
            <p className="text-xs font-medium text-slate-500">Our Carbon Offset</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">4,600 kg</p>
            <p className="text-xs font-semibold text-cyan-600 mt-1">CO₂e greenhouse saved</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
            <p className="text-xs font-medium text-slate-500">Active Listings in Transit</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">2 Batches</p>
            <p className="text-xs font-semibold text-purple-600 mt-1">84 kg total today</p>
          </div>
        </div>

        {/* Donor Inventory Watchlist & Recent Donations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Items Near Expiry (Actionable) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  Kitchen Inventory Expiry Watchlist
                </h2>
              </div>
              <span className="text-xs text-amber-600 font-semibold">Action Recommended</span>
            </div>

            <div className="divide-y divide-slate-100">
              {donorInventory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      {item.quantity} {item.unit} • Storage: {item.storage_type} • Best before: {item.expiry_date}
                    </span>
                  </div>
                  <button
                    onClick={onNavigateToListing}
                    className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100"
                  >
                    Donate to NGO
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hotel Sunshine's Pickups Log */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Our Recent Donation Pickups
            </h2>

            <div className="space-y-3">
              {operations.filter(op => op.donor.includes('Hotel Sunshine')).map((op, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{op.listing_id} • {op.food_type}</span>
                    {getStatusBadge(op.status)}
                  </div>
                  <p className="text-slate-600">{op.qty_kg} kg assigned to <strong>{op.ngo_assigned}</strong></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. NGO VIEW (HOPE FOUNDATION) ====================
  if (currentRole === 'ngo') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* NGO Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">Hope Foundation — Charity Ingestion Hub</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                  Verified Food Shelter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                10 Hope Avenue, Central • Daily Capacity: 150 kg/day • Serving 240 shelter residents
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
            Intake Capacity Remaining Today: <strong>102 kg</strong>
          </div>
        </div>

        {claimedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-lg flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{claimedNotice}</span>
            </div>
            <button onClick={() => setClaimedNotice(null)}>✕</button>
          </div>
        )}

        {/* NGO Specific 4 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <p className="text-xs font-medium text-slate-500">Total Food Received</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">3,400 kg</p>
            <p className="text-xs font-semibold text-emerald-600 mt-1">This month's intake</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
            <p className="text-xs font-medium text-slate-500">Meals Distributed</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">8,500</p>
            <p className="text-xs font-semibold text-blue-600 mt-1">To local community families</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
            <p className="text-xs font-medium text-slate-500">Deliveries Arriving Today</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">2 Pickups</p>
            <p className="text-xs font-semibold text-indigo-600 mt-1">Hotel Sunshine & FreshMart</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <p className="text-xs font-medium text-slate-500">Cost Savings for Shelter</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">$14,450</p>
            <p className="text-xs font-semibold text-amber-600 mt-1">Grocery budget saved</p>
          </div>
        </div>

        {/* Live Available Food In Area to Claim */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Surplus Food Available in Your Proximity (Ready to Claim)
              </h2>
            </div>
            <span className="text-xs text-slate-500">&lt;5 km from Hope Shelter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableListings.length > 0 ? (
              availableListings.map(l => (
                <div key={l.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:border-emerald-300 transition-all text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{l.listing_code}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{l.food_type}</h4>
                      <p className="text-slate-600 font-medium">Donor: {l.business_name}</p>
                    </div>
                    <span className="text-base font-extrabold text-slate-900">{l.quantity_kg} kg</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Pickup Window: {l.pickup_window_start.split(' ')[1]} - {l.pickup_window_end.split(' ')[1]}</span>
                    <button
                      onClick={() => handleNgoClaim(l)}
                      className="px-3 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded shadow-xs"
                    >
                      Claim & Request Driver
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 col-span-2 text-center">
                All nearby surplus listings currently claimed. New batches sync every 30 minutes.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. ADMIN / CENTRAL FOOD RESCUE VIEW (DEFAULT) ====================
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Food Rescue Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Connecting surplus food to NGOs and communities in need
        </p>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Listings Active */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#22c55e]"></div>
          <p className="text-xs font-medium text-slate-500">Listings Active</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {summary.listings_active.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-[#16a34a] mt-1">
            {summary.participating_restaurants} restaurants
          </p>
        </div>

        {/* Card 2: Food Rescued */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#f97316]"></div>
          <p className="text-xs font-medium text-slate-500">Food Rescued</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {summary.food_rescued_kg.toLocaleString()} kg
          </p>
          <p className="text-xs font-semibold text-[#ea580c] mt-1">
            {summary.food_rescued_period}
          </p>
        </div>

        {/* Card 3: CO2 Prevented */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#06b6d4]"></div>
          <p className="text-xs font-medium text-slate-500">CO₂ Prevented</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {summary.co2_prevented_kg.toLocaleString()} kg
          </p>
          <p className="text-xs font-semibold text-[#0891b2] mt-1">
            {summary.co2_label}
          </p>
        </div>

        {/* Card 4: NGOs Active */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6366f1]"></div>
          <p className="text-xs font-medium text-slate-500">NGOs Active</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {summary.ngos_active}
          </p>
          <p className="text-xs font-semibold text-[#4f46e5] mt-1">
            {summary.meals_label}
          </p>
        </div>
      </div>

      {/* Middle Section: Bar Chart & Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 shadow-xs p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-6">
            Food Rescued by Category (kg — Last 30 Days)
          </h2>

          <div className="h-56 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
            {categories.map((cat) => {
              const barHeightPx = Math.max(20, Math.round((cat.weight_kg / maxCategoryWeight) * 160));
              return (
                <div key={cat.category} className="flex flex-col items-center flex-1 mx-1.5 h-full justify-end group">
                  <span className="text-xs font-bold text-slate-800 mb-1.5">
                    {cat.weight_kg}
                  </span>
                  <div
                    style={{
                      height: `${barHeightPx}px`,
                      backgroundColor: cat.color,
                      width: '44px',
                    }}
                    className="rounded-t-xs transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                  ></div>
                  <span className="text-[11px] font-medium text-slate-700 mt-2.5 truncate max-w-[65px] text-center">
                    {cat.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Top Donor Partners (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900">
              Top Donor Partners
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-700 border border-emerald-200/60">
              30 days
            </span>
          </div>

          <div className="space-y-4">
            {topDonors.map((donor) => (
              <div key={donor.name} className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: donor.color }}
                  ></span>
                  <span className="text-sm font-medium text-slate-800">
                    {donor.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {donor.donated_kg.toLocaleString()} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Rescue Operations Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Recent Rescue Operations
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50/50">
                <th className="py-3.5 px-6">Listing ID</th>
                <th className="py-3.5 px-6">Donor</th>
                <th className="py-3.5 px-6">Food Type</th>
                <th className="py-3.5 px-6">Qty (kg)</th>
                <th className="py-3.5 px-6">NGO Assigned</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {operations.map((op, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-700">{op.listing_id}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-900">{op.donor}</td>
                  <td className="py-3.5 px-6 text-slate-600">{op.food_type}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{op.qty_kg}</td>
                  <td className="py-3.5 px-6 text-slate-700">{op.ngo_assigned}</td>
                  <td className="py-3.5 px-6">
                    {getStatusBadge(op.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
