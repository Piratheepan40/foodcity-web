'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { ReceiptModal, OrderReceipt } from '../../components/ReceiptModal';
import { api } from '../../lib/api';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Printer,
  Tag,
  Loader2,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Command,
} from 'lucide-react';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Category definition for foodcity products simulation
const CATEGORIES = [
  { id: 'ALL', label: 'All Items', icon: '🛒' },
  { id: 'BAKERY', label: 'Bakery & Snacks', icon: '🍞' },
  { id: 'DAIRY', label: 'Dairy & Eggs', icon: '🥛' },
  { id: 'BEVERAGES', label: 'Beverages', icon: '🧃' },
  { id: 'PANTRY', label: 'Pantry & Grains', icon: '🌾' },
  { id: 'HOUSEHOLD', label: 'Household', icon: '🧹' },
];

export default function POSTerminalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderReceipt | null>(null);

  // Keyboard shortcut listener for Ctrl+K auto-focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch product catalog
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await api.get('/products', {
        params: { search: searchQuery },
      });
      setProducts(res.data);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  // Helper to categorize products by name keywords
  const getProductCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || lower.includes('egg') || lower.includes('curd')) return 'DAIRY';
    if (lower.includes('bread') || lower.includes('bun') || lower.includes('biscuit') || lower.includes('cake') || lower.includes('snack') || lower.includes('chips')) return 'BAKERY';
    if (lower.includes('juice') || lower.includes('drink') || lower.includes('water') || lower.includes('tea') || lower.includes('coffee') || lower.includes('soda')) return 'BEVERAGES';
    if (lower.includes('rice') || lower.includes('flour') || lower.includes('sugar') || lower.includes('oil') || lower.includes('dhal') || lower.includes('salt')) return 'PANTRY';
    if (lower.includes('soap') || lower.includes('detergent') || lower.includes('cleaner') || lower.includes('tissue') || lower.includes('wash')) return 'HOUSEHOLD';
    return 'PANTRY';
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return getProductCategory(p.name) === selectedCategory;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is currently Out of Stock!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.warning(`Cannot exceed available stock (${product.stockQuantity})`);
          return prevCart;
        }
        toast.success(`Updated ${product.name} quantity`);
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success(`Added ${product.name} to cart`);
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              toast.warning(`Stock limit reached (${item.product.stockQuantity})`);
              return item;
            }
            if (newQty <= 0) {
              toast.info(`Removed ${item.product.name} from cart`);
              return null;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) toast.info(`Removed ${item.product.name}`);
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setCart([]);
      toast.info('Cart cleared');
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    for (const item of cart) {
      if (item.quantity > item.product.stockQuantity) {
        const msg = `Stock deficit for ${item.product.name}. Available: ${item.product.stockQuantity}`;
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
    }

    try {
      setCheckoutLoading(true);
      setErrorMsg(null);

      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder: OrderReceipt = res.data;

      setCompletedOrder(createdOrder);
      clearCart();
      toast.success('Order processed successfully!');
      await fetchProducts(); // Refresh stock inventory dynamically
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 gap-3">
        <Loader2 className="w-9 h-9 text-emerald-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Initializing Billing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar />

      {/* Main Terminal Grid */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Section: Catalog & Filter Controls (7 cols on lg, 8 on xl) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-5">
          {/* Header Controls: Live Search & Refresh */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm dark:shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar with Ctrl+K shortcut indicator */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Instant live search by item name or SKU..."
                  className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                  <Command className="w-3 h-3" /> K
                </div>
              </div>

              {/* Refresh Catalog button */}
              <button
                onClick={fetchProducts}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Catalog
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="flex-1 overflow-y-auto min-h-[480px] pr-1">
            {loadingProducts ? (
              /* Shimmer Skeletons */
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-52 rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-full h-24 rounded-xl skeleton-shimmer" />
                    <div className="w-3/4 h-4 rounded skeleton-shimmer" />
                    <div className="w-1/2 h-3 rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500 space-y-3 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 bg-white/50 dark:bg-slate-900/30">
                <Package className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No products found</p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Try adjusting your search terms or category filter, or add new products in the Admin portal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stockQuantity <= 0;
                  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
                  const cartItem = cart.find((i) => i.product.id === product.id);
                  const qtyInCart = cartItem ? cartItem.quantity : 0;
                  const category = CATEGORIES.find((c) => c.id === getProductCategory(product.name)) || CATEGORIES[1];

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`group relative rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border cursor-pointer ${isOutOfStock
                          ? 'border-slate-200 dark:border-slate-800/40 bg-slate-100/60 dark:bg-slate-950/40 opacity-60 cursor-not-allowed'
                          : qtyInCart > 0
                            ? 'border-emerald-500/80 bg-emerald-500/5 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                      {/* Cart Quantity Badge */}
                      {qtyInCart > 0 && (
                        <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-950 animate-fadeIn">
                          {qtyInCart}
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Top Thumbnail Header / Category Icon Placeholder */}
                        <div className="w-full h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-3xl shadow-inner relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                          <span className="select-none filter drop-shadow">{category.icon}</span>
                          <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                            {product.sku}
                          </span>
                        </div>

                        {/* Product Title */}
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {/* Stock Badge & Price Tag */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : isLowStock
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              }`}
                          >
                            {isOutOfStock ? (
                              <>
                                <XCircle className="w-3 h-3" /> Out of Stock
                              </>
                            ) : isLowStock ? (
                              <>
                                <AlertCircle className="w-3 h-3" /> Low ({product.stockQuantity})
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> In Stock ({product.stockQuantity})
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                            Rs. {product.price.toFixed(2)}
                          </span>

                          <button
                            disabled={isOutOfStock}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${isOutOfStock
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                              }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Section: Sticky Cart & Checkout Sidebar (5 cols on lg, 4 on xl) */}
        <section className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-3xl shadow-xl p-5 flex flex-col self-start sticky top-24 max-h-[calc(100vh-120px)] transition-colors duration-300">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Current Cart</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} total items
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>

          {/* Cart Error Banner */}
          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-fadeIn shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Itemized List */}
          <div className="overflow-y-auto py-3 space-y-2.5 max-h-[360px] pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cart is empty</p>
                <p className="text-xs text-center text-slate-400 max-w-[220px]">
                  Click products in the grid catalog to build customer order.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Rs. {item.product.price.toFixed(2)}</span>
                      <span>• SKU: {item.product.sku}</span>
                    </div>
                  </div>

                  {/* Qty Counter Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 text-right font-mono font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Billing Breakdown & Checkout Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 shrink-0">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" /> Discount (Rs.)
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2.5 py-1 text-right bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-slate-100">
                <span>Grand Total</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Glowing Prominent "Complete & Print Receipt" Primary CTA */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl glow-emerald transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Printer className="w-5 h-5" /> Complete & Print Receipt
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Clean Thermal Receipt Modal */}
      <ReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}
