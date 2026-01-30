
import React, { useState, useRef } from 'react';
import { InventoryItem, Location } from '../types';

interface Props {
  items: InventoryItem[];
  locations: Location[];
  onSave: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onImport: (items: InventoryItem[]) => void;
}

const ItemSection: React.FC<Props> = ({ items, locations, onSave, onDelete, onImport }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    ref: '',
    defaultLoc: locations[0]?.name || '',
    uBig: '',
    uSmall: '',
    initialQtyBig: 0,
    initialQtySmall: 0
  });
  const [editId, setEditId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave({
      id: editId || Date.now(),
      name: formData.name!,
      ref: formData.ref || '',
      defaultLoc: formData.defaultLoc || (locations[0]?.name || ''),
      uBig: formData.uBig || '',
      uSmall: formData.uSmall || '',
      initialQtyBig: Number(formData.initialQtyBig) || 0,
      initialQtySmall: Number(formData.initialQtySmall) || 0
    } as InventoryItem);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      ref: '', 
      defaultLoc: locations[0]?.name || '', 
      uBig: '', 
      uSmall: '',
      initialQtyBig: 0,
      initialQtySmall: 0
    });
    setEditId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData(item);
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      // @ts-ignore
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      // @ts-ignore
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      const importedItems: InventoryItem[] = [];
      // Data dimulai dari baris ke-5 (index 4)
      for (let i = 4; i < json.length; i++) {
        const row = json[i] as any[];
        if (row && row[1]) {
          importedItems.push({
            id: Date.now() + i,
            ref: row[0] || "",
            name: row[1],
            defaultLoc: locations[0]?.name || (locations[0]?.name || "Gudang 1"),
            uBig: row[2] || "",
            initialQtyBig: Number(row[3]) || 0, // Kolom D (Index 3)
            uSmall: row[4] || "",
            initialQtySmall: Number(row[5]) || 0 // Kolom F (Index 5)
          });
        }
      }
      onImport(importedItems);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-sky-50 p-4 border-2 border-dashed border-sky-300 rounded-2xl text-center">
        <label className="block text-[11px] font-black text-sky-600 uppercase mb-2">📂 Import via Excel</label>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls, .csv"
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
        />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Informasi Barang</h3>
        
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nama Barang</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Contoh: Beras Pandan Wangi"
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Ref / SKU</label>
            <input 
              type="text" 
              value={formData.ref}
              onChange={(e) => setFormData({...formData, ref: e.target.value})}
              placeholder="Kode Barang"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Lokasi Default</label>
            <select 
              value={formData.defaultLoc}
              onChange={(e) => setFormData({...formData, defaultLoc: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
            >
              {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Satuan Besar</label>
            <input 
              type="text" 
              value={formData.uBig}
              onChange={(e) => setFormData({...formData, uBig: e.target.value})}
              placeholder="Dus/Karung"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Satuan Kecil</label>
            <input 
              type="text" 
              value={formData.uSmall}
              onChange={(e) => setFormData({...formData, uSmall: e.target.value})}
              placeholder="Pcs/Kg"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            />
          </div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
          <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Saldo / Stok Awal</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-emerald-600 uppercase mb-1">Stok Awal ({formData.uBig || 'Besar'})</label>
              <input 
                type="number" 
                value={formData.initialQtyBig}
                onChange={(e) => setFormData({...formData, initialQtyBig: Number(e.target.value)})}
                placeholder="0"
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-black text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-emerald-600 uppercase mb-1">Stok Awal ({formData.uSmall || 'Kecil'})</label>
              <input 
                type="number" 
                value={formData.initialQtySmall}
                onChange={(e) => setFormData({...formData, initialQtySmall: Number(e.target.value)})}
                placeholder="0"
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-black text-emerald-700"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
        >
          {editId ? 'UPDATE DATA BARANG' : 'SIMPAN KE MASTER BARANG'}
        </button>
        
        {editId && (
          <button 
            type="button"
            onClick={resetForm}
            className="w-full py-2 text-slate-400 font-bold text-xs uppercase"
          >
            Batal Edit
          </button>
        )}
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-400 text-sm font-bold">Belum ada barang di master.</p>
          </div>
        ) : (
          items.slice().reverse().map(item => (
            <div key={item.id} className="flex flex-col bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <p className="font-black text-slate-800 leading-tight uppercase text-sm">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                    REF: {item.ref || '-'} • LOC: {item.defaultLoc}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-amber-50 text-amber-600 rounded-xl active:scale-90"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl active:scale-90"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Awal:</span>
                  <span className="text-[10px] font-black text-emerald-600">
                    {item.initialQtyBig} {item.uBig} / {item.initialQtySmall} {item.uSmall}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemSection;
