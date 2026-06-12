import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, User, Calendar, Ticket } from 'lucide-react';

export default function MobileNav() {
  const items = [
    { to: '/discover',      label: 'Home',     icon: Home },
    { to: '/directory',     label: 'Members',  icon: Users },
    { to: '/meetups',       label: 'Meetups',  icon: Calendar },
    { to: '/registrations', label: 'Passes',   icon: Ticket },
    { to: '/profile/me',    label: 'Profile',  icon: User },
  ];

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-inner">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
