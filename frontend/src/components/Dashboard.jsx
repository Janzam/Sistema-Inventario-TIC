import React, { useState, useEffect } from 'react';
import { LayoutGrid, ArrowRight, Package, Box, Plus } from 'lucide-react';
import api from '../api';

const Dashboard = ({ onSelectCategory, onAddToCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('categorias/with_stats/');
      setCategories(res.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Emojis para las categorías para un look "Limpio y Profesional"
  const catEmojis = {
    "Hardware y Componentes Internos": "💻",
    "Equipos de Comunicación y Telefonía": "📱",
    "Periféricos y Accesorios": "🖱️",
    "Cableado y Conectividad": "🔌",
    "Insumos de Limpieza y Mantenimiento": "🧼",
    "Lubricantes y Químicos Especializados": "🧪",
    "Herramientas y Misceláneos": "🛠️"
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#151521]">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 bg-[#151521] min-h-screen text-white animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
            <LayoutGrid size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Panel de Gestión TIC</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Explora el inventario por categorías especializadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="group relative h-64 rounded-[2.5rem] bg-[#1e1e2d] border border-gray-800/50 overflow-hidden shadow-2xl transition-all hover:scale-[1.02] hover:border-indigo-500/30"
            >
              <div 
                className="absolute top-0 right-0 p-8 text-6xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
              >
                {catEmojis[cat.nombre] || "📦"}
              </div>

              <div className="h-full p-8 flex flex-col justify-between relative z-10">
                <div>
                   <span 
                    className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    style={{ borderColor: cat.color, color: cat.color, backgroundColor: `${cat.color}10` }}
                  >
                    {cat.total_equipos} Ítems
                  </span>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter mt-4 leading-tight">
                    {cat.nombre}
                  </h2>
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => onSelectCategory(cat)}
                    className="flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2"
                   >
                     Ver Inventario <ArrowRight size={14} />
                   </button>
                   <button 
                    onClick={(e) => { e.stopPropagation(); onAddToCategory(cat); }}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                    title="Ingresar Equipo"
                   >
                     <Plus size={20} />
                   </button>
                </div>
              </div>

              <div 
                className="absolute inset-x-10 bottom-0 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
                style={{ backgroundColor: cat.color }}
              ></div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-indigo-600/20 to-transparent rounded-[2.5rem] border border-indigo-500/20 p-8 flex flex-col justify-between group cursor-default shadow-2xl">
             <div className="flex justify-between items-start">
                <div className="p-4 bg-indigo-500/10 rounded-[1.5rem] text-indigo-500 group-hover:scale-110 transition-transform">
                  <Package size={32} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen Global</p>
                   <p className="text-indigo-400 font-black text-xs uppercase italic">Sistema Activo</p>
                </div>
             </div>
             
             <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Centro de Inventario</h3>
                <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase leading-relaxed">
                  Gestión profesional de activos tecnológicos.
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#151521] p-3 rounded-2xl border border-gray-800 text-center">
                   <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Total Ítems</p>
                   <p className="text-xl font-black italic text-white">{categories.reduce((acc, cat) => acc + cat.total_equipos, 0)}</p>
                </div>
                <div className="bg-[#151521] p-3 rounded-2xl border border-gray-800 text-center">
                   <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Categorías</p>
                   <p className="text-xl font-black italic text-indigo-500">{categories.length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;