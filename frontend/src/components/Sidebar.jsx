import "./Sidebar.css";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FileIcon({ type }) {
  const label =
    type === "pdf" ? "PDF" : type === "docx" ? "DOC" : "TXT";
  return (
    <span className={`file-icon ${type || "txt"}`} aria-hidden>
      {label}
    </span>
  );
}

export default function Sidebar({
  documents,
  activeDocId,
  onSelect,
  onRefresh,
  onDelete,
  deletingId,
}) {
  const handleDelete = (e, doc) => {
    e.stopPropagation();
    const ok = window.confirm(
      `Delete "${doc.filename}"? This cannot be undone.`
    );
    if (ok) onDelete(doc.id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <h2>Documents</h2>
          <p className="sidebar-sub">{documents.length} uploaded</p>
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={onRefresh}
          title="Refresh list"
          aria-label="Refresh documents"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006.34 6.34M4 15a8 8 0 0013.66 2.66"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <ul className="doc-list">
        {documents.length === 0 && (
          <li className="doc-empty">
            <div className="empty-illus" aria-hidden>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p>No documents yet</p>
            <span>Upload a PDF, DOCX, or TXT to get started</span>
          </li>
        )}
        {documents.map((doc) => (
          <li key={doc.id} className="doc-list-item">
            <div
              className={`doc-item-row ${activeDocId === doc.id ? "active" : ""}`}
            >
              <button
                type="button"
                className="doc-item"
                onClick={() => onSelect(doc)}
              >
                <FileIcon type={doc.file_type} />
                <div className="doc-item-body">
                  <span className="doc-filename">{doc.filename}</span>
                  <span className="doc-date">{formatDate(doc.created_at)}</span>
                </div>
              </button>
              <button
                type="button"
                className="doc-delete"
                onClick={(e) => handleDelete(e, doc)}
                disabled={deletingId === doc.id}
                aria-label={`Delete ${doc.filename}`}
                title="Delete document"
              >
                {deletingId === doc.id ? (
                  <span className="delete-spinner" aria-hidden />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
