import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { 
  LayoutDashboard, Database, FileText, AlertTriangle, 
  Laptop, Settings2, Trash2, ChevronDown, ChevronRight, FileSpreadsheet, UserCheck, Wrench, Box
} from 'lucide-react';
import api from '../api';

const Sidebar = ({ setView, currentView, equiposReales = [] }) => {
  const { stockLimit, setStockLimit } = useStock();
  const [categories, setCategories] = useState([]);
  const [showCatReports, setShowCatReports] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('categorias/');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const bajoStock = Object.entries(
    equiposReales
      .filter(eq => eq.estado === 'DISPONIBLE')
      .reduce((acc, eq) => ({ ...acc, [eq.nombre_equipo]: (acc[eq.nombre_equipo] || 0) + 1 }), {})
  )
    .map(([name, count]) => ({ name, count }))
    .filter(item => item.count < stockLimit);

  const handleDownload = (type, id = null) => {
    let urlParams = new URLSearchParams();
    let fallbackFilename = 'Reporte_Inventario.xlsx';

    if (type === 'ALL') {
      urlParams.set('estado', 'ALL');
      fallbackFilename = 'Reporte_Global_Inventario_TIC.xlsx';
    } else if (type === 'CATEGORY') {
      urlParams.set('categoria', id);
      fallbackFilename = `Reporte_Categoria_${id}_Inventario_TIC.xlsx`;
    } else if (type === 'BAJA') {
      urlParams.set('estado', 'BAJA');
      fallbackFilename = 'Reporte_Equipos_Baja_TIC.xlsx';
    } else if (type === 'ASIGNADO') {
      urlParams.set('estado', 'ASIGNADO');
      fallbackFilename = 'Reporte_Equipos_Asignados_TIC.xlsx';
    } else if (type === 'REPARACION') {
      urlParams.set('estado', 'REPARACION');
      fallbackFilename = 'Reporte_Equipos_Mantenimiento_TIC.xlsx';
    } else if (type === 'DISPONIBLE') {
      urlParams.set('estado', 'DISPONIBLE');
      fallbackFilename = 'Reporte_Equipos_Disponibles_TIC.xlsx';
    }

    const token = localStorage.getItem('token');
    urlParams.set('auth_token', token);
    urlParams.set('_t', Date.now());

    const baseUrl = api.defaults.baseURL || 'http://127.0.0.1:8000/api/';
    const fullUrl = `${baseUrl}equipos/export_excel/?${urlParams.toString()}`;

    // window.open funciona en todos los navegadores (Chrome, Brave, Edge, Firefox)
    // El backend acepta el token por query param para este endpoint
    window.open(fullUrl, '_blank');
  };

  return (
    <aside className="w-72 bg-[#1e1e2d] h-screen flex flex-col border-r border-gray-800 shrink-0">
      {/* Branding */}
      <div className="p-10 text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg"><Laptop size={24} /></div>
        TIC INVENTARIO
      </div>
      
      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
        <button 
          onClick={() => setView('dashboard')} 
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${
            currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <LayoutDashboard size={20}/> DASHBOARD
        </button>

        <button 
          onClick={() => setView('bajas')} 
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${
            currentView === 'bajas' ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <Trash2 size={20}/> EQUIPOS DE BAJA
        </button>

        <button 
          onClick={() => setView('asignaciones')} 
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${
            currentView === 'asignaciones' ? 'bg-sky-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <UserCheck size={20}/> EQUIPOS ASIGNADOS
        </button>

        <button 
          onClick={() => setView('reparacion')} 
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${
            currentView === 'reparacion' ? 'bg-amber-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <Wrench size={20}/> MANTENIMIENTO
        </button>

        <button 
          onClick={() => setView('disponibles')} 
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${
            currentView === 'disponibles' ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <Box size={20}/> EQUIPOS DISPONIBLES
        </button>

        <div className="pt-6 pb-2 px-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">
           Reportes de Inventario
        </div>
        
        <button 
          onClick={() => handleDownload('ALL')}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all uppercase mb-2"
        >
          <FileText size={18}/> Reporte Global (Inventario)
        </button>

        <button 
          onClick={() => handleDownload('BAJA')}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black text-red-500 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all uppercase mb-2"
        >
          <Trash2 size={18}/> Reporte Equipos de Baja
        </button>

        <button 
          onClick={() => handleDownload('ASIGNADO')}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black text-sky-500 bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-all uppercase mb-2"
        >
          <Database size={18}/> Reporte Equipos Asignados
        </button>

        <button 
          onClick={() => handleDownload('REPARACION')}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black text-amber-500 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all uppercase mb-2"
        >
          <Wrench size={18}/> Reporte Mantenimiento
        </button>

        <button 
          onClick={() => handleDownload('DISPONIBLE')}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all uppercase mb-2"
        >
          <Box size={18}/> Reporte Equipos Disponibles
        </button>

        <button 
          onClick={() => setShowCatReports(!showCatReports)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-[10px] font-black text-gray-500 hover:bg-gray-800/50 transition-all uppercase"
        >
          <div className="flex items-center gap-4">
            <FileSpreadsheet size={18}/> Excel por Categoría
          </div>
          {showCatReports ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        </button>

        {showCatReports && (
          <div className="ml-10 mt-1 space-y-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleDownload('CATEGORY', cat.id)}
                className="w-full text-left px-4 py-2 text-[8px] font-bold text-gray-600 hover:text-indigo-400 uppercase truncate"
              >
                • {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer: Límite y Alertas */}
      <div className="p-6 bg-[#151521]/50 border-t border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-2">
            <Settings2 size={12}/> Límite de Alerta
          </label>
          <input 
            type="number" 
            value={stockLimit} 
            onChange={(e) => setStockLimit(parseInt(e.target.value) || 0)}
            className="w-12 bg-[#1e1e2d] border border-gray-700 rounded-lg text-xs text-center font-bold text-indigo-400 py-1"
          />
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${bajoStock.length > 0 ? 'border-red-500/20 bg-red-500/5 shadow-lg shadow-red-500/5' : 'border-gray-800/40 bg-gray-800/5'}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-3 text-gray-500">
             <AlertTriangle size={14} className={bajoStock.length > 0 ? 'text-red-500' : 'text-gray-600'}/> 
             <span>Monitor de Alertas</span>
          </div>
          <div className="space-y-2 max-h-24 overflow-y-auto pr-1 scrollbar-hide">
            {bajoStock.length > 0 ? bajoStock.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-[#151521] p-2 rounded-lg border border-gray-800 group hover:border-red-500/50 transition-colors">
                <span className="text-[9px] text-white font-bold truncate w-24 uppercase">{item.name}</span>
                <span className="text-[9px] text-red-500 font-black px-2 py-0.5 bg-red-500/10 rounded-md">{item.count}</span>
              </div>
            )) : <p className="text-[9px] text-gray-700 text-center font-bold italic py-2">Estado: Óptimo</p>}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;