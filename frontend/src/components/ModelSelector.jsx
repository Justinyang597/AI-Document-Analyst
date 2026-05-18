import "./ModelSelector.css";

export const PROVIDER_MODELS = {
  claude: [
    { id: "claude-opus-4-7",           label: "Opus 4.7" },
    { id: "claude-sonnet-4-6",         label: "Sonnet 4.6" },
    { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
  ],
  openai: [
    { id: "gpt-4.1",     label: "GPT-4.1" },
    { id: "o3-mini",     label: "o3 Mini" },
    { id: "gpt-4o",      label: "GPT-4o" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  ],
  gemini: [
    { id: "gemini-2.5-pro",        label: "2.5 Pro" },
    { id: "gemini-2.5-flash",      label: "2.5 Flash" },
    { id: "gemini-2.5-flash-lite", label: "2.5 Flash Lite" },
  ],
};

export const DEFAULT_MODELS = {
  claude: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash-lite",
};

export default function ModelSelector({ provider, model, onChange }) {
  const models = PROVIDER_MODELS[provider] ?? [];

  return (
    <div className="model-selector">
      <select
        value={model}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select model"
        className={`model-select ${provider}`}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
