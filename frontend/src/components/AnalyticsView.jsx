import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('volume');

  // Trend data over months (Rescued vs Disposed)
  const monthlyTrends = [
    { month: 'Jun', rescued: 8200, disposed: 2800 },
    { month: 'Jul', rescued: 9400, disposed: 2300 },
    { month: 'Aug', rescued: 10600, disposed: 1900 },
    { month: 'Sep', rescued: 11800, disposed: 1400 },
    { month: 'Oct', rescued: 12400, disposed: 1100 },
    { month: 'Nov', rescued: 12958, disposed: 740 },
  ];

  // Peak surplus generation hours
  const hourlySurplus = [
    { hour: '08:00', percent: 15, label: 'Breakfast Prep' },
    { hour: '11:00', percent: 25, label: 'Mid-Morning' },
    { hour: '14:30', percent: 85, label: 'Lunch Buffet Surplus' },
    { hour: '17:00', percent: 30, label: 'Late Afternoon' },
    { hour: '21:30', percent: 95, label: 'Dinner Closing Clearance' },
    { hour: '23:00', percent: 45, label: 'Bakery Batch End' },
  ];

  // AI Model Performance Metrics
  const modelMetrics = [
    { name: 'Model Algorithm', value: 'Gradient Boosting Regressor' },
    { name: 'Demand Forecast Accuracy (R²)', value: '91.2%' },
    { name: 'Mean Absolute Error (MAE)', value: '2.84 kg' },
    { name: 'Surplus Matching Precision', value: '96.4%' },
    { name: 'Average Lead Time to Claim', value: '38 minutes' },
    { name: 'Cold-Chain Compliance Rate', value: '99.1%' }
  ];

  const maxRescued = 14000;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Predictive Analytics & Operations Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Historical diversion trends, machine learning accuracy benchmarks, and time-of-day surplus dynamics
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold shadow-xs">
          {['7d', '30d', '90d', '1y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-md uppercase transition-all ${
                timeRange === t ? 'bg-[#10b981] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Rescue Conversion Rate</span>
            <span className="text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +3.4%
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">94.6%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Surplus claimed before expiry</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Avg Dispatch Response Time</span>
            <span className="text-emerald-600 font-bold flex items-center">
              <Clock className="w-3.5 h-3.5 mr-0.5" /> -18 mins
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">2.4 hrs</p>
          <span className="text-[11px] text-slate-400 mt-1 block">From listing to NGO pickup</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Retail Shrinkage Salvaged</span>
            <span className="text-emerald-600 font-bold">100% Tax Deductible</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">$54,570</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Inventory capital recovery</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>AI Demand Model Score</span>
            <span className="text-emerald-600 font-bold">High Precision</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">91.2%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">R² score on sales prediction</span>
        </div>
      </div>

      {/* Main Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 6-Month Diversion vs Disposal Trend */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Food Waste Diversion Trajectory (kg / month)
              </h2>
              <p className="text-xs text-slate-500">Comparing rescued surplus vs unpreventable disposed waste</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center font-medium text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-[#10b981] mr-1.5"></span> Rescued Food (kg)
              </span>
              <span className="flex items-center font-medium text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-slate-300 mr-1.5"></span> Disposed Waste (kg)
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
            {monthlyTrends.map((t) => {
              const rescuedHeight = Math.round((t.rescued / maxRescued) * 200);
              const disposedHeight = Math.round((t.disposed / maxRescued) * 200);
              return (
                <div key={t.month} className="flex flex-col items-center flex-1 mx-2 h-full justify-end group">
                  <div className="flex items-end space-x-1.5 mb-1.5">
                    {/* Rescued bar */}
                    <div
                      style={{ height: `${rescuedHeight}px` }}
                      className="w-7 bg-[#10b981] rounded-t-xs transition-all group-hover:opacity-90"
                      title={`Rescued: ${t.rescued} kg`}
                    ></div>
                    {/* Disposed bar */}
                    <div
                      style={{ height: `${disposedHeight}px` }}
                      className="w-4 bg-slate-300 rounded-t-xs transition-all"
                      title={`Disposed: ${t.disposed} kg`}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 mt-2">{t.month}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">{t.rescued.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Since deploying FoodBridge in June, monthly waste disposal dropped by <strong>73.5%</strong>.
          </p>
        </div>

        {/* Right Column: AI Model Benchmark Card */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Model Evaluation</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Validated against historical inventory transactions and multi-tenant telemetry.
          </p>

          <div className="space-y-3">
            {modelMetrics.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">{m.name}</span>
                <span className="font-bold text-slate-900">{m.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
            <strong>Optimal Model State:</strong> The Gradient Boosting Regressor outperforms baseline moving average models by 27.7% in predicting daily kitchen demand.
          </div>
        </div>
      </div>

      {/* Peak Surplus Generation Heatmap Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Peak Surplus Generation Windows (Time-of-Day Dynamics)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Identifies critical surplus listing influx times to prepare proactive courier dispatch
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {hourlySurplus.map((h, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border text-center transition-all ${
                h.percent >= 80
                  ? 'bg-red-50 border-red-200 ring-1 ring-red-400'
                  : h.percent >= 40
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate-800 block">{h.hour}</span>
              <p className={`text-xl font-extrabold mt-1 ${h.percent >= 80 ? 'text-red-700' : 'text-slate-800'}`}>
                {h.percent}%
              </p>
              <span className="text-[10px] font-medium text-slate-600 block mt-1 leading-tight">
                {h.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
