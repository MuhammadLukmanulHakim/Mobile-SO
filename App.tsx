
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, Location, InventoryItem, OpnameResult, ExportedReport } from './types';
import LocationSection from './components/LocationSection';
import ItemSection from './components/ItemSection';
import OpnameSection from './components/OpnameSection';
import { Layout } from './components/Layout';

const STORAGE_KEYS = {
  LOCATIONS: 'ayy_loc',
  ITEMS: 'ayy_item',
  RESULTS: 'ayy_results',
  REPORTS: 'ayy_reports'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LOKASI);
  const [editingOpname, setEditingOpname] = useState<OpnameResult | null>(null);
  
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Gudang 1' },
      { id: 2, name: 'Gudang 2' },
      { id: 3, name: 'Kitchen' }
    ];
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return saved ? JSON.parse(saved) : [];
  });

  const [opnameResults, setOpnameResults] = useState<OpnameResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [exportedReports, setExportedReports] = useState<ExportedReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(opnameResults));
  }, [opnameResults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(exportedReports));
  }, [exportedReports]);

  const handleSaveLocation = useCallback((loc: Location) => {
    setLocations(prev => {
      const exists = prev.find(l => l.id === loc.id);
      if (exists) return prev.map(l => l.id === loc.id ? loc : l);
      return [...prev, loc];
    });
  }, []);

  const handleDeleteLocation = useCallback((id: number) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleSaveItem = useCallback((item: InventoryItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? item : i);
      return [...prev, item];
    });
  }, []);

  const handleDeleteItem = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleImportItems = useCallback((newItems: InventoryItem[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const handleSaveOpname = useCallback((result: OpnameResult) => {
    setOpnameResults(prev => {
      const exists = prev.find(r => r.id === result.id);
      if (exists) return prev.map(r => r.id === result.id ? result : r);
      return [...prev, result];
    });
    setEditingOpname(null);
  }, []);

  const handleDeleteOpname = useCallback((id: number) => {
    setOpnameResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleAddReport = useCallback((report: ExportedReport) => {
    setExportedReports(prev => [report, ...prev]);
  }, []);

  const handleDeleteReport = useCallback((id: number) => {
    setExportedReports(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab !== AppTab.OPNAME) setEditingOpname(null);
    }}>
      {activeTab === AppTab.LOKASI && (
        <LocationSection 
          locations={locations} 
          reports={exportedReports}
          items={items}
          onSave={handleSaveLocation} 
          onDelete={handleDeleteLocation} 
          onDeleteReport={handleDeleteReport}
        />
      )}
      {activeTab === AppTab.BARANG && (
        <ItemSection 
          items={items} 
          locations={locations}
          onSave={handleSaveItem} 
          onDelete={handleDeleteItem}
          onImport={handleImportItems}
        />
      )}
      {activeTab === AppTab.OPNAME && (
        <OpnameSection 
          opnameResults={opnameResults} 
          items={items}
          locations={locations}
          onSave={handleSaveOpname} 
          onDelete={handleDeleteOpname}
          onReportExported={handleAddReport}
          editingOpname={editingOpname}
        />
      )}
    </Layout>
  );
};

export default App;
