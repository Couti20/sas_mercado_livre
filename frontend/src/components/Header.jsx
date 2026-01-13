import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Header({ onRefresh, refreshing, searchTerm, onSearchChange }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    console.log('[INFO] 🔐 Usuário fazendo logout');
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/')}>
            <div className="p-3 rounded-xl shadow-lg bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300">
              <span className="text-2xl">�</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                MonitoraPreço
              </h1>
              <p className="text-xs font-medium text-white/80">
                Rastreie preços em tempo real
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-auto lg:mx-4">
            <div className="relative group">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors"
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
                className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200 hover:bg-white/30 hover:border-white/40"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right section - Refresh and User Menu */}
          <div className="flex items-center gap-3 justify-end">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm border border-white/20 hover:border-white/40"
              title="Atualizar preços"
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Atualizando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Atualizar</span>
                </>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm border border-white/20 hover:border-white/40"
                title={`Usuário: ${user?.fullName || user?.email}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.fullName || 'Usuário'}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-200 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
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
