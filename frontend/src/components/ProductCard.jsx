import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import PriceHistoryModal from './PriceHistoryModal'

export default function ProductCard({ product, onDelete, onShowHistory }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const priceChange = product.lastPrice 
    ? ((product.currentPrice - product.lastPrice) / product.lastPrice * 100).toFixed(1)
    : 0
  const isPriceDropped = priceChange < 0
  const priceChangeIcon = isPriceDropped ? '📉' : '📈'

  return (
    <>
      <div className="rounded-2xl shadow-lg hover:shadow-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:-translate-y-1 group">
        {/* Price Badge */}
        {isPriceDropped && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 text-center font-bold text-sm">
            🎉 PREÇO CAIU {Math.abs(priceChange)}%
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {/* Header com delete */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-base font-bold text-gray-900 hover:text-indigo-600 line-clamp-2 transition-colors group-hover:text-indigo-500"
              >
                {product.name}
              </a>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-red-50 transition-all duration-300 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer hover:scale-110 active:scale-95"
              title="Deletar produto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Price Info Section */}
          <div className={`mb-5 p-4 rounded-xl transition-all duration-300 ${
            isPriceDropped 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
          }`}>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Preço Atual</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                R$ {product.currentPrice?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            {product.lastPrice && (
              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-700">
                  <span className="font-semibold">Último:</span> R$ {product.lastPrice.toFixed(2)}
                </span>
                <span className={`font-bold text-lg flex items-center gap-1 ${
                  isPriceDropped ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceChangeIcon} {Math.abs(priceChange)}%
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Histórico
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visitar
            </a>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Deletar Produto?"
          message={`Tem certeza que deseja deletar "${product.name}"?`}
          onConfirm={() => {
            onDelete(product.id, product.name)
            setShowDeleteConfirm(false)
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showHistory && (
        <PriceHistoryModal
          open={showHistory}
          product={product}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}
