import "./ProviderToggle.css";

const PROVIDERS = [
  { id: "claude", label: "Claude" },
  { id: "openai", label: "GPT" },
  { id: "gemini", label: "Gemini" },
];

export default function ProviderToggle({ provider, onChange }) {
  return (
    <div className="provider-toggle" role="group" aria-label="AI provider">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`provider-btn ${provider === p.id ? `active ${p.id}` : ""}`}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
