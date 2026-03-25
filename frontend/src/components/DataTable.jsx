import React, { useState, useEffect } from 'react';
import { Edit, Plus, Search, Trash2, UserCheck, Wrench, Calendar, Box, AlertTriangle } from 'lucide-react';
import api from '../api';
import EquipoModal from './EquipoModal';

// ── Mini-modal para dar de baja ───────────────────────────────────────────────
const BajaModal = ({ equipo, onConfirm, onCancel }) => {
  const [novedad, setNovedad] = useState('');
  const [fechaBaja, setFechaBaja] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ novedad, fecha_baja: fechaBaja });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <div className="bg-[#1e1e2d] border border-red-500/30 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-gray-800/50 bg-red-500/5">
          <div className="p-2 bg-red-500/20 rounded-xl"><AlertTriangle size={20} className="text-red-400"/></div>
          <div>
            <h3 className="text-lg font-black text-white uppercase italic">Dar de Baja</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{equipo?.nombre_equipo} — {equipo?.serie}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Fecha de Baja *</label>
            <input
              type="date"
              required
              value={fechaBaja}
              onChange={(e) => setFechaBaja(e.target.value)}
              className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white focus:border-red-500/50 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Motivo / Novedad de Baja *</label>
            <textarea
              required
              rows={3}
              placeholder="Ej: Equipo obsoleto, daño irreparable, robo, etc."
              value={novedad}
              onChange={(e) => setNovedad(e.target.value)}
              className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white resize-none focus:border-red-500/50 outline-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 bg-gray-800 text-gray-400 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-700 transition-all">
              Cancelar
            </button>
            <button type="submit"
              className="flex-[2] bg-red-600 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg">
              Confirmar Baja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const DataTable = ({ currentView, searchTerm, categoryId, subcategoryId, hidden, isManualModalOpen, setIsManualModalOpen, preselectedCategory, onRefresh }) => { 
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bajaTarget, setBajaTarget] = useState(null); // equipo pendiente de baja

  const isOpen = isModalOpen || isEditModalOpen || isManualModalOpen;
  const setOpen = (val) => {
    if (!val) {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      if (setIsManualModalOpen) setIsManualModalOpen(false);
      setSelectedEquipo(null);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    if (onRefresh) onRefresh();
  };

  const viewConfig = {
    disponibles: { title: "EQUIPOS DISPONIBLES EN BODEGA", filter: 'DISPONIBLE' },
    bajas: { title: "EQUIPOS DE BAJA / SALIDA (RETIRO)", filter: 'BAJA' },
    asignaciones: { title: "EQUIPOS ASIGNADOS A USUARIOS", filter: 'ASIGNADO' },
    reparacion: { title: "EQUIPOS EN MANTENIMIENTO TÉCNICO", filter: 'REPARACION' },
    nuevos: { title: "BANDEJA DE NUEVOS EQUIPOS", filter: 'NUEVO' },
    global: { title: "INVENTARIO TOTAL Y GLOBAL", filter: 'ALL' },
    category_filter: { title: "VISTA FILTRADA POR CATEGORÍA", filter: 'ALL' }
  };

  const fetchData = async () => {
    if (hidden) return;
    setLoading(true);
    try {
      let url = 'equipos/';
      const params = new URLSearchParams();
      
      if (currentView === 'category_filter') {
        if (subcategoryId) params.append('subcategoria', subcategoryId);
        else if (categoryId) params.append('categoria', categoryId);
      }
      
      const response = await api.get(`${url}?${params.toString()}`);
      let allEquipos = Array.isArray(response.data) ? response.data : [];

      const sorted = allEquipos.sort((a, b) => {
        const isAMonitor = a.nombre_equipo.toLowerCase().includes('monitor');
        const isBMonitor = b.nombre_equipo.toLowerCase().includes('monitor');
        if (isAMonitor && isBMonitor) return a.nombre_equipo.localeCompare(b.nombre_equipo);
        if (isAMonitor) return -1;
        if (isBMonitor) return 1;
        return a.nombre_equipo.localeCompare(b.nombre_equipo);
      });

      let filtered = [];
      if (currentView === 'global' || currentView === 'category_filter') {
        filtered = sorted;
      } else {
        const currentFilter = viewConfig[currentView]?.filter;
        filtered = sorted.filter(e => e.estado === currentFilter);
      }
      
      setData(filtered);
    } catch (error) { 
      console.error("Error al cargar datos:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentView, categoryId, subcategoryId, hidden]);

  // Mover a otro estado (sin BAJA — para eso está handleBajaConfirm)
  const handleMove = async (equipo, nuevoEstado) => {
    if (nuevoEstado === 'BAJA') {
      setBajaTarget(equipo); // abre modal de baja
      return;
    }
    try {
      await api.patch(`equipos/${equipo.id}/`, { estado: nuevoEstado });
      await handleRefresh();
    } catch (err) {
      alert("Error al actualizar estado.");
    }
  };

  const handleBajaConfirm = async ({ novedad, fecha_baja }) => {
    try {
      await api.patch(`equipos/${bajaTarget.id}/`, {
        estado: 'BAJA',
        novedad,
        fecha_baja,
      });
      setBajaTarget(null);
      await handleRefresh();
    } catch (err) {
      alert("Error al dar de baja el equipo.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredData = data.filter(item => {
    const term = searchTerm?.toLowerCase() || "";
    return (
      item.serie.toLowerCase().includes(term) || 
      item.nombre_equipo.toLowerCase().includes(term) ||
      (item.usuario_asignado && item.usuario_asignado.toLowerCase().includes(term))
    );
  });

  if (hidden) {
    return (
      <EquipoModal 
        isOpen={isOpen} 
        onClose={() => setOpen(false)} 
        onRefresh={handleRefresh}
        equipoInicial={selectedEquipo}
        preselectedCategory={preselectedCategory}
      />
    );
  }

  return (
    <div className="p-8 space-y-6 text-white animate-in fade-in duration-500">
      {/* Modal de Baja */}
      {bajaTarget && (
        <BajaModal
          equipo={bajaTarget}
          onConfirm={handleBajaConfirm}
          onCancel={() => setBajaTarget(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {viewConfig[currentView]?.title || "INVENTARIO"}
          </h2>
          <div className="h-1 w-20 bg-indigo-600 rounded-full mt-1"></div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => { setSelectedEquipo(null); setIsModalOpen(true); }} 
            className="bg-indigo-600 px-5 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-all">
            <Plus size={16} /> NUEVO EQUIPO
          </button>
        </div>
      </div>

      <div className="bg-[#1e1e2d] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
              <th className="px-6 py-5 text-center w-12">N°</th>
              <th className="px-6 py-5">Equipo / Serie</th>
              <th className="px-6 py-5">Fecha Reg.</th>
              <th className="px-6 py-5">Estado Actual</th>
              <th className="px-6 py-5">Responsable</th>
              <th className="px-6 py-5 text-center">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cargando inventario...</p>
                  </div>
                </td>
              </tr>
            ) : filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 text-center text-gray-600 font-mono text-xs">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-black text-xs uppercase text-white flex items-center gap-2">
                    {item.nombre_equipo.toLowerCase().includes('monitor') && <span className="text-indigo-400">🖥️</span>}
                    {item.nombre_equipo}
                  </div>
                  <div className="text-indigo-400 font-mono text-[10px] font-bold">{item.serie}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <Calendar size={12} className="text-indigo-500/50" />
                    {formatDate(item.fecha_ingreso)}
                  </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter ${
                      item.estado === 'DISPONIBLE' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.estado === 'ASIGNADO' ? 'bg-sky-500/10 text-sky-500' :
                      item.estado === 'BAJA' ? 'bg-red-500/10 text-red-500' : 
                      item.estado === 'REPARACION' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {item.estado}
                    </span>
                </td>
                <td className="px-6 py-4 text-[10px] font-bold uppercase text-gray-300">
                  {item.estado === 'DISPONIBLE' ? 'BODEGA CENTRAL' : (item.usuario_asignado || 'NO ASIGNADO')}
                </td>
                <td className="px-6 py-4 flex justify-center gap-1">
                    <button onClick={() => { setSelectedEquipo({...item, estado: 'ASIGNADO'}); setIsEditModalOpen(true); }} className="p-2 text-sky-400 hover:bg-sky-400/10 rounded-lg transition-all" title="Asignar Equipo (Completar Datos)"><UserCheck size={16}/></button>
                    <button onClick={() => handleMove(item, 'DISPONIBLE')} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all" title="Regresar a Bodega"><Box size={16}/></button>
                    <button onClick={() => handleMove(item, 'REPARACION')} className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all" title="Mantenimiento"><Wrench size={16}/></button>
                    <button onClick={() => handleMove(item, 'BAJA')} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Dar de Baja (Retiro)"><Trash2 size={16}/></button>
                    <div className="w-[1px] bg-gray-800 mx-1"></div>
                    <button onClick={() => { setSelectedEquipo(item); setIsEditModalOpen(true); }} className="p-2 text-gray-400 hover:text-white transition-all" title="Editar Registro"><Edit size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredData.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic">
              No se encontraron resultados para la búsqueda
            </p>
          </div>
        )}
      </div>

      <EquipoModal 
        isOpen={isOpen} 
        onClose={() => setOpen(false)} 
        onRefresh={handleRefresh}
        equipoInicial={selectedEquipo}
        preselectedCategoryId={categoryId}
        preselectedSubcatId={subcategoryId}
      />
    </div>
  );
};

export default DataTable;
