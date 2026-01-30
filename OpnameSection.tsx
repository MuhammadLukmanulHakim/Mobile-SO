
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Location, OpnameResult, ExportedReport } from '../types';

interface Props {
  opnameResults: OpnameResult[];
  items: InventoryItem[];
  locations: Location[];
  onSave: (res: OpnameResult) => void;
  onDelete: (id: number) => void;
  onReportExported: (report: ExportedReport) => void;
  editingOpname?: OpnameResult | null;
}

const OpnameSection: React.FC<Props> = ({ opnameResults, items, locations, onSave, onDelete, onReportExported, editingOpname }) => {
  const [selectedLoc, setSelectedLoc] = useState(locations[0]?.name || '');
  const [search, setSearch] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [qtyBig, setQtyBig] = useState<string>('');
  const [qtySmall, setQtySmall] = useState<string>('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (editingOpname) {
      setSelectedLoc(editingOpname.location);
      setSelectedItemName(editingOpname.itemName);
      setQtyBig(editingOpname.qtyBig.toString());
      setQtySmall(editingOpname.qtySmall.toString());
      setEditId(editingOpname.id);
      onDelete(editingOpname.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingOpname]);

  const selectedItem = useMemo(() => items.find(i => i.name === selectedItemName), [items, selectedItemName]);

  const filteredItems = useMemo(() => {
    const alreadyDone = opnameResults.filter(r => r.location === selectedLoc).map(r => r.itemName);
    const keyword = search.toLowerCase();
    return items.filter(item => 
      !alreadyDone.includes(item.name) && 
      item.name.toLowerCase().includes(keyword)
    );
  }, [items, opnameResults, selectedLoc, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemName) return alert("Pilih barang dulu!");
    
    onSave({
      id: editId || Date.now(),
      location: selectedLoc,
      itemName: selectedItemName,
      ref: selectedItem?.ref || '',
      qtyBig: parseFloat(qtyBig) || 0,
      qtySmall: parseFloat(qtySmall) || 0,
      uBig: selectedItem?.uBig || '',
      uSmall: selectedItem?.uSmall || ''
    });

    setSearch('');
    setSelectedItemName('');
    setQtyBig('');
    setQtySmall('');
    setEditId(null);
  };

  const handleEditInternal = (res: OpnameResult) => {
    setSelectedLoc(res.location);
    setSelectedItemName(res.itemName);
    setQtyBig(res.qtyBig.toString());
    setQtySmall(res.qtySmall.toString());
    setEditId(res.id);
    onDelete(res.id); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    // @ts-ignore
    const XLSX_LIB = window.XLSX;
    if (!XLSX_LIB) return;

    const timestamp = new Date().toLocaleString();
    const filename = `Laporan_Final_${Date.now()}.xlsx`;

    const header = [
      ["Depok Margonda Offline"],
      ["Date:", timestamp],
      ["", "Nama Barang", "Supervisor:"],
      ["", "", "UOM", "", "", "Lokasi Storage"],
      ["Internal Reference", "Nama Barang", "Besar", "Awal", "Kecil", "Awal", "Gudang 1", "Gudang 2", "Kitchen", "Sisa Pemakaian", "Total"]
    ];

    const rows = items.map(b => {
      const h = opnameResults.filter(x => x.itemName === b.name);
      const g1 = h.find(x => x.location === "Gudang 1");
      const g2 = h.find(x => x.location === "Gudang 2");
      const kit = h.find(x => x.location === "Kitchen");
      
      return [
        b.ref, 
        b.name, 
        b.uBig, 
        b.initialQtyBig || 0, // Kolom D (Index 3)
        b.uSmall, 
        b.initialQtySmall || 0, // Kolom F (Index 5)
        g1 ? `${g1.qtyBig}/${g1.qtySmall}` : "", 
        g2 ? `${g2.qtyBig}/${g2.qtySmall}` : "", 
        kit ? `${kit.qtyBig}/${kit.qtySmall}` : "", 
        "", 
        ""
      ];
    });

    const ws = XLSX_LIB.utils.aoa_to_sheet([...header, ...rows]);
    const wb = XLSX_LIB.utils.book_new();
    XLSX_LIB.utils.book_append_sheet(wb, ws, "SO");
    XLSX_LIB.writeFile(wb, filename);

    onReportExported({
      id: Date.now(),
      filename: filename,
      timestamp: timestamp,
      dataSnapshot: [...opnameResults]
    });
  };

  return (
    <div className="space-y-4 pb-10">
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Input Hasil Audit</h3>
        
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">📍 Lokasi Kerja</label>
          <select 
            value={selectedLoc}
            onChange={(e) => setSelectedLoc(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700"
          >
            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
          </select>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          <label className="block text-[11px] font-black text-amber-600 uppercase mb-1">🔍 Cari Nama Barang</label>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik kata kunci..."
            className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">📦 Pilih Barang</label>
          <select 
            value={selectedItemName}
            onChange={(e) => setSelectedItemName(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold text-slate-700"
          >
            <option value="">-- Pilih Barang --</option>
            {filteredItems.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </div>

        {selectedItem && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-2">📊 Stok Awal (Master Data)</p>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-emerald-600 uppercase">Satuan Besar</span>
                <span className="text-base font-black text-emerald-800">{selectedItem.initialQtyBig} <span className="text-[10px]">{selectedItem.uBig}</span></span>
              </div>
              <div className="h-8 w-[1px] bg-emerald-200"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-emerald-600 uppercase">Satuan Kecil</span>
                <span className="text-base font-black text-emerald-800">{selectedItem.initialQtySmall} <span className="text-[10px]">{selectedItem.uSmall}</span></span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">Qty Fisik ({selectedItem?.uBig || '-'})</label>
            <input 
              type="number" 
              inputMode="decimal"
              value={qtyBig}
              onChange={(e) => setQtyBig(e.target.value)}
              placeholder="0"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black text-emerald-700"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase mb-1">Qty Fisik ({selectedItem?.uSmall || '-'})</label>
            <input 
              type="number" 
              inputMode="decimal"
              value={qtySmall}
              onChange={(e) => setQtySmall(e.target.value)}
              placeholder="0"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black text-emerald-700"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all uppercase tracking-widest text-sm"
        >
          {editId ? 'Update Hasil Fisik' : 'Simpan Hasil Fisik'}
        </button>
      </form>

      <button 
        onClick={handleExport}
        className="w-full py-4 bg-sky-600 text-white font-black rounded-2xl shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
      >
        📥 EKSPOR LAPORAN EXCEL
      </button>

      <div className="space-y-3 pt-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Review Input Terakhir</h4>
        {opnameResults.slice().reverse().map(res => (
          <div key={res.id} className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex-1 pr-2">
              <p className="font-black text-slate-800 leading-tight uppercase text-xs">{res.itemName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Ref: {res.ref || '-'} | 📍 {res.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-black text-emerald-600 leading-none">{res.qtyBig} {res.uBig}</div>
                <div className="text-[11px] font-black text-emerald-600">{res.qtySmall} {res.uSmall}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleEditInternal(res)}
                  className="p-1.5 bg-amber-50 text-amber-600 rounded-lg active:scale-90"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDelete(res.id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg active:scale-90"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpnameSection;
