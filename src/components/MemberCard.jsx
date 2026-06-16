import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import Tag from "./Tag";

export function MemberCardVertical({ member }) {
  return (
    <Link
      to={`/profile/${member.id}`}
      className="member-card-vertical"
      style={{ textDecoration: "none" }}
    >
      <Avatar
        src={member.avatar}
        name={member.name}
        size="lg"
        style={{ borderRadius: 16 }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="member-name">{member.name}</div>
        <div className="member-role" style={{ marginTop: 4 }}>
          {member.profession}
        </div>
        <div className="member-area" style={{ marginTop: 2 }}>
          {member.area.split(",")[0]}
        </div>
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {member.tags && member.tags[0] && <Tag label={member.tags[0]} />}
      </div>
    </Link>
  );
}

export function MemberCardHorizontal({ member }) {
  return (
    <Link
      to={`/profile/${member.id}`}
      className="member-card-horizontal"
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Avatar
        src={member.avatar}
        name={member.name}
        size="md"
        style={{ borderRadius: 12, flexShrink: 0 }}
      />
      <div
        className="member-info"
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: "var(--space-3)",
          overflow: "hidden",
        }}
      >
        <div
          className="member-name"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.name}
        </div>
        <div
          className="member-role"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.profession}
        </div>
        <div
          className="member-area"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.area}
        </div>
      </div>
      {member.tags && member.tags[0] && (
        <div
          style={{
            flexShrink: 0,
            paddingLeft: 8,
            paddingRight: 4,
            maxWidth: 90,
          }}
        >
          <span
            style={{
              display: "block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 999,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            {member.tags[0]}
          </span>
        </div>
      )}
    </Link>
  );
}
