import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  User,
  Calendar,
  Ticket,
  Shield,
  Radio,
} from "lucide-react";

const ADMIN_EMAILS = [
  "admin@perenti.com",
  "sreemadhav@gmail.com",
  "madhav@ebc.com",
  "shiva24.santosh@gmail.com",
];

export default function MobileNav({ currentUser }) {
  const isAdmin =
    currentUser &&
    (ADMIN_EMAILS.includes(currentUser.email) ||
      currentUser.email?.includes("@EBC") ||
      currentUser.email?.includes("@ebc"));

  const items = [
    { to: "/discover", label: "Home", icon: Home },
    { to: "/directory", label: "Members", icon: Users },
    { to: "/meetups", label: "Meetups", icon: Calendar },
    { to: "/live", label: "Live", icon: Radio },
    { to: "/registrations", label: "Passes", icon: Ticket },
    { to: "/profile/me", label: "Profile", icon: User },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-inner">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
