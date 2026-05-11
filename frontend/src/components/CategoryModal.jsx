import React, { useState } from 'react';
import { X, Save, Palette, Type, Image as ImageIcon } from 'lucide-react';
import api from '../api';
import { useToast } from './Toast';

const CategoryModal = ({ isOpen, onClose, onRefresh }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    color: '#6366f1',
    imagen: '📦' // Default emoji
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('categorias/', formData);
      onRefresh();
      showToast("Categoría registrada con éxito", "success");
      // No cerramos el modal, solo limpiamos para seguir ingresando
      setFormData({ nombre: '', color: '#6366f1', imagen: '📦' });
    } catch (err) {
      console.error("Error al crear categoría:", err);
      showToast("Error al registrar categoría. Asegúrate de que el nombre sea único.", "error");
    } finally {
      setLoading(false);
    }
  };

  const commonEmojis = ["💻", "📱", "🖱️", "🔌", "🧼", "🧪", "🛠️", "📦", "🖥️", "⌨️", "🎧", "📷", "🔋", "📡", "🏗️"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0f]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e1e2d] w-full max-w-lg rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-transparent">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Nueva Categoría</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Registra un nuevo grupo de inventario</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              <Type size={14} className="text-indigo-500" /> Nombre de Categoría
            </label>
            <input 
              required
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ejem: Servidores y Redes"
              className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold italic"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                <Palette size={14} className="text-indigo-500" /> Color Distintivo
              </label>
              <div className="flex gap-3">
                <input 
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-14 h-14 rounded-2xl bg-[#151521] border border-gray-800 p-1 cursor-pointer"
                />
                <div className="flex-1 bg-[#151521] border border-gray-800 rounded-2xl flex items-center px-4 font-mono text-xs text-gray-400">
                  {formData.color.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                <ImageIcon size={14} className="text-indigo-500" /> Icono / Emoji
              </label>
              <input 
                type="text"
                value={formData.imagen}
                onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-4 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Sugerencias de Iconos</p>
            <div className="flex flex-wrap gap-2 p-4 bg-[#151521] rounded-2xl border border-gray-800">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({...formData, imagen: emoji})}
                  className={`text-xl p-2 rounded-xl hover:bg-white/5 transition-colors ${formData.imagen === emoji ? 'bg-indigo-600/20 ring-1 ring-indigo-500' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                type="submit"
                className="flex-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                {loading ? 'Guardando...' : <><Save size={16} /> Guardar Categoría</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
