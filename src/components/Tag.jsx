import React from "react";
import { getTagColor } from "../services/api";

export default function Tag({ label }) {
  const cls = getTagColor(label);
  return (
    <span
      className={`tag ${cls}`}
      style={{
        display: "inline-block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
