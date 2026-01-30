
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: AppTab.LOKASI, label: '🏠 LOKASI' },
    { id: AppTab.BARANG, label: '📦 BARANG' },
    { id: AppTab.OPNAME, label: '📝 OPNAME' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20 px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          🏛️ Proper Inventory Master
        </h1>
      </header>

      <div className="flex bg-slate-200 p-1 rounded-xl mb-6 shadow-inner no-scrollbar overflow-x-auto gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>

      <footer className="fixed bottom-4 right-4 text-[10px] text-slate-400 font-bold pointer-events-none">
        Created By luckmeanz.im
      </footer>
    </div>
  );
};
