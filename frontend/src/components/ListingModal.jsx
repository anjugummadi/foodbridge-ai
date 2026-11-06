import React, { useState } from 'react';
import { createSurplusListing } from '../api';
import { HeartHandshake, X } from 'lucide-react';

export default function ListingModal({ isOpen, onClose, initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    business_id: 'biz_1',
    business_name: 'Hotel Sunshine',
    food_type: initialData?.name || 'Assorted Prepared Meals',
    category: initialData?.category || 'Cooked',
    quantity_kg: initialData?.quantity || 30.0,
    portions_count: Math.round((initialData?.quantity || 30.0) * 2.5),
    dietary_type: 'Standard',
    storage_condition: initialData?.storage_type || 'Chilled',
    expiry_time: initialData?.expiry_date || '',
    pickup_window_start: '',
    pickup_window_end: '',
    pickup_address: '45 Brigade Road, Central District'
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSurplusListing(formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error creating listing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">List Surplus Food for Donation</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Food Description / Title</label>
            <input
              type="text"
              required
              value={formData.food_type}
              onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              placeholder="e.g. Steamed Rice, Dal, and Mixed Vegetable Curry"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              >
                <option value="Cooked">Cooked Meals</option>
                <option value="Bakery">Bakery</option>
                <option value="Fruits & Veg">Fruits & Veg</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Packaged">Packaged</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Tag</label>
              <select
                value={formData.dietary_type}
                onChange={(e) => setFormData({ ...formData, dietary_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              >
                <option value="Standard">Standard</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity (kg)</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.quantity_kg}
                onChange={(e) => {
                  const qty = parseFloat(e.target.value);
                  setFormData({ ...formData, quantity_kg: qty, portions_count: Math.round(qty * 2.5) });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Portions</label>
              <input
                type="number"
                value={formData.portions_count}
                onChange={(e) => setFormData({ ...formData, portions_count: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Condition</label>
              <select
                value={formData.storage_condition}
                onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              >
                <option value="Ambient">Ambient / Room Temp</option>
                <option value="Chilled">Chilled (&lt;4°C)</option>
                <option value="Frozen">Frozen (&lt;-18°C)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Safe Expiry Time</label>
              <input
                type="datetime-local"
                required
                value={formData.expiry_time}
                onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value.replace('T', ' ') })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pickup Address</label>
            <input
              type="text"
              required
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-emerald-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-md font-bold shadow-xs"
            >
              {loading ? 'Posting...' : 'Post Surplus Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
