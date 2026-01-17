import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default function NotificationPreferences({ product, onClose, onSave }) {
  const [notifyOnDrop, setNotifyOnDrop] = useState(
    product.notifyOnPriceDrop !== false
  );
  const [notifyOnIncrease, setNotifyOnIncrease] = useState(
    product.notifyOnPriceIncrease !== false
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          notifyOnPriceDrop: notifyOnDrop,
          notifyOnPriceIncrease: notifyOnIncrease,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar preferências');
      }

      const updatedProduct = await response.json();
      setSuccess(true);
      
      // Aguarda um pouco para mostrar sucesso e fecha
      setTimeout(() => {
        onSave(updatedProduct);
        onClose();
      }, 800);
      
    } catch (err) {
      console.error('Erro ao atualizar preferências:', err);
      setError(err.message || 'Erro ao atualizar preferências');
    } finally {
      setLoading(false);
    }
  };

  const bothDisabled = !notifyOnDrop && !notifyOnIncrease;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔔</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Configurar Alertas
              </h2>
              <p className="text-xs text-slate-400">Escolha quando ser notificado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700">
          <p className="text-xs text-slate-500">Produto</p>
          <p className="text-sm text-white font-medium line-clamp-1">{product.name}</p>
          <p className="text-xs text-amber-400 font-semibold mt-1">
            R$ {product.currentPrice?.toFixed(2)}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Queda de Preço */}
          <div 
            onClick={() => setNotifyOnDrop(!notifyOnDrop)}
            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
              notifyOnDrop 
                ? 'bg-emerald-500/10 border-2 border-emerald-500/50' 
                : 'bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                notifyOnDrop ? 'bg-emerald-500/20' : 'bg-slate-600'
              }`}>
                <span className="text-2xl">📉</span>
              </div>
              <div>
                <p className={`font-semibold ${notifyOnDrop ? 'text-emerald-400' : 'text-slate-300'}`}>
                  Queda de Preço
                </p>
                <p className="text-xs text-slate-400">
                  Avise quando o concorrente baixar
                </p>
              </div>
            </div>
            
            {/* Toggle */}
            <div className={`relative w-14 h-8 rounded-full transition-colors ${
              notifyOnDrop ? 'bg-emerald-500' : 'bg-slate-600'
            }`}>
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                notifyOnDrop ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Aumento de Preço */}
          <div 
            onClick={() => setNotifyOnIncrease(!notifyOnIncrease)}
            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
              notifyOnIncrease 
                ? 'bg-red-500/10 border-2 border-red-500/50' 
                : 'bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                notifyOnIncrease ? 'bg-red-500/20' : 'bg-slate-600'
              }`}>
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className={`font-semibold ${notifyOnIncrease ? 'text-red-400' : 'text-slate-300'}`}>
                  Aumento de Preço
                </p>
                <p className="text-xs text-slate-400">
                  Avise quando o concorrente subir
                </p>
              </div>
            </div>
            
            {/* Toggle */}
            <div className={`relative w-14 h-8 rounded-full transition-colors ${
              notifyOnIncrease ? 'bg-red-500' : 'bg-slate-600'
            }`}>
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                notifyOnIncrease ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Warning when both disabled */}
          {bothDisabled && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-amber-400">
                Nenhum alerta ativo. Você não receberá notificações sobre este produto.
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="text-xl">✅</span>
              <p className="text-sm text-emerald-400 font-medium">
                Preferências salvas com sucesso!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <span className="text-xl">❌</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Status Summary */}
          <div className="p-3 bg-slate-700/50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Como você será notificado:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-600 rounded-md text-xs text-slate-300 flex items-center gap-1">
                <span>📧</span> Email
              </span>
              <span className="px-2 py-1 bg-slate-600 rounded-md text-xs text-slate-300 flex items-center gap-1">
                <span>🔔</span> Sininho
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 text-slate-300 font-semibold border border-slate-600 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || success}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : success ? (
              <>
                <span>✅</span>
                Salvo!
              </>
            ) : (
              <>
                <span>💾</span>
                Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
