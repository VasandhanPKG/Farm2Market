
import React, { useState } from 'react';
import { CropListing, User, UserRole, SmartBundle } from '../types';
import { Language, translations } from '../translations';

interface MarketplaceProps {
  user: User;
  listings: CropListing[];
  onPlaceOrder: (listingId: string, quantity: number, type: 'RETAIL' | 'WHOLESALE', price?: number) => void;
  language: Language;
}

const SMART_BUNDLES: SmartBundle[] = [
  {
    id: 'b1',
    name: 'Sambar Special Kit',
    items: [{ crop: 'Onions', qty: 2, unit: 'Kg' }, { crop: 'Tomatoes', qty: 1, unit: 'Kg' }],
    price: 45,
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80',
    description: 'All essential veggies for the perfect traditional Sambar.'
  },
  {
    id: 'b2',
    name: 'Healthy Salad Pack',
    items: [{ crop: 'Tomatoes', qty: 1.5, unit: 'Kg' }, { crop: 'Onions', qty: 0.5, unit: 'Kg' }],
    price: 38,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh organic greens and veggies for daily nutritional needs.'
  }
];

const Marketplace: React.FC<MarketplaceProps> = ({ user, listings, onPlaceOrder, language }) => {
  const t = translations[language];
  const [activeMode, setActiveMode] = useState<'RETAIL' | 'WHOLESALE' | 'BUNDLES'>(
    user.role === UserRole.WHOLESALE_BUYER ? 'WHOLESALE' : 'RETAIL'
  );
  const [bidInputs, setBidInputs] = useState<Record<string, { price: number; quantity: number }>>({});

  const handleBidChange = (id: string, field: 'price' | 'quantity', value: number) => {
    setBidInputs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { price: 0, quantity: 0 }), [field]: value }
    }));
  };

  const getInputs = (listing: CropListing) => {
    return bidInputs[listing.id] || { price: listing.basePrice, quantity: listing.moq };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.marketplace}</h2>
          <p className="text-slate-500 text-sm">{t.slogan}</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveMode('RETAIL')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeMode === 'RETAIL' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t.retailShop}
          </button>
          <button 
            onClick={() => setActiveMode('BUNDLES')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeMode === 'BUNDLES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            AI Smart Bundles
          </button>
          <button 
            onClick={() => setActiveMode('WHOLESALE')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeMode === 'WHOLESALE' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t.wholesaleBidding}
          </button>
        </div>
      </div>

      {activeMode === 'BUNDLES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SMART_BUNDLES.map(bundle => (
            <div key={bundle.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row group hover:shadow-xl transition-all">
              <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                <img src={bundle.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={bundle.name} />
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                   <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">AI Optimized</span>
                   <h3 className="text-xl font-black text-slate-800 mb-2">{bundle.name}</h3>
                   <p className="text-sm text-slate-500 mb-4">{bundle.description}</p>
                   <div className="flex flex-wrap gap-2 mb-6">
                      {bundle.items.map((it, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold border border-slate-100">
                          {it.crop} ({it.qty}{it.unit})
                        </span>
                      ))}
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Bundle Price</p>
                     <p className="text-2xl font-black text-slate-800">₹{bundle.price}</p>
                   </div>
                   <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                     Buy Bundle
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map(listing => {
            const inputs = getInputs(listing);
            const isPriceValid = inputs.price >= listing.basePrice;
            const isQuantityValid = inputs.quantity >= listing.moq;
            
            return (
              <div key={listing.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-800 shadow-md uppercase tracking-widest">
                    {listing.availableQuantity} {listing.unit} {t.available}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">{listing.name}</h3>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">{t.harvested}</p>
                      <p className="text-xs font-black text-slate-700">{listing.harvestDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${listing.farmerName}`} className="w-6 h-6 rounded-full border border-slate-100 shadow-sm" alt="farmer" />
                    <span className="text-xs font-bold text-slate-500">{listing.farmerName} • {listing.location}</span>
                  </div>

                  {activeMode === 'RETAIL' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Fixed Price</p>
                          <p className="text-3xl font-black text-slate-800">₹{listing.fixedPrice}<span className="text-xs text-slate-400 font-normal">/{listing.unit}</span></p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Secure Store</div>
                      </div>
                      <button 
                        onClick={() => onPlaceOrder(listing.id, 1, 'RETAIL')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                      >
                        {t.instantPurchase}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.bid}</label>
                          <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg z-10 ${isPriceValid ? 'text-emerald-700' : 'text-red-600'}`}>₹</span>
                            <input 
                              type="number" 
                              value={inputs.price}
                              onChange={(e) => handleBidChange(listing.id, 'price', Number(e.target.value))}
                              className={`w-full bg-slate-50 border-2 rounded-2xl pl-10 pr-4 py-4 text-xl font-black outline-none transition-all ${
                                isPriceValid ? 'border-emerald-100 text-emerald-900 focus:bg-white' : 'border-red-100 text-red-700'
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.qty}</label>
                          <input 
                            type="number" 
                            value={inputs.quantity}
                            onChange={(e) => handleBidChange(listing.id, 'quantity', Number(e.target.value))}
                            className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-xl font-black outline-none transition-all ${
                              isQuantityValid ? 'border-emerald-100 text-emerald-900 focus:bg-white' : 'border-red-100 text-red-700'
                            }`}
                          />
                        </div>
                      </div>
                      <button 
                        disabled={!isPriceValid || !isQuantityValid}
                        onClick={() => onPlaceOrder(listing.id, inputs.quantity, 'WHOLESALE', inputs.price)}
                        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {t.placeBid}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
