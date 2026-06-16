import React, { useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { createMember } from "../services/api";

export default function OnboardingModal({ user, onComplete }) {
  const [form, setForm] = useState({
    full_name: user?.name || "",
    profession: "",
    company: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.profession) {
      setError("Name and Role are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const newMember = await createMember({
        ...form,
        email: user?.email,
        tags: [],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.full_name)}`,
      });
      // Replace avatar with avatar_url, add id
      const formattedMember = {
        ...newMember,
        name: newMember.full_name,
        avatar: newMember.avatar_url,
      };
      onComplete(formattedMember);
    } catch (err) {
      setError("Failed to create profile. Please try again.");
      setLoading(false);
    }
  };

  const inputSt = {
    width: "100%",
    padding: "12px 16px",
    background: "var(--bg-elevated)",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    fontSize: "0.9375rem",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelSt = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 500,
          padding: "32px 40px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--primary-glow)",
              border: "1px solid var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <UserPlus color="var(--primary)" size={28} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Complete Your Profile
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              lineHeight: 1.5,
            }}
          >
            Welcome to EBC! Tell the community a bit about yourself to unlock
            full access.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(242,87,48,0.1)",
              color: "var(--red)",
              padding: "12px",
              borderRadius: 8,
              fontSize: "0.875rem",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label style={labelSt}>Full Name *</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              style={inputSt}
              required
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Role / Profession *</label>
              <input
                name="profession"
                placeholder="e.g. Founder, Developer"
                value={form.profession}
                onChange={handleChange}
                style={inputSt}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>Company</label>
              <input
                name="company"
                placeholder="Optional"
                value={form.company}
                onChange={handleChange}
                style={inputSt}
              />
            </div>
          </div>

          <div>
            <label style={labelSt}>Location</label>
            <input
              name="location"
              placeholder="e.g. Hyderabad, India"
              value={form.location}
              onChange={handleChange}
              style={inputSt}
            />
          </div>

          <div>
            <label style={labelSt}>Short Bio</label>
            <textarea
              name="bio"
              placeholder="What are you building?"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              style={{ ...inputSt, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 8,
              padding: "14px",
              fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving Profile..." : "Join Community"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
