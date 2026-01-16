import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  // Prevent double execution in React Strict Mode
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    // Prevent double execution
    if (hasVerified.current) {
      return;
    }
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/email/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verificado com sucesso!');
          
          // Update localStorage if user is logged in
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            user.emailVerified = true;
            localStorage.setItem('user', JSON.stringify(user));
          }
        } else {
          // Check if error is because token was already used (email already verified)
          if (data.error?.includes('inválido') || data.error?.includes('expirado')) {
            // Try to check if user is already verified by checking localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              const user = JSON.parse(savedUser);
              if (user.emailVerified) {
                setStatus('success');
                setMessage('Seu email já foi verificado anteriormente!');
                return;
              }
            }
          }
          setStatus('error');
          setMessage(data.error || 'Erro ao verificar email.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro de conexão. Tente novamente.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
          
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <h1 className="text-2xl font-bold text-white mb-2">Verificando...</h1>
              <p className="text-slate-400">Aguarde enquanto confirmamos seu email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-5xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verificado!</h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <p className="text-slate-500 mb-6">
                Sua conta está totalmente ativa. Agora você pode aproveitar todos os recursos do MonitoraPreço.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all"
              >
                Ir para o Dashboard →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-5xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Erro na Verificação</h1>
              <p className="text-red-400 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
                >
                  Fazer Login
                </Link>
                <p className="text-slate-500 text-sm">
                  Após fazer login, você pode solicitar um novo email de verificação nas configurações.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
