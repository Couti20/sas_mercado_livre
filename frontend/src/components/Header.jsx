import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Header({ onRefresh, refreshing, searchTerm, onSearchChange }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    console.log('[INFO] Usuário fazendo logout');
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl backdrop-blur-md border-b border-slate-700/50">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        
        {/* Layout: Logo + Search + Actions */}
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <div className="text-3xl">📊</div>
            <div>
              <h1 className="text-xl font-bold text-white">
                MonitoraPreço
              </h1>
              <p className="text-xs text-slate-400">
                Maximize seus lucros
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Limpar"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-slate-600 hover:border-slate-500 whitespace-nowrap"
              title="Atualizar"
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Atualizando...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span className="hidden sm:inline">Atualizar</span>
                </>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all border border-amber-400/50 hover:border-amber-300 flex items-center gap-2"
              >
                👤 {user?.email?.split('@')[0] || 'Usuário'}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl py-2 z-50 border border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
