export const COLORS = {
  NAVY: '#003366',
  GREEN: '#15803d',
  WHITE: '#ffffff',
  BG: '#f8f9fa'
};

export const MODEL_NAMES = {
  // Use gemini-3-flash-preview for general tasks as per guidelines
  FLASH: 'gemini-3-flash-preview',
  // Keep 2.5 flash specifically for Maps grounding as per requirements
  FLASH_25: 'gemini-2.5-flash',
  // Use recommended alias for flash lite
  FLASH_LITE: 'gemini-flash-lite-latest',
  PRO: 'gemini-3-pro-preview',
  PRO_IMAGE: 'gemini-3-pro-image-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
  AUDIO: 'gemini-2.5-flash-native-audio-preview-09-2025',
  VEO_FAST: 'veo-3.1-fast-generate-preview'
};

export const ASPECT_RATIOS = [
  "1:1", "3:4", "4:3", "9:16", "16:9"
];

export const IMAGE_SIZES = ["1K", "2K", "4K"];