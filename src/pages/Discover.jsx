import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Bell,
  Star,
  ArrowRight,
  Home,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { LinkedinIcon } from "../components/Icons";
import { fetchMembers, fetchMeetups, createSlug } from "../services/api";
import Avatar from "../components/Avatar";
import LottiePlayer from "../components/LottiePlayer";
import {
  MemberCardVertical,
  MemberCardHorizontal,
} from "../components/MemberCard";

export default function Discover() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchMeetups()])
      .then(([membersData, meetupsData]) => {
        setMembers(membersData || []);
        const active = (meetupsData || []).filter((m) => m.is_active !== false);
        setMeetups(active);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data for Discover page:", err);
        setLoading(false);
      });
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // Choose the first active meetup as spotlight event
  const upcomingMeetup = meetups[0];
  const nearThem = members.filter(
    (m) =>
      m.area &&
      (m.area.includes("Jubilee Hills") ||
        m.area.includes("HITEC City") ||
        m.area.includes("Hyderabad")),
  );
  const recentlyJoined = [...members].reverse().slice(0, 4);
  const recommended = members.filter(
    (m) =>
      m.tags && (m.tags.includes("Founder") || m.tags.includes("Investor")),
  );
  const founders = members.filter((m) => m.tags && m.tags.includes("Founder"));
  const businessOwners = members.filter(
    (m) => m.tags && m.tags.includes("Business Owner"),
  );
  const topContributors = members;

  if (loading) {
    return (
      <div className="main-feed">
        <div className="page-header">
          <div className="page-header-inner">
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {getGreeting()}
              </div>
              <div className="page-title gradient-text">Discover</div>
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Spotlight skeleton */}
          <div
            className="skeleton skeleton-card"
            style={{ height: 220, width: "100%" }}
          />
          {/* Member row skeleton */}
          <div>
            <div
              className="skeleton skeleton-title"
              style={{ width: 140, marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 12, overflowX: "hidden" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: 160 }}>
                  <div
                    className="skeleton skeleton-card"
                    style={{ height: 180 }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Second row skeleton */}
          <div>
            <div
              className="skeleton skeleton-title"
              style={{ width: 180, marginBottom: 16 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton skeleton-card"
                  style={{ height: 72 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-feed">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {getGreeting()}
            </div>
            <div className="page-title gradient-text">Discover</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to="/directory"
              className="btn btn-ghost btn-icon"
              style={{ textDecoration: "none" }}
            >
              <Search size={20} color="var(--text-secondary)" />
            </Link>
            <button className="btn btn-ghost btn-icon">
              <Bell size={20} color="var(--text-secondary)" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 8 }}>
        {/* Spotlight Hero */}
        {/* GenZ x Premium Spotlight Hero */}
        <div
          className="discover-spotlight-wrapper"
          style={{ padding: "24px 24px 0" }}
        >
          <div
            className="spotlight-card"
            onClick={() =>
              upcomingMeetup
                ? navigate(`/meetups/${createSlug(upcomingMeetup.title)}`)
                : navigate("/meetups")
            }
            style={{
              transition:
                "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
              e.currentTarget.style.background = "var(--bg-elevated)";
              const arrow = e.currentTarget.querySelector(".spotlight-arrow");
              if (arrow) arrow.style.transform = "translateX(6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "var(--bg-card)";
              const arrow = e.currentTarget.querySelector(".spotlight-arrow");
              if (arrow) arrow.style.transform = "translateX(0)";
            }}
          >
            {/* Ambient Background Light / Blur */}
            <div
              className="spotlight-bg-blur"
              style={{
                backgroundImage:
                  upcomingMeetup && upcomingMeetup.banner_url
                    ? `url(${upcomingMeetup.banner_url})`
                    : "none",
                opacity:
                  upcomingMeetup && upcomingMeetup.banner_url ? 0.35 : 0.05,
              }}
            />

            {/* Giant watermark */}
            <div
              style={{
                position: "absolute",
                bottom: -24,
                left: 16,
                fontSize: "clamp(100px, 18vw, 220px)",
                fontWeight: 900,
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
                opacity: 0.03,
                pointerEvents: "none",
                lineHeight: 0.75,
                letterSpacing: "-0.05em",
                zIndex: 1,
              }}
            >
              {upcomingMeetup ? "MEETUP" : "EVENTS"}
            </div>

            {/* Responsive content wrapper */}
            <div className="spotlight-content">
              {/* Left side: Banner image or Calendar block */}
              <div
                className="spotlight-left-section"
                style={{ position: "relative", zIndex: 2, flexShrink: 0 }}
              >
                {upcomingMeetup &&
                upcomingMeetup.banner_url &&
                upcomingMeetup.banner_url.trim() !== "" ? (
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: 280,
                        height: 160,
                        borderRadius: 18,
                        overflow: "hidden",
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      <img
                        src={upcomingMeetup.banner_url}
                        alt={upcomingMeetup.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    {/* Tilted Floating Badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -6,
                        right: -10,
                        background: "var(--primary)",
                        color: "#000",
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        boxShadow: "0 8px 16px rgba(3,212,124,0.3)",
                        transform: "rotate(-6deg)",
                      }}
                    >
                      Next Event
                    </div>
                  </div>
                ) : (
                  /* Sleek calendar card placeholder */
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 20,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-strong)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 16,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "var(--primary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginBottom: 4,
                      }}
                    >
                      {upcomingMeetup
                        ? (() => {
                            const parts = upcomingMeetup.date.split(",");
                            if (parts.length > 1) {
                              const monthPart = parts[1].trim().split(" ")[0];
                              return monthPart.substring(0, 3).toUpperCase();
                            }
                            return "EVENT";
                          })()
                        : "NEXT"}
                    </div>
                    <div
                      style={{
                        fontSize: "2.75rem",
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        lineHeight: 1,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {upcomingMeetup
                        ? upcomingMeetup.date.match(/\d+/)?.[0] || "📅"
                        : "📅"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        marginTop: 6,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      {upcomingMeetup ? upcomingMeetup.time : "Meetups"}
                    </div>
                    {upcomingMeetup && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -8,
                          right: -12,
                          background: "var(--primary)",
                          color: "#000",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          boxShadow: "0 8px 16px rgba(3,212,124,0.3)",
                          transform: "rotate(-6deg)",
                        }}
                      >
                        Next Event
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right side: Content Section */}
              <div
                className="spotlight-right-section"
                style={{
                  flex: 1,
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  className="spotlight-badge-container"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 2,
                      background: "var(--primary)",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {upcomingMeetup ? "Spotlight Event" : "EBC Meetups"}
                  </span>
                </div>

                <div
                  className="spotlight-title-text"
                  style={{
                    fontSize: "clamp(1.65rem, 3.5vw, 2.5rem)",
                    fontWeight: 600,
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.03em",
                    color: "var(--text-primary)",
                    lineHeight: 1.15,
                    marginBottom: 16,
                  }}
                >
                  {upcomingMeetup
                    ? upcomingMeetup.title
                    : "No upcoming events scheduled"}
                </div>

                <div
                  className="spotlight-meta-info"
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    marginBottom: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontWeight: 400,
                  }}
                >
                  {upcomingMeetup ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Calendar
                          size={16}
                          color="var(--primary)"
                          style={{ flexShrink: 0 }}
                        />
                        <span>
                          {upcomingMeetup.date} &bull; {upcomingMeetup.time}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <MapPin
                          size={16}
                          color="var(--primary)"
                          style={{ flexShrink: 0 }}
                        />
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {upcomingMeetup.venue}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span>
                      Stay tuned! Browse our events directory to view past
                      meetups and community activities.
                    </span>
                  )}
                </div>

                <div
                  className="spotlight-cta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "var(--text-tertiary)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    {upcomingMeetup
                      ? "View details & register"
                      : "Go to events directory"}
                  </span>
                  <div
                    className="spotlight-arrow"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1px solid var(--border-medium)",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition:
                        "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <ArrowRight size={14} color="var(--primary)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div
          style={{
            padding: "24px 24px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Action 1: Add LinkedIn */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(3, 212, 124, 0.1), rgba(3, 212, 124, 0.02))",
              border: "1px solid rgba(3, 212, 124, 0.2)",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                  marginBottom: 6,
                  fontFamily: "var(--font-display)",
                }}
              >
                Get 2× more views
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Add your LinkedIn to verify your professional profile.
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Link
                to="/profile/me"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: "none", display: "inline-flex" }}
              >
                <LinkedinIcon size={14} /> Add Link
              </Link>
            </div>
          </div>

          {/* Action 2: Directory */}
          <div
            style={{
              background: "var(--bg-elevated)",
              borderRadius: 16,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                  fontFamily: "var(--font-display)",
                }}
              >
                Expand your network
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Browse the complete directory of verified founders in Hyderabad.
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Link
                to="/directory"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: "none", display: "inline-flex" }}
              >
                Browse Directory
              </Link>
            </div>
          </div>
        </div>

        {/* Face Pile */}
        <div style={{ padding: "40px 24px 0" }}>
          <div
            style={{
              fontSize: "1.0625rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 4,
              fontFamily: "var(--font-display)",
            }}
          >
            Top Contributors
          </div>
          <div
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              marginBottom: 16,
            }}
          >
            The most active members this week
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div className="face-pile">
              {topContributors.slice(0, 5).map((m, i) => (
                <Link
                  key={m.id}
                  to={`/profile/${m.id}`}
                  style={{
                    marginLeft: i === 0 ? 0 : -10,
                    zIndex: 10 - i,
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <Avatar
                    src={m.avatar}
                    name={m.name}
                    size="sm"
                    style={{
                      border: "3px solid var(--bg)",
                      borderRadius: "50%",
                    }}
                  />
                </Link>
              ))}
              <div className="face-pile-more">
                +{Math.max(0, topContributors.length - 5)}
              </div>
            </div>
            <div
              style={{
                marginLeft: 16,
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                {topContributors.length}
              </span>{" "}
              active members
            </div>
          </div>
        </div>

        {/* People Near Them */}
        {nearThem.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">People Near You</div>
              <Link
                to="/directory"
                className="section-see-all"
                style={{ textDecoration: "none" }}
              >
                See all
              </Link>
            </div>
            <div className="grid-row">
              {nearThem.map((m) => (
                <MemberCardVertical key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Joined */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Recently Joined</div>
            <Link
              to="/directory"
              className="section-see-all"
              style={{ textDecoration: "none" }}
            >
              See all
            </Link>
          </div>
          <div className="grid-list">
            {recentlyJoined.map((m) => (
              <MemberCardHorizontal key={m.id} member={m} />
            ))}
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Recommended for You</div>
              <Link
                to="/directory"
                className="section-see-all"
                style={{ textDecoration: "none" }}
              >
                See all
              </Link>
            </div>
            <div className="grid-row">
              {recommended.map((m) => (
                <MemberCardVertical key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        {/* New Founders */}
        {founders.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">New Founders</div>
              <Link
                to="/directory"
                className="section-see-all"
                style={{ textDecoration: "none" }}
              >
                See all
              </Link>
            </div>
            <div className="grid-row">
              {founders.map((m) => (
                <MemberCardVertical key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        {/* Business Owners */}
        {businessOwners.length > 0 && (
          <div className="section" style={{ borderBottom: "none" }}>
            <div className="section-header">
              <div className="section-title">Business Owners</div>
              <Link
                to="/directory"
                className="section-see-all"
                style={{ textDecoration: "none" }}
              >
                See all
              </Link>
            </div>
            <div className="grid-list">
              {businessOwners.map((m) => (
                <MemberCardHorizontal key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
