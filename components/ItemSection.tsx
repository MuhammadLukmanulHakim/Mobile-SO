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
      for (let i = 4; i < json.length; i++) {
        const row = json[i] as any[];
        if (row && row[1]) {
          importedItems.push({
            id: Date.now() + i,
            ref: row[0] || "",
            name: row[1],
            defaultLoc: locations[0]?.name || "Gudang 1",
            uBig: row[2] || "",
            initialQtyBig: Number(row[3]) || 0,
            uSmall: row[4] || "",
            initialQtySmall: Number(row[5]) || 0
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
      {/* IMPORT EXCEL */}
      <div className="bg-sky-50 p-4 border-2 border-dashed border-sky-300 rounded-2xl text-center">
        <label className="block text-[11px] font-black text-sky-600 uppercase mb-2">
          📂 Import via Excel
        </label>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls, .csv"
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
        />
      </div>

      {/* FORM BARANG */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border space-y-4">
        <h3 className="text-sm font-black uppercase border-b pb-2">
          Informasi Barang
        </h3>

        {/* ...form input... */}
      </form>

      {/* LIST BARANG */}
      <div className="space-y-3">
        {items.slice().reverse().map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm">
            {/* card content */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemSection;
