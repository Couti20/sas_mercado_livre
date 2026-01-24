import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Se usuário já está logado, redirecionar para dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: '⚡',
      title: 'Monitoramento em Tempo Real',
      description: 'Receba alertas instantâneos sempre que os preços dos seus produtos mudam no Mercado Livre.'
    },
    {
      icon: '📊',
      title: 'Analytics Avançado',
      description: 'Visualize gráficos detalhados, tendências de preços e histórico completo para tomar decisões estratégicas.'
    },
    {
      icon: '✈️',
      title: 'Alertas no Telegram',
      description: 'Receba notificações instantâneas no Telegram. Saiba de mudanças de preço direto no seu celular!'
    },
    {
      icon: '📧',
      title: 'Notificações por Email',
      description: 'Receba relatórios resumidos com mudanças de preços. Fique informado mesmo quando estiver offline.'
    },
    {
      icon: '🔔',
      title: 'Alertas Personalizados',
      description: 'Configure notificações por queda percentual ou valor em R$. Você decide quando quer ser alertado.'
    },
    {
      icon: '🔒',
      title: 'Segurança de Dados',
      description: 'Seus dados são protegidos com autenticação JWT e criptografia de nível empresarial.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-50"></div>

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-sm border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <img src="/logo_monitora.png" alt="MonitoraPreço" className="h-12 w-12 object-contain" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  MonitoraPreço
                </h1>
                <p className="text-xs text-slate-400">Maximize seus lucros</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-bold transition-all transform hover:scale-105"
              >
                Começar Grátis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700">
                <span className="sr-only">Abrir menu</span>
                {/* Hamburger Icon */}
                <svg className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                {/* Close Icon */}
                <svg className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="w-full">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-full">
            <span className="text-amber-400 font-semibold text-sm">🔍 Inteligência Competitiva para E-commerce</span>
          </div>

          {/* Main headline */}
