import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import CategoryView from './components/CategoryView';
import SecurityModule from './components/SecurityModule';
import CategoryManager from './components/CategoryManager';
import Header from './components/Header'; 
import Login from './components/Login'; 
import api from './api'; 
import { useStock } from './context/StockContext';

function App() {
  const [view, setView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuth') === 'true');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userData')) || null);

  const { stockLimit } = useStock();

  const handleSetView = (newView) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const fetchEquipos = async () => {
    try {
      const res = await api.get('equipos/');
      setEquipos(res.data);
    } catch (err) { 
      console.error("Error al cargar equipos:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEquipos();
  }, [view, stockLimit, isAuthenticated]); 

  const handleLoginSuccess = (data) => {
    const userToSave = data.user || data; 
    const tokenToSave = data.token;

    setUser(userToSave);
    setIsAuthenticated(true);
    
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('userData', JSON.stringify(userToSave));
    if (tokenToSave) {
      localStorage.setItem('token', tokenToSave);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear(); 
  };

  const handleUpdateUser = async (newData) => {
    try {
      const res = await api.put('profile/', newData);
      if (res.data && res.data.user) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      alert("No se pudo actualizar el perfil");
    }
  };

  const handleSelectCategory = (cat, subcat = null) => {
     setSelectedCategory(cat);
     setSelectedSubcategory(subcat);
     setView('category_details');
     setIsSidebarOpen(false);
  };

  const handleAddToCategory = (cat) => {
    setPreselectedCategory(cat);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  const renderContent = () => {
    if (view === 'dashboard') {
      return <Dashboard onSelectCategory={handleSelectCategory} onAddToCategory={handleAddToCategory} user={user} />;
    }
    if (view === 'category_details') {
      return (
        <CategoryView 
          category={selectedCategory} 
          initialSubcat={selectedSubcategory}
          onBack={() => { 
            setView('dashboard'); 
            setSelectedCategory(null); 
            setSelectedSubcategory(null); 
          }} 
        />
      );
    }
    if (view === 'security') {
      return <SecurityModule />;
    }
    if (view === 'category_config') {
      return <CategoryManager />;
    }
    return <DataTable currentView={view} onRefresh={fetchEquipos} searchTerm={searchTerm} user={user} />;
  };

  return (
    <div className="flex bg-[#151521] min-h-screen font-sans text-gray-200 overflow-hidden italic relative">
      {/* Backdrop blur for mobile drawer sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        setView={handleSetView} 
        currentView={view} 
        equiposReales={equipos} 
        onSelectCategory={handleSelectCategory}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <Header 
          equipos={equipos} 
          onSearch={setSearchTerm} 
          user={user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        /> 
        <main className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderContent()}
          </div>
        </main>
        
        {/* Modal Global para ingresos rápidos */}
        <DataTable 
          hidden 
          isManualModalOpen={isModalOpen} 
          setIsManualModalOpen={setIsModalOpen}
          preselectedCategory={preselectedCategory}
          onRefresh={fetchEquipos}
          user={user}
        />
      </div>
    </div>
  );
}

export default App;