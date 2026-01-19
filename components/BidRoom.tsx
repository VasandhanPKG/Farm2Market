
import React, { useState } from 'react';
import { CropListing, User, Bid } from '../types';
import { Language, translations } from '../translations';

interface BidRoomProps {
  user: User;
  listings: CropListing[];
  bids: Bid[];
  onPlaceOrder: (listingId: string, quantity: number, type: 'WHOLESALE', price: number) => void;
  language: Language;
}

const BidRoom: React.FC<BidRoomProps> = ({ user, listings, bids, onPlaceOrder, language }) => {
  const t = translations[language];
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [bidInputs, setBidInputs] = useState<Record<string, { price: number; quantity: number }>>({});
  const [viewMode, setViewMode] = useState<'GRID' | 'DETAILS'>('GRID');

  const handleSelectAuction = (listing: CropListing) => {
    setSelectedListing(listing);
    setViewMode('DETAILS');
  };

  const handleBackToList = () => {
    setViewMode('GRID');
    setSelectedListing(null);
  };

  const getListingBids = (listingId: string) => {
    return bids
      .filter(b => b.listingId === listingId)
      .sort((a, b) => b.price - a.price);
  };

  const handleBidChange = (listingId: string, field: 'price' | 'quantity', value: number) => {
    setBidInputs(prev => ({
      ...prev,
      [listingId]: { 
        ...(prev[listingId] || { 
          price: (getListingBids(listingId)[0]?.price || listings.find(l => l.id === listingId)?.basePrice || 0) + 1, 
          quantity: listings.find(l => l.id === listingId)?.moq || 0 
        }), 
        [field]: value 
      }
    }));
  };

  const getInputs = (listing: CropListing) => {
    const currentHigh = getListingBids(listing.id)[0]?.price || listing.basePrice;
    return bidInputs[listing.id] || { 
      price: currentHigh + 1, 
      quantity: listing.moq 
    };
  };

  if (viewMode === 'GRID') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-4 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex items-center justify-center">
                 <span className="absolute bg-emerald-500 w-3 h-3 rounded-full animate-ping opacity-75"></span>
                 <span className="relative bg-emerald-500 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
              </div>
              <h2 className="text-3xl font-black tracking-tight uppercase italic">{t.bidRoom}</h2>
            </div>
            <p className="text-slate-400 max-w-lg text-sm font-medium leading-relaxed opacity-90">
              Access verified harvest batches with real-time price discovery terminal.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600 rounded-full blur-[120px] opacity-[0.08] -mr-20 -mt-20"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => {
            const auctionBids = getListingBids(l.id);
            const highBid = auctionBids.length > 0 ? auctionBids[0].price : l.basePrice;
            
            return (
              <div 
                key={l.id} 
                onClick={() => handleSelectAuction(l)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={l.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={l.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">LIVE</span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end text-white">
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest opacity-70 mb-0.5">Top Bid</p>
                      <p className="text-xl font-black">₹{highBid}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-black uppercase tracking-widest opacity-70 mb-0.5">Bidders</p>
                       <p className="text-lg font-black">{auctionBids.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4 group-hover:text-emerald-600 transition-colors">{l.name}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{l.farmerName}</span>
                    <span className="text-emerald-600">Terminal →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentBids = getListingBids(selectedListing!.id);
  const topBid = currentBids.length > 0 ? currentBids[0].price : selectedListing!.basePrice;

  return (
    <div className="fixed inset-0 top-[60px] md:top-[72px] bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-500 z-50">
      
      {/* TERMINAL HEADER */}
      <div className="h-12 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToList}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-800 font-bold text-[9px] uppercase tracking-widest transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Lobby
          </button>
          <div className="h-3 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <p className="text-slate-700 font-bold text-[9px] uppercase tracking-widest truncate max-w-[150px]">{selectedListing!.name}</p>
          </div>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-[7px] font-black text-slate-500 uppercase tracking-widest">
           #{selectedListing!.id.slice(-6).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* MAIN CENTER/LEFT: DETAILS & MEDIA */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide bg-white">
          
          <div className="relative h-[45vh] w-full shrink-0">
             <img src={selectedListing!.image} className="w-full h-full object-cover" alt="harvest" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/40"></div>
             
             <div className="absolute top-4 left-6">
                <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full font-bold text-[8px] uppercase tracking-widest shadow-md">
                   <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                   Cam 01
                </div>
             </div>

             <div className="absolute bottom-8 left-8 right-8">
                <p className="text-emerald-400 font-bold text-[9px] uppercase tracking-[0.3em] mb-1">{selectedListing!.location}</p>
                <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{selectedListing!.name}</h2>
             </div>
          </div>

          <div className="p-8 space-y-10 bg-white rounded-t-3xl -mt-6 relative z-10">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Specifications</h4>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                         {selectedListing!.description}
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Moisture</p>
                         <p className="text-lg font-black text-slate-800">11.4%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Grade</p>
                         <p className="text-lg font-black text-slate-800">Premium A</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedListing!.farmerName}`} className="w-10 h-10 rounded-lg border border-slate-800 shadow-inner" alt="farmer" />
                         <div>
                            <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Producer</p>
                            <h3 className="text-sm font-black tracking-tight">{selectedListing!.farmerName}</h3>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                            <p className="text-[6px] font-black uppercase opacity-40">Trust</p>
                            <p className="text-xs font-black text-emerald-400">98%</p>
                         </div>
                         <div className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
                            <p className="text-[6px] font-black uppercase opacity-40">Rating</p>
                            <p className="text-xs font-black text-amber-400">4.9 ★</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex justify-between items-center">
                      <div>
                         <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-1">Escrow System</h5>
                         <p className="text-emerald-600/70 text-[8px] font-bold uppercase">Funds Protected</p>
                      </div>
                      <span className="text-lg opacity-60">🛡️</span>
                   </div>
                </div>
             </div>
             <div className="h-24"></div>
          </div>
        </div>

        {/* SIDEBAR: LIVE BIDS LEADERBOARD */}
        <div className="w-[340px] shrink-0 flex flex-col bg-slate-50 border-l border-slate-200 relative z-30">
           <div className="p-6 pb-3 border-b border-slate-200 bg-white">
              <div className="flex justify-between items-center">
                 <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Floor</h4>
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">{currentBids.length} Active</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {currentBids.length > 0 ? (
                 currentBids.map((bid, i) => {
                   const isTopBid = i === 0;
                   return (
                    <div 
                       key={bid.id} 
                       className={`p-4 rounded-xl border transition-all relative overflow-hidden animate-in slide-in-from-right duration-300 ${
                         isTopBid 
                         ? 'bg-white border-emerald-500/30 shadow-sm ring-1 ring-emerald-500/10' 
                         : 'bg-white/50 border-slate-200'
                       }`}
                    >
                       {isTopBid && (
                          <div className="absolute top-0 right-0 p-2">
                             <div className="bg-amber-400 text-black text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                👑 TOP
                             </div>
                          </div>
                       )}

                       <div className="flex items-center gap-3 mb-2 relative z-10">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] ${
                            isTopBid ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                          }`}>
                            #{i + 1}
                          </div>
                          <div>
                             <p className={`font-black text-[10px] tracking-tight ${isTopBid ? 'text-slate-800' : 'text-slate-500'}`}>
                                {bid.buyerName}
                             </p>
                             <p className={`text-[7px] font-bold uppercase tracking-widest ${isTopBid ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                                {bid.quantity.toLocaleString()} {selectedListing!.unit} Request
                             </p>
                          </div>
                       </div>
                       
                       <div className={`flex justify-between items-end relative z-10 pt-2 border-t ${isTopBid ? 'border-emerald-50' : 'border-slate-50'}`}>
                          <div>
                             <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price / Unit</p>
                             <p className={`text-xl font-black tracking-tighter ${isTopBid ? 'text-slate-900' : 'text-slate-400'}`}>₹{bid.price}</p>
                          </div>
                          <div className="text-right">
                             <p className={`text-[9px] font-black ${isTopBid ? 'text-emerald-500' : 'text-slate-300'}`}>
                               {isTopBid ? '94%' : `-${topBid - bid.price}`}
                             </p>
                          </div>
                       </div>
                    </div>
                   );
                 })
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">No Bids Yet</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* FOOTER ACTION STRIP: WHITE CLEAN UI */}
      <div className="h-24 shrink-0 bg-white border-t border-slate-100 flex items-center px-8 gap-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <div className="shrink-0 flex items-center gap-4 border-r border-slate-100 pr-6">
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor High</p>
               <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">₹{topBid}</p>
                  <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[7px] font-black uppercase">
                     Beat: ₹{topBid + 1}
                  </div>
               </div>
            </div>
         </div>

         <div className="flex-1 flex gap-6 items-center max-w-4xl">
            <div className="flex-1 relative group">
               <label className="absolute -top-2 left-3 bg-white px-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Offer Price</label>
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-base">₹</span>
               <input 
                  type="number"
                  min={topBid + 1}
                  value={getInputs(selectedListing!).price}
                  onChange={(e) => handleBidChange(selectedListing!.id, 'price', Number(e.target.value))}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-8 pr-3 py-3 text-lg font-black text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
               />
            </div>

            <div className="flex-1 relative group max-w-[150px]">
               <label className="absolute -top-2 left-3 bg-white px-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Volume</label>
               <input 
                  type="number"
                  min={selectedListing!.moq}
                  value={getInputs(selectedListing!).quantity}
                  onChange={(e) => handleBidChange(selectedListing!.id, 'quantity', Number(e.target.value))}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
               />
            </div>

            <button 
               onClick={() => onPlaceOrder(selectedListing!.id, getInputs(selectedListing!).quantity, 'WHOLESALE', getInputs(selectedListing!).price)}
               className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
               SUBMIT OFFER
            </button>
         </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default BidRoom;
