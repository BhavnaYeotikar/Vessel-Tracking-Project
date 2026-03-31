import { GoogleGenAI, Type } from "@google/genai";
import { Vessel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function searchVessel(query: string): Promise<Vessel | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the current or most recent tracking information for the vessel: ${query}. 
      Include IMO number, Name, MMSI, Type, Status, Speed (knots), Course (degrees), Latitude, Longitude, Destination, ETA, Flag, Length, and Width.
      If you cannot find exact real-time coordinates, provide the last known or typical coordinates for this vessel's current route.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            imo: { type: Type.STRING },
            mmsi: { type: Type.STRING },
            type: { type: Type.STRING },
            status: { type: Type.STRING },
            speed: { type: Type.NUMBER },
            course: { type: Type.NUMBER },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            destination: { type: Type.STRING },
            eta: { type: Type.STRING },
            flag: { type: Type.STRING },
            length: { type: Type.NUMBER },
            width: { type: Type.NUMBER },
            lastUpdate: { type: Type.STRING },
          },
          required: ["name", "imo", "lat", "lng", "type", "flag"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    return {
      id: data.imo,
      ...data,
      lastUpdate: data.lastUpdate || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error searching vessel:", error);
    return null;
  }
}

export async function getVesselHistory(imo: string): Promise<any[]> {
  // Simulate history for now
  return [];
}
