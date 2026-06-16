import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Search,
  Lightbulb,
  Rocket,
  Building2,
  MessageCircle,
} from "lucide-react";
import { fetchMembers, fetchUserReservations } from "../services/api";
import Avatar from "../components/Avatar";
import Tag from "../components/Tag";
import { LinkedinIcon, InstagramIcon } from "../components/Icons";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = localStorage.getItem("ebc_logged_in") === "true";
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reservationFallback, setReservationFallback] = useState(
    location.state?.reservation || null,
  );

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/discover");
    }
  };

  useEffect(() => {
    fetchMembers().then(async (data) => {
      let decodedId = id;
      try {
        decodedId = decodeURIComponent(id);
      } catch (e) {
        /* ignore */
      }

      const found = data.find(
        (m) =>
          String(m.id) === String(id) ||
          String(m.id) === String(decodedId) ||
          (m.email &&
            String(m.email).toLowerCase() === String(id).toLowerCase()) ||
          (m.email &&
            String(m.email).toLowerCase() === String(decodedId).toLowerCase()),
      );

      setMember(found || null);

      if (!found && !reservationFallback && decodedId.includes("@")) {
        // If they are not in the directory, and we don't have reservation state, fetch their reservations
        try {
          const userRes = await fetchUserReservations(decodedId);
          if (userRes && userRes.length > 0) {
            // Sort by most recent
            userRes.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            );
            setReservationFallback(userRes[0]);
          }
        } catch (err) {
          console.error("Failed to fetch fallback reservation", err);
        }
      }

      setLoading(false);
    });
  }, [id, reservationFallback]);

  if (loading) {
    return (
      <div
        className="main-feed"
        style={{
          padding: 48,
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>Loading profile...</p>
      </div>
    );
  }

  if (!member) {
    const reservation = reservationFallback;

    if (reservation) {
      let answers = {};
      try {
        answers = JSON.parse(reservation.answers || "{}");
      } catch (e) {
        /* ignore */
      }

      return (
        <div
          className="main-feed"
          style={{ minHeight: "100dvh", background: "var(--bg)" }}
        >
          <div
            className="page-header"
            style={{ position: "sticky", top: 0, zIndex: 50 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="btn btn-ghost btn-icon-sm"
                onClick={handleBack}
              >
                <ChevronLeft size={22} />
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                Attendee Profile
              </span>
            </div>
          </div>

          <div className="profile-cover"></div>

          <div className="profile-hero">
            <Avatar
              name={reservation.user_name || reservation.user_email}
              size="3xl"
            />
            <div className="profile-header-info">
              <div className="profile-info-left">
                <div className="profile-name">
                  {reservation.user_name || "Attendee"}
                </div>
                <div className="profile-role">
                  {answers.role || "Event Attendee"}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-content-grid">
            <div className="profile-main-column">
              {answers.building && (
                <div className="profile-section-card animate-in animate-in-delay-1">
                  <h4>What I'm Building</h4>
                  <p>{answers.building}</p>
                </div>
              )}

              {answers.lookingFor && (
                <div className="profile-row-cards animate-in animate-in-delay-3">
                  <div className="profile-half-card" style={{ width: "100%" }}>
                    <div className="profile-icon-wrap">
                      <Search size={16} color="var(--text-primary)" />
                    </div>
                    <h5>Looking For</h5>
                    <p>{answers.lookingFor}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-side-column">
              <div
                className="profile-section-card animate-in animate-in-delay-2"
                style={{
                  background: "var(--bg-elevated)",
                  borderStyle: "dashed",
                }}
              >
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9375rem",
                      marginBottom: 12,
                      fontWeight: 500,
                    }}
                  >
                    This attendee hasn't fully set up their Community Profile
                    yet.
                  </p>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-tertiary)",
                      background: "var(--bg)",
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: 8,
                    }}
                  >
                    Contact Email: <br />
                    <span
                      style={{ color: "var(--text-primary)", fontWeight: 600 }}
                    >
                      {reservation.user_email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 80 }} />
        </div>
      );
    }

    return (
      <div
        className="main-feed"
        style={{
          padding: 48,
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 16 }}>
          Profile Not Found
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          The member profile you are trying to view does not exist.
        </p>
        <Link to={isLoggedIn ? "/discover" : "/"} className="btn btn-primary">
          Go to Home
        </Link>
      </div>
    );
  }

  const openLink = (url) => {
    if (url) window.open(url, "_blank");
  };

  const handleJoinClick = () => {
    localStorage.setItem("ebc_logged_in", "true");
    navigate("/discover");
  };

  return (
    <div
      className="main-feed"
      style={
        !isLoggedIn
          ? {
              maxWidth: "1000px",
              margin: "0 auto",
              borderLeft: "1px solid var(--border)",
              borderRight: "1px solid var(--border)",
              minHeight: "100dvh",
              background: "var(--bg)",
            }
          : {}
      }
    >
      {/* Sticky guest callout if not logged in */}
      {!isLoggedIn && (
        <div
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark), var(--bg-secondary))",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--primary)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                fontFamily: "var(--font-logo)",
                letterSpacing: "-0.03em",
                color: "#fff",
              }}
            >
              EBC
            </span>
            <span
              style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}
            >
              You're viewing a profile on EBC. Connect with Hyderabad's top
              builders.
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleJoinClick}
            style={{ boxShadow: "none" }}
          >
            Join EBC Network
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className="page-header"
        style={{ position: "sticky", top: !isLoggedIn ? 53 : 0, zIndex: 50 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-icon-sm" onClick={handleBack}>
            <ChevronLeft size={22} />
          </button>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text-primary)",
            }}
          >
            Profile
          </span>
        </div>
      </div>

      <div className="profile-cover">
        {/* Cover Background styling is in CSS */}
      </div>

      <div className="profile-hero">
        <Avatar src={member.avatar} name={member.name} size="3xl" />

        <div className="profile-header-info">
          <div className="profile-info-left">
            <div className="profile-name">{member.name}</div>
            <div className="profile-role">{member.profession}</div>
            <div className="profile-location">
              <MapPin size={13} /> {member.area}
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {member.tags && member.tags.map((t) => <Tag key={t} label={t} />)}
            </div>
          </div>

          <div className="profile-actions">
            {member.linkedIn && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openLink(member.linkedIn)}
              >
                <LinkedinIcon size={15} color="var(--blue)" /> LinkedIn
              </button>
            )}
            {member.instagram && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openLink(member.instagram)}
              >
                <InstagramIcon size={15} color="var(--orange)" /> Instagram
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() =>
                openLink(member.linkedIn || "https://linkedin.com")
              }
            >
              <MessageCircle size={18} /> Connect
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-main-column">
          {/* About */}
          <div className="profile-section-card animate-in animate-in-delay-1">
            <h4>About</h4>
            <p>{member.bio}</p>
          </div>

          {/* Looking for / Can Help */}
          <div className="profile-row-cards animate-in animate-in-delay-3">
            <div className="profile-half-card">
              <div className="profile-icon-wrap">
                <Search size={16} color="var(--text-primary)" />
              </div>
              <h5>Looking For</h5>
              <p>{member.whatTheyExpect}</p>
            </div>
            <div className="profile-half-card">
              <div className="profile-icon-wrap">
                <Lightbulb size={16} color="var(--primary)" />
              </div>
              <h5>Can Help With</h5>
              <p>{member.howTheyCanHelp}</p>
            </div>
          </div>
        </div>

        <div className="profile-side-column">
          {/* Work */}
          {(member.startupName || member.companyName) && (
            <div
              className="profile-section-card animate-in animate-in-delay-2"
              style={{ marginBottom: 20 }}
            >
              <h4>Current Work</h4>
              {member.startupName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <Rocket size={16} color="var(--primary)" />
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        marginBottom: 2,
                      }}
                    >
                      Startup
                    </div>
                    <div
                      style={{ fontWeight: 700, color: "var(--text-primary)" }}
                    >
                      {member.startupName}
                    </div>
                  </div>
                </div>
              )}
              {member.companyName && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Building2 size={16} color="var(--text-secondary)" />
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        marginBottom: 2,
                      }}
                    >
                      Company
                    </div>
                    <div
                      style={{ fontWeight: 700, color: "var(--text-primary)" }}
                    >
                      {member.companyName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Why Joined */}
          <div className="profile-section-card animate-in animate-in-delay-2">
            <h4>Why I Joined EBC</h4>
            <p>{member.whyJoined}</p>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}
