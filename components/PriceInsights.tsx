
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketInsights } from '../services/geminiService';
import { MarketInsight } from '../types';

const PriceInsights: React.FC = () => {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);

  const mockChartData = [
    { name: 'Jan', price: 170 },
    { name: 'Feb', price: 175 },
    { name: 'Mar', price: 182 },
    { name: 'Apr', price: 178 },
    { name: 'May', price: 185 },
    { name: 'Jun', price: 190 },
  ];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getMarketInsights('Corn');
      setInsight(res);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-800">Market Price Trends</h3>
          <p className="text-sm text-slate-500">Regional analysis for Corn (Iowa Hub)</p>
        </div>
        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Detailed Report →</button>
      </div>

      <div className="h-48 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="h-2 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              insight?.currentTrend === 'up' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
            }`}>
              Trend: {insight?.currentTrend}
            </span>
            <span className="text-xs font-bold text-slate-700">Avg Market: ${insight?.avgMarketPrice}/Ton</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "{insight?.reasoning}"
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceInsights;
