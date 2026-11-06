import React, { useState, useEffect } from 'react';
import {
  fetchBatchWastePredictions,
  fetchReorderRecommendations
} from '../api';
import {
  BrainCircuit,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  BarChart,
  ShoppingBag
} from 'lucide-react';

export default function AiPredictionView({ onDonateItem }) {
  const [predictionData, setPredictionData] = useState(null);
  const [reorders, setReorders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const pred = await fetchBatchWastePredictions();
        setPredictionData(pred);
        const reord = await fetchReorderRecommendations();
        setReorders(reord);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
        <BrainCircuit className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        Computing AI Demand & Waste Risk Models...
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Moderate': return 'text-amber-700 bg-amber-100 border-amber-200';
      default: return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-emerald-100 text-emerald-800">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Waste Risk & Demand Forecasting Engine
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Machine learning predictive model combining shelf-life urgency, demand velocity, and oversupply ratios
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'predictions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waste Risk Scores
          </button>
          <button
            onClick={() => setActiveTab('reorders')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'reorders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Smart Reorder Optimizer
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <span className="text-xs text-slate-500 font-medium">Items Monitored</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {predictionData?.total_analyzed || 0}
          </p>
          <span className="text-[11px] text-slate-400">Time-series trained</span>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4 bg-red-50/20">
          <span className="text-xs text-red-600 font-medium">Critical Waste Risk</span>
          <p className="text-2xl font-extrabold text-red-700 mt-1">
            {predictionData?.critical_waste_risk || 0}
          </p>
          <span className="text-[11px] text-red-600 font-semibold">Action within 24h</span>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-4 bg-orange-50/20">
          <span className="text-xs text-orange-600 font-medium">High Risk Batches</span>
          <p className="text-2xl font-extrabold text-orange-700 mt-1">
            {predictionData?.high_waste_risk || 0}
          </p>
          <span className="text-[11px] text-orange-600 font-semibold">Prepare donation</span>
        </div>

        <div className="bg-white rounded-lg border border-emerald-200 p-4 bg-emerald-50/20">
          <span className="text-xs text-emerald-700 font-medium">Projected Waste Diverted</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">
            {predictionData?.predicted_total_waste_kg || 0} kg
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Surplus rescue target</span>
        </div>
      </div>

      {activeTab === 'predictions' ? (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Composite Waste Risk Predictions (GradientBoosting Time-Series)
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Critical &gt;75</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span> High 50-74</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Low &lt;25</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50/60">
                  <th className="py-3 px-5">Item & Category</th>
                  <th className="py-3 px-5">Stock Level</th>
                  <th className="py-3 px-5">3-Day Forecast</th>
                  <th className="py-3 px-5">Days to Expiry</th>
                  <th className="py-3 px-5">AI Waste Risk Score</th>
                  <th className="py-3 px-5">Recommended Action</th>
                  <th className="py-3 px-5 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictionData?.predictions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {p.item_name}
                      <span className="block text-xs text-slate-500 font-normal">{p.category}</span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      {p.current_stock} kg
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {p.forecasted_demand} kg
                    </td>
                    <td className="py-3.5 px-5 text-xs font-medium text-slate-700">
                      {p.days_to_expiry} days ({p.hours_to_expiry}h)
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.risk_score >= 75 ? 'bg-red-500' : p.risk_score >= 50 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${p.risk_score}%` }}
                          ></div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(p.risk_level)}`}>
                          {p.risk_score} - {p.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 max-w-xs">
                      {p.recommended_action}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {p.risk_score >= 50 && (
                        <button
                          onClick={() => onDonateItem({ name: p.item_name, category: p.category, quantity: p.predicted_waste_kg || p.current_stock })}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-xs"
                        >
                          List Surplus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Smart Purchase & Reorder Optimization (Demand Forecast + Safety Buffer)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prevents over-purchasing and spoilage by balancing weekly demand forecasts against storage capacity limits
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50/60">
                  <th className="py-3 px-5">Item</th>
                  <th className="py-3 px-5">Current Stock</th>
                  <th className="py-3 px-5">Forecast 7-Day Demand</th>
                  <th className="py-3 px-5">Safety Buffer</th>
                  <th className="py-3 px-5">Storage Limit</th>
                  <th className="py-3 px-5">Recommended Reorder</th>
                  <th className="py-3 px-5">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reorders?.recommendations.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {r.item_name}
                      <span className="block text-xs text-slate-400 font-normal">{r.category}</span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      {r.current_stock_kg} kg
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {r.forecasted_7d_demand_kg} kg
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">
                      +{r.safety_stock_buffer_kg} kg
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {r.storage_capacity_kg} kg ({r.available_storage_kg} kg free)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700">
                      {r.recommended_reorder_qty_kg} kg
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                        r.reorder_urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                        r.reorder_urgency === 'Overstocked' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.reorder_urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
