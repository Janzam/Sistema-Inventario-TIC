import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    info: <Info className="text-sky-500" size={20} />,
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5',
    error: 'border-red-500/20 bg-red-500/10 shadow-red-500/5',
    warning: 'border-amber-500/20 bg-amber-500/10 shadow-amber-500/5',
    info: 'border-sky-500/20 bg-sky-500/10 shadow-sky-500/5',
  };

  return (
    <div className={`
      pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500
      ${colors[toast.type]}
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
    `}>
      {icons[toast.type]}
      <p className="text-[11px] font-black uppercase tracking-widest text-white italic">
        {toast.message}
      </p>
      <button onClick={onRemove} className="ml-2 text-gray-500 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};
