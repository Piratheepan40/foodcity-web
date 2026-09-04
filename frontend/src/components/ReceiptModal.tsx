'use client';

import React from 'react';
import { Printer, CheckCircle2, X, Store, Calendar, Clock, User, Hash } from 'lucide-react';

export interface OrderItemReceipt {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    sku: string;
  };
}

export interface OrderReceipt {
  id: string;
  totalAmount: number;
  createdAt: string;
  cashier: {
    email: string;
    role: string;
  };
  items: OrderItemReceipt[];
}

interface ReceiptModalProps {
  order: OrderReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn no-print-bg">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 no-print">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" /> Transaction Processed
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container (Targeted for Printing) */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-slate-900 text-slate-200" id="printable-receipt">
          {/* Store Branding */}
          <div className="text-center pb-4 border-b border-dashed border-slate-700/80 space-y-1">
            <h2 className="text-base font-bold tracking-tight text-slate-100 uppercase">FOODCITY SUPERMARKET</h2>
            <p className="text-[11px] text-slate-400">Galle Road, Colombo 03, Sri Lanka</p>
            <p className="text-[11px] text-slate-400">Tel: +94 (11) 255-FOODCITY</p>
          </div>

          {/* Meta Details */}
          <div className="py-4 border-b border-dashed border-slate-700/80 space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-slate-400"><Hash className="w-3 h-3" /> Order ID:</span>
              <span className="font-bold text-slate-100 truncate max-w-[180px]">{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-slate-400"><Calendar className="w-3 h-3" /> Date:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> Time:</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-slate-400"><User className="w-3 h-3" /> Cashier:</span>
              <span className="font-semibold text-emerald-400">{order.cashier.email}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-4 border-b border-dashed border-slate-700/80">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2 font-normal">Item</th>
                  <th className="pb-2 text-center font-normal">Qty</th>
                  <th className="pb-2 text-right font-normal">Price</th>
                  <th className="pb-2 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-slate-200">
                    <td className="py-2 pr-2 font-sans font-medium text-slate-100">
                      <div>{item.product.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.product.sku}</div>
                    </td>
                    <td className="py-2 text-center font-bold text-emerald-400">{item.quantity}</td>
                    <td className="py-2 text-right text-slate-400">Rs. {item.price.toFixed(2)}</td>
                    <td className="py-2 text-right font-semibold text-slate-100">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="py-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm font-bold text-slate-100">
              <span>GRAND TOTAL</span>
              <span className="text-base text-emerald-400 font-bold">Rs. {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="pt-4 text-center border-t border-dashed border-slate-700/80 text-[10px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Thank you for shopping at FoodCity!</p>
            <p>Please keep this receipt for returns within 7 days.</p>
            <p className="text-slate-500 pt-1 font-mono">*** FoodCity Supermarket POS ***</p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
