'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Navbar } from '../../../components/Navbar';
import { ProductModal, Product } from '../../../components/ProductModal';
import { api } from '../../../lib/api';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  Filter,
  Loader2,
  ShieldAlert,
  XCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/products', {
        params: { search: searchQuery },
      });
      setProducts(res.data);
    } catch (err: any) {
      toast.error('Failed to load inventory products');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'ADMIN') {
        router.replace('/pos');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  // Product CRUD Handlers
  const handleSaveProduct = async (productData: Product) => {
    try {
      if (editingProduct?.id) {
        // Update
        const res = await api.patch(`/products/${editingProduct.id}`, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.data : p))
        );
        toast.success(`Updated product ${res.data.name}`);
      } else {
        // Create
        const res = await api.post('/products', productData);
        setProducts((prev) => [res.data, ...prev]);
        toast.success(`Created product ${res.data.name}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save product';
      toast.error(msg);
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const target = products.find((p) => p.id === id);
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      toast.success(`Deleted ${target?.name || 'product'} from inventory`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Filter products by stock filter state
  const filteredProducts = products.filter((p) => {
    if (filterStock === 'LOW') return p.stockQuantity > 0 && p.stockQuantity <= 5;
    if (filterStock === 'OUT') return p.stockQuantity <= 0;
    return true;
  });

  // Calculate Summary Metrics
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <Loader2 className="w-9 h-9 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Authenticating Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Inventory Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage product pricing, SKU barcodes, and real-time stock levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
              title="Refresh Catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
            </button>
          </div>
        </div>

        {/* Dynamic Header Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Products
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {totalProducts}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Catalog items</p>
            </div>
          </div>

          {/* Card 2: Inventory Value */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Inventory Valuation
              </p>
              <h3 className="text-xl xl:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                Rs. {totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold whitespace-nowrap">
                <TrendingUp className="w-3 h-3 shrink-0" /> Live Stock Valuation
              </p>
            </div>
          </div>

          {/* Card 3: Low Stock Alert */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Low Stock Alert (≤ 5)
              </p>
              <h3 className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
                {lowStockCount}
              </h3>
              <p className="text-[11px] text-amber-500">Requires reordering</p>
            </div>
          </div>

          {/* Card 4: Out of Stock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Out of Stock
              </p>
              <h3 className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">
                {outOfStockCount}
              </h3>
              <p className="text-[11px] text-rose-500">Unavailable for POS</p>
            </div>
          </div>
        </div>

        {/* Filter and Live Search Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product catalog by name or SKU barcode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterStock('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStock === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilterStock('LOW')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStock === 'LOW'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterStock('OUT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStock === 'OUT'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">SKU / Code</th>
                  <th className="py-4 px-6 text-right">Price (Rs.)</th>
                  <th className="py-4 px-6 text-center">Stock Quantity</th>
                  <th className="py-4 px-6 text-center">Stock Status</th>
                  <th className="py-4 px-6 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {loading ? (
                  /* Shimmer Skeleton Rows */
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="py-4 px-6">
                        <div className="w-full h-8 rounded-lg skeleton-shimmer" />
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-mono text-xs">
                      No products found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isOut = product.stockQuantity <= 0;
                    const isLow = product.stockQuantity > 0 && product.stockQuantity <= 5;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                          {product.name}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {product.sku}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                          Rs. {product.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-extrabold text-slate-900 dark:text-slate-100">
                          {product.stockQuantity}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isOut
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : isLow
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              }`}
                          >
                            {isOut ? (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Out of Stock
                              </>
                            ) : isLow ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {deleteConfirmId === product.id ? (
                              <div className="flex items-center gap-1.5 animate-fadeIn">
                                <button
                                  onClick={() => handleDeleteProduct(product.id!)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-md"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(product.id!)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over Modal for Product Create / Edit */}
      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
