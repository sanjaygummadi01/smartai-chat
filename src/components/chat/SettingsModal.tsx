import { useState } from 'react';
import { X, Sparkles, Brain, MessageSquare, Sliders, RotateCcw } from 'lucide-react';
import {
  AISettings,
  loadSettings,
  saveSettings,
  getTemperatureFromMode,
  DEFAULT_SYSTEM_PROMPT,
} from '@/lib/aiSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AISettings>(() => loadSettings());

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings(settings);
    onClose();
  };

  const handleReset = () => {
    const defaults: AISettings = {
      temperature: 0.7,
      maxTokens: 2048,
      creativityMode: 'balanced',
      responseStyle: 'detailed',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    };
    setSettings(defaults);
  };

  const setCreativityMode = (mode: AISettings['creativityMode']) => {
    setSettings((s) => ({ ...s, creativityMode: mode, temperature: getTemperatureFromMode(mode) }));
  };

  const creativityOptions: { value: AISettings['creativityMode']; label: string; icon: string; desc: string }[] = [
    { value: 'precise', label: 'Precise', icon: '🎯', desc: 'Factual & focused' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'Best of both' },
    { value: 'creative', label: 'Creative', icon: '🎨', desc: 'Imaginative & free' },
  ];

  const styleOptions: { value: AISettings['responseStyle']; label: string; desc: string }[] = [
    { value: 'concise', label: '⚡ Concise', desc: 'Short & to the point' },
    { value: 'detailed', label: '📝 Detailed', desc: 'Thorough explanations' },
    { value: 'conversational', label: '💬 Conversational', desc: 'Friendly & casual' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-backdrop"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto animate-message-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Settings</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Creativity Mode */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Creativity Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {creativityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCreativityMode(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-center ${
                  settings.creativityMode === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-secondary hover:bg-muted'
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-xs font-medium text-foreground">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Temperature</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">
              {settings.temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => setSettings((s) => ({ ...s, temperature: parseFloat(e.target.value) }))}
            className="w-full accent-primary h-1.5 rounded-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Deterministic</span>
            <span>Random</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Max Response Length</span>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">
              {settings.maxTokens}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="4096"
            step="256"
            value={settings.maxTokens}
            onChange={(e) => setSettings((s) => ({ ...s, maxTokens: parseInt(e.target.value) }))}
            className="w-full accent-primary h-1.5 rounded-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>

        {/* Response Style */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Response Style</span>
          </div>
          <div className="flex flex-col gap-2">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSettings((s) => ({ ...s, responseStyle: opt.value }))}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                  settings.responseStyle === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-secondary hover:bg-muted'
                }`}
              >
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">System Prompt</span>
            <button
              onClick={() => setSettings((s) => ({ ...s, systemPrompt: DEFAULT_SYSTEM_PROMPT }))}
              className="text-[10px] text-primary hover:underline"
            >
              Reset
            </button>
          </div>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
            rows={3}
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            placeholder="Customize AI personality..."
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl gradient-accent text-white font-medium hover:opacity-90 transition-all active:scale-[0.98] text-sm"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
