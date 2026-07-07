// resources/js/components/ui/UserAvatar.jsx

import React from 'react';

const UserAvatar = ({ username = '', color, size = 'md' }) => {
  const safeColor = (typeof color === 'string' && color.startsWith('#') && color.length >= 7)
    ? color
    : '#ff9900';

  const initials = username.trim()
    ? username.trim().slice(0, 2).toUpperCase()
    : '??';

  const sizes = { sm: 48, md: 72, lg: 96 };
  const px = sizes[size] ?? 72;

  return (
    <div
      className={`user-avatar user-avatar--${size}`}
      style={{
        width:       px,
        height:      px,
        borderColor: `${safeColor}99`,
        boxShadow:   `0 0 0 3px ${safeColor}18, 0 0 28px ${safeColor}44`,
        background:  `${safeColor}18`,
        position:    'relative',
        overflow:    'hidden',
      }}
    >
      {/* SVG silhouette — tinted with cosmic color via CSS filter */}
      <img
        src="/icons/avatar.svg"
        alt=""
        aria-hidden="true"
        className="user-avatar__svg"
        style={{
          width:    '72%',
          height:   '72%',
          position: 'absolute',
          bottom:   '-4%',
          left:     '50%',
          transform:'translateX(-50%)',
          opacity:  0.55,
          filter:   `brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(${hueFromColor(safeColor)}deg)`,
        }}
      />

      {/* Initials overlay — shown if SVG fails to load */}
      <span
        className="user-avatar__initials"
        style={{
          color:    '#fff',
          position: 'absolute',
          top:      '50%',
          left:     '50%',
          transform:'translate(-50%, -50%)',
          opacity:  0,
        }}
      >
        {initials}
      </span>
    </div>
  );
};

// Derive a rough hue rotation from a hex color so the SVG tints to match
function hueFromColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return Math.round(h * 360);
}

export default UserAvatar;