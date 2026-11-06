import React, { useState, useEffect } from 'react';
import {
  fetchInventoryItems,
  createInventoryItem,
  uploadInventoryCsv,
  fetchExpiryAlerts
} from '../api';
import {
  Boxes,
  Plus,
  Upload,
  QrCode,
  RefreshCw,
  AlertTriangle,
  Clock,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export default function InventoryView({ onDonateItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [alerts, setAlerts] = useState({ total_at_risk: 0, critical_count: 0, warning_count: 0 });

  // Add Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Cooked',
    quantity: 20,
    unit: 'kg',
    storage_type: 'Chilled',
    perishability_level: 'High',
    expiry_date: '',
    cost_per_unit: 3.5,
  });

  const [scanResult, setScanResult] = useState('');
  const [posSyncing, setPosSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInventoryItems();
      setItems(data);
      const alertData = await fetchExpiryAlerts();
      setAlerts(alertData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await createInventoryItem(newItem);
      setShowAddModal(false);
      setNewItem({
        name: '',
        category: 'Cooked',
        quantity: 20,
        unit: 'kg',
        storage_type: 'Chilled',
        perishability_level: 'High',
        expiry_date: '',
        cost_per_unit: 3.5,
      });
      setNotification('New inventory item added successfully.');
      loadData();
    } catch (err) {
      alert('Error creating item: ' + err.message);
    }
  };

  const handlePosSync = async () => {
    setPosSyncing(true);
    try {
      const res = await fetch('/api/pos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: 'biz_1',
          items_sold: [
            { sku: 'CK-01', quantity: 5.0 },
            { sku: 'CK-02', quantity: 4.0 }
          ]
        })
      });
      await res.json();
      setNotification('POS sync complete: sales deducted from active stock.');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setPosSyncing(false);
    }
  };

  const filteredItems = categoryFilter === 'ALL'
    ? items
    : items.filter(it => it.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  const getAlertBadge = (alert) => {
    switch (alert) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> &lt;24h CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> &lt;48h WARNING
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            &lt;72h WATCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            HEALTHY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Alert banner if items near expiry */}
      {alerts.critical_count > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900">
                Action Required: {alerts.critical_count} items approaching critical expiry (&lt;24h)
              </p>
              <p className="text-xs text-red-700">
                AI Waste Engine recommends listing surplus donations immediately to avoid waste.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCategoryFilter('Cooked')}
            className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Review Critical Items
          </button>
        </div>
      )}

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory & Expiry Monitoring
          </h1>
          <p className="text-sm text-slate-500">
            Real-time batch shelf-life tracking, food taxonomy classification, and POS sync
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowScannerModal(true)}
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Scan Barcode
          </button>

          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            CSV Import
          </button>

          <button
            onClick={handlePosSync}
            disabled={posSyncing}
            className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-emerald-600 ${posSyncing ? 'animate-spin' : ''}`} />
            {posSyncing ? 'Syncing...' : 'Sync POS'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-bold text-white bg-[#10b981] hover:bg-emerald-600 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['ALL', 'Cooked', 'Bakery', 'Fruits & Veg', 'Dairy', 'Grains', 'Packaged'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600 bg-slate-50/60">
                <th className="py-3.5 px-5">Item Name</th>
                <th className="py-3.5 px-5">Category & Storage</th>
                <th className="py-3.5 px-5">SKU / Barcode</th>
                <th className="py-3.5 px-5">Stock Level</th>
                <th className="py-3.5 px-5">Expiry Date</th>
                <th className="py-3.5 px-5">Expiry Alert</th>
                <th className="py-3.5 px-5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {item.name}
                    <div className="text-[11px] text-slate-400 font-normal">Batch: {item.batch_number || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-xs font-medium text-slate-800">{item.category}</span>
                    <span className="block text-[11px] text-slate-500">{item.storage_type} storage</span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-600 font-mono">
                    {item.sku || 'SKU-00'}
                    <span className="block text-[10px] text-slate-400 font-normal">{item.barcode}</span>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-700">
                    {item.expiry_date}
                    <span className="block text-[11px] text-slate-500">
                      ~{item.hours_to_expiry}h left
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {getAlertBadge(item.expiry_alert)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onDonateItem(item)}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Donate Surplus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Fresh Baked Croissants"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Condition</label>
                  <select
                    value={newItem.storage_type}
                    onChange={(e) => setNewItem({ ...newItem, storage_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-emerald-500"
                  >
                    <option value="Ambient">Ambient</option>
                    <option value="Chilled">Chilled</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value.replace('T', ' ') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-xs font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">CSV Bulk Inventory Upload</h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload a spreadsheet with columns: <code>Item Name, Category, Quantity, Storage, Expiry Date</code>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    await uploadInventoryCsv(file);
                    setShowCsvModal(false);
                    setNotification('CSV parsed and imported successfully.');
                    loadData();
                  } catch (err) {
                    alert('Upload failed: ' + err.message);
                  }
                }
              }}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-md text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Simulation Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Barcode / QR Scanner</h2>
            <p className="text-xs text-slate-500 mb-4">
              Rapid inventory scanning simulation. Select a sample barcode or enter a code.
            </p>

            <div className="bg-slate-900 rounded-lg p-6 flex flex-col items-center justify-center text-white mb-4 relative overflow-hidden">
              <QrCode className="w-20 h-20 text-emerald-400 mb-2" />
              <div className="w-full h-0.5 bg-emerald-500 absolute top-1/2 left-0 animate-bounce opacity-70"></div>
              <span className="text-xs text-slate-400">Camera / Laser Reader Active</span>
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-xs font-semibold text-slate-700">Quick Test Barcodes:</span>
              <div className="flex flex-wrap gap-1.5">
                {items.slice(0, 4).map(it => (
                  <button
                    key={it.id}
                    onClick={() => setScanResult(`Found: ${it.name} (${it.quantity} ${it.unit}) - Expiry: ${it.expiry_date}`)}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-800 font-mono"
                  >
                    {it.barcode || it.sku}
                  </button>
                ))}
              </div>
            </div>

            {scanResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium mb-4">
                {scanResult}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => { setShowScannerModal(false); setScanResult(''); }}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
