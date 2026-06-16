import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { fetchMeetups, createSlug } from "../services/api";
import { parseMeetupTimes } from "../utils/dateHelpers";
import CompletedStamp from "../components/CompletedStamp";

export default function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetups()
      .then((data) => {
        const active = Array.isArray(data)
          ? data.filter((m) => m.is_active !== false)
          : [];
        setMeetups(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sort and group meetups
  const sortedMeetups = meetups;

  const grouped = [];
  sortedMeetups.forEach((m) => {
    const dateStr = m.date || "TBD";
    let group = grouped.find((g) => g.date === dateStr);
    if (!group) {
      group = { date: dateStr, items: [] };
      grouped.push(group);
    }
    group.items.push(m);
  });

  if (loading) {
    return (
      <div
        className="main-feed"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ color: "var(--text-secondary)" }}>Loading events…</div>
      </div>
    );
  }

  return (
    <div className="main-feed" style={{ overflowY: "auto" }}>
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-title gradient-text">Events Directory</div>
        </div>
      </div>

      <div
        style={{
          padding: "32px 24px",
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Calendar
              size={48}
              color="var(--border-strong)"
              style={{ margin: "0 auto 16px" }}
            />
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              No upcoming events
            </div>
            <div style={{ color: "var(--text-secondary)", marginTop: 8 }}>
              Check back later.
            </div>
          </div>
        ) : (
          <div
            style={{ position: "relative", paddingLeft: 28, margin: "10px 0" }}
          >
            {grouped.map((group, index) => (
              <div
                key={group.date}
                style={{ paddingBottom: 36, position: "relative", zIndex: 2 }}
              >
                {/* Segmented Timeline Line */}
                {index < grouped.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      bottom: -8, // Reaches exactly the center of the next dot
                      left: -24, // Matches left: 4 relative to container paddingLeft: 28
                      width: 1,
                      background: "var(--border-strong)",
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Timeline Dot & Date Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                    position: "relative",
                  }}
                >
                  {/* Bullet dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: -28,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      border: "2px solid var(--bg)",
                      boxShadow: "0 0 0 1px var(--border-strong)",
                      marginLeft: 1,
                      zIndex: 2,
                    }}
                  />

                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      paddingLeft: 8,
                    }}
                  >
                    {group.date}
                  </div>
                </div>

                {/* Event Cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    paddingLeft: 8,
                  }}
                >
                  {group.items.map((meetup) => {
                    const { end } = parseMeetupTimes(meetup.date, meetup.time);
                    const isEnded = Date.now() > end.getTime();

                    return (
                      <Link
                        key={meetup.id}
                        to={`/meetups/${createSlug(meetup.title)}`}
                        style={{
                          position: "relative",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: isEnded
                            ? "transparent"
                            : "var(--bg-card)",
                          border: `1px solid ${isEnded ? "var(--border-medium)" : "var(--border)"}`,
                          borderRadius: 18,
                          padding: "20px 24px",
                          transition:
                            "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
                          transform: "translateY(0)",
                          boxShadow: isEnded
                            ? "none"
                            : "0 4px 20px rgba(0,0,0,0.04)",
                          opacity: isEnded ? 0.75 : 1,
                          gap: 24,
                          cursor: "pointer",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isEnded) {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 12px 30px rgba(0,0,0,0.08)";
                            e.currentTarget.style.borderColor =
                              "var(--border-strong)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isEnded) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 20px rgba(0,0,0,0.04)";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }
                        }}
                      >
                        {/* Left: Small Poster Image */}
                        {meetup.banner_url && (
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 12,
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1px solid var(--border-medium)",
                              background: "var(--bg-elevated)",
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            <img
                              src={meetup.banner_url}
                              alt={meetup.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: isEnded
                                  ? "grayscale(100%) opacity(60%)"
                                  : "none",
                              }}
                            />
                          </div>
                        )}

                        {/* Right: Content */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginBottom: 6,
                            }}
                          >
                            {meetup.time}{" "}
                            {isEnded && (
                              <span style={{ color: "#22c55e", marginLeft: 4 }}>
                                | COMPLETED
                              </span>
                            )}
                          </div>

                          <h3
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1.25rem",
                              fontWeight: 600,
                              color: isEnded
                                ? "var(--text-secondary)"
                                : "var(--text-primary)",
                              marginBottom: 8,
                              lineHeight: 1.25,
                            }}
                          >
                            {meetup.title}
                          </h3>

                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: isEnded
                                ? "var(--text-tertiary)"
                                : "var(--text-secondary)",
                              fontSize: "0.9rem",
                              fontWeight: 500,
                            }}
                          >
                            <MapPin size={16} />
                            <span
                              style={{
                                flex: 1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {meetup.venue}
                            </span>

                            {/* Absolutely positioned 'Completed' text perfectly aligned with location baseline, perfectly centered under the Orb */}
                            {isEnded && (
                              <span
                                style={{
                                  position: "absolute",
                                  right: "-104px", // 24px gap + 80px badge width
                                  width: "80px",
                                  textAlign: "center",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  color: "#22c55e",
                                  fontFamily: "var(--font-sans)",
                                }}
                              >
                                Completed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Completed Stamp (Orb only) */}
                        {isEnded && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              width: 80,
                              zIndex: 5,
                              transform: "translateY(-10px)", // Nudge upwards for visual balance
                            }}
                          >
                            <CompletedStamp size={76} hideText={true} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}
