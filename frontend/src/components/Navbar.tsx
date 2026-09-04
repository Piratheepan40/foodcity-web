'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShoppingBag, Package, Receipt, LogOut,
  User as UserIcon, Shield, Moon, Sun,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isDark = theme === 'dark';
  const username = user.email ? user.email.split('@')[0] : 'User';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        { }
        <Link href={isAdmin ? '/admin/products' : '/pos'} className="flex items-center gap-3 group">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                FoodCity<span className="text-emerald-500">POS</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Supermarket Inventory</p>
          </div>
        </Link>

        {/* Nav Links  */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          {!isAdmin && (
            <Link
              href="/pos"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${pathname === '/pos'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Billing
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${pathname === '/admin/products'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Package className="w-4 h-4" />
                Products & Inventory
              </Link>

              <Link
                href="/admin/orders"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${pathname === '/admin/orders'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Receipt className="w-4 h-4" />
                All Bills
              </Link>
            </>
          )}
        </nav>

        { }
        <div className="flex items-center gap-3">

          { }
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-all duration-200 active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          { }
          <div className="flex items-center gap-3 p-1.5 pl-2 pr-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
            { }
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-sm uppercase ${isAdmin
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950'
                }`}>
                {username.substring(0, 2)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
            </div>

            {/* Account Details */}
            <div className="hidden sm:block text-left pr-1">
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 capitalize leading-tight truncate max-w-[120px]">
                {username}
              </p>
              <div className="mt-0.5">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    <Shield className="w-2.5 h-2.5" /> ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <UserIcon className="w-2.5 h-2.5" /> CASHIER
                  </span>
                )}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/80" />

            {/* Logout Action Button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
