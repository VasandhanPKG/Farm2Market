
import React, { useState, useEffect } from 'react';
import { Order, User, CropListing, DemandForecast } from '../types';
import PriceInsights from './PriceInsights';
import { getDemandForecast } from '../services/geminiService';
import { Language, translations } from '../translations';

// Fix: Added language to DashboardProps to resolve TS error in App.tsx
interface DashboardProps {
  user: User;
  orders: Order[];
  listings: CropListing[];
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ user, orders, listings, language }) => {
  const activeOrders = orders.filter(o => o.farmerId === user.id || o.buyerId === user.id);
  const totalValue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (user.role === 'FARMER' && listings.length > 0) {
      getDemandForecast(listings[0].name, user.location).then(setForecast);
    }
  }, [user, listings]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl text-emerald-600">💵</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{t.businessVolume}</p>
              <p className="text-2xl font-bold text-slate-800">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[65%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl text-blue-600">📦</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{t.activeOrders}</p>
              <p className="text-2xl font-bold text-slate-800">{activeOrders.length}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Total active transactions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl text-amber-600">🛡️</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{t.escrowProtected}</p>
              <p className="text-2xl font-bold text-slate-800">₹{(totalValue * 0.9).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 font-bold">100% Payment Guarantee</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PriceInsights />
        </div>
        
        <div className="space-y-6">
          {forecast && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Gemini Demand Prediction</h4>
               <div className="flex items-center gap-4 mb-4">
                  <div className={`w-3 h-3 rounded-full ${forecast.predictedDemand === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <span className="text-xl font-bold text-slate-800">{forecast.predictedDemand} Demand</span>
               </div>
               <p className="text-sm text-slate-600 italic">"{forecast.reasoning}"</p>
               <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Confidence Score</span>
                  <span className="text-emerald-600">{Math.round(forecast.confidence * 100)}%</span>
               </div>
            </div>
          )}
          
          <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Smart Inventory</h3>
              <p className="text-emerald-200 text-xs mb-6 leading-relaxed">
                Prices for {listings[0]?.name || 'crops'} are expected to peak in 3 weeks. Consider holding 20% inventory.
              </p>
              <button className="bg-emerald-400 text-emerald-950 px-6 py-2 rounded-lg font-bold text-xs hover:bg-emerald-300 transition-colors">
                Market Analysis
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-3">Crop</th>
                <th className="px-6 py-3">Party</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{order.cropName}</td>
                  <td className="px-6 py-4 text-slate-500">{user.role === 'FARMER' ? order.buyerName : 'Farmer Store'}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
