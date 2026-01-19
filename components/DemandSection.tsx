
import React, { useState } from 'react';
import { BuyerDemand, User, UserRole } from '../types';
import { Language, translations } from '../translations';
import { CROP_TYPES } from '../constants';

interface DemandSectionProps {
  user: User;
  demands: BuyerDemand[];
  onAddDemand: (demand: Partial<BuyerDemand>) => void;
  language: Language;
}

const DemandSection: React.FC<DemandSectionProps> = ({ user, demands, onAddDemand, language }) => {
  const t = translations[language];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropType: CROP_TYPES[0],
    quantity: 100,
    unit: 'Kg',
    targetPrice: 20,
    deliveryMonth: 'June 2024',
    description: ''
  });

  const isFarmer = user.role === UserRole.FARMER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDemand(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.futureNeeds}</h2>
          <p className="text-slate-500 text-sm mt-1">Strategic signals to help farmers plan their next cultivation cycle.</p>
        </div>
        {!isFarmer && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            {showForm ? 'Cancel' : `+ ${t.postDemand}`}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl max-w-2xl mx-auto">
          <h3 className="text-xl font-black text-slate-800 mb-6">Specify Your Future Needs</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Crop Variety</label>
                <select 
                  value={formData.cropType}
                  onChange={e => setFormData({...formData, cropType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.targetPrice} (₹)</label>
                <input 
                  type="number"
                  value={formData.targetPrice}
                  onChange={e => setFormData({...formData, targetPrice: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Volume Needed</label>
                <input 
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.neededBy}</label>
                <input 
                  type="text"
                  placeholder="e.g. Late Sep 2024"
                  value={formData.deliveryMonth}
                  onChange={e => setFormData({...formData, deliveryMonth: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description / Quality Specs</label>
              <textarea 
                rows={3}
                placeholder="Details about required quality, certifications, etc."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all">
              Broadcast Demand Signal
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demands.map(demand => (
          <div key={demand.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Market Demand</span>
               <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-bold uppercase">{t.targetPrice}</p>
                 <p className="text-lg font-black text-slate-800">₹{demand.targetPrice}<span className="text-xs font-normal">/{demand.unit}</span></p>
               </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-800 tracking-tight mb-4">{demand.cropType}</h4>
            
            <div className="flex items-center gap-3 mb-6">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${demand.buyerName}`} className="w-6 h-6 rounded-full" alt="buyer" />
               <p className="text-xs font-bold text-slate-600">Requested by <span className="text-slate-900">{demand.buyerName}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quantity</p>
                  <p className="text-sm font-black text-slate-800">{demand.quantity} {demand.unit}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expected Date</p>
                  <p className="text-sm font-black text-slate-800">{demand.deliveryMonth}</p>
               </div>
            </div>

            {isFarmer && (
              <button className="w-full mt-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100">
                Commit to Harvest
              </button>
            )}
          </div>
        ))}
        {demands.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 italic font-medium">No active demand signals. Buyers can post future needs here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandSection;
