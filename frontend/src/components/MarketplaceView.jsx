import React, { useState, useEffect } from 'react';
import {
  fetchSurplusListings,
  runAiMatching,
  claimListing,
  createSurplusListing
} from '../api';
import {
  Store,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Truck,
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function MarketplaceView({ onOpenNewListingModal }) {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadListings = async () => {
    try {
      const data = await fetchSurplusListings();
      setListings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleRunMatch = async (listing) => {
    setSelectedListing(listing);
    setMatchingLoading(true);
    try {
      const matches = await runAiMatching(listing);
      setMatchResults(matches);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleClaim = async (ngo) => {
    if (!selectedListing) return;
    setClaiming(true);
    try {
      await claimListing(selectedListing.id, ngo.ngo_id, null, 'EcoExpress Food Courier');
      setNotification(`Listing ${selectedListing.listing_code} successfully matched and scheduled for ${ngo.ngo_name}!`);
      setSelectedListing(null);
      setMatchResults([]);
      loadListings();
    } catch (err) {
      alert('Claim failed: ' + err.message);
    } finally {
      setClaiming(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Available</span>;
      case 'Scheduled':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">Scheduled</span>;
      case 'In Transit':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">In Transit</span>;
      case 'Picked Up':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Picked Up</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-lg flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Surplus Food Marketplace & NGO Matching
          </h1>
          <p className="text-sm text-slate-500">
            Real-time surplus listings connected to nearby community kitchens and food banks via AI proximity matching
          </p>
        </div>

        <button
          onClick={onOpenNewListingModal}
          className="inline-flex items-center px-4 py-2 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
        >
          + Post Surplus Food
        </button>
      </div>

      {/* Listings Grid & Match Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Listings (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {listings.map((l) => (
            <div
              key={l.id}
              className={`bg-white rounded-lg border p-4.5 transition-all ${
                selectedListing?.id === l.id
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{l.listing_code}</span>
                    {getStatusBadge(l.status)}
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {l.dietary_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{l.food_type}</h3>
                  <p className="text-xs text-slate-600 font-medium">{l.business_name}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900">{l.quantity_kg} kg</span>
                  <span className="block text-[11px] text-slate-500">~{l.portions_count || int(l.quantity_kg * 2.5)} portions</span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{l.pickup_address}</span>
                </div>
                <div className="flex items-center space-x-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pickup: {l.pickup_window_start.split(' ')[1]} - {l.pickup_window_end.split(' ')[1]}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-red-600 font-semibold flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Best before: {l.expiry_time}
                </span>

                {l.status === 'Available' ? (
                  <button
                    onClick={() => handleRunMatch(l)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-[#10b981] hover:bg-emerald-600 text-white shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Run AI Matching
                  </button>
                ) : (
                  <span className="text-xs font-medium text-slate-500">
                    Assigned to: <strong className="text-slate-800">{l.matched_ngo_name}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: AI Matching Recommendations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200/90 shadow-xs p-5 self-start sticky top-20">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              AI Recipient Matching Engine
            </h2>
          </div>

          {selectedListing ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block">
                  Target Listing: {selectedListing.listing_code} ({selectedListing.food_type})
                </span>
                <span className="text-emerald-700">
                  {selectedListing.quantity_kg} kg • {selectedListing.category} • Location: {selectedListing.business_name}
                </span>
              </div>

              {matchingLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-spin mx-auto mb-2" />
                  Calculating Haversine distance, NGO capacities, and food preferences...
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700">Ranked NGO Matches:</span>
                  {matchResults.map((m, idx) => (
                    <div
                      key={m.ngo_id}
                      className="border border-slate-200 rounded-lg p-3 hover:border-emerald-400 transition-all bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{m.ngo_name}</h4>
                          <span className="text-[11px] text-slate-500">{m.ngo_type} • {m.distance_km} km away</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {m.match_score}% Match
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center space-x-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>Est. transit time: ~{m.estimated_transit_minutes} mins</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.match_reasons.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600">
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaim(m)}
                        disabled={claiming}
                        className="w-full mt-3 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
                      >
                        {claiming ? 'Confirming...' : `Confirm Match & Dispatch`}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an available surplus listing on the left to run multi-criteria AI matching.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
