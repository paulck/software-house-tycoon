import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ game, onExit, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isBankrupt = game?.patrimonio < game?.monthly_costs;

  const navigationItems = [
    { path: '/production', icon: '🏗️', label: 'Produzione' },
    { path: '/sales', icon: '💼', label: 'Sales' },
    { path: '/hr', icon: '🧑‍💼', label: 'HR' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      {/* Header */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg sticky top-0 z-50 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 text-white rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current transform transition-all"></div>
                <div className="w-full h-0.5 bg-current transform transition-all"></div>
                <div className="w-full h-0.5 bg-current transform transition-all"></div>
              </div>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Software House Tycoon</h1>
              <p className="text-sm text-white text-opacity-75">Gestisci la tua azienda tech</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-white">
            <div className="text-right bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-sm opacity-75 mb-1">Patrimonio</div>
              <div className={`text-2xl font-bold ${isBankrupt ? 'text-red-300' : ''}`}>
                €{game?.patrimonio?.toLocaleString()}
              </div>
            </div>
            <div className="text-right bg-white bg-opacity-10 rounded-xl p-4">
              <div className="text-sm opacity-75 mb-1">Costi Mensili</div>
              <div className="text-xl font-semibold">€{game?.monthly_costs?.toLocaleString()}</div>
            </div>
            <button 
              onClick={onExit}
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl transition-colors font-medium"
            >
              🚪 Esci
            </button>
          </div>
        </div>
        
        {isBankrupt && (
          <div className="mt-6 bg-red-500 text-white p-4 rounded-xl text-center font-bold text-lg max-w-7xl mx-auto">
            ⚠️ BANCAROTTA! Patrimonio insufficiente per coprire i costi mensili!
          </div>
        )}
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-80 h-full bg-white bg-opacity-95 backdrop-blur-lg z-50 transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <div className="w-6 h-6">✕</div>
            </button>
          </div>
          
          <nav className="space-y-3">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Patrimonio:</span>
                <span className="font-medium">€{game?.patrimonio?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Costi Mensili:</span>
                <span className="font-medium">€{game?.monthly_costs?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Team:</span>
                <span className="font-medium">
                  {game?.developers?.length || 0} Dev + {game?.salesPeople?.length || 0} Sales
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
{/* Footer Navigation - AGGIUNGI SOLO QUESTO */}
<div className="bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20">
  <div className="max-w-7xl mx-auto p-4">
    <div className="flex justify-center space-x-6">
      <button
        onClick={() => navigate('/production')}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
          location.pathname === '/production'
            ? 'bg-white bg-opacity-20 text-white shadow-lg border-2 border-white border-opacity-30' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        <span className="text-xl">🏗️</span>
        <span className="hidden sm:block">Produzione</span>
      </button>
      
      <button
        onClick={() => navigate('/sales')}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
          location.pathname === '/sales'
            ? 'bg-white bg-opacity-20 text-white shadow-lg border-2 border-white border-opacity-30' 
            : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        <span className="text-xl">💼</span>
        <span className="hidden sm:block">Sales</span>
      </button>
      
      <button
        onClick={() => navigate('/hr')}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
          location.pathname === '/hr'
            ? 'bg-white bg-opacity-20 text-white shadow-lg border-2 border-white border-opacity-30' 
            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        <span className="text-xl">👥</span>
        <span className="hidden sm:block">HR</span>
      </button>
    </div>
  </div>
</div>
    </div>
  );
};

export default Layout;
