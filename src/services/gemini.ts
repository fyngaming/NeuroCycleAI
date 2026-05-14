import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

// Log untuk memastikan API Key ada (hanya menampilkan 4 karakter pertama demi keamanan)
if (!apiKey || apiKey === "your_api_key_here") {
  console.error("EROR: API Key Gemini belum diisi atau masih menggunakan nilai default di file .env!");
} else {
  console.log("API Key terdeteksi:", apiKey.substring(0, 4) + "...");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface WasteAnalysis {
  name: string;
  category: "Organik" | "Anorganik" | "B3" | "Kertas" | "Plastik" | "Logam";
  composition: {
    material: string;
    percentage: number;
    description?: string;
  }[];
  disposalGuide: string;
  recyclable: boolean;
  accuracy: number;
  tips: string;
  environmentalImpact: string;
  creativeIdeas: string[];
  impactStats: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
}

export async function analyzeWaste(base64Image: string): Promise<WasteAnalysis> {
  // Menggunakan model Gemini Flash terbaru yang stabil (untuk menghindari kuota 0)
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const prompt = `Identify the waste object in this image. 
  Classify it correctly as: Organik, Anorganik, B3, Kertas, Plastik, or Logam.
  Provide a detailed composition analysis (materials and estimated percentages).
  Provide step-by-step disposal instructions.
  Provide an environmental impact fact.
  Provide 3 short creative DIY/upcycling ideas for this specific waste.
  Estimate the environmental impact saved if recycled (CO2 in grams, Water in liters, Energy in kWh).
  
  IMPORTANT: Return the result ONLY as a raw JSON object matching this structure:
  {
    "name": "string",
    "category": "Organik | Anorganik | B3 | Kertas | Plastik | Logam",
    "composition": [{"material": "string", "percentage": number, "description": "string"}],
    "disposalGuide": "string",
    "recyclable": boolean,
    "accuracy": number,
    "tips": "string",
    "environmentalImpact": "string",
    "creativeIdeas": ["string", "string", "string"],
    "impactStats": {"co2Saved": number, "waterSaved": number, "energySaved": number}
  }
  Do not include any markdown formatting like \`\`\`json or plain text.`;

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
    { text: prompt },
  ]);

  const text = result.response.text();
  if (!text) throw new Error("No analysis result received from AI");
  
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedText) as WasteAnalysis;
  } catch (e) {
    console.error("Gagal parse JSON:", cleanedText);
    throw new Error("Format hasil analisis tidak sesuai. Silakan coba lagi.");
  }
}
