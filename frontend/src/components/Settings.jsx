import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Toast from './Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function Settings() {
  const { user, token, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Check URL hash for direct navigation
  useEffect(() => {
    if (location.hash === '#password') {
      setActiveTab('password');
    }
  }, [location]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }
      
      // Update context and local storage
      updateUser({ fullName });
      
      setToast({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'As senhas não coincidem' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao alterar senha');
      }
      
      setToast({ type: 'success', message: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/email/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao reenviar email');
      }
      
      setToast({ type: 'success', message: 'Email de verificação enviado! Verifique sua caixa de entrada.' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n' +
      'Todos os seus dados serão excluídos permanentemente:\n' +
      '• Sua conta\n' +
      '• Todos os produtos monitorados\n' +
      '• Todo o histórico de preços\n\n' +
      'Tem certeza que deseja excluir sua conta?'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.prompt(
      'Para confirmar, digite "EXCLUIR" (em maiúsculas):'
    );
    
    if (doubleConfirm !== 'EXCLUIR') {
      setToast({ type: 'info', message: 'Operação cancelada' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir conta');
      }
      
      logout();
      navigate('/');
    } catch (error) {
      setToast({ type: 'error', message: error.message });
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'email', label: 'Email', icon: '✉️', alert: !user?.emailVerified },
    { id: 'password', label: 'Senha', icon: '🔐' },
    { id: 'danger', label: 'Zona de Perigo', icon: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400">Gerencie sua conta e preferências</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.alert && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Informações do Perfil</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/30 border border-slate-700 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        O email não pode ser alterado
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || fullName === user?.fullName}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </form>
                </div>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Verificação de Email</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-600">
                      <div className="flex-1">
                        <p className="text-white font-medium">{user?.email}</p>
                        <p className="text-sm text-slate-400">Seu email de cadastro</p>
                      </div>
                      {user?.emailVerified ? (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                          <span>✓</span> Verificado
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2">
                          <span>⏳</span> Pendente
                        </span>
                      )}
                    </div>
                    
                    {!user?.emailVerified && (
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <h3 className="text-amber-400 font-medium mb-2">📧 Verifique seu email</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Enviamos um link de verificação para seu email. Clique no link para confirmar sua conta.
                          Se não encontrar, verifique a pasta de spam.
                        </p>
                        <button
                          onClick={handleResendVerification}
                          disabled={isLoading}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all disabled:opacity-50"
                        >
                          {isLoading ? 'Enviando...' : '📨 Reenviar Email de Verificação'}
                        </button>
                      </div>
                    )}
                    
                    {user?.emailVerified && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <h3 className="text-green-400 font-medium mb-2">✅ Email verificado</h3>
                        <p className="text-slate-400 text-sm">
                          Sua conta está totalmente ativa e você tem acesso a todos os recursos do MonitoraPreço.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Alterar Senha</h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Senha Atual
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nova Senha
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      />
                    </div>
                    
                    <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-sm">Mostrar senhas</span>
                    </label>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-6">⚠️ Zona de Perigo</h2>
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Excluir Conta Permanentemente
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Uma vez excluída, sua conta e todos os dados associados serão 
                      permanentemente removidos. Esta ação não pode ser desfeita.
                    </p>
                    <ul className="text-sm text-slate-500 mb-6 space-y-1">
                      <li>• Todos os produtos monitorados serão excluídos</li>
                      <li>• Todo o histórico de preços será perdido</li>
                      <li>• Você não poderá recuperar esses dados</li>
                    </ul>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Excluindo...' : '🗑️ Excluir Minha Conta'}
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
