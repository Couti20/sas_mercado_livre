import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import Header from './components/Header'
import AddProduct from './components/AddProduct'
import ProductList from './components/ProductList'
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'
import PriceHistoryModal from './components/PriceHistoryModal'

// API URL - pode ser customizado via variável de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Theme Context
const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

// Toast Context
const ToastContext = createContext()
export const useToast = () => useContext(ToastContext)

function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : true
  })

  // Products state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adding, setAdding] = useState(false)

  // Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')

  // Toast state
  const [toasts, setToasts] = useState([])

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, productId: null, productName: '' })
  const [priceHistoryModal, setPriceHistoryModal] = useState({ open: false, product: null })

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Toast functions
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Fetch products com retry logic
  const fetchProducts = async (retries = 3) => {
    try {
      console.log(`[INFO] Fetching products from: ${API_URL}/api/products`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
      
      const response = await fetch(`${API_URL}/api/products`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
      console.log(`[SUCCESS] Fetched ${data.length} products`)
    } catch (error) {
      console.error('[ERROR] Erro ao buscar produtos:', error.message)
      
      // Retry logic
      if (retries > 0 && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
        console.log(`[RETRY] Tentando novamente... (${3 - retries + 1}/3)`)
        setTimeout(() => fetchProducts(retries - 1), 1000)
        return
      }
      
      addToast(
        'Erro ao carregar produtos. Verifique se o Backend está rodando em ' + API_URL,
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Add product com melhor validação
  const addProduct = async (url) => {
    // Validação client-side
    try {
      new URL(url)
    } catch {
      addToast('URL inválida. Use um endereço completo (https://...)', 'error')
      return { success: false }
    }

    setAdding(true)
    try {
      console.log(`[INFO] Adding product from URL: ${url}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout para scraping
      
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      clearTimeout(timeoutId)
      
      const responseData = await response.json()
      
      if (response.ok) {
        console.log(`[SUCCESS] Product added: ${responseData.name}`)
        addToast(`✅ "${responseData.name}" adicionado com sucesso!`, 'success')
        fetchProducts()
        return { success: true }
      } else {
        const errorMsg = responseData.error || 'Erro desconhecido'
        const details = responseData.details || ''
        console.error(`[ERROR] ${errorMsg} - ${details}`)
        
        if (errorMsg.includes('scraper')) {
          addToast('❌ Scraper Python não está rodando. Inicie em outro terminal com: python main.py', 'error')
        } else if (errorMsg.includes('valid')) {
          addToast('❌ URL inválida ou produto não encontrado no Mercado Livre', 'error')
        } else {
          addToast(`❌ ${errorMsg}`, 'error')
        }
        return { success: false }
      }
    } catch (error) {
      console.error('[ERROR] Exception ao adicionar produto:', error)
      
      if (error.name === 'AbortError') {
        addToast('❌ Timeout ao scraper. URL muito lenta ou scraper não responde.', 'error')
      } else if (error.message.includes('Failed to fetch')) {
        addToast(`❌ Não conseguiu conectar ao Backend em ${API_URL}`, 'error')
      } else {
        addToast('❌ Erro ao adicionar produto. Tente novamente.', 'error')
      }
      return { success: false }
    } finally {
      setAdding(false)
    }
  }

  // Delete product
  const handleDeleteClick = (id, name) => {
    setConfirmModal({ open: true, productId: id, productName: name })
  }

  const confirmDelete = async () => {
    const { productId, productName } = confirmModal
    try {
      console.log(`[INFO] Deleting product: ${productId}`)
      
      const response = await fetch(`${API_URL}/api/products/${productId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      console.log(`[SUCCESS] Product deleted: ${productName}`)
      addToast(`✅ "${productName}" removido com sucesso`, 'success')
      fetchProducts()
    } catch (error) {
      console.error('[ERROR] Erro ao deletar produto:', error)
      addToast('❌ Erro ao remover produto', 'error')
    } finally {
      setConfirmModal({ open: false, productId: null, productName: '' })
    }
  }

  // Refresh prices
  const refreshPrices = async () => {
    setRefreshing(true)
    try {
      console.log(`[INFO] Refreshing prices manually`)
      
      const response = await fetch(`${API_URL}/api/products/refresh`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      addToast('🔄 Preços sendo atualizados...', 'info')
      console.log('[SUCCESS] Price refresh triggered')
      
      // Espera um pouco e recarrega
      setTimeout(() => {
        fetchProducts()
        setRefreshing(false)
      }, 2000)
    } catch (error) {
      console.error('[ERROR] Erro ao atualizar preços:', error)
      addToast('❌ Erro ao atualizar preços', 'error')
      setRefreshing(false)
    }
  }

  // Show price history
  const showPriceHistory = (product) => {
    setPriceHistoryModal({ open: true, product })
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterBy === 'priceDropped' && !(product.lastPrice && product.currentPrice < product.lastPrice)) {
        return false
      }
      if (filterBy === 'priceUp' && !(product.lastPrice && product.currentPrice > product.lastPrice)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.currentPrice - b.currentPrice
        case 'priceDesc':
          return b.currentPrice - a.currentPrice
        case 'priceChange':
          const changeA = a.lastPrice ? ((a.currentPrice - a.lastPrice) / a.lastPrice) : 0
          const changeB = b.lastPrice ? ((b.currentPrice - b.lastPrice) / b.lastPrice) : 0
          return changeA - changeB
        default:
          return 0
      }
    })

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <ToastContext.Provider value={{ addToast }}>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <Header 
            onRefresh={refreshPrices} 
            refreshing={refreshing}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <AddProduct onAdd={addProduct} adding={adding} />
            <ProductList 
              products={filteredProducts}
              totalProducts={products.length}
              loading={loading} 
              onDelete={handleDeleteClick}
              onShowHistory={showPriceHistory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
            />
          </main>

          {/* Toast Container */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
              <Toast 
                key={toast.id} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => removeToast(toast.id)} 
              />
            ))}
          </div>

          {/* Confirm Delete Modal */}
          <ConfirmModal
            open={confirmModal.open}
            title="Remover Produto"
            message={`Tem certeza que deseja remover "${confirmModal.productName}"?`}
            onConfirm={confirmDelete}
            onCancel={() => setConfirmModal({ open: false, productId: null, productName: '' })}
          />

          {/* Price History Modal */}
          <PriceHistoryModal
            open={priceHistoryModal.open}
            product={priceHistoryModal.product}
            onClose={() => setPriceHistoryModal({ open: false, product: null })}
          />
        </div>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
