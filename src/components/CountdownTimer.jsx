import React, { useState, useEffect } from "react";

/**
 * useCountdown – returns live { minutes, seconds, isExpired, timeLeft }
 * @param {string|null} expiresAt - ISO timestamp string
 */
function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, new Date(expiresAt) - new Date());
  });

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setTimeLeft(Math.max(0, new Date(expiresAt) - new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isExpired = timeLeft === 0;

  return { minutes, seconds, isExpired, timeLeft };
}

/**
 * CountdownTimer – renders MM:SS, turns red under 3 minutes, shows "Expired" at zero.
 * Props:
 *   expiresAt  {string}  ISO timestamp
 *   style      {object}  optional extra styles on the outer span
 *   showLabel  {bool}    if true, prepend "Expires in " text
 */
export default function CountdownTimer({
  expiresAt,
  style,
  showLabel = false,
}) {
  const { minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return (
      <span
        style={{
          color: "var(--red)",
          fontWeight: 700,
          fontSize: "0.875rem",
          ...style,
        }}
      >
        Expired
      </span>
    );
  }

  const urgent = minutes < 3;

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: "1rem",
        color: urgent ? "var(--red)" : "var(--orange, #FF7101)",
        transition: "color 0.3s",
        ...style,
      }}
    >
      {showLabel && "Expires in "}
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
