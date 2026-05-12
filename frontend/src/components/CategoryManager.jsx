import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Tag, ChevronRight, FolderPlus } from 'lucide-react';
import api from '../api';
import { useToast } from './Toast';

const CategoryManager = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Form Data
  const [catForm, setCatForm] = useState({ nombre: '', color: '#6366f1' });
  const [subForm, setSubForm] = useState({ nombre: '', categoria: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, subsRes] = await Promise.all([
        api.get('categorias/'),
        api.get('subcategorias/')
      ]);
      setCategories(catsRes.data);
      setSubcategories(subsRes.data);
      
      // Update active category object if it was selected to keep it in sync
      if (activeCategory) {
        const updatedActive = catsRes.data.find(c => c.id === activeCategory.id);
        setActiveCategory(updatedActive || null);
      }
    } catch (err) {
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    const normalizedData = {
      ...catForm,
      nombre: catForm.nombre.toUpperCase().trim()
    };
    try {
      if (selectedCat) {
        await api.put(`categorias/${selectedCat.id}/`, normalizedData);
        showToast("Categoría actualizada", "success");
        setIsCatModalOpen(false);
      } else {
        await api.post('categorias/', normalizedData);
        showToast("Categoría creada con éxito", "success");
        // No cerramos, solo limpiamos para seguir ingresando
        setCatForm({ nombre: '', color: '#6366f1' });
      }
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.nombre?.[0] || "Error al guardar categoría";
      showToast(msg, "error");
    }
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    const normalizedData = {
      ...subForm,
      nombre: subForm.nombre.toUpperCase().trim()
    };
    try {
      if (selectedSub) {
        await api.put(`subcategorias/${selectedSub.id}/`, normalizedData);
        showToast("Subcategoría actualizada", "success");
        setIsSubModalOpen(false);
      } else {
        await api.post('subcategorias/', normalizedData);
        showToast("Subcategoría creada con éxito", "success");
        // No cerramos, solo limpiamos para seguir ingresando
        setSubForm({ nombre: '', categoria: subForm.categoria }); // Mantenemos la categoría padre para agilizar
      }
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.nombre?.[0] || "Error al guardar subcategoría";
      showToast(msg, "error");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("¿Eliminar categoría? Esto afectará a sus subcategorías.")) return;
    try {
      await api.delete(`categorias/${id}/`);
      showToast("Categoría eliminada", "info");
      fetchData();
    } catch (err) {
      showToast("No se pudo eliminar", "error");
    }
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm("¿Eliminar subcategoría?")) return;
    try {
      await api.delete(`subcategorias/${id}/`);
      showToast("Subcategoría eliminada", "info");
      fetchData();
    } catch (err) {
      showToast("No se pudo eliminar", "error");
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Layers size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Configuración de Inventario</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestiona la jerarquía de tus activos tecnológicos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Tabla de Categorías */}
        <div className="bg-[#1e1e2d] rounded-[2.5rem] border border-gray-800/50 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-8 border-b border-gray-800/50 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Tag size={18}/></div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Categorías Principales</h3>
            </div>
            <button 
              onClick={() => { setSelectedCat(null); setCatForm({ nombre: '', color: '#6366f1' }); setIsCatModalOpen(true); }}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800">
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {categories.map(cat => (
                  <tr 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat)}
                    className={`group cursor-pointer transition-all ${activeCategory?.id === cat.id ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-lg shadow-inner border border-white/10" style={{ backgroundColor: cat.color }}></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-black uppercase text-xs italic tracking-wide ${activeCategory?.id === cat.id ? 'text-indigo-400' : 'text-white'}`}>
                          {cat.nombre}
                        </span>
                        {activeCategory?.id === cat.id && <ChevronRight size={14} className="text-indigo-400" />}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedCat(cat); setCatForm({ nombre: cat.nombre, color: cat.color }); setIsCatModalOpen(true); }}
                          className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Subcategorías */}
        <div className="bg-[#1e1e2d] rounded-[2.5rem] border border-gray-800/50 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-8 border-b border-gray-800/50 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><FolderPlus size={18}/></div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">
                  {activeCategory ? `Subcategorías: ${activeCategory.nombre}` : 'Subcategorías Específicas'}
                </h3>
                {activeCategory && (
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:underline"
                  >
                    Ver todas las subcategorías
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => { 
                setSelectedSub(null); 
                setSubForm({ nombre: '', categoria: activeCategory?.id || '' }); 
                setIsSubModalOpen(true); 
              }}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            {!activeCategory && subcategories.length > 0 && (
              <div className="p-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center text-gray-600">
                  <Tag size={32} />
                </div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">
                  Selecciona una categoría a la izquierda para ver sus detalles
                </p>
                <button 
                  onClick={() => setActiveCategory({ id: 'all' })} // Temporary trick to show all
                  className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors"
                >
                  O haz clic aquí para ver todo
                </button>
              </div>
            )}
            
            {(activeCategory || subcategories.length === 0) && (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800">
                    <th className="px-6 py-4">Subcategoría</th>
                    {!activeCategory || activeCategory.id === 'all' ? <th className="px-6 py-4">Perteneciente a</th> : null}
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {subcategories
                    .filter(sub => !activeCategory || activeCategory.id === 'all' || sub.categoria === activeCategory.id)
                    .map(sub => (
                    <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-black uppercase text-xs italic tracking-wide text-white">{sub.nombre}</td>
                      {(!activeCategory || activeCategory.id === 'all') && (
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-gray-800 text-gray-400 border border-gray-700">
                            {sub.categoria_nombre}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedSub(sub); setSubForm({ nombre: sub.nombre, categoria: sub.categoria }); setIsSubModalOpen(true); }}
                            className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteSubcategory(sub.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeCategory && subcategories.filter(sub => activeCategory.id === 'all' || sub.categoria === activeCategory.id).length === 0 && (
              <div className="p-10 text-center">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No hay subcategorías en esta categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Categoría */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800/50 bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {selectedCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">×</button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nombre de Categoría</label>
                <input required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-4 text-white uppercase focus:border-indigo-500/50 outline-none transition-all"
                  value={catForm.nombre} onChange={(e) => setCatForm({...catForm, nombre: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Color Representativo</label>
                <div className="flex gap-4 items-center">
                  <input type="color" className="w-16 h-16 bg-transparent border-none cursor-pointer"
                    value={catForm.color} onChange={(e) => setCatForm({...catForm, color: e.target.value})} />
                  <p className="text-xs font-mono text-gray-500">{catForm.color.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 text-[10px] uppercase shadow-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subcategoría */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800/50 bg-white/[0.02] flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {selectedSub ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">×</button>
            </div>
            <form onSubmit={handleSubSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Categoría Padre</label>
                <select required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-4 text-white appearance-none focus:border-emerald-500/50 outline-none transition-all"
                  value={subForm.categoria} onChange={(e) => setSubForm({...subForm, categoria: e.target.value})}>
                  <option value="">Seleccionar Categoría...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nombre de Subcategoría</label>
                <input required className="w-full bg-[#151521] border border-gray-700 rounded-2xl px-5 py-4 text-white uppercase focus:border-emerald-500/50 outline-none transition-all"
                  value={subForm.nombre} onChange={(e) => setSubForm({...subForm, nombre: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsSubModalOpen(false)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 text-[10px] uppercase shadow-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
