import React, { useState } from 'react';
import { Laptop, User, Lock, Mail } from 'lucide-react';
import api from '../api';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleTraditionalAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isRegister ? 'register/' : 'token/';
      
      const payload = isRegister 
        ? { 
            username: formData.identifier, 
            email: formData.identifier, 
            password: formData.password, 
            first_name: formData.name 
          }
        : { 
            username: formData.identifier, 
            password: formData.password 
          };

      const res = await api.post(endpoint, payload);

      if (res.data && res.data.token) {
        onLoginSuccess({
          user: res.data.user || { name: formData.name || formData.identifier, email: formData.identifier },
          token: res.data.token
        });
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      const errorMsg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.error || "Credenciales incorrectas o cuenta no activa";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151521] flex items-center justify-center p-4 font-sans italic">
      <div className="bg-[#1e1e2d] p-8 rounded-[2rem] border border-gray-800 shadow-2xl w-full max-w-md z-10">
        
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <Laptop size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">TIC INV</h1>
        </div>

        <div className="flex bg-[#151521] rounded-xl p-1 mb-6 border border-gray-800">
          <button 
            type="button"
            onClick={() => setIsRegister(false)} 
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${!isRegister ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => setIsRegister(true)} 
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${isRegister ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleTraditionalAction} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="NOMBRE COMPLETO" 
                required 
                className="w-full bg-[#151521] border border-gray-800 rounded-xl py-3 pl-10 text-sm text-white focus:border-indigo-500 outline-none font-bold uppercase"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="USUARIO O CORREO" 
              required 
              className="w-full bg-[#151521] border border-gray-800 rounded-xl py-3 pl-10 text-sm text-white focus:border-indigo-500 outline-none font-bold"
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="password" 
              placeholder="CONTRASEÑA" 
              required 
              className="w-full bg-[#151521] border border-gray-800 rounded-xl py-3 pl-10 text-sm text-white focus:border-indigo-500 outline-none font-bold"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg`}
          >
            {loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;