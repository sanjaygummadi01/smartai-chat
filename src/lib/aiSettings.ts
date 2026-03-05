export interface AISettings {
  temperature: number;
  maxTokens: number;
  creativityMode: 'precise' | 'balanced' | 'creative';
  responseStyle: 'concise' | 'detailed' | 'conversational';
  systemPrompt: string;
}

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.7,
  maxTokens: 2048,
  creativityMode: 'balanced',
  responseStyle: 'detailed',
  systemPrompt:
    'You are Smart AI, a helpful and knowledgeable assistant. Provide clear, well-structured responses. Use markdown formatting including bold, lists, code blocks, and tables when appropriate. Keep answers concise but thorough.',
};

const STORAGE_KEY = 'smartai_settings';

export function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AISettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getTemperatureFromMode(mode: AISettings['creativityMode']): number {
  switch (mode) {
    case 'precise': return 0.3;
    case 'balanced': return 0.7;
    case 'creative': return 1.0;
  }
}

export const DEFAULT_SYSTEM_PROMPT = DEFAULT_SETTINGS.systemPrompt;
