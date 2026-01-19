
import React, { useState, useEffect } from 'react';
import { CROP_TYPES } from '../constants';
import { suggestPricing } from '../services/geminiService';
import { calculateFairPrice, PriceSuggestion } from '../utils/pricingLogic';

interface CreateListingProps {
  onSubmit: (data: any) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    cropType: CROP_TYPES[0],
    quantity: 1000,
    unit: 'Kg',
    basePrice: 0,
    pricePerUnit: 0,
    moq: 100,
    deliveryDate: '',
    location: '',
    description: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [localSuggestion, setLocalSuggestion] = useState<PriceSuggestion | null>(null);

  // Update fair price instantly when crop or quantity changes
  useEffect(() => {
    const suggestion = calculateFairPrice(formData.cropType, formData.quantity);
    setLocalSuggestion(suggestion);
    
    // Auto-fill initial values if they are zero
    if (formData.basePrice === 0 || formData.pricePerUnit === 0) {
      setFormData(prev => ({
        ...prev,
        basePrice: suggestion.low,
        pricePerUnit: suggestion.average
      }));
    }
  }, [formData.cropType, formData.quantity]);

  const handleAiSuggest = async () => {
    setAiLoading(true);
    const res = await suggestPricing(formData.cropType, formData.quantity);
    setFormData(prev => ({ 
      ...prev, 
      basePrice: res.suggestedBase, 
      pricePerUnit: res.suggestedFixed 
    }));
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isOverpriced = formData.pricePerUnit > (localSuggestion?.high || 0);
  const isGoodValue = formData.pricePerUnit <= (localSuggestion?.average || 0);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 h-fit">
        <div className="bg-emerald-600 p-8 text-white">
          <h3 className="text-2xl font-bold">Create Market Listing</h3>
          <p className="text-emerald-100 text-sm mt-1">List your harvest for both Retail and Wholesale buyers.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Crop Variety</label>
              <select 
                value={formData.cropType}
                onChange={e => setFormData({...formData, cropType: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quantity</label>
                <input 
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unit</label>
                <select 
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kg">Kg</option>
                  <option value="Tons">Tons</option>
                  <option value="Quintals">Quintals</option>
                </select>
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 relative overflow-hidden">
               <div className="flex justify-between mb-4 relative z-10">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Gemini Price Shield</span>
                  <button 
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {aiLoading ? 'Analyzing...' : '⚡ AI Optimize'}
                  </button>
               </div>
               <div className="space-y-4 relative z-10">
                  <div>
                     <label className="block text-[10px] text-emerald-600/70 font-bold uppercase mb-1">Base Bid Price (Wholesale)</label>
                     <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 font-bold text-emerald-900">₹</span>
                        <input 
                          type="number" 
                          value={formData.basePrice}
                          onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                          className="w-full border-b-2 border-emerald-200 bg-transparent pl-4 py-1.5 font-bold text-xl text-emerald-950 outline-none focus:border-emerald-500 transition-colors" 
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] text-emerald-600/70 font-bold uppercase mb-1">Fixed Buy Price (Retail)</label>
                     <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 font-bold text-emerald-900">₹</span>
                        <input 
                          type="number" 
                          value={formData.pricePerUnit}
                          onChange={e => setFormData({...formData, pricePerUnit: Number(e.target.value)})}
                          className="w-full border-b-2 border-emerald-200 bg-transparent pl-4 py-1.5 font-bold text-xl text-emerald-950 outline-none focus:border-emerald-500 transition-colors" 
                        />
                     </div>
                  </div>
               </div>
               {/* Abstract background shape */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl -mr-12 -mt-12 opacity-50"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Harvest/Delivery Date</label>
              <input 
                type="date"
                value={formData.deliveryDate}
                onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Minimum Order Qty (Wholesale)</label>
              <input 
                type="number"
                value={formData.moq}
                onChange={e => setFormData({...formData, moq: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                <input 
                  type="text"
                  placeholder="Farm City, State"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Product Description</label>
            <textarea 
              rows={3}
              placeholder="Details about quality, moisture content, certifications..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2 pt-4 flex gap-4">
            <button 
              type="submit"
              className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
            >
              Go Live in Marketplace
            </button>
          </div>
        </form>
      </div>

      {/* Pricing Assistant Sidecard */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📊</div>
              <h4 className="font-bold text-slate-800">Pricing Assistant</h4>
           </div>

           {localSuggestion && (
             <div className="space-y-6">
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Rule-Based Market Average</p>
                   <p className="text-3xl font-black text-slate-900">₹{localSuggestion.average}<span className="text-sm text-slate-400 font-normal"> / {formData.unit}</span></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Suggested Fair Range</p>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-700">₹{localSuggestion.low}</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full transition-all duration-500 ${isGoodValue ? 'bg-emerald-500' : isOverpriced ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, (formData.pricePerUnit / localSuggestion.high) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">₹{localSuggestion.high}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-medium text-slate-400">
                      <span>Lower Bound</span>
                      <span>Upper Bound</span>
                   </div>
                </div>

                <div className={`p-4 rounded-xl border flex gap-3 ${isGoodValue ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : isOverpriced ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                   <span className="text-lg">{isGoodValue ? '✅' : isOverpriced ? '⚠️' : '🔔'}</span>
                   <div>
                      <p className="text-xs font-bold uppercase leading-none mb-1">
                        {isGoodValue ? 'Great Value' : isOverpriced ? 'High Price' : 'Standard Pricing'}
                      </p>
                      <p className="text-xs leading-relaxed opacity-80">{localSuggestion.advice}</p>
                   </div>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center">
                  Rules updated weekly based on regional mandi data.
                </p>
             </div>
           )}
        </div>

        {/* Volume Impact Hint */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
           <h5 className="font-bold text-sm mb-3 relative z-10">Volume Impact</h5>
           <p className="text-xs text-slate-400 leading-relaxed relative z-10">
             Wholesale buyers prefer larger quantities. Our system suggests a 5-10% discount for orders above 1,000 units to improve listing visibility.
           </p>
           <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
