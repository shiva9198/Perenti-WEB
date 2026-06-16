import React from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, CheckCircle } from "lucide-react";
import Avatar from "./Avatar";
import { fetchMembers } from "../services/api";

export default function RightPanel() {
  const [suggestions, setSuggestions] = React.useState([]);

  React.useEffect(() => {
    fetchMembers().then((data) => {
      // Pick random 4 members
      setSuggestions(data.sort(() => 0.5 - Math.random()).slice(0, 4));
    });
  }, []);

  return (
    <aside className="right-panel">
      {/* Community Stats */}
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "var(--space-4)",
          fontFamily: "var(--font-display)",
        }}
      >
        Community Stats
      </h3>
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-3)",
          marginBottom: 32,
        }}
      >
        {[
          { value: "2000+", label: "Members" },
          { value: "27+", label: "Events" },
          { value: "800+", label: "Attendees" },
          { value: "Infinite", label: "Collaborations" },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{
              padding: "var(--space-3)",
              background: "var(--bg-card)",
              border: "none",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <div
              className="stat-value"
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {s.value}
            </div>
            <div
              className="stat-label"
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                textTransform: "uppercase",
                tracking: "0.05em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Who to Connect */}
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "var(--space-4)",
          fontFamily: "var(--font-display)",
        }}
      >
        Who to Connect
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 32,
        }}
      >
        {suggestions.map((m, i) => (
          <Link
            key={m.id}
            to={`/profile/${m.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 200ms",
              textDecoration: "none",
            }}
            className="card-hover"
          >
            <Avatar src={m.avatar} name={m.name} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.name}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.profession}
              </div>
            </div>
            <ArrowRight size={14} color="var(--text-tertiary)" />
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "none",
          borderRadius: "var(--radius-lg)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Zap size={16} color="var(--primary)" />
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Complete Your Profile
          </span>
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          Get 3× more connection requests with a complete profile.
        </p>
        <Link
          to="/profile/me"
          className="btn btn-primary btn-sm"
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            textDecoration: "none",
          }}
        >
          <CheckCircle size={14} />
          Complete Now
        </Link>
      </div>
    </aside>
  );
}
