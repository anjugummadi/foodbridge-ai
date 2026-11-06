import React, { useState, useEffect } from 'react';
import {
  fetchDashboardSummary,
  fetchCategoryBreakdown,
  fetchTopDonors,
  fetchRecentOperations
} from '../api';

export default function DashboardView({ onNavigateToListing }) {
  const [summary, setSummary] = useState({
    listings_active: 842,
    participating_restaurants: 284,
    food_rescued_kg: 12840,
    food_rescued_period: 'this month',
    co2_prevented_kg: 6420,
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
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }
    loadData();
  }, []);

  const maxCategoryWeight = Math.max(...categories.map(c => c.weight_kg), 5000);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Picked Up':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#22c55e] text-white">
            Picked Up
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#fef3c7] text-[#b45309]">
            In Transit
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#e0e7ff] text-[#4338ca]">
            Scheduled
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
            Available
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

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
        {/* Left Column: Bar Chart (7 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200/90 shadow-xs p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-6">
            Food Rescued by Category (kg — Last 30 Days)
          </h2>

          <div className="h-56 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
            {categories.map((cat) => {
              // Calculate height in pixels (max 150px)
              const barHeightPx = Math.max(20, Math.round((cat.weight_kg / maxCategoryWeight) * 160));
              return (
                <div key={cat.category} className="flex flex-col items-center flex-1 mx-1.5 h-full justify-end group">
                  {/* Value number on top */}
                  <span className="text-xs font-bold text-slate-800 mb-1.5">
                    {cat.weight_kg}
                  </span>
                  {/* Bar */}
                  <div
                    style={{
                      height: `${barHeightPx}px`,
                      backgroundColor: cat.color,
                      width: '44px',
                    }}
                    className="rounded-t-xs transition-all duration-300 group-hover:opacity-90 shadow-2xs"
                  ></div>
                  {/* Category Label */}
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
