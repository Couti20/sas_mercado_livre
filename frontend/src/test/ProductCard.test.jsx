import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

// Helper para renderizar componentes com providers
const renderWithProviders = (component, { user = null, token = null } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, token, login: () => {}, logout: () => {} }}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Produto Teste de Exemplo',
    url: 'https://mercadolivre.com.br/produto-123',
    imageUrl: 'https://example.com/image.jpg',
    currentPrice: 99.90,
    lastPrice: null,
    notifyOnPriceDrop: true,
    notifyOnPriceIncrease: false
  }

  it('deve renderizar o nome do produto', () => {
    renderWithProviders(
      <ProductCard 
        product={mockProduct} 
        onDelete={() => {}} 
        onShowHistory={() => {}}
        onUpdateProduct={() => {}}
      />
    )

    expect(screen.getByText('Produto Teste de Exemplo')).toBeInTheDocument()
  })

  it('deve mostrar o preço atual formatado', () => {
    renderWithProviders(
      <ProductCard 
        product={mockProduct} 
        onDelete={() => {}} 
        onShowHistory={() => {}}
        onUpdateProduct={() => {}}
      />
    )

    expect(screen.getByText('R$ 99.90')).toBeInTheDocument()
  })

  it('deve mostrar badge de queda quando preço caiu', () => {
    const productWithDrop = {
      ...mockProduct,
      currentPrice: 79.90,
      lastPrice: 99.90
    }

    renderWithProviders(
      <ProductCard 
        product={productWithDrop} 
        onDelete={() => {}} 
        onShowHistory={() => {}}
        onUpdateProduct={() => {}}
      />
    )

    // Deve mostrar a porcentagem de queda (-20%)
    expect(screen.getByText(/🔥/)).toBeInTheDocument()
  })

  it('deve mostrar badge de aumento quando preço subiu', () => {
    const productWithIncrease = {
      ...mockProduct,
      currentPrice: 119.90,
      lastPrice: 99.90
    }

    renderWithProviders(
      <ProductCard 
        product={productWithIncrease} 
        onDelete={() => {}} 
        onShowHistory={() => {}}
        onUpdateProduct={() => {}}
      />
    )

    // Deve mostrar o emoji de aumento
    expect(screen.getByText(/📈/)).toBeInTheDocument()
  })

  it('não deve mostrar badge quando não há variação de preço', () => {
    renderWithProviders(
      <ProductCard 
        product={mockProduct} 
        onDelete={() => {}} 
        onShowHistory={() => {}}
        onUpdateProduct={() => {}}
      />
    )

    // Não deve ter emojis de variação (produto sem lastPrice)
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
  })
})
