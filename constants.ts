
import { User, UserRole, CropListing, Order, OrderStatus } from './types';

export const MOCK_USERS: Record<UserRole, User> = {
  [UserRole.FARMER]: {
    id: 'u-1',
    name: 'Suresh Kumar',
    role: UserRole.FARMER,
    location: 'Punjab, India',
    rating: 4.9,
    ratingCount: 124,
    honorScore: 98, // Farmer reputation metric
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    walletBalance: 45000,
  },
  [UserRole.RETAIL_BUYER]: {
    id: 'u-2',
    name: 'Anjali Sharma',
    role: UserRole.RETAIL_BUYER,
    location: 'New Delhi, India',
    rating: 4.7,
    ratingCount: 42,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
    walletBalance: 5000,
  },
  [UserRole.WHOLESALE_BUYER]: {
    id: 'u-3',
    name: 'FreshMart Corp',
    role: UserRole.WHOLESALE_BUYER,
    location: 'Mumbai, India',
    rating: 4.5,
    ratingCount: 89,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FreshMart',
    walletBalance: 250000,
  },
  [UserRole.ADMIN]: {
    id: 'u-4',
    name: 'System Admin',
    role: UserRole.ADMIN,
    location: 'Cloud',
    rating: 5.0,
    ratingCount: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    walletBalance: 0,
  }
};

export const MOCK_LISTINGS: CropListing[] = [
  {
    id: 'l-1',
    farmerId: 'u-1',
    farmerName: 'Suresh Kumar',
    name: 'Premium Basmati Rice',
    totalQuantity: 5000,
    availableQuantity: 4200,
    unit: 'Kg',
    basePrice: 75,
    fixedPrice: 95,
    moq: 100,
    harvestDate: '2024-05-20',
    location: 'Amritsar, Punjab',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Long grain, highly aromatic Basmati rice. Organic certified.'
  },
  {
    id: 'l-2',
    farmerId: 'u-1',
    farmerName: 'Suresh Kumar',
    name: 'Yellow Corn',
    totalQuantity: 10000,
    availableQuantity: 10000,
    unit: 'Kg',
    basePrice: 18,
    fixedPrice: 25,
    moq: 500,
    harvestDate: '2024-06-15',
    location: 'Ludhiana, Punjab',
    image: 'https://images.unsplash.com/photo-1551727041-5b347d65b633?auto=format&fit=crop&w=800&q=80',
    description: 'Perfect for feed or industrial processing. Low moisture content.'
  }
];

export const CROP_NAMES = ['Basmati Rice', 'Wheat', 'Yellow Corn', 'Soybean', 'Potatoes', 'Onions', 'Tomatoes'];
export const CROP_TYPES = CROP_NAMES;
