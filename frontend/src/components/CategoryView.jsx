import React, { useState } from 'react';
import { ArrowLeft, Box, ChevronRight } from 'lucide-react';
import DataTable from './DataTable';

const CategoryView = ({ category, onBack, initialSubcat }) => {
  const [selectedSubcat, setSelectedSubcat] = useState(initialSubcat || null);

  // Update selection if initialSubcat changes (e.g. clicking different subcat in sidebar)
  React.useEffect(() => {
    if (initialSubcat) setSelectedSubcat(initialSubcat);
  }, [initialSubcat]);

  if (!category) return null;

  return (
    <div className="p-8 space-y-10 bg-[#151521] min-h-screen text-white animate-in fade-in duration-700">
      {/* Header Premium */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="group p-4 bg-gray-800/30 hover:bg-indigo-600 rounded-[1.5rem] transition-all duration-500 shadow-xl border border-gray-800/50 hover:border-indigo-500/50"
          >
            <ArrowLeft size={24} className="text-gray-500 group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
              <span>Inventario Global</span>
              <ChevronRight size={10} className="text-gray-700" />
              <span className="px-2 py-0.5 rounded bg-gray-800/50 border border-gray-800" style={{ color: category.color }}>{category.nombre}</span>
              {selectedSubcat && (
                <>
                  <ChevronRight size={10} className="text-gray-700" />
                  <span className="text-indigo-400">Detalles de Subcategoría</span>
                </>
              )}
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              {selectedSubcat ? selectedSubcat.nombre : category.nombre}
            </h2>
          </div>
        </div>
        
        {/* Estadísticas Rápidas */}
        <div className="hidden md:flex gap-4">
          <div className="bg-[#1e1e2d] px-6 py-4 rounded-[2rem] border border-gray-800/50 shadow-xl">
             <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Activos</p>
             <p className="text-2xl font-black italic">{category.total_equipos}</p>
          </div>
        </div>
      </div>

      {/* Tabs Estilo Premium */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        <button
          onClick={() => setSelectedSubcat(null)}
          className={`px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap border ${
            !selectedSubcat 
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/30 -translate-y-1' 
            : 'bg-gray-800/20 border-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
          }`}
        >
          Vista General
        </button>
        {category.subcategorias?.map(sub => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubcat(sub)}
            className={`px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap border ${
              selectedSubcat?.id === sub.id 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/30 -translate-y-1' 
              : 'bg-gray-800/20 border-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
            }`}
          >
            {sub.nombre}
          </button>
        ))}
      </div>

      {/* Contenedor de Tabla con Glow */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[3.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
        <div className="relative bg-[#1e1e2d] rounded-[3.5rem] border border-gray-800 shadow-2xl overflow-hidden min-h-[500px]">
          <DataTable 
            currentView="category_filter" 
            categoryId={category.id}
            subcategoryId={selectedSubcat?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
