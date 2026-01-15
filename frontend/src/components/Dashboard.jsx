import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProducts, addProduct as apiAddProduct, deleteProduct as apiDeleteProduct, refreshPrices as apiRefreshPrices } from '../api/products';

import Header from './Header';
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';
import PriceHistoryModal from './PriceHistoryModal';
import useToasts from '../hooks/useToasts';

export default function Dashboard() {
    const queryClient = useQueryClient();
    const { toasts, addToast, removeToast } = useToasts();

    // State for UI controls
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterBy, setFilterBy] = useState('all');
    const [confirmModal, setConfirmModal] = useState({ open: false, productId: null, productName: '' });
    const [priceHistoryModal, setPriceHistoryModal] = useState({ open: false, product: null });
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    // --- React Query ---

    // Query for fetching products
    const { data: products = [], isLoading: isLoadingProducts, isError: isFetchError } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Update last update time when products are fetched
    useEffect(() => {
        if (products.length > 0) {
            const now = new Date();
            setLastUpdateTime(now);
        }
    }, [products]);

    // Mutation for adding a product
    const { mutate: addProduct, isPending: isAddingProduct } = useMutation({
        mutationFn: apiAddProduct,
        onSuccess: (newProduct) => {
            addToast(`✅ "${newProduct.name}" adicionado com sucesso!`, 'success');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            addToast(`❌ ${error.message}`, 'error');
        },
    });

    // Mutation for deleting a product
    const { mutate: deleteProduct } = useMutation({
        mutationFn: apiDeleteProduct,
        onSuccess: (_, variables) => {
            // `variables` is the productId passed to the mutate function
            const productName = products.find(p => p.id === variables)?.name || 'Produto';
            addToast(`✅ "${productName}" removido com sucesso.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            addToast(`❌ ${error.message}`, 'error');
        },
        onSettled: () => {
            setConfirmModal({ open: false, productId: null, productName: '' });
        }
    });

    // Mutation for refreshing prices
    const { mutate: refreshPrices, isPending: isRefreshing } = useMutation({
        mutationFn: apiRefreshPrices,
        onSuccess: () => {
            addToast('🔄 Preços sendo atualizados em segundo plano...', 'info');
            // Wait a bit for the backend to process, then refetch
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['products'] });
            }, 5000);
        },
        onError: (error) => {
            addToast(`❌ ${error.message}`, 'error');
        }
    });


    // --- Event Handlers ---

    const handleAddProduct = (url) => {
        try {
            new URL(url);
            addToast('⏳ Adicionando produto... Isso pode levar alguns segundos.', 'info');
            addProduct(url);
            return { success: true };
        } catch {
            addToast('URL inválida. Use um endereço completo (https://...)', 'error');
            return { success: false };
        }
    };

    const handleDeleteClick = (id, name) => {
        setConfirmModal({ open: true, productId: id, productName: name });
    };

    const confirmDelete = () => {
        if (confirmModal.productId) {
            deleteProduct(confirmModal.productId);
        }
    };

    // Handle manual refresh - update time immediately and then trigger refresh
    const handleRefreshClick = () => {
        // Update the time immediately for visual feedback
        setLastUpdateTime(new Date());
        // Then trigger the actual refresh
        refreshPrices();
    };

    // Format last update time
    const formatUpdateTime = () => {
        if (!lastUpdateTime) return '';
        const hours = String(lastUpdateTime.getHours()).padStart(2, '0');
        const minutes = String(lastUpdateTime.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // --- Derived State (Filtering and Sorting) ---

    const filteredAndSortedProducts = useMemo(() => {
        return products
            .filter(product => {
                if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
                if (filterBy === 'priceDropped' && !(product.lastPrice && product.currentPrice < product.lastPrice)) {
                    return false;
                }
                if (filterBy === 'priceUp' && !(product.lastPrice && product.currentPrice > product.lastPrice)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price':
                        return a.currentPrice - b.currentPrice;
                    case 'priceDesc':
                        return b.currentPrice - a.currentPrice;
                    case 'priceChange':
                        const changeA = a.lastPrice ? ((a.currentPrice - a.lastPrice) / a.lastPrice) : 0;
                        const changeB = b.lastPrice ? ((b.currentPrice - b.lastPrice) / b.lastPrice) : 0;
                        return changeA - changeB;
                    default:
                        return 0;
                }
            });
    }, [products, searchTerm, filterBy, sortBy]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Header
                onRefresh={refreshPrices}
                refreshing={isRefreshing}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            <main className="min-h-[calc(100vh-80px)]">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    
                    {/* Stats Bar */}
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Products */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Total Produtos</p>
                                    <p className="text-white font-bold text-xl">{products.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Price Drops */}
                        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📉</span>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Preços em Queda</p>
                                    <p className="text-emerald-400 font-bold text-xl">
                                        {products.filter(p => p.lastPrice && p.currentPrice < p.lastPrice).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Price Ups */}
                        <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📈</span>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Preços Subindo</p>
                                    <p className="text-red-400 font-bold text-xl">
                                        {products.filter(p => p.lastPrice && p.currentPrice > p.lastPrice).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Last Update */}
                        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🕐</span>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Última Atualização</p>
                                    <p className="text-amber-400 font-bold text-xl">
                                        {lastUpdateTime ? formatUpdateTime() : '--:--'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Bar */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                                🔄
                            </div>
                            <div>
                                <p className="text-white font-semibold">Atualização de Preços</p>
                                <p className="text-slate-400 text-sm">
                                    {isRefreshing 
                                        ? 'Buscando preços no Mercado Livre...' 
                                        : 'Clique para buscar os preços mais recentes'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleRefreshClick}
                            disabled={isRefreshing}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-amber-500/25"
                        >
                            {isRefreshing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Atualizando...
                                </>
                            ) : (
                                <>🔄 Atualizar Agora</>
                            )}
                        </button>
                    </div>

                    <AddProduct onAdd={handleAddProduct} adding={isAddingProduct} />
                    
                    {isFetchError && (
                         <div className="rounded-2xl shadow-lg p-8 text-center bg-red-500/10 border border-red-500/30 text-red-400">
                           <h3 className="text-xl font-semibold mb-2">❌ Erro ao Carregar Produtos</h3>
                           <p>Não foi possível buscar os dados. Verifique a conexão com o servidor.</p>
                         </div>
                    )}

                    <ProductList
                        products={filteredAndSortedProducts}
                        totalProducts={products.length}
                        loading={isLoadingProducts}
                        onDelete={handleDeleteClick}
                        onShowHistory={(product) => setPriceHistoryModal({ open: true, product })}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        filterBy={filterBy}
                        onFilterChange={setFilterBy}
                    />
                </div>
            </main>

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

            <ConfirmModal
                open={confirmModal.open}
                title="Remover Produto"
                message={`Tem certeza que deseja remover "${confirmModal.productName}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmModal({ open: false, productId: null, productName: '' })}
            />

            <PriceHistoryModal
                open={priceHistoryModal.open}
                product={priceHistoryModal.product}
                onClose={() => setPriceHistoryModal({ open: false, product: null })}
            />
        </div>
    );
}