import React from 'react';
import { Leaf, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentRole, setCurrentRole }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'listings', label: 'Listings' },
    { id: 'ngos', label: 'NGOs' },
    { id: 'pickups', label: 'Pickups' },
    { id: 'impact', label: 'Impact' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="bg-[#0b3323] text-white px-6 py-2.5 flex items-center justify-between shadow-md select-none sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
          <Leaf className="w-5 h-5 fill-emerald-400 text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-lg tracking-tight leading-none text-white">FoodBridge</span>
          </div>
          <span className="text-[11px] text-emerald-300/80 font-medium tracking-wide">
            AI Food Waste Reduction Platform
          </span>
        </div>
      </div>

      {/* Main Top Nav */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-4">
        {/* Role Switcher */}
        <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-2.5 py-1">
          <span className="text-xs text-emerald-300 font-medium">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="admin" className="bg-[#0b3323] text-white">Admin (Food Rescue View)</option>
            <option value="donor" className="bg-[#0b3323] text-white">Donor (Hotel Sunshine)</option>
            <option value="ngo" className="bg-[#0b3323] text-white">NGO (Hope Foundation)</option>
          </select>
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-emerald-700/80 border border-emerald-400/30 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            AP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-white">Admin</span>
            <span className="text-[10px] text-emerald-300/70">Central Dispatch</span>
          </div>
        </div>
      </div>
    </header>
  );
}
