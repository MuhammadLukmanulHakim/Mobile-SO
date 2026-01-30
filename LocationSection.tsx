
import React, { useState } from 'react';
import { Location, ExportedReport, InventoryItem } from '../types';

interface Props {
  locations: Location[];
  reports: ExportedReport[];
  items: InventoryItem[];
  onSave: (loc: Location) => void;
  onDelete: (id: number) => void;
  onDeleteReport: (id: number) => void;
}

const LocationSection: React.FC<Props> = ({ 
  locations, 
  reports, 
  items,
  onSave, 
  onDelete, 
  onDeleteReport
}) => {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: editId || Date.now(), name: name.trim() });
    setName('');
    setEditId(null);
  };

  const handleEditLocation = (loc: Location) => {
    setName(loc.name);
    setEditId(loc.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadAgain = (report: ExportedReport) => {
    // @ts-ignore
    const XLSX_LIB = window.XLSX;
    if (!XLSX_LIB) return;

    const header = [
      ["Depok Margonda Offline"],
      ["Date Created:", report.timestamp],
      ["", "Nama Barang", "Supervisor:"],
      ["", "", "UOM", "", "", "Lokasi Storage"],
      ["Internal Reference", "Nama Barang", "Besar", "Awal", "Kecil", "Awal", "Gudang 1", "Gudang 2", "Kitchen", "Sisa Pemakaian", "Total"]
    ];

    const rows = items.map(b => {
      const h = report.dataSnapshot.filter(x => x.itemName === b.name);
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
    XLSX_LIB.utils.book_append_sheet(wb, ws, "SO_Reprint");
    XLSX_LIB.writeFile(wb, report.filename);
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="space-y-4">
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Kelola Master Lokasi</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gudang Timur"
              className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            <button 
              type="submit"
              className="px-6 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              {editId ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {locations.map(loc => (
            <div key={loc.id} className="group flex items-center justify-between bg-white p-4 rounded-2xl border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-all">
              <span className="font-bold text-slate-700">{loc.name}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditLocation(loc)}
                  className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-xl active:scale-90 transition-all"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDelete(loc.id)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl active:scale-90 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-slate-200">
        <div className="mb-5 px-1">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            📁 Arsip Laporan Excel
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Riwayat File yang Pernah Di-ekspor
          </p>
        </div>

        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
              <span className="text-4xl mb-3 opacity-20">📂</span>
              <p className="text-slate-400 font-bold text-sm">Belum ada laporan yang diekspor.</p>
              <p className="text-[10px] text-slate-300 mt-1 uppercase font-black">Ekspor di menu Opname untuk melihat riwayat</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  📊
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-xs truncate uppercase leading-tight">{report.filename}</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Cetak: {report.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadAgain(report)}
                    className="w-10 h-10 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl active:scale-90 transition-all"
                    title="Download Ulang"
                  >
                    📥
                  </button>
                  <button 
                    onClick={() => onDeleteReport(report.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl active:scale-90 transition-all"
                    title="Hapus Dari Riwayat"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LocationSection;
