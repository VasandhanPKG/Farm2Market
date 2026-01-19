
import React, { useState } from 'react';
import { CROP_TYPES } from '../constants';
import { getMarketInsights } from '../services/geminiService';

interface CreateContractProps {
  onSubmit: (contractData: any) => void;
}

const CreateContract: React.FC<CreateContractProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    cropType: CROP_TYPES[0],
    quantity: 10,
    unit: 'Tons',
    pricePerUnit: 150,
    deliveryDate: '',
    location: '',
    advancePercentage: 20,
    description: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrice, setAiPrice] = useState<number | null>(null);

  const handleAiSuggest = async () => {
    setAiLoading(true);
    const res = await getMarketInsights(formData.cropType);
    setAiPrice(res.avgMarketPrice);
    setFormData(prev => ({ ...prev, pricePerUnit: res.avgMarketPrice }));
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-emerald-600 p-8 text-white">
        <h3 className="text-2xl font-bold">Post New Purchase Contract</h3>
        <p className="text-emerald-100 text-sm mt-1">Pre-commit to a harvest price and secure your supply chain.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Crop Type</label>
            <select 
              value={formData.cropType}
              onChange={e => setFormData({...formData, cropType: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</label>
              <input 
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unit</label>
              <select 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tons">Tons</option>
                <option value="Bushels">Bushels</option>
                <option value="Kgs">Kgs</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Price per Unit ($)</label>
              <button 
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold hover:bg-emerald-200 disabled:opacity-50"
              >
                {aiLoading ? 'Analyzing...' : '⚡ AI Suggest'}
              </button>
            </div>
            <input 
              type="number"
              value={formData.pricePerUnit}
              onChange={e => setFormData({...formData, pricePerUnit: parseFloat(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {aiPrice && <p className="text-[10px] text-emerald-600 mt-1">Recommended current market price: ${aiPrice}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Target Date</label>
            <input 
              type="date"
              value={formData.deliveryDate}
              onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Location</label>
            <input 
              type="text"
              placeholder="e.g. Des Moines Regional Elevator"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Escrow Advance (%)</label>
            <input 
              type="range"
              min="5"
              max="50"
              step="5"
              value={formData.advancePercentage}
              onChange={e => setFormData({...formData, advancePercentage: parseInt(e.target.value)})}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
              <span>5%</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{formData.advancePercentage}% Selected</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contract Description / Special Requirements</label>
          <textarea 
            rows={3}
            placeholder="e.g. Moisture content below 15%, No broken kernels..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="md:col-span-2 pt-4 flex gap-4">
          <button 
            type="submit"
            className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            Post Contract to Network
          </button>
          <button 
            type="button"
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContract;
