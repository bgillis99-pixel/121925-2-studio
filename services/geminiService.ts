
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODEL_NAMES } from "../constants";
import { Lead, ImageGenerationConfig, RegistrationData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const OFFLINE_KNOWLEDGE_BASE = [
  {
    keywords: ['blocked', 'hold', 'registration', 'dmv', 'renew'],
    answer: "🔒 **Why is my registration blocked?**\n\nCommon reasons:\n1. **Unpaid State Fee:** You must pay the $30 annual compliance fee per vehicle at https://cleantruckcheck.arb.ca.gov/.\n2. **Missing Test:** You need a passing Smoke/OBD test submitted within 90 days of your registration date."
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
You are VIN DIESEL, a specialized AI Compliance Officer for the California Clean Truck Check (HD I/M) Program.
Base answers strictly on official CARB data (ww2.arb.ca.gov/our-work/programs/CTC).
Scope: ONLY Heavy-Duty Diesel Trucks (>14,000 lbs GVWR).
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

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .filter((c: any) => c.web?.uri || c.maps?.uri)
      .map((c: any) => ({ uri: c.web?.uri || "https://maps.google.com", title: c.web?.title || "Reference" }));

    return { text: response.text || "No response.", groundingUrls, isOffline: false };
  } catch (error) {
    return { text: findOfflineAnswer(text) + "\n\nNeed clarity? 617-359-6953", groundingUrls: [], isOffline: true };
  }
};

export const lookupCountyByZip = async (zip: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAMES.FLASH,
      contents: `Identify the California County for ZIP code ${zip}. Return ONLY the name of the county followed by the word 'County'. No other text.`
    });
    return response.text?.trim() || "California County";
  } catch {
    return "California County";
  }
};

export const extractVinFromImage = async (file: File): Promise<{vin: string, description: string}> => {
  const ai = getAI();
  const b64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.PRO,
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: b64 } },
        { text: "Extract VIN and Year/Make/Model. JSON: {vin, description}" }
      ]
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: { vin: { type: Type.STRING }, description: { type: Type.STRING } }
        }
    }
  });
  const json = JSON.parse(response.text || '{}');
  return { vin: (json.vin || '').toUpperCase(), description: json.description || 'Truck' };
};

export const extractEngineTagInfo = async (file: File): Promise<{familyName: string, modelYear: string}> => {
  const ai = getAI();
  const b64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.PRO,
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: b64 } },
        { text: "Extract Engine Family Name (EFN) and Model Year. Return JSON." }
      ]
    },
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
  const json = JSON.parse(response.text || '{}');
  return { familyName: (json.familyName || 'UNKNOWN').toUpperCase(), modelYear: json.modelYear || 'N/A' };
};

export const analyzeMedia = async (file: File, prompt: string, type: 'image' | 'video'): Promise<string> => {
  const ai = getAI();
  const b64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.FLASH,
    contents: { parts: [{ inlineData: { mimeType: file.type, data: b64 } }, { text: prompt }] }
  });
  return response.text || "No analysis provided.";
};

export const generateAppImage = async (prompt: string, config: {aspectRatio: string, size: string}): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.PRO_IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: config.aspectRatio as any, imageSize: config.size as any } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.TTS,
    contents: [{ parts: [{ text }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

export const transcribeAudio = async (file: File): Promise<string> => {
  const ai = getAI();
  const b64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: MODEL_NAMES.FLASH,
    contents: { parts: [{ inlineData: { mimeType: file.type, data: b64 } }, { text: "Transcribe audio." }] }
  });
  return response.text || "No transcription.";
};

export const scoutTruckLead = async (file: File): Promise<Lead> => {
    const ai = getAI();
    const b64 = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.PRO,
        contents: { parts: [{ inlineData: { mimeType: file.type, data: b64 } }, { text: "Extract Lead Info. JSON." }] },
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
    const json = JSON.parse(response.text || '{}');
    return { id: Date.now().toString(), timestamp: Date.now(), ...json };
};

export const parseRegistrationPhoto = async (file: File): Promise<RegistrationData> => {
    const ai = getAI();
    const b64 = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.PRO,
        contents: { parts: [{ inlineData: { mimeType: file.type, data: b64 } }, { text: "Extract Registration. JSON." }] },
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
