import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Users } from 'lucide-react';
import { fetchMembers, fetchMeetups } from '../services/api';
import Avatar from '../components/Avatar';

export default function Landing({ onLogin }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [nextMeetup, setNextMeetup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchMeetups()]).then(([mems, meetups]) => {
      const safeMems = Array.isArray(mems) ? mems : [];
      const safeMeetups = Array.isArray(meetups) ? meetups : [];
      setMembers(safeMems);
      const active = safeMeetups.filter(m => m.is_active);
      if (active.length > 0) setNextMeetup(active[0]);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching members/meetups on landing page:', err);
      setLoading(false);
    });
  }, []);

  const goToLogin = () => navigate('/login');

  const totalMembers = Array.isArray(members) ? members.length : 0;
  const founders = Array.isArray(members) ? members.filter(m => m?.tags?.includes('Founder')).length : 0;
  const marqueeMembers = Array.isArray(members) ? [...members].sort(() => 0.5 - Math.random()).slice(0, 18) : [];

  const stats = [
    { value: '500+', label: 'MEMBERS' },
    { value: '12', label: 'CITIES' },
    { value: '200+', label: 'FOUNDERS' },
    { value: '80+', label: 'INVESTORS' },
  ];

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)',
      display: 'flex', flexDirection: 'column', overflowX: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* NAV */}
      <header style={{
        padding: '0 48px', height: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, background: 'var(--overlay)', backdropFilter: 'blur(20px)',
        zIndex: 100, borderBottom: '1px solid var(--border)',
      }}>
        {/* Text-only logo — the name IS the brand */}
        <span style={{
          fontFamily: 'var(--font-logo)', fontWeight: 800,
          fontSize: '1.75rem', letterSpacing: '-0.03em', color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          Perenti
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={goToLogin}>Sign In</button>
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 999 }}
            onClick={goToLogin}
          >
            Get Started
          </button>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* HERO — 2-col */}
        <section className="landing-hero-grid" style={{
          padding: '80px 48px 64px', maxWidth: 1100, margin: '0 auto',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', background: 'var(--primary-glow)',
              border: '1px solid rgba(3,212,124,0.25)', borderRadius: 999, marginBottom: 28,
            }}>
              <span className="pulse-dot" />
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Hyderabad
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 500, fontFamily: 'var(--font-display)',
              letterSpacing: '-0.035em', lineHeight: 1.1,
              color: 'var(--text-primary)', marginBottom: 22,
            }}>
              Where Hyderabad's<br />
              <span className="gradient-text">builders connect.</span>
            </h1>

            <p style={{
              fontSize: '1rem', color: 'var(--text-secondary)',
              lineHeight: 1.75, marginBottom: 36, maxWidth: 460,
            }}>
              Perenti brings together founders, investors, and professionals
              through curated monthly meetups and a verified member directory.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 30px', fontSize: '0.9375rem', borderRadius: 999 }}
                onClick={goToLogin}
              >
                Join Now <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '12px 26px', fontSize: '0.9375rem', borderRadius: 999 }}
                onClick={goToLogin}
              >
                Sign In
              </button>
            </div>

            {/* Member faces */}
            {members.length > 0 && (
              <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {members.slice(0, 5).map((m, i) => (
                    <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid var(--bg)', borderRadius: '50%' }}>
                      <Avatar src={m.avatar} name={m.name} size="xs" />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {totalMembers}+ members already inside
                </span>
              </div>
            )}
          </div>

          {/* Right — next meetup or community card */}
          <div>
            {nextMeetup ? (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-md)',
              }}>
                {nextMeetup.banner_url && nextMeetup.banner_url.trim() !== '' && (
                  <img
                    src={nextMeetup.banner_url}
                    alt={nextMeetup.title}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--primary)',
                    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
                  }}>
                    Next Meetup
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                    fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16,
                    letterSpacing: '-0.025em',
                  }}>
                    {nextMeetup.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={13} color="var(--primary)" /> {nextMeetup.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={13} color="var(--primary)" /> {nextMeetup.venue}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={13} color="var(--primary)" /> {nextMeetup.capacity} seats
                    </span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: 12, fontWeight: 600 }}
                    onClick={goToLogin}
                  >
                    Register for Free Pass
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '40px 32px', boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.5rem',
                  fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10,
                  letterSpacing: '-0.025em',
                }}>
                  Perenti Community
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  Monthly meetups. Curated network. Real outcomes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Founders and builders',
                    'Investors and mentors',
                    'Co-founder matching',
                  ].map(t => (
                    <div key={t} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'var(--bg-elevated)',
                      borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* STATS */}
        <section style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          padding: '40px 48px',
        }}>
          <div className="landing-stats-grid" style={{
            maxWidth: 1100, margin: '0 auto',
          }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 700,
                  fontFamily: 'var(--font-display)', color: 'var(--primary)',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MEMBER MARQUEE */}
        {marqueeMembers.length > 0 && (
          <section style={{ padding: '56px 0', overflow: 'hidden', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.35rem',
                fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em',
              }}>
                Real people, real outcomes
              </div>
            </div>
            <div style={{ display: 'flex', width: '200%', animation: 'marquee 45s linear infinite' }}>
              {[...marqueeMembers, ...marqueeMembers].map((m, i) => (
                <div key={`${m.id}-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', background: 'var(--bg-card)',
                  borderRadius: 999, border: '1px solid var(--border)',
                  whiteSpace: 'nowrap', marginRight: 14, flexShrink: 0,
                }}>
                  <Avatar src={m.avatar} name={m.name} size="sm" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.profession || 'Member'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 100, background: 'linear-gradient(to right, var(--bg), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 100, background: 'linear-gradient(to left, var(--bg), transparent)', pointerEvents: 'none' }} />
          </section>
        )}

        {/* HOW IT WORKS */}
        <section style={{ padding: '60px 48px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <div style={{
              fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
            }}>
              How it works
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.65rem',
              fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.025em',
            }}>
              Simple and powerful.
            </div>
          </div>
          <div className="landing-steps-grid">
            {[
              {
                step: '01',
                title: 'Join Perenti',
                desc: 'Sign up with email and password. Your profile goes live in the member directory immediately.',
              },
              {
                step: '02',
                title: 'Discover Members',
                desc: 'Browse real member profiles — founders, investors, engineers. Filter by role and connect directly.',
              },
              {
                step: '03',
                title: 'Attend Meetups',
                desc: 'Register for monthly meetups. Get a digital pass. Show up, network, and build real relationships.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 18, padding: '26px 22px',
              }}>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)',
                  letterSpacing: '0.15em', marginBottom: 14, fontFamily: 'var(--font-sans)',
                }}>
                  {step}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.05rem',
                  fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10,
                  letterSpacing: '-0.02em',
                }}>
                  {title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BLOCK */}
        <section style={{ padding: '0 48px 72px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            background: 'var(--primary-glow)',
            border: '1px solid rgba(3,212,124,0.18)',
            borderRadius: 20, padding: '52px 48px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', fontWeight: 500,
              color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 14,
            }}>
              Ready to join Perenti?
            </div>
            <p style={{
              fontSize: '0.9375rem', color: 'var(--text-secondary)',
              marginBottom: 28, maxWidth: 420, margin: '0 auto 28px',
            }}>
              Sign up with your email, complete your profile, and start connecting with
              Hyderabad's most driven builders.
            </p>
            <button
              className="btn btn-primary"
              style={{
                padding: '13px 36px', fontSize: '1rem', borderRadius: 999,
                fontWeight: 600, boxShadow: '0 6px 24px rgba(3,212,124,0.2)',
              }}
              onClick={goToLogin}
            >
              Create Free Account
            </button>
          </div>
        </section>

      </main>

      {/* Giant Watermark */}
      <div style={{ textAlign: 'center', overflow: 'hidden', lineHeight: 0.75, userSelect: 'none', pointerEvents: 'none' }}>
        <span style={{
          fontSize: 'clamp(120px, 28vw, 420px)', fontWeight: 800,
          fontFamily: 'var(--font-logo)', letterSpacing: '-0.04em',
          color: 'var(--text-primary)', opacity: 0.03, display: 'block',
          transform: 'translateY(15%)',
        }}>
          Perenti
        </span>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 48px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{
          fontFamily: 'var(--font-sans)', fontWeight: 700,
          fontSize: '1.2rem', color: 'var(--text-secondary)', letterSpacing: '-0.03em',
        }}>
          Perenti
        </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            <MapPin size={12} /> Hyderabad, India
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .landing-hero section { grid-template-columns: 1fr !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          header { padding: 0 20px !important; }
          footer { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}
