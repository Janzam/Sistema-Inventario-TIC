import React, { useState, useEffect } from 'react';
import { X, Save, Layers } from 'lucide-react';
import api from '../api';
import { useToast } from './Toast';

const EquipoModal = ({ isOpen, onClose, onRefresh, equipoInicial, preselectedCategory, preselectedCategoryId, preselectedSubcatId }) => {
  const { showToast } = useToast();
  const initialState = {
    // ... (campos existentes se mantienen igual)
    nombre_equipo: '', 
    marca: '', 
    modelo: '', 
    serie: '', 
    activo_fijo: '',
    usuario_asignado: '', 
    departamento: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_baja: '', 
    estado: 'DISPONIBLE', 
    novedad: 'Ingreso inicial al sistema',
    subcategoria: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [hasActivoFijo, setHasActivoFijo] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('categorias/');
        setCategories(res.data);
      } catch (err) {
        console.error("Error al cargar categorías", err);
      }
    };
    const fetchPersonas = async () => {
      try {
        const res = await api.get('personas/');
        setPersonas(res.data);
      } catch (err) {
        console.error("Error al cargar personas", err);
      }
    };
    if (isOpen) {
      fetchCats();
      fetchPersonas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCatId) {
      const fetchSubs = async () => {
         try {
           const res = await api.get(`subcategorias/?categoria=${selectedCatId}`);
           setSubcategories(res.data);
         } catch(err) { console.error(err); }
      }
      fetchSubs();
    } else {
      setSubcategories([]);
    }
  }, [selectedCatId]);

  useEffect(() => {
    if (equipoInicial) {
      setFormData({
        ...equipoInicial,
        fecha_ingreso: equipoInicial.fecha_ingreso || initialState.fecha_ingreso,
        fecha_baja: equipoInicial.fecha_baja || '',
        subcategoria: equipoInicial.subcategoria || ''
      });
      setHasActivoFijo(!!equipoInicial.activo_fijo && equipoInicial.activo_fijo !== 'SIN ACTIVO FIJO');
      if (equipoInicial.subcategoria_detalle) {
        setSelectedCatId(equipoInicial.subcategoria_detalle.category_id || equipoInicial.subcategoria_detalle.categoria);
      }
    } else {
      setFormData(initialState);
      setHasActivoFijo(true);
      
      // Lógica de preselección robusta
      const catId = preselectedCategoryId || preselectedCategory?.id;
      if (catId) {
        setSelectedCatId(catId);
        if (preselectedSubcatId) {
          setFormData(prev => ({ ...prev, subcategoria: preselectedSubcatId }));
        }
      } else {
        setSelectedCatId('');
      }
    }
  }, [equipoInicial, isOpen, preselectedCategory, preselectedCategoryId, preselectedSubcatId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      nombre_equipo: formData.nombre_equipo?.toUpperCase().trim(),
      serie: formData.serie?.toUpperCase().trim(),
      activo_fijo: hasActivoFijo ? (formData.activo_fijo?.toUpperCase().trim() || null) : null,
      subcategoria: formData.subcategoria || null,
      marca: formData.marca?.toUpperCase().trim() || null,
      modelo: formData.modelo?.toUpperCase().trim() || null,
      usuario_asignado: formData.usuario_asignado?.toUpperCase().trim() || null,
      departamento: formData.departamento?.toUpperCase().trim() || null,
      fecha_baja: formData.fecha_baja || null, 
      novedad: formData.novedad?.toUpperCase().trim() || 'SIN NOVEDAD'
    };

    try {
      if (equipoInicial) {
        await api.put(`equipos/${equipoInicial.id}/`, dataToSend);
        showToast("Equipo actualizado correctamente", "success");
        onRefresh();
        onClose();
      } else {
        await api.post('equipos/', dataToSend);
        showToast("Equipo registrado con éxito", "success");
        onRefresh();
        // No cerramos el modal, solo limpiamos para seguir ingresando
        setFormData(initialState);
        // Si queremos mantener la categoría y subcategoría para agilizar:
        if (dataToSend.subcategoria) {
            setFormData(prev => ({...prev, subcategoria: dataToSend.subcategoria}));
        }
      }
    } catch (error) {
      const data = error.response?.data;
      let msg = "Error al guardar el equipo.";
      if (data?.serie) msg = data.serie[0];
      else if (data?.activo_fijo) msg = data.activo_fijo[0];
      else if (data?.non_field_errors) msg = data.non_field_errors[0];
      
      showToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-8 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl"><Layers size={20}/></div>
             <h3 className="text-2xl font-black text-white uppercase italic">
               {equipoInicial ? 'Editar Registro' : 'Nuevo Ingreso'}
             </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clasificación - Ocultar si ya vienen preseleccionados de las "barritas" */}
            {!preselectedSubcatId && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Categoría Principal</label>
                  <select 
                    className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white appearance-none"
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                  >
                    <option value="">Seleccionar Categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Subcategoría *</label>
                  <select 
                    required={!preselectedSubcatId}
                    className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white appearance-none"
                    value={formData.subcategoria}
                    onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                  >
                    <option value="">Seleccionar Subcategoría...</option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Equipo *</label>
              <input required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white"
                value={formData.nombre_equipo} onChange={(e) => setFormData({...formData, nombre_equipo: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Serie *</label>
              <input required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white font-mono"
                value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Marca</label>
              <input className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white"
                value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Modelo</label>
              <input className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white"
                value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-2 mb-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">Activo Fijo</label>
                <button 
                  type="button"
                  onClick={() => setHasActivoFijo(!hasActivoFijo)}
                  className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${hasActivoFijo ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                >
                  {hasActivoFijo ? 'Con Activo' : 'Sin Activo'}
                </button>
              </div>
              {hasActivoFijo ? (
                <input 
                  required={hasActivoFijo}
                  className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white animate-in slide-in-from-top-1 duration-300"
                  placeholder="Ingrese el código de activo fijo"
                  value={formData.activo_fijo === 'SIN ACTIVO FIJO' ? '' : formData.activo_fijo} 
                  onChange={(e) => setFormData({...formData, activo_fijo: e.target.value})} 
                />
              ) : (
                <div className="w-full bg-[#151521]/50 border border-dashed border-gray-800 rounded-2xl px-5 py-3 text-gray-600 text-[10px] font-bold uppercase italic text-center">
                  Sin Activo Fijo
                </div>
              )}
            </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Estado</label>
                <select 
                  className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white appearance-none"
                  value={formData.estado}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData, 
                      estado: val,
                      ...(val === 'BAJA' && !formData.fecha_baja ? { fecha_baja: new Date().toISOString().split('T')[0] } : {})
                    });
                  }}
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="DISPONIBLE">En Bodega (Disponible)</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="REPARACION">En Reparación</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
               <div className="col-span-full">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Fechas y Control</p>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Fecha Ingreso (Inst.)</label>
                  <input type="date" className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white"
                    value={formData.fecha_ingreso || ''} onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})} />
               </div>
               {equipoInicial && (
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Fecha Registro (Sistema)</label>
                    <div className="w-full bg-[#151521]/50 border border-gray-800 rounded-2xl px-5 py-3 text-gray-500 font-mono text-[11px]">
                      {new Date(equipoInicial.fecha_registro).toLocaleString()}
                    </div>
                 </div>
               )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
             <div className="col-span-full">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Detalles de Asignación / Ubicación</p>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Usuario / Responsable</label>
                <select 
                  className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white appearance-none focus:border-indigo-500/50 outline-none transition-all"
                  value={formData.usuario_asignado || ''} 
                  onChange={(e) => setFormData({...formData, usuario_asignado: e.target.value})}
                >
                  <option value="">SIN ASIGNAR</option>
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Departamento</label>
                <input className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white"
                  placeholder="Ej: Sistemas, Contabilidad..."
                  value={formData.departamento} onChange={(e) => setFormData({...formData, departamento: e.target.value})} />
             </div>
          </div>

          {formData.estado === 'BAJA' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-red-500/5 rounded-[2rem] border border-red-500/10">
               <div className="col-span-full">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Detalles de Baja</p>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Fecha de Baja *</label>
                  <input type="date" required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white focus:border-red-500/50 outline-none"
                    value={formData.fecha_baja || ''} onChange={(e) => setFormData({...formData, fecha_baja: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Motivo / Novedad de Baja *</label>
                  <textarea required rows={2} className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-3 text-white resize-none focus:border-red-500/50 outline-none"
                    placeholder="Ej: Equipo obsoleto, daño irreparable, robo..."
                    value={formData.novedad === 'Ingreso inicial al sistema' ? '' : formData.novedad} onChange={(e) => setFormData({...formData, novedad: e.target.value})} />
               </div>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4 sticky bottom-0 bg-[#1e1e2d] py-4 border-t border-gray-800/50 mt-auto">
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-700">Cancelar</button>
              <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl text-[10px] uppercase tracking-widest transition-all">
                <Save size={18} className="inline mr-2" /> {equipoInicial ? 'Guardar Cambios' : 'Registrar Equipo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipoModal;