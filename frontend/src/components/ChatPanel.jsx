import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ChatPanel.css";

const SUGGESTIONS = [
  "Summarize the key points",
  "What are the main conclusions?",
  "List any dates or deadlines mentioned",
  "Explain this in simple terms",
];

const PROVIDER_LABELS = {
  claude: "Claude",
  openai: "GPT",
  gemini: "Gemini",
};

export default function ChatPanel({ messages, onSend, isLoading, disabled, provider = "claude" }) {
  const providerLabel = PROVIDER_LABELS[provider] ?? "AI";
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Ask about your document</h3>
            <p>Get summaries, answers, and insights powered by {providerLabel}.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="suggestion-chip"
                  disabled={disabled || isLoading}
                  onClick={() => onSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-row ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`} aria-hidden>
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div className={`chat-bubble ${msg.role}`}>
              <div className="bubble-content">
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : isLoading && i === messages.length - 1 ? (
                    <span className="typing">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </span>
                  ) : null
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-composer" onSubmit={submit}>
        <div className="composer-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${providerLabel} about this document…`}
            rows={1}
            disabled={disabled || isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isLoading || disabled}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5m0 0l-6 6m6-6l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="composer-hint">Enter to send · Shift+Enter for new line</p>
      </form>
    </div>
  );
}
