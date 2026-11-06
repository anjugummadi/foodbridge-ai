import React, { useState, useEffect } from 'react';
import { fetchPickups, updatePickupStatus } from '../api';
import { Truck, CheckCircle2, Clock, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PickupsView() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPickups = async () => {
    try {
      const data = await fetchPickups();
      setPickups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleAdvanceStatus = async (pickup, nextStatus) => {
    try {
      await updatePickupStatus(pickup.id, nextStatus);
      loadPickups();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pickup Routes & Logistics Coordination
        </h1>
        <p className="text-sm text-slate-500">
          Calendar-based dispatch, insulated transport verification, and real-time transit status tracking
        </p>
      </div>

      {/* Logistics Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Scheduled */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> 1. Scheduled Pickups
            </span>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              {pickups.filter(p => p.pickup_status === 'Scheduled').length}
            </span>
          </div>

          <div className="space-y-3">
            {pickups.filter(p => p.pickup_status === 'Scheduled').map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{p.listing_code}</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Scheduled</span>
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-800">From: {p.business_name}</p>
                  <p className="text-emerald-700 font-semibold">To: {p.ngo_name}</p>
                  <p className="text-slate-500 mt-1">Driver: {p.driver_name} ({p.vehicle_number})</p>
                </div>
                <button
                  onClick={() => handleAdvanceStatus(p, 'In Transit')}
                  className="w-full mt-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center space-x-1"
                >
                  <span>Dispatch (Mark In Transit)</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 2: In Transit */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center">
              <Truck className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> 2. In Transit
            </span>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {pickups.filter(p => p.pickup_status === 'In Transit').length}
            </span>
          </div>

          <div className="space-y-3">
            {pickups.filter(p => p.pickup_status === 'In Transit').map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{p.listing_code}</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">En Route</span>
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-800">From: {p.business_name}</p>
                  <p className="text-emerald-700 font-semibold">To: {p.ngo_name}</p>
                  <p className="text-slate-500 mt-1">Driver: {p.driver_name} ({p.vehicle_number})</p>
                </div>
                <div className="flex items-center text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Temperature Verified Chilled
                </div>
                <button
                  onClick={() => handleAdvanceStatus(p, 'Picked Up')}
                  className="w-full mt-2 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded flex items-center justify-center space-x-1"
                >
                  <span>Confirm Delivery (Picked Up)</span>
                  <CheckCircle2 className="w-3 h-3 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 3: Picked Up / Completed */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> 3. Completed Rescues
            </span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {pickups.filter(p => p.pickup_status === 'Picked Up').length}
            </span>
          </div>

          <div className="space-y-3">
            {pickups.filter(p => p.pickup_status === 'Picked Up').map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-md border border-slate-200 shadow-xs text-xs space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{p.listing_code}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Delivered</span>
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-800">{p.business_name} → {p.ngo_name}</p>
                  <p className="text-slate-500 text-[11px] mt-1">{p.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
