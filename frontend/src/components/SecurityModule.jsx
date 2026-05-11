import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Users, Search, Mail, Phone, Fingerprint, Key, Check, X, Edit, Trash2 } from 'lucide-react';
import api from '../api';
import { useToast } from './Toast';

const SecurityModule = () => {
  const { showToast } = useToast();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', identificacion: '', email: '', telefono: '', direccion: '' });
  const [userFormData, setUserFormData] = useState({ username: '', password: '' });

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const res = await api.get('personas/');
      setPersonas(res.data);
    } catch (err) {
      console.error("Error al cargar personas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handlePersonaSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEditing = !!(selectedPersona && !isUserModalOpen);
      if (isEditing) {
        await api.put(`personas/${selectedPersona.id}/`, formData);
        showToast("Persona actualizada correctamente", "success");
        setIsModalOpen(false);
      } else {
        await api.post('personas/', formData);
        showToast("Persona registrada con éxito", "success");
        // No cerramos el modal, solo limpiamos para seguir ingresando
        setFormData({ nombre: '', identificacion: '', email: '', telefono: '', direccion: '' });
      }
      fetchPersonas();
      if (isEditing) resetForms();
    } catch (err) {
      const errorMsg = err.response?.data?.identificacion?.[0] || err.response?.data?.error || "Error al guardar persona.";
      showToast(errorMsg, "error");
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`personas/${selectedPersona.id}/create_user/`, userFormData);
      showToast("Acceso de usuario creado correctamente", "success");
      fetchPersonas();
      setIsUserModalOpen(false);
      resetForms();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al crear usuario", "error");
    }
  };

  const deletePersona = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar a esta persona?")) return;
    try {
      await api.delete(`personas/${id}/`);
      showToast("Persona eliminada", "info");
      fetchPersonas();
    } catch (err) {
      showToast("No se pudo eliminar la persona.", "error");
    }
  };

  const resetForms = () => {
    setFormData({ nombre: '', identificacion: '', email: '', telefono: '', direccion: '' });
    setUserFormData({ username: '', password: '' });
    setSelectedPersona(null);
  };

  const filtered = personas.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.identificacion.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Módulo de Seguridad</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de Personal y Cuentas de Usuario</p>
          </div>
        </div>

        <button 
          onClick={() => { resetForms(); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
        >
          <UserPlus size={18} /> Registrar Persona
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o identificación..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e2d] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all font-bold italic"
            />
          </div>

          {/* Tabla de Personas */}
          <div className="bg-[#1e1e2d] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="px-6 py-5">Persona</th>
                  <th className="px-6 py-5">Identificación</th>
                  <th className="px-6 py-5">Contacto</th>
                  <th className="px-6 py-5">Usuario Sistema</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loading ? (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-500 uppercase text-[10px] font-black">Cargando personal...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-500 uppercase text-[10px] font-black italic">No se encontraron personas</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-black text-white uppercase italic text-xs">{p.nombre}</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">ID: {p.id}</div>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-mono font-bold text-indigo-400">{p.identificacion}</td>
                    <td className="px-6 py-5 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <Mail size={12} className="text-gray-600" /> {p.email || '---'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <Phone size={12} className="text-gray-600" /> {p.telefono || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {p.has_user ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full w-fit text-[9px] font-black uppercase">
                          <Check size={12} /> {p.username}
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setSelectedPersona(p); setIsUserModalOpen(true); }}
                          className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-full w-fit text-[9px] font-black uppercase transition-all"
                        >
                          <Key size={12} /> Sin Acceso
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedPersona(p); setFormData(p); setIsModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deletePersona(p.id)}
                          className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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

        {/* Sidebar Estadísticas */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
             <Fingerprint size={80} className="absolute -right-4 -bottom-4 text-white/10" />
             <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Personal</p>
             <h3 className="text-4xl font-black text-white italic">{personas.length}</h3>
             <div className="mt-6 p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-[9px] font-bold text-white uppercase">Usuarios Activos: {personas.filter(p => p.has_user).length}</p>
             </div>
          </div>

          <div className="bg-[#1e1e2d] border border-gray-800 p-6 rounded-[2rem] space-y-4">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-3">Resumen de Seguridad</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-400">Sin Usuario</span>
                   <span className="text-[10px] font-black text-amber-500">{personas.filter(p => !p.has_user).length}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${(personas.filter(p => !p.has_user).length / (personas.length || 1)) * 100}%` }}
                   ></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal Persona */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-transparent">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {selectedPersona ? 'Editar Persona' : 'Registrar Persona'}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Datos de identificación personal</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handlePersonaSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nombre Completo *</label>
                <input required className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white"
                  value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Cédula / Identificación *</label>
                <input required className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white font-mono"
                  value={formData.identificacion} onChange={(e) => setFormData({...formData, identificacion: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Email</label>
                  <input type="email" className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Teléfono</label>
                  <input className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white"
                    value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl text-[10px] uppercase">Guardar Datos</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
               <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                  <Key size={32} />
               </div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Crear Acceso</h3>
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Persona: {selectedPersona?.nombre}</p>
            </div>
            <form onSubmit={handleUserSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nombre de Usuario *</label>
                <input required className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white"
                  value={userFormData.username} onChange={(e) => setUserFormData({...userFormData, username: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Contraseña Temporal *</label>
                <input required type="password" placeholder="••••••••" className="w-full bg-[#151521] border border-gray-800 rounded-2xl px-5 py-3 text-white"
                  value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] bg-amber-600 text-white font-black py-4 rounded-2xl hover:bg-amber-700 shadow-xl text-[10px] uppercase">Habilitar Acceso</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityModule;
