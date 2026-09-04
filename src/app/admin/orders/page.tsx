'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Navbar } from '../../../components/Navbar';
import { ReceiptModal, OrderReceipt } from '../../../components/ReceiptModal';
import { api } from '../../../lib/api';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  User,
  Loader2,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<OrderReceipt | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const msg = err.response?.data?.message || 'Failed to load transaction history';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cashier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalesRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalSalesRevenue / orders.length : 0;

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Transaction History & Bills
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review completed POS sales, audit cashier transactions, and reprint receipts.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Sales History
          </button>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Orders Processed
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {orders.length}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Completed transactions</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Gross Sales Volume
              </p>
              <h3 className="text-xl xl:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                Rs. {totalSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold whitespace-nowrap">
                <TrendingUp className="w-3 h-3 shrink-0" /> Total Revenue Collected
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Average Order Value
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                Rs. {avgOrderValue.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400">Per transaction</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID hash or Cashier email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Cashier Staff</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6 text-center">Items Count</th>
                  <th className="py-4 px-6 text-right">Total Amount</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="py-4 px-6">
                        <div className="w-full h-8 rounded-lg skeleton-shimmer" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-mono text-xs">
                      No order records found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                    const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {order.id.slice(0, 18)}...
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            <User className="w-4 h-4" />
                            {order.cashier.email}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs font-mono">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-6 text-center font-extrabold text-slate-900 dark:text-slate-100">
                          {itemCount} items
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          Rs. {order.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 transition-all shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5" /> View Receipt
                          </button>
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

      {/* Modal for viewing receipt */}
      <ReceiptModal
        order={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
