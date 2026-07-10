const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyD1xMX86JrSxJtKdTCIw67jHZGHZeFm6ws');

async function run() {
  const models = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-2.5-pro",
  ];

  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      
      const prompt = `You are a professional waste analyzer. Analyze this waste photo and identify the visible object accurately.
  IMPORTANT: Food waste MUST be classified as "Organik".
  Classify it strictly into ONE of these categories: Organik, Anorganik, B3, Kertas, Plastik, or Logam.
  Use the actual object in the photo to create HIGHLY ACCURATE composition percentages based on the visual materials. Provide a realistic disposal guide, creative upcycling ideas, tips, environmental impact, and impact stats.
  If the object is unclear, infer the most likely material from visual cues instead of saying it is undetected.
  You must return the result as a JSON object with this exact structure:
  {
    "name": "string (Specific name of the waste)",
    "category": "Organik | Anorganik | B3 | Kertas | Plastik | Logam",
    "composition": [{"material": "string", "percentage": number, "description": "string"}],
    "disposalGuide": "string",
    "recyclable": boolean,
    "accuracy": number (between 0.7 and 0.99),
    "tips": "string",
    "environmentalImpact": "string",
    "creativeIdeas": ["string", "string", "string"],
    "impactStats": {"co2Saved": number, "waterSaved": number, "energySaved": number}
  }`;

      const result = await model.generateContent(prompt);
      console.log(`Success ${modelName}:`, result.response.text());
    } catch (e) {
      console.error(`Failed ${modelName}:`, e.message);
    }
  }
}
run();
