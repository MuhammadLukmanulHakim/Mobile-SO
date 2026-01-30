import React, { useState } from 'react';
import { Location } from '../types';

interface Props {
  locations: Location[];
  onSave: (location: Location) => void;
  onDelete: (id: number) => void;
}

const LocationSection: React.FC<Props> = ({ locations, onSave, onDelete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: Date.now(),
      name: name.trim()
    });

    setName('');
  };

  return (
    <div className="space-y-4 pb-10">
      {/* FORM LOKASI */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-5 rounded-3xl shadow-sm border space-y-4"
      >
        <h3 className="text-sm font-black uppercase border-b pb-2">
          Tambah Lokasi
        </h3>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama lokasi (Gudang, Freezer, Rak A, dll)"
          className="w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition"
        >
          ➕ Simpan Lokasi
        </button>
      </form>

      {/* LIST LOKASI */}
      <div className="space-y-3">
        {locations.slice().reverse().map(loc => (
          <div 
            key={loc.id} 
            className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between"
          >
            <span className="font-semibold text-slate-700 text-sm">
              📍 {loc.name}
            </span>

            <button
              onClick={() => onDelete(loc.id)}
              className="text-xs font-bold text-red-500 hover:text-red-700"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSection;
