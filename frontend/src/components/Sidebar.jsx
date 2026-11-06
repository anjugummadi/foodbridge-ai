import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Users2,
  Truck,
  Leaf,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Cpu,
  Boxes
} from 'lucide-react';

export default function Sidebar({ activeSidebar, setActiveSidebar }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-listing', label: 'New Listing', icon: PlusCircle },
    { id: 'inventory', label: 'Inventory & POS', icon: Boxes },
    { id: 'ai-waste', label: 'AI Waste Predictor', icon: Cpu },
    { id: 'ngo-network', label: 'NGO Network', icon: Users2 },
    { id: 'pickup-routes', label: 'Pickup Routes', icon: Truck },
    { id: 'impact-tracker', label: 'Impact Tracker', icon: Leaf },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#ecfdf5] border-r border-emerald-100/80 min-h-[calc(100vh-53px)] flex flex-col justify-between py-5 px-3">
      <div className="space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSidebar === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebar(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#10b981] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Backend & AI Engine Live Status */}
      <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/60 shadow-sm mt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>AI Engine Status</span>
          <span className="flex items-center text-emerald-600 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Expiry tracker & demand forecasting online with scheduled batch runs.
        </p>
      </div>
    </aside>
  );
}
