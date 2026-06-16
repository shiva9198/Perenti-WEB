import React, { useState, useEffect } from "react";

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
  style = {},
}) {
  const sizeClass = `avatar-${size}`;
  const initial = name ? name[0].toUpperCase() : "?";
  const hasValidSrc = typeof src === "string" ? src.trim() !== "" : !!src;
  const [imgError, setImgError] = useState(!hasValidSrc);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgError(!hasValidSrc);
  }

  return (
    <div className={`avatar ${sizeClass} ${className}`} style={style}>
      {hasValidSrc && !imgError ? (
        <img src={src} alt={name} onError={() => setImgError(true)} />
      ) : (
        <span
          className="avatar-initials"
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
