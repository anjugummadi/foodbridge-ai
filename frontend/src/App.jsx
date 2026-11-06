import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import AiPredictionView from './components/AiPredictionView';
import MarketplaceView from './components/MarketplaceView';
import PickupsView from './components/PickupsView';
import ImpactView from './components/ImpactView';
import ListingModal from './components/ListingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSidebar, setActiveSidebar] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('admin');
  const [showListingModal, setShowListingModal] = useState(false);
  const [donateItemData, setDonateItemData] = useState(null);

  // Sync navbar tabs and sidebar
  const handleTopTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') setActiveSidebar('dashboard');
    else if (tab === 'listings') setActiveSidebar('new-listing');
    else if (tab === 'ngos') setActiveSidebar('ngo-network');
    else if (tab === 'pickups') setActiveSidebar('pickup-routes');
    else if (tab === 'impact') setActiveSidebar('impact-tracker');
    else if (tab === 'settings') setActiveSidebar('settings');
  };

  const handleSidebarChange = (item) => {
    setActiveSidebar(item);
    if (item === 'dashboard') setActiveTab('dashboard');
    else if (item === 'new-listing') setActiveTab('listings');
    else if (item === 'ngo-network') setActiveTab('ngos');
    else if (item === 'pickup-routes') setActiveTab('pickups');
    else if (item === 'impact-tracker') setActiveTab('impact');
    else if (item === 'settings') setActiveTab('settings');
  };

  const handleDonateItem = (item) => {
    setDonateItemData(item);
    setShowListingModal(true);
  };

  const renderMainContent = () => {
    switch (activeSidebar) {
      case 'dashboard':
        return <DashboardView onNavigateToListing={() => handleSidebarChange('new-listing')} />;
      case 'new-listing':
        return <MarketplaceView onOpenNewListingModal={() => { setDonateItemData(null); setShowListingModal(true); }} />;
      case 'inventory':
        return <InventoryView onDonateItem={handleDonateItem} />;
      case 'ai-waste':
        return <AiPredictionView onDonateItem={handleDonateItem} />;
      case 'ngo-network':
        return <MarketplaceView onOpenNewListingModal={() => { setDonateItemData(null); setShowListingModal(true); }} />;
      case 'pickup-routes':
        return <PickupsView />;
      case 'impact-tracker':
      case 'analytics':
      case 'reports':
        return <ImpactView />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl mx-auto shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Platform & Integration Settings</h2>
            <p className="text-xs text-slate-500 mb-6">Manage POS connectors, threshold triggers, and AI matching parameters.</p>
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">FastAPI Backend Endpoint</span>
                  <span className="text-slate-500 font-mono">http://localhost:8000/api</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold">Online</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">AI Demand Model Type</span>
                  <span className="text-slate-500">GradientBoostingRegressor (scikit-learn)</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold">Trained</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">Expiry Alert Thresholds</span>
                  <span className="text-slate-500">Critical: &lt;24h • Warning: &lt;48h • Watch: &lt;72h</span>
                </div>
                <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded font-semibold">Active</span>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView onNavigateToListing={() => handleSidebarChange('new-listing')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTopTabChange}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex">
        <Sidebar
          activeSidebar={activeSidebar}
          setActiveSidebar={handleSidebarChange}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>

      {/* New Listing Modal */}
      <ListingModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
        initialData={donateItemData}
        onSuccess={() => {
          handleSidebarChange('new-listing');
        }}
      />
    </div>
  );
}
