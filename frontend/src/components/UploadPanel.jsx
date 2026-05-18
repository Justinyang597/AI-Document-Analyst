import { useCallback, useState } from "react";
import "./UploadPanel.css";

export default function UploadPanel({ onUpload, isUploading }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "txt", "docx"].includes(ext)) {
        alert("Only PDF, DOCX, and TXT files are supported.");
        return;
      }
      onUpload(file);
    },
    [onUpload]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="upload-wrap">
      <div className="upload-hero">
        <h2>Upload a document</h2>
        <p>Drop a PDF, Word doc, or text file and start asking questions with your selected AI model.</p>
      </div>
      <label
        className={`upload-zone ${dragOver ? "drag-over" : ""} ${isUploading ? "loading" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          hidden
          disabled={isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="upload-icon-wrap">
          <svg className="upload-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="upload-title">
          {isUploading ? "Extracting text…" : "Drag & drop your file here"}
        </p>
        <p className="upload-hint">PDF, DOCX, or TXT · up to 16 MB</p>
        {!isUploading && <span className="upload-btn">Browse files</span>}
        {isUploading && <span className="upload-spinner" aria-hidden />}
      </label>
      <div className="upload-features">
        <div className="feature">
          <span className="feature-icon">✦</span>
          <span>Summarize & extract insights</span>
        </div>
        <div className="feature">
          <span className="feature-icon">◈</span>
          <span>Ask follow-up questions</span>
        </div>
        <div className="feature">
          <span className="feature-icon">↻</span>
          <span>Re-open past documents anytime</span>
        </div>
      </div>
    </div>
  );
}
