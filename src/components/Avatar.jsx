import React from 'react';

export default function Avatar({ src, name, size = 'md', className = '', style = {} }) {
  const sizeClass = `avatar-${size}`;
  const initial = name ? name[0].toUpperCase() : '?';
  return (
    <div className={`avatar ${sizeClass} ${className}`} style={style}>
      <img 
        src={src} 
        alt={name} 
        onError={e => { 
          e.target.style.display = 'none'; 
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex'; 
          }
        }}
      />
      <span className="avatar-initials" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {initial}
      </span>
    </div>
  );
}
