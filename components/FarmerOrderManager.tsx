
import React, { useState } from 'react';
import { Order, OrderStatus, User, UserRole } from '../types';
import { Language, translations } from '../translations';
import RatingModal from './RatingModal';

interface FarmerOrderManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onRateTransaction: (orderId: string, score: number, comment: string) => void;
  currentUser: User;
  language: Language;
}

const FarmerOrderManager: React.FC<FarmerOrderManagerProps> = ({ 
  orders, 
  onUpdateStatus, 
  onRateTransaction,
  currentUser,
  language 
}) => {
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const t = translations[language];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PLACED: return 'bg-blue-100 text-blue-700';
      case OrderStatus.PACKED: return 'bg-amber-100 text-amber-700';
      case OrderStatus.DISPATCHED: return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    const sequence = [OrderStatus.PLACED, OrderStatus.PACKED, OrderStatus.DISPATCHED, OrderStatus.DELIVERED];
    const index = sequence.indexOf(status);
    return index < sequence.length - 1 ? sequence[index + 1] : null;
  };

  const isFarmer = currentUser.role === UserRole.FARMER;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isFarmer ? 'Dispatch Queue' : 'Purchase Journey'}</h3>
            <p className="text-sm text-slate-500 mt-1">{isFarmer ? 'Monitor your fulfillment workflow and release escrow.' : 'Real-time tracking for your procurement items.'}</p>
          </div>
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Active</p>
             <p className="text-xl font-black text-slate-800">{orders.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">ID / Timeline</th>
                <th className="px-8 py-6">Product & Counterparty</th>
                <th className="px-8 py-6">Volume & Value</th>
                <th className="px-8 py-6">Status Tracker</th>
                <th className="px-8 py-6 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(order => {
                const next = getNextStatus(order.status);
                const hasRated = isFarmer ? order.isRatedByFarmer : order.isRatedByBuyer;
                const canRate = order.status === OrderStatus.DELIVERED && !hasRated;
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-mono text-[10px] font-black text-slate-400 mb-1">ORDER_{order.id.slice(-6).toUpperCase()}</p>
                      <button 
                        onClick={() => setTrackingOrder(order)}
                        className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest"
                      >
                        Track Map
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 text-lg tracking-tight mb-1">{order.cropName}</p>
                      <div className="flex items-center gap-2">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${isFarmer ? order.buyerName : order.farmerId}`} className="w-4 h-4 rounded-full" alt="avatar" />
                         <p className="text-xs font-bold text-slate-500">{isFarmer ? order.buyerName : 'Verified Farmer'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-slate-800">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{order.quantity} Units Total</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className="flex h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-emerald-500 transition-all duration-1000"
                             style={{ width: `${(Object.values(OrderStatus).indexOf(order.status) + 1) * 25}%` }}
                           ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        {isFarmer && next && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, next)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          >
                            Mark {next}
                          </button>
                        )}
                        {canRate && (
                          <button 
                            onClick={() => setRatingOrder(order)}
                            className="bg-amber-500 text-white hover:bg-amber-600 px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-amber-100 transition-all active:scale-95"
                          >
                            {isFarmer ? t.rateBuyer : t.rateFarmer}
                          </button>
                        )}
                        {hasRated && (
                          <span className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-4 py-2.5 rounded-2xl">
                            <span className="text-sm">★</span> Verified {t.rated}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Tracking Modal Simulator */}
      {trackingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] animate-in zoom-in-95 duration-300">
              <div className="md:w-1/2 p-10 bg-slate-50 flex flex-col justify-between">
                 <div>
                    <button onClick={() => setTrackingOrder(null)} className="text-slate-400 hover:text-slate-800 text-sm font-black mb-10">← Back to List</button>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">Tracking Journey</h3>
                    <p className="text-slate-500 font-medium">Order for {trackingOrder.cropName}</p>
                 </div>
                 
                 <div className="space-y-8 relative">
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                    {[OrderStatus.PLACED, OrderStatus.PACKED, OrderStatus.DISPATCHED, OrderStatus.DELIVERED].map((st, i) => {
                      const isActive = Object.values(OrderStatus).indexOf(trackingOrder.status) >= i;
                      return (
                        <div key={st} className="flex items-start gap-6 relative z-10">
                           <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-md ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                             {i + 1}
                           </div>
                           <div>
                              <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{st}</p>
                              {isActive && <p className="text-[10px] text-emerald-600 font-bold">Completed at 10:45 AM</p>}
                           </div>
                        </div>
                      );
                    })}
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Carrier Partner</p>
                    <p className="text-sm font-black text-slate-800">AgriSecure Logistics (Verified)</p>
                 </div>
              </div>
              <div className="flex-1 bg-emerald-50 relative overflow-hidden flex items-center justify-center p-12">
                 {/* Simulated Map SVG */}
                 <div className="w-full h-full border-4 border-white rounded-[2rem] shadow-2xl relative bg-slate-100/50 backdrop-blur">
                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-30">
                       <path d="M20,180 Q60,160 100,100 T180,20" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 2" />
                    </svg>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                       <div className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl animate-bounce inline-block mb-4">📍</div>
                       <p className="text-xs font-black text-emerald-800">In Transit - Punjab Border</p>
                       <p className="text-[10px] font-bold text-slate-400">ETA: Tomorrow 4:00 PM</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {ratingOrder && (
        <RatingModal
          isOpen={!!ratingOrder}
          onClose={() => setRatingOrder(null)}
          onSubmit={(score, comment) => onRateTransaction(ratingOrder.id, score, comment)}
          targetName={isFarmer ? ratingOrder.buyerName : ratingOrder.cropName + ' (Farmer Store)'}
          language={language}
        />
      )}
    </div>
  );
};

export default FarmerOrderManager;
