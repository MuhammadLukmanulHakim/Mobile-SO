import React, { useState } from 'react';
import { InventoryItem, StockOpname } from '../types';

interface Props {
  items: InventoryItem[];
  onSave: (opname: StockOpname) => void;
}

const OpnameSection: React.FC<Props> = ({ items, onSave }) => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [qtyBig, setQtyBig] = useState<number>(0);
  const [qtySmall, setQtySmall] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    onSave({
      id: Date.now(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      qtyBig,
      qtySmall,
      note,
      date: new Date().toISOString()
    });

    setSelectedItemId(null);
    setQtyBig(0);
    setQtySmall(0);
    setNote('');
  };

  return (
    <div className="space-y-4 pb-10">
      {/* FORM OPNAME */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-5 rounded-3xl shadow-sm border space-y-4"
      >
        <h3 className="text-sm font-black uppercase border-b pb-2">
          Stock Opname
        </h3>

        {/* PILIH BARANG */}
        <select
          value={selectedItemId ?? ''}
          onChange={e => setSelectedItemId(Number(e.target.value))}
          className="w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Pilih Barang
          </option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* JUMLAH BESAR */}
        <input
          type="number"
          value={qtyBig}
          onChange={e => setQtyBig(Number(e.target.value))}
          placeholder={`Jumlah ${selectedItem?.uBig || 'Satuan Besar'}`}
          className="w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* JUMLAH KECIL */}
        <input
          type="number"
          value={qtySmall}
          onChange={e => setQtySmall(Number(e.target.value))}
          placeholder={`Jumlah ${selectedItem?.uSmall || 'Satuan Kecil'}`}
          className="w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* CATATAN */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Catatan (selisih, rusak, expired, dll)"
          className="w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition"
        >
          💾 Simpan Opname
        </button>
      </form>
    </div>
  );
};

export default OpnameSection;
