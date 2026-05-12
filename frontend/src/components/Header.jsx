import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, Search, Package, ChevronDown, User, Lock, LogOut, X, Camera, Upload, Eye, EyeOff } from 'lucide-react';
import { useStock } from '../context/StockContext';

const Modal = ({ title, onClose, onSave, children }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 italic">
    <div className="bg-[#1e1e2d] border border-gray-800 w-full max-w-md rounded-[2rem] p-8 animate-in zoom-in duration-300 relative">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={20} /></button>
      <h2 className="text-xl font-black text-white uppercase mb-6 tracking-tighter">{title}</h2>
      {children}
      <div className="mt-6 flex gap-3">
        <button onClick={onClose} className="flex-1 bg-gray-800 text-gray-400 font-bold py-3 rounded-xl uppercase text-[10px]">Cancelar</button>
        <button onClick={onSave} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl uppercase text-[10px]">Guardar</button>
      </div>
    </div>
  </div>
);

const Header = ({ equipos = [], onSearch, user, onLogout, onUpdateUser }) => {
  const { stockLimit } = useStock();
  const [showNotis, setShowNotis] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name, email: user?.email, picture: user?.picture });
  const [passData, setPassData] = useState({ old: '', new: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handleSavePass = async () => {
    if (!passData.old || !passData.new) return alert("Ambas contraseñas son requeridas");
    try {
      await api.post('change-password/', { old_password: passData.old, new_password: passData.new });
      alert("Contraseña actualizada correctamente");
      setShowPassModal(false);
      setPassData({ old: '', new: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar contraseña");
    }
  };

  useEffect(() => {
    setEditData({ name: user?.name, email: user?.email, picture: user?.picture });
  }, [user]);

  const fileInputRef = useRef(null);
  const prevStockRef = useRef([]);
  const bajoStock = useMemo(() => {
    const disponiblesList = equipos.filter(e => e.estado === 'DISPONIBLE');
    const conteo = disponiblesList.reduce((acc, eq) => {
      acc[eq.nombre_equipo] = (acc[eq.nombre_equipo] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(conteo)
      .map(nombre => ({ name: nombre, count: conteo[nombre] }))
      .filter(item => item.count < stockLimit);
  }, [equipos, stockLimit]);

  useEffect(() => {
    prevStockRef.current = bajoStock;
  }, [bajoStock.length]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    onUpdateUser(editData);
    setShowEditModal(false);
  };

  return (
    <header className="bg-[#151521] border-b border-gray-800 p-4 flex justify-between items-center sticky top-0 z-50 italic">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        <input type="text" placeholder="Buscar por serie, equipo o responsable..." onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#1e1e2d] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500 font-bold" />
      </div>

      <div className="flex items-center gap-6">
        {/* Notificaciones */}
        <div className="relative">
          <button onClick={() => { setShowNotis(!showNotis); setShowProfileMenu(false); }}
            className={`p-2 rounded-xl transition-all ${bajoStock.length > 0 ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Bell size={20} />
            {bajoStock.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#151521]"></span>}
          </button>
          {showNotis && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1e1e2d] border border-gray-800 rounded-2xl shadow-2xl p-4 z-50">
              <h4 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest">Notificaciones</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {bajoStock.length > 0 ? bajoStock.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="text-red-500"><Package size={16}/></div>
                    <div>
                      <p className="text-[10px] text-white font-bold uppercase tracking-tight">Stock Bajo: {item.name}</p>
                      <p className="text-[9px] text-red-400 font-medium tracking-tight">Solo quedan {item.count} unidades.</p>
                    </div>
                  </div>
                )) : <p className="text-[10px] text-gray-500 text-center py-4 font-bold uppercase">Todo está en orden</p>}
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <div onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotis(false); }} className="flex items-center gap-3 border-l border-gray-800 pl-6 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white uppercase italic group-hover:text-indigo-400 transition-colors">
                {user?.name || "Admin TI"}
              </p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Sesión Activa</p>
            </div>
            
            {user?.picture ? (
              <img src={user.picture} alt="profile" className="w-10 h-10 rounded-xl border-2 border-indigo-500/50 shadow-lg group-hover:scale-105 transition-transform object-cover" />
            ) : (
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 relative group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || "A"}
                <div className="absolute -bottom-1 -right-1 bg-[#151521] rounded-full p-0.5">
                  <ChevronDown size={10} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </div>
              </div>
            )}
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[#1e1e2d] border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-gray-800 mb-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest tracking-tighter">Configuración</p>
              </div>
              <button onClick={() => { setShowEditModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-gray-300 uppercase hover:bg-indigo-600 rounded-xl transition-all">
                <User size={14} /> Editar Información
              </button>
              <button onClick={() => { setShowPassModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-gray-300 uppercase hover:bg-indigo-600 rounded-xl transition-all">
                <Lock size={14} /> Cambiar Contraseña
              </button>
              <div className="my-1 border-t border-gray-800"></div>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-red-500 uppercase hover:bg-red-500/10 rounded-xl transition-all">
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <Modal title="Editar Perfil" onClose={() => setShowEditModal(false)} onSave={handleSaveEdit}>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  {editData.picture ? (
                    <img src={editData.picture} className="w-24 h-24 rounded-[1.5rem] object-cover border-4 border-indigo-500/30 shadow-2xl" alt="Preview" />
                  ) : (
                    <div className="w-24 h-24 bg-indigo-600/20 rounded-[1.5rem] border-4 border-dashed border-indigo-500 flex items-center justify-center text-indigo-400">
                       <User size={40}/>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-[1.5rem] transition-all">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                
                {/* Input de archivo oculto */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Toca la foto para subir</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Nombre Real</label>
              <input 
                type="text" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
                className="w-full bg-[#151521] border border-gray-800 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500 font-bold" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={editData.email} 
                onChange={(e) => setEditData({...editData, email: e.target.value})} 
                className="w-full bg-[#151521] border border-gray-800 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500 font-bold" 
              />
            </div>
          </div>
        </Modal>
      )}

      {showPassModal && (
        <Modal title="Cambiar Contraseña" onClose={() => setShowPassModal(false)} onSave={handleSavePass}>
          <div className="space-y-4">
            <div className="relative">
              <input 
                type={showOldPass ? "text" : "password"} 
                placeholder="Contraseña Actual" 
                value={passData.old}
                onChange={(e) => setPassData({...passData, old: e.target.value})}
                className="w-full bg-[#151521] border border-gray-800 rounded-xl p-3 pr-10 text-sm text-white outline-none focus:border-indigo-500 font-bold" 
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showNewPass ? "text" : "password"} 
                placeholder="Nueva Contraseña" 
                value={passData.new}
                onChange={(e) => setPassData({...passData, new: e.target.value})}
                className="w-full bg-[#151521] border border-gray-800 rounded-xl p-3 pr-10 text-sm text-white outline-none focus:border-indigo-500 font-bold" 
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
};

export default Header;