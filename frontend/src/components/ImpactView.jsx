import React, { useState, useEffect } from 'react';
import { fetchSustainabilityImpact } from '../api';
import { Leaf, Droplets, Flame, Utensils, DollarSign, Award, Download, CheckCircle2 } from 'lucide-react';

export default function ImpactView() {
  const [impact, setImpact] = useState({
    food_diverted_kg: 12840,
    co2e_saved_kg: 32100,
    water_conserved_liters: 13482000,
    methane_prevented_kg: 2311.2,
    total_meals_provided: 32100,
    economic_value_saved_usd: 54570,
    landfill_diversion_rate_pct: 94.6
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSustainabilityImpact();
        if (data) setImpact(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sustainability & ESG Environmental Impact
          </h1>
          <p className="text-sm text-slate-500">
            Certified carbon offsets, methane aversion, and hunger relief metrics calculated from verified redistribution
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Export ESG Certificate
        </button>
      </div>

      {/* Main 4 Environmental Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">CO₂e Emissions Saved</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {impact.co2e_saved_kg.toLocaleString()} kg
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Equiv. to 4,800 miles un-driven</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Droplets className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Virtual Water Conserved</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {impact.water_conserved_liters.toLocaleString()} L
          </p>
          <span className="text-[11px] text-blue-600 font-semibold">Agricultural supply saved</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Nutritious Meals Served</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {impact.total_meals_provided.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold">Distributed across 64 NGOs</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Landfill Diversion Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {impact.landfill_diversion_rate_pct}%
          </p>
          <span className="text-[11px] text-purple-600 font-semibold">Zero-waste landfill pledge</span>
        </div>
      </div>

      {/* Deep-dive methodology & verification card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          EPA & UN FAO Food Loss Index Compliance
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          FoodBridge follows the <strong>UN Sustainable Development Goal 12.3</strong> (Halving per capita food waste by 2030).
          Each kilogram of food rescued from commercial food waste streams prevents approximately <strong>2.5 kg of CO₂ equivalent greenhouse gases</strong>
          and averts <strong>0.18 kg of potent methane emissions</strong> from anaerobic landfill decomposition.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs font-bold text-slate-800">Economic Value Salvaged</span>
            <p className="text-lg font-extrabold text-emerald-700 mt-1">
              ${impact.economic_value_saved_usd.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500">Retail inventory value saved</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs font-bold text-slate-800">Methane Averted</span>
            <p className="text-lg font-extrabold text-emerald-700 mt-1">
              {impact.methane_prevented_kg.toLocaleString()} kg CH₄
            </p>
            <span className="text-[11px] text-slate-500">28x more potent than CO₂</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs font-bold text-slate-800">Verified Rescue Partners</span>
            <p className="text-lg font-extrabold text-emerald-700 mt-1">
              284 Donors • 64 NGOs
            </p>
            <span className="text-[11px] text-slate-500">End-to-end audit trail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
