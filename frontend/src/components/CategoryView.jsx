import React, { useState } from 'react';
import { ArrowLeft, Box, ChevronRight } from 'lucide-react';
import DataTable from './DataTable';

const CategoryView = ({ category, onBack }) => {
  const [selectedSubcat, setSelectedSubcat] = useState(null);

  if (!category) return null;

  // El DataTable ya maneja el filtrado si le pasamos los props correctos
  // Necesitamos que DataTable acepte cat_id o subcat_id

  return (
    <div className="p-8 space-y-8 bg-[#151521] min-h-screen text-white animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-2xl transition-all text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>Panel TIC</span>
            <ChevronRight size={10} />
            <span style={{ color: category.color }}>{category.nombre}</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            {selectedSubcat ? selectedSubcat.nombre : category.nombre}
          </h2>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedSubcat(null)}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
            !selectedSubcat 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
            : 'bg-gray-800/30 border-gray-800 text-gray-500 hover:text-gray-300'
          }`}
        >
          Ver Todo ({category.total_equipos})
        </button>
        {category.subcategorias.map(sub => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubcat(sub)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              selectedSubcat?.id === sub.id 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
              : 'bg-gray-800/30 border-gray-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            {sub.nombre}
          </button>
        ))}
      </div>

      <div className="bg-[#1e1e2d] rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
        <DataTable 
          currentView="category_filter" 
          categoryId={category.id}
          subcategoryId={selectedSubcat?.id}
        />
      </div>
    </div>
  );
};

export default CategoryView;
