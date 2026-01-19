
export interface PriceSuggestion {
  average: number;
  low: number;
  high: number;
  discountApplied: number;
  advice: string;
}

const BASE_MARKET_PRICES: Record<string, number> = {
  'Premium Basmati Rice': 85,
  'Wheat': 24,
  'Yellow Corn': 20,
  'Soybean': 45,
  'Potatoes': 15,
  'Onions': 18,
  'Tomatoes': 12,
};

export const calculateFairPrice = (crop: string, quantity: number): PriceSuggestion => {
  const base = BASE_MARKET_PRICES[crop] || 30;
  let discount = 0;

  // Rule 1: Volume Discount Logic
  if (quantity >= 5000) discount = 0.10; // 10% off for huge wholesale
  else if (quantity >= 1000) discount = 0.05; // 5% off for bulk

  const adjustedAvg = base * (1 - discount);
  
  // Rule 2: Fair Range is +/- 12%
  const low = adjustedAvg * 0.88;
  const high = adjustedAvg * 1.12;

  let advice = "Price is competitive for current volume.";
  if (discount > 0) advice = `Bulk volume discount of ${discount * 100}% factored in.`;

  return {
    average: Math.round(adjustedAvg * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    discountApplied: discount,
    advice
  };
};
