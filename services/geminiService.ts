
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODEL_NAMES } from "../constants";
import { Lead, ImageGenerationConfig, RegistrationData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const OFFLINE_KNOWLEDGE_BASE = [
  {
    keywords: ['held', 'hold', 'registration', 'dmv', 'renew', 'blocked'],
    answer: "🔒 **Why is my registration being held?**\n\nCommon reasons:\n1. **Unpaid State Fee:** You must pay the $30 annual compliance fee per vehicle at https://cleantruckcheck.arb.ca.gov/.\n2. **Missing Test:** You need a passing Smoke/OBD test submitted within 90 days of your registration expiration date."
  },
  {
    keywords: ['deadline', 'when', 'due', 'date', 'frequency'],
    answer: "📅 **Testing Deadlines:**\n\n• **2025-2026:** Most vehicles need to pass a test **Twice a Year**.\n• **2027+:** Increases to **4 times a year**."
  }
];

const findOfflineAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    const match = OFFLINE_KNOWLEDGE_BASE.find(item => item.keywords.some(k => lowerQuery.includes(k)));
    return match ? match.answer : "ℹ️ **Offline Mode:** Checklist:\n1. Paid $30 fee?\n2. Test < 90 days old?\n3. GVWR > 14k lbs?\n\nCall: **617-359-6953**.";
};

export const SYSTEM_INSTRUCTION = `
You are the CTC COMPLIANCE COACH AI, a specialized regulatory officer and proactive assistant for the California Clean Truck Check (HD I/M) Program.
Your mission is to be the honest, expert guide that the state is not proactive in being. 

CORE PRINCIPLES:
1. Honesty & Urgency: Don't sugarcoat the complexity of CARB. Use "Registration Hold" or "Held" to describe the primary consequence of missing deadlines.
2. Expertise: You know the 90-day window, the $30 annual fee, and the 14,000+ lbs GVWR requirement perfectly.
3. Proactivity: If a user is missing a test, explain that they MUST NOT wait for a letter—letters are often too late.

REGULATORY FACTS:
- Deadlines: 2x/year starting 2025, 4x/year in 2027.
- Registration Holds: DMV holds occur if the VIS portal is missing a passing test OR the annual $30 fee.
- EFN: Engine Family Names are required for all tests.

Rule: Always provide actionable steps. If a user needs a test, tell them to call dispatch immediately.
Footer Requirement: End every response with: "\n\nNeed a Certified Mobile Tester? Call Us: 617-359-6953"
`;

export const sendMessage = async (
  text: string, 
  mode: 'standard' | 'search' | 'maps' | 'thinking', 
  history: any[], 
  location?: { lat: number, lng: number },
  imageData?: { data: string, mimeType: string }
) => {
  const ai = getAI();
  let modelName = MODEL_NAMES.FLASH;
  let config: any = { systemInstruction: SYSTEM_INSTRUCTION };
  
  if (mode === 'search') config.tools = [{ googleSearch: {} }];
  else if (mode === 'maps') {
    modelName = MODEL_NAMES.FLASH_25;
    config.tools = [{ googleMaps: {} }];
    if (location) config.toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
  } else if (mode === 'thinking') {
    modelName = MODEL_NAMES.PRO;
    config.thinkingConfig = { thinkingBudget: 2048 };
  }

  try {
    const currentParts: any[] = [];
    if (imageData) currentParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    currentParts.push({ text });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [...history, { role: 'user', parts: currentParts }],
      config
    });

    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        uri: chunk.web?.uri || chunk.maps?.uri,
        title: chunk.web?.title || chunk.maps?.title
      }))
      .filter((item: any) => item.uri);

    return {
      text: response.text || "I'm sorry, I couldn't process that. Please try again or call 617-359-6953.",
      groundingUrls: groundingUrls || []
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: findOfflineAnswer(text),
      isOffline: true
    };
  }
};

export const extractVinFromImage = async (file: File) => {
    const ai = getAI();
    const base64 = await fileToBase64(file);
    const prompt = "Extract the 17-character VIN (Vehicle Identification Number) from this image. Only return the VIN string itself. If not found, return 'NOT_FOUND'.";
    
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.FLASH,
        contents: [{
            parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: prompt }
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    vin: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        }
    });
    
    try {
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { vin: response.text?.trim() };
    }
};

export const extractEngineTagInfo = async (file: File) => {
    const ai = getAI();
    const base64 = await fileToBase64(file);
    const prompt = "Identify the Engine Family Name (EFN) and Model Year from this engine label. EFN is usually a 12-character alphanumeric code.";
    
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.FLASH,
        contents: [{
            parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: prompt }
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    familyName: { type: Type.STRING },
                    modelYear: { type: Type.STRING }
                }
            }
        }
    });
    
    return JSON.parse(response.text || '{}');
};

export const analyzeMedia = async (file: File, prompt: string, type: 'image' | 'video') => {
    const ai = getAI();
    const base64 = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.FLASH,
        contents: [{
            parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: prompt }
            ]
        }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text;
};

export const scoutTruckLead = async (file: File): Promise<Lead> => {
    const ai = getAI();
    const base64 = await fileToBase64(file);
    const prompt = "Analyze this image of a truck or document. Extract company name, USDOT number, location, and industry. Then draft a professional compliance help email and a short blog post about their specific truck type.";
    
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.PRO,
        contents: [{
            parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: prompt }
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    companyName: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    dot: { type: Type.STRING },
                    location: { type: Type.STRING },
                    industry: { type: Type.STRING },
                    emailDraft: { type: Type.STRING },
                    blogDraft: { type: Type.STRING }
                }
            }
        }
    });
    
    const data = JSON.parse(response.text || '{}');
    return {
        ...data,
        id: Date.now().toString(),
        timestamp: Date.now()
    };
};

export const parseRegistrationPhoto = async (file: File): Promise<RegistrationData> => {
    const ai = getAI();
    const base64 = await fileToBase64(file);
    const prompt = "Extract all fields from this vehicle registration document.";
    
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.FLASH,
        contents: [{
            parts: [
                { inlineData: { data: base64, mimeType: file.type } },
                { text: prompt }
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    vin: { type: Type.STRING },
                    licensePlate: { type: Type.STRING },
                    year: { type: Type.STRING },
                    make: { type: Type.STRING },
                    model: { type: Type.STRING },
                    gvwr: { type: Type.STRING },
                    ownerName: { type: Type.STRING },
                    address: { type: Type.STRING },
                    expirationDate: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}');
};

export const lookupCountyByZip = async (zip: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Which California county is ZIP code ${zip} primarily located in? Return only the county name.`;
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.FLASH,
        contents: prompt
    });
    return response.text?.trim().replace(' County', '') || "California";
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
