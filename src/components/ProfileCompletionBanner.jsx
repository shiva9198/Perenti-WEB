import React from "react";
import { AlertCircle, ChevronRight } from "lucide-react";

export default function ProfileCompletionBanner({ onCompleteClick }) {
  return (
    <div
      style={{
        background: "var(--primary-glow)",
        borderBottom: "1px solid rgba(242, 87, 48, 0.2)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 140,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={20} />
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "0.9375rem",
            color: "var(--text-primary)",
            lineHeight: 1.4,
          }}
        >
          <span style={{ fontWeight: 600 }}>Action Required:</span> Your profile
          is incomplete. Add a social link (LinkedIn or Instagram), your
          location, and bio so others can connect with you!
        </div>
        <button
          onClick={onCompleteClick}
          className="btn btn-primary btn-sm"
          style={{ whiteSpace: "nowrap", flexShrink: 0, padding: "8px 16px" }}
        >
          Complete Now <ChevronRight size={16} style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  );
}
