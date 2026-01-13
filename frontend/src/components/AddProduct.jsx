import { useState } from 'react'

function AddProduct({ onAdd, adding }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const validateUrl = (urlString) => {
    if (!urlString.trim()) {
      return 'Cole a URL do produto'
    }

    // Check if it's a valid URL format
    try {
      new URL(urlString)
    } catch {
      return 'URL inválida. Use um endereço completo'
    }

    // Check if it's from Mercado Livre
    if (!urlString.includes('mercadolivre.com') && !urlString.includes('mercadolibre.com')) {
      return 'URL deve ser do Mercado Livre (mercadolivre.com.br ou mercadolibre.com)'
    }

    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateUrl(url)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    const result = await onAdd(url)
    
    if (result.success) {
      setUrl('')
    }
  }

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setError('') // Clear error when user starts typing
  }

  const handlePaste = async (e) => {
    const pastedText = e.clipboardData.getData('text')
    const urlError = validateUrl(pastedText)
    if (!urlError) {
      setUrl(pastedText)
      setError('')
    }
  }

  return (
    <div className="rounded-2xl shadow-xl p-8 mb-10 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Adicionar Novo Produto
          </h2>
          <p className="text-sm text-gray-600">
            Cole a URL do Mercado Livre para começar o monitoramento
          </p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Input */}
          <div className="flex-1 relative group">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              🔗 URL do Produto
            </label>
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                onPaste={handlePaste}
                placeholder="https://www.mercadolivre.com.br/seu-produto..."
                disabled={adding}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-200 hover:border-indigo-300 font-medium"
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding || !url.trim()}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white active:scale-95 transform hover:scale-105 w-full sm:w-auto"
            >
              {adding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adicionando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Monitorar</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 mt-5 p-4 rounded-xl bg-red-50 border-2 border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">ℹ️ Informações Importantes:</p>
              <p>✅ Backend: <strong>http://localhost:8081</strong></p>
              <p>✅ Scraper Python: <strong>http://localhost:8000</strong></p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
