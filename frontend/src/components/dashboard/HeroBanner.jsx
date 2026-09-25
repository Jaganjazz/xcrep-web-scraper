import React, { useEffect, useRef } from 'react';

/* ─── Animated Network Graph (SVG-based) ─── */
const HeroVisual = () => {
  const nodes = [
    { id: 'center', cx: 150, cy: 150, r: 22, color: '#00e5a3', glow: 'rgba(0,229,163,0.6)' },
    { id: 'n1',     cx: 75,  cy: 70,  r: 10, color: '#00f2fe', glow: 'rgba(0,242,254,0.5)' },
    { id: 'n2',     cx: 240, cy: 60,  r: 8,  color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
    { id: 'n3',     cx: 270, cy: 160, r: 12, color: '#00f2fe', glow: 'rgba(0,242,254,0.5)' },
    { id: 'n4',     cx: 230, cy: 250, r: 9,  color: '#00e5a3', glow: 'rgba(0,229,163,0.5)' },
    { id: 'n5',     cx: 90,  cy: 255, r: 11, color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
    { id: 'n6',     cx: 40,  cy: 180, r: 8,  color: '#00e5a3', glow: 'rgba(0,229,163,0.4)' },
    { id: 'n7',     cx: 165, cy: 45,  r: 7,  color: '#00f2fe', glow: 'rgba(0,242,254,0.4)' },
    { id: 'n8',     cx: 160, cy: 260, r: 8,  color: '#00f2fe', glow: 'rgba(0,242,254,0.4)' },
  ];

  const edges = [
    ['center','n1'], ['center','n2'], ['center','n3'],
    ['center','n4'], ['center','n5'], ['center','n6'],
    ['center','n7'], ['center','n8'],
    ['n1','n7'], ['n2','n3'], ['n3','n4'], ['n5','n6'],
  ];

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div
      style={{
        position: 'relative',
        width: 320,
        height: 320,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient glow aura */}
      <div
        style={{
          position: 'absolute',
          inset: '20px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,229,163,0.18) 0%, rgba(0,242,254,0.1) 40%, transparent 70%)',
          filter: 'blur(24px)',
          animation: 'pulseGlow 5s ease-in-out infinite',
        }}
      />

      {/* Main SVG network */}
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}
      >
        <defs>
          {/* Edge gradient */}
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00e5a3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.2" />
          </linearGradient>

          {/* Outer dashed orbit ring */}
          <circle id="orbitPath" cx="150" cy="150" r="128" />

          {/* Node glows */}
          <filter id="glow-teal">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-amber">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-center">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Concentric dashed rings */}
        {[55, 90, 128].map((r, i) => (
          <circle
            key={r}
            cx="150" cy="150" r={r}
            fill="none"
            stroke={i === 2 ? 'rgba(0,229,163,0.18)' : 'rgba(0,242,254,0.12)'}
            strokeWidth={i === 2 ? 1.5 : 1}
            strokeDasharray={i === 2 ? '4 6' : '2 8'}
            style={{ animation: `orbit ${14 + i * 5}s linear infinite` }}
          />
        ))}

        {/* Animated scan line */}
        <rect
          x="22" y="0" width="256" height="3"
          rx="1.5"
          fill="url(#scanGrad)"
          opacity="0.0"
          style={{ animation: 'scanline 4s ease-in-out infinite 1s' }}
        >
          <animate attributeName="opacity" values="0;0.25;0" dur="4s" repeatCount="indefinite" begin="1s" />
          <animateTransform attributeName="transform" type="translate" values="0,10;0,285;0,10" dur="4s" repeatCount="indefinite" begin="1s" />
        </rect>
        <defs>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00f2fe" stopOpacity="0" />
            <stop offset="50%"  stopColor="#00f2fe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => {
          const na = getNode(a); const nb = getNode(b);
          if (!na || !nb) return null;
          return (
            <line
              key={i}
              x1={na.cx} y1={na.cy}
              x2={nb.cx} y2={nb.cy}
              stroke="url(#edgeGrad)"
              strokeWidth={a === 'center' ? 1.5 : 1}
              strokeDasharray={a === 'center' ? '5 4' : '3 6'}
              strokeOpacity={a === 'center' ? 0.7 : 0.4}
              style={{
                animation: `dash ${6 + i * 0.8}s linear infinite`,
              }}
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-100"
                dur={`${6 + i * 0.8}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {/* Satellite nodes */}
        {nodes.filter(n => n.id !== 'center').map((n, i) => (
          <g key={n.id} filter={n.color === '#f59e0b' ? 'url(#glow-amber)' : 'url(#glow-teal)'}>
            <circle cx={n.cx} cy={n.cy} r={n.r + 4} fill={n.glow} opacity="0.25">
              <animate attributeName="opacity" values="0.15;0.4;0.15" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.cx} cy={n.cy} r={n.r}
              fill={`rgba(${n.color === '#00f2fe' ? '0,242,254' : n.color === '#f59e0b' ? '245,158,11' : '0,229,163'},0.15)`}
              stroke={n.color}
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Center hub */}
        <g filter="url(#glow-center)">
          <circle cx="150" cy="150" r="32" fill="rgba(0,229,163,0.1)">
            <animate attributeName="r" values="28;34;28" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="150" r="22"
            fill="rgba(6,9,14,0.9)"
            stroke="#00e5a3"
            strokeWidth="2"
          />
          {/* Spider/network icon */}
          <text x="150" y="155" textAnchor="middle" fontSize="14" fill="#00e5a3" fontWeight="700">◈</text>
        </g>

        {/* Floating data badge — top-left */}
        <g transform="translate(32,42)" style={{ animation: 'float 5.2s ease-in-out infinite' }}>
          <rect width="52" height="26" rx="7"
            fill="rgba(0,242,254,0.1)" stroke="rgba(0,242,254,0.3)" strokeWidth="1" />
          <text x="8"  y="17" fontSize="9"  fill="#00f2fe" fontWeight="600">🔗 Links</text>
        </g>

        {/* Floating data badge — top-right */}
        <g transform="translate(218,30)" style={{ animation: 'float 6.5s ease-in-out infinite 1s' }}>
          <rect width="54" height="26" rx="7"
            fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          <text x="7" y="17" fontSize="9" fill="#f59e0b" fontWeight="600">🖼 Images</text>
        </g>

        {/* Floating data badge — right */}
        <g transform="translate(252,138)" style={{ animation: 'floatAlt 7s ease-in-out infinite 0.5s' }}>
          <rect width="52" height="26" rx="7"
            fill="rgba(0,229,163,0.1)" stroke="rgba(0,229,163,0.3)" strokeWidth="1" />
          <text x="6" y="17" fontSize="9" fill="#00e5a3" fontWeight="600">📊 Tables</text>
        </g>

        {/* Floating data badge — bottom */}
        <g transform="translate(195,246)" style={{ animation: 'float 4.8s ease-in-out infinite 2s' }}>
          <rect width="52" height="26" rx="7"
            fill="rgba(0,242,254,0.1)" stroke="rgba(0,242,254,0.3)" strokeWidth="1" />
          <text x="8" y="17" fontSize="9" fill="#00f2fe" fontWeight="600">{'</> HTML'}</text>
        </g>

        {/* Floating data badge — bottom-left */}
        <g transform="translate(22,236)" style={{ animation: 'floatAlt 5.5s ease-in-out infinite 1.5s' }}>
          <rect width="56" height="26" rx="7"
            fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          <text x="7" y="17" fontSize="9" fill="#f59e0b" fontWeight="600">📄 Meta</text>
        </g>
      </svg>
    </div>
  );
};

/* ─── Feature Pill ─── */
const FeaturePill = ({ icon, title, sub, accentColor, bgColor }) => (
  <div
    className="glass-panel"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.65rem 1rem',
      borderRadius: 'var(--radius-md)',
      flex: '0 0 auto',
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 'var(--radius-sm)',
        background: bgColor,
        color: accentColor,
        display: 'grid',
        placeContent: 'center',
        fontSize: '1rem',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-white)' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
        {sub}
      </div>
    </div>
  </div>
);

/* ─── Hero Banner ─── */
export const HeroBanner = () => {
  return (
    <section
      className="hero-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        position: 'relative',
        gap: '2rem',
        minHeight: 280,
      }}
    >
      {/* Left: Text block */}
      <div style={{ maxWidth: 580, zIndex: 2, flex: '1 1 auto' }}>
        {/* WELCOME BACK eyebrow */}
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: '0.14em',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.6rem',
          }}
        >
          ✦ Welcome Back
        </span>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
            fontWeight: 'var(--weight-extrabold)',
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            marginBottom: '1rem',
          }}
        >
          <span style={{ color: 'var(--text-white)' }}>Web </span>
          <span
            style={{
              background: 'var(--grad-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 22px rgba(0,229,163,0.35))',
            }}
          >
            Scraper
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.94rem, 1.5vw, 1.1rem)',
            marginBottom: '2rem',
            lineHeight: 1.55,
            maxWidth: 480,
          }}
        >
          Extract meaningful data from any website in seconds.
          Structured, clean, and ready to export.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <FeaturePill
            icon="⚡"
            title="Fast & Reliable"
            sub="Get data in seconds"
            accentColor="var(--accent-gold)"
            bgColor="var(--status-warning-bg)"
          />
          <FeaturePill
            icon="🗄️"
            title="Multiple Data Types"
            sub="Text, Images, Links & more"
            accentColor="var(--accent-cyan)"
            bgColor="var(--accent-cyan-subtle)"
          />
          <FeaturePill
            icon="📤"
            title="Export Anywhere"
            sub="CSV, JSON, Excel, PDF"
            accentColor="var(--accent-primary)"
            bgColor="var(--status-success-bg)"
          />
        </div>
      </div>

      {/* Right: Network Visualization */}
      <div className="hero-visual-wrap" style={{ flexShrink: 0 }}>
        <HeroVisual />
      </div>
    </section>
  );
};
