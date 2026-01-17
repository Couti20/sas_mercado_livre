import { describe, it, expect } from 'vitest'

/**
 * Testes de utilitários e funções auxiliares
 */

describe('Formatação de Preços', () => {
  const formatPrice = (price) => {
    if (price == null) return 'R$ 0.00'
    return `R$ ${price.toFixed(2)}`
  }

  it('deve formatar preço corretamente', () => {
    expect(formatPrice(99.90)).toBe('R$ 99.90')
    expect(formatPrice(1234.56)).toBe('R$ 1234.56')
    expect(formatPrice(0)).toBe('R$ 0.00')
  })

  it('deve retornar R$ 0.00 para valores nulos', () => {
    expect(formatPrice(null)).toBe('R$ 0.00')
    expect(formatPrice(undefined)).toBe('R$ 0.00')
  })
})

describe('Cálculo de Variação de Preço', () => {
  const calculatePriceChange = (currentPrice, lastPrice) => {
    if (!lastPrice || lastPrice === 0) return 0
    return ((currentPrice - lastPrice) / lastPrice * 100).toFixed(1)
  }

  it('deve calcular queda de preço corretamente', () => {
    expect(calculatePriceChange(80, 100)).toBe('-20.0')
    expect(calculatePriceChange(90, 100)).toBe('-10.0')
  })

  it('deve calcular aumento de preço corretamente', () => {
    expect(calculatePriceChange(120, 100)).toBe('20.0')
    expect(calculatePriceChange(110, 100)).toBe('10.0')
  })

  it('deve retornar 0 quando não há preço anterior', () => {
    expect(calculatePriceChange(100, null)).toBe(0)
    expect(calculatePriceChange(100, 0)).toBe(0)
  })

  it('deve retornar 0 quando preços são iguais', () => {
    expect(calculatePriceChange(100, 100)).toBe('0.0')
  })
})

describe('Validação de URL do Mercado Livre', () => {
  const isValidMercadoLivreUrl = (url) => {
    if (!url) return false
    const patterns = [
      /mercadolivre\.com\.br/i,
      /mercadolibre\.com/i,
      /produto\.mercadolivre/i
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  it('deve aceitar URLs válidas do Mercado Livre', () => {
    expect(isValidMercadoLivreUrl('https://www.mercadolivre.com.br/produto-123')).toBe(true)
    expect(isValidMercadoLivreUrl('https://produto.mercadolivre.com.br/MLB-123')).toBe(true)
    expect(isValidMercadoLivreUrl('https://www.mercadolibre.com.ar/item')).toBe(true)
  })

  it('deve rejeitar URLs inválidas', () => {
    expect(isValidMercadoLivreUrl('https://amazon.com.br/produto')).toBe(false)
    expect(isValidMercadoLivreUrl('https://google.com')).toBe(false)
    expect(isValidMercadoLivreUrl('')).toBe(false)
    expect(isValidMercadoLivreUrl(null)).toBe(false)
  })
})
