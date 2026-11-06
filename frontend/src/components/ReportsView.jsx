import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Building,
  Award,
  CheckCircle2,
  DollarSign,
  Leaf,
  Layers
} from 'lucide-react';

export default function ReportsView() {
  const [selectedReportType, setSelectedReportType] = useState('esg');
  const [dateRange, setDateRange] = useState('monthly');
  const [partnerFilter, setPartnerFilter] = useState('all');

  const reportTypes = [
    {
      id: 'esg',
      title: 'ESG & Carbon Offset Certificate',
      description: 'Certified GHG emissions prevented, water conserved, and UN SDG 12.3 alignment',
      icon: Leaf,
      badge: 'ESG Audit'
    },
    {
      id: 'tax',
      title: 'Tax Deduction & Inventory Valuation',
      description: 'Fair-market value assessment of donated surplus under IRS Sec 170(e)(3)',
      icon: DollarSign,
      badge: 'Financial'
    },
    {
      id: 'audit',
      title: 'Commercial Waste Audit Report',
      description: 'Departmental shrinkage analysis, perishability metrics, and prevention benchmarks',
      icon: Layers,
      badge: 'Operational'
    },
    {
      id: 'chain',
      title: 'Food Safety & Cold-Chain Log',
      description: 'Safe handling temperature compliance logs and insulated transport sign-offs',
      icon: ShieldCheck,
      badge: 'Compliance'
    }
  ];

  // Audit breakdown data
  const auditData = [
    { donor: 'Hotel Sunshine', category: 'Cooked Meals', volume_kg: 1840, val_usd: 7820, co2_kg: 4600, meals: 4600 },
    { donor: 'City Bakery', category: 'Bread & Pastry', volume_kg: 980, val_usd: 4165, co2_kg: 2450, meals: 2450 },
    { donor: 'FreshMart Chain', category: 'Fruits & Veg', volume_kg: 840, val_usd: 3570, co2_kg: 2100, meals: 2100 },
    { donor: 'Spice Garden Rest.', category: 'Cooked Meals', volume_kg: 720, val_usd: 3060, co2_kg: 1800, meals: 1800 },
    { donor: 'Campus Canteen', category: 'Cooked Meals', volume_kg: 640, val_usd: 2720, co2_kg: 1600, meals: 1600 },
  ];

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Donor,Category,Volume (kg),Fair Market Value (USD),CO2 Prevented (kg),Meals Provided\n";
    auditData.forEach(row => {
      csvContent += `"${row.donor}","${row.category}",${row.volume_kg},${row.val_usd},${row.co2_kg},${row.meals}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FoodBridge_${selectedReportType.toUpperCase()}_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5 text-emerald-700" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reports, ESG Audits & Certification Hub
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate verifiable sustainability compliance certificates, tax deduction ledger schedules, and food safety audit logs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 rounded-md text-xs font-bold text-white bg-[#10b981] hover:bg-emerald-600 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReportType === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {rep.badge}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">{rep.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {rep.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Report Document Preview Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl mx-auto">
        {/* Certificate / Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                FB
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">FoodBridge Verified Audit</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocol: ISO 14064-1 GHG Verification & UN SDG 12.3 Zero Food Waste Framework
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <span className="font-bold text-slate-800 block">Certificate No: FB-2026-ESG-89012</span>
            <span>Issued Date: November 06, 2026</span>
            <span className="block text-emerald-700 font-semibold">Status: Verified & Audited</span>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center py-4 mb-6 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Official Compliance Record</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {selectedReportType === 'esg' && 'Certified Carbon Avoidance & Food Diversion Statement'}
            {selectedReportType === 'tax' && 'Corporate Surplus Food Donation Tax Ledger Schedule'}
            {selectedReportType === 'audit' && 'Comprehensive Commercial Food Shrinkage & Waste Audit'}
            {selectedReportType === 'chain' && 'Cold-Chain HACCP Food Safety Compliance Verification'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Covering operational cycle: October 01, 2026 – October 31, 2026
          </p>
        </div>

        {/* Key Metrics Summary Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-emerald-950 text-white rounded-lg mb-8">
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">Total Diversion</span>
            <p className="text-xl font-extrabold mt-0.5">12,958 kg</p>
            <span className="text-[10px] text-emerald-400">100% landfill averted</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">CO₂e Averted</span>
            <p className="text-xl font-extrabold mt-0.5">32,395 kg</p>
            <span className="text-[10px] text-emerald-400">EPA WARM model</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">Total Meals Served</span>
            <p className="text-xl font-extrabold mt-0.5">32,395 meals</p>
            <span className="text-[10px] text-emerald-400">0.4 kg standard serving</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-medium">Economic Value</span>
            <p className="text-xl font-extrabold mt-0.5">$54,570 USD</p>
            <span className="text-[10px] text-emerald-400">Fair market inventory value</span>
          </div>
        </div>

        {/* Detailed Itemized Ledger Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 font-bold text-slate-700 bg-slate-50">
                <th className="py-2.5 px-3">Donor Partner</th>
                <th className="py-2.5 px-3">Primary Category</th>
                <th className="py-2.5 px-3">Volume (kg)</th>
                <th className="py-2.5 px-3">Valuation ($)</th>
                <th className="py-2.5 px-3">CO₂e Prevented</th>
                <th className="py-2.5 px-3">Meals Provided</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.donor}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.volume_kg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">${row.val_usd.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.co2_kg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.meals.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Sign-off Block */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographic Verification & Timestamp</span>
            </div>
            <p className="font-mono text-[10px] text-slate-400 break-all">
              SHA256: e8b9f7a1c3d2e5a6f8b0c4d2e7a1c9d3e5b8a0c2e4f6a8b1c3d5e7a9c1b3d5e7
            </p>
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-800 block">FoodBridge Central Certification Office</span>
            <span className="text-[11px] text-slate-500">Autonomous ESG & Food Redistribution Auditor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
