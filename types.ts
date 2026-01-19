
export enum UserRole {
  FARMER = 'FARMER',
  RETAIL_BUYER = 'RETAIL_BUYER',
  WHOLESALE_BUYER = 'WHOLESALE_BUYER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PLACED = 'PLACED',
  PACKED = 'PACKED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED'
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  location: string;
  rating: number;
  ratingCount: number;
  honorScore?: number;
  avatar: string;
  walletBalance: number;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  basePrice: number;
  fixedPrice: number;
  moq: number;
  harvestDate: string;
  location: string;
  image: string;
  description: string;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  deliveryMonth: string;
  status: 'OPEN' | 'FULFILLED';
  description?: string;
}

export interface Bid {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  price: number;
  quantity: number;
  status: BidStatus;
  timestamp: number;
}

export interface Order {
  id: string;
  listingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  quantity: number;
  totalProductCost: number;
  deliveryCost: number;
  totalAmount: number;
  type: 'RETAIL' | 'WHOLESALE';
  status: OrderStatus;
  trackingId?: string;
  deliveryDate?: string;
  unit?: string;
  isRatedByBuyer?: boolean;
  isRatedByFarmer?: boolean;
  milestones?: {
    label: string;
    timestamp: number;
    completed: boolean;
  }[];
}

export interface SmartBundle {
  id: string;
  name: string;
  items: { crop: string; qty: number; unit: string }[];
  price: number;
  image: string;
  description: string;
}

export interface MarketInsight {
  currentTrend: 'up' | 'down';
  avgMarketPrice: number;
  reasoning: string;
  volatility: 'Low' | 'Medium' | 'High';
}

export interface DemandForecast {
  crop: string;
  predictedDemand: 'High' | 'Medium' | 'Low';
  confidence: number;
  reasoning: string;
  districtSignals: { district: string; signal: string }[];
}

// Added Rating interface to resolve compilation error in App.tsx
export interface Rating {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  comment: string;
  timestamp: number;
}

// Added Contract interface to resolve compilation error in components/ContractCard.tsx
export interface Contract {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  deliveryDate: string;
  location: string;
  advancePercentage: number;
  description?: string;
}
