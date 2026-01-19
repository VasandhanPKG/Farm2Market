
import { GoogleGenAI, Type } from "@google/genai";
import { DemandForecast, MarketInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const getDemandForecast = async (crop: string, location: string): Promise<DemandForecast> => {
  const prompt = `Analyze agricultural demand for ${crop} in ${location}. 
  Include hyper-local district signals.
  Provide a JSON object with: 
  - crop: string
  - predictedDemand: 'High', 'Medium', or 'Low'
  - confidence: number
  - reasoning: string (max 20 words)
  - districtSignals: Array of { district: string, signal: string }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            predictedDemand: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            districtSignals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  district: { type: Type.STRING },
                  signal: { type: Type.STRING }
                }
              }
            }
          }
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { crop, predictedDemand: 'Medium', confidence: 0.5, reasoning: "Local data unavailable.", districtSignals: [] };
  }
};

export const getMarketInsights = async (crop: string): Promise<MarketInsight> => {
  const prompt = `Analyze market trends and price volatility for ${crop}. 
  Return JSON with:
  - currentTrend: 'up' or 'down'
  - avgMarketPrice: number
  - volatility: 'Low', 'Medium', or 'High'
  - reasoning: string (max 30 words)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentTrend: { type: Type.STRING },
            avgMarketPrice: { type: Type.NUMBER },
            volatility: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          }
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { currentTrend: 'up', avgMarketPrice: 180, volatility: 'Medium', reasoning: "Market trends stable." };
  }
};

export const suggestPricing = async (crop: string, quantity: number): Promise<{suggestedBase: number, suggestedFixed: number}> => {
  const prompt = `Wholesale and retail price suggestion for ${quantity} of ${crop}. Return JSON {suggestedBase: number, suggestedFixed: number}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { suggestedBase: 100, suggestedFixed: 150 };
  }
};
