import React from 'react';

export default function CompletedStamp({ style, size = 68, hideText = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Dashed Arcs */}
          {/* Left arc */}
          <path d="M 25,65 A 35,35 0 0,1 25,35" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          {/* Right arc */}
          <path d="M 75,35 A 35,35 0 0,1 75,65" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          
          {/* Bottom Left Star */}
          <path d="M 12,65 Q 17,65 17,60 Q 17,65 22,65 Q 17,65 17,70 Q 17,65 12,65 Z" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />
          {/* Top Right Star */}
          <path d="M 78,25 Q 83,25 83,20 Q 83,25 88,25 Q 83,25 83,30 Q 83,25 78,25 Z" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />
          {/* Smaller Top Right Star */}
          <path d="M 88,35 Q 90,35 90,33 Q 90,35 92,35 Q 90,35 90,37 Q 90,35 88,35 Z" fill="#22c55e" opacity="0.8" />
        </svg>

        {/* Center Green Circle */}
        <div style={{
          width: '56%',
          height: '56%',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      
      {!hideText && (
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#22c55e',
          fontFamily: 'var(--font-sans)',
          marginTop: '-8px'
        }}>
          Completed
        </span>
      )}
    </div>
  );
}
