import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (password !== confirmPassword) {
      setToast({ type: 'error', message: 'As senhas não coincidem' });
      return;
    }

    if (password.length < 6) {
      setToast({ type: 'error', message: 'Senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[INFO] 📝 Tentando registrar:', email);
      
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no cadastro');
      }

      console.log('[SUCCESS] ✅ Cadastro realizado:', data.email);
      login(data);
      setToast({ type: 'success', message: 'Cadastro realizado com sucesso!' });
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('[ERROR] ❌ Erro no cadastro:', error.message);
      setToast({ type: 'error', message: error.message || 'Erro ao cadastrar' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center p-4 overflow-hidden">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card com backdrop blur */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-emerald-600 to-teal-600 p-4 rounded-xl mb-4 hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Comece a rastrear preços com MonitoraPreço
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                👤 Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                🔐 Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                ✓ Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 hover:border-gray-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando conta...
                </span>
              ) : (
                '✨ Criar Conta'
              )}
            </button>
          </form>

          {/* Link para login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-700 text-sm">
              Já tem conta?{' '}
              <a href="/login" className="font-bold text-emerald-600 hover:text-teal-600 hover:underline transition-colors">
                Faça login
              </a>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-white/70 text-xs mt-6">
          ✨ Interface moderna e responsiva
        </p>
      </div>
    </div>
  );
}
