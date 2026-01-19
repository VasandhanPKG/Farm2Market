
import React from 'react';
import { Contract } from '../types';

interface ContractCardProps {
  contract: Contract;
  onClick: () => void;
  isSelected?: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onClick, isSelected }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-slate-800">{contract.cropType}</h4>
          <p className="text-sm text-slate-500">{contract.buyerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-emerald-600">${contract.pricePerUnit}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Per {contract.unit}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Volume</p>
          <p className="text-sm font-semibold text-slate-700">{contract.quantity} {contract.unit}</p>
        </div>
        <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Delivery</p>
          <p className="text-sm font-semibold text-slate-700">{contract.deliveryDate}</p>
        </div>
        <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Escrow</p>
          <p className="text-sm font-semibold text-slate-700">{contract.advancePercentage}%</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">📍 {contract.location}</span>
        <span className="text-slate-300">•</span>
        <span>Rating: ⭐ 4.9</span>
      </div>
    </div>
  );
};

export default ContractCard;
