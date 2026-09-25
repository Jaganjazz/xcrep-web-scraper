import React from 'react';

const extractCards = [
  {
    id: 'title',
    title: 'Page Title',
    desc: 'Automatically extract the website title tag',
    icon: '📄',
    iconText: null,
    bgColor: 'rgba(0, 242, 254, 0.1)',
    borderColor: 'rgba(0, 242, 254, 0.28)',
    iconColor: '#00f2fe',
    tag: 'Always',
    tagColor: 'rgba(0,242,254,0.2)',
    tagText: '#00f2fe',
  },
  {
    id: 'text',
    title: 'Clean Text',
    desc: 'Extract readable paragraph content',
    icon: null,
    iconText: 'T',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    iconColor: '#f59e0b',
    tag: 'Popular',
    tagColor: 'rgba(245,158,11,0.2)',
    tagText: '#f59e0b',
  },
  {
    id: 'links',
    title: 'All Links',
    desc: 'Collect internal & external hyperlinks',
    icon: '🔗',
    iconText: null,
    bgColor: 'rgba(5, 214, 160, 0.1)',
    borderColor: 'rgba(5, 214, 160, 0.28)',
    iconColor: '#05d6a0',
    tag: 'Popular',
    tagColor: 'rgba(5,214,160,0.2)',
    tagText: '#05d6a0',
  },
  {
    id: 'images',
    title: 'Images',
    desc: 'Get image URLs, alt text & dimensions',
    icon: '🖼️',
    iconText: null,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.28)',
    iconColor: '#f87171',
    tag: null,
  },
  {
    id: 'headings',
    title: 'Headings',
    desc: 'Capture H1–H6 heading structure',
    icon: null,
    iconText: 'H',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.28)',
    iconColor: '#60a5fa',
    tag: null,
  },
  {
    id: 'tables',
    title: 'Tables',
    desc: 'Detect and extract structured HTML tables',
    icon: '📊',
    iconText: null,
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.28)',
    iconColor: '#34d399',
    tag: null,
  },
  {
    id: 'metadata',
    title: 'Metadata',
    desc: 'Pull meta title, description & keywords',
    icon: null,
    iconText: '</>',
    bgColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.28)',
    iconColor: '#38bdf8',
    tag: null,
  },
  {
    id: 'html',
    title: 'HTML Source',
    desc: 'Download the raw full HTML of the page',
    icon: '💾',
    iconText: null,
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.28)',
    iconColor: '#22d3ee',
    tag: 'Raw',
    tagColor: 'rgba(6,182,212,0.15)',
    tagText: '#22d3ee',
  },
];

import { useScrape } from '../../context/ScrapeContext';
import { useToast } from '../common/Toast';

export const ExtractTypesGrid = () => {
  const { extractionOptions, toggleOption } = useScrape();
  const toast = useToast();

  const handleCardClick = (id, title) => {
    toggleOption(id);
    const newState = !extractionOptions[id];
    toast.info(`${title} extraction ${newState ? 'enabled' : 'disabled'}`);
  };
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-emerald-subtle)',
              border: '1px solid var(--accent-emerald-border)',
              display: 'grid',
              placeContent: 'center',
              color: 'var(--accent-primary)',
              fontSize: '0.9rem',
            }}
          >
            ⊞
          </div>
          <div>
            <h3
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-white)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              What You Can Extract
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Select any combination of data types
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--accent-primary)',
            fontWeight: 'var(--weight-semibold)',
            background: 'var(--accent-emerald-subtle)',
            border: '1px solid var(--accent-emerald-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.2rem 0.75rem',
          }}
        >
          8 Data Types
        </span>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.9rem',
        }}
      >
        {extractCards.map((card) => {
          const isEnabled = Boolean(extractionOptions[card.id] || extractionOptions.extract_all);
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id, card.title)}
              className="glass-panel extract-card"
              style={{
                padding: '1.1rem 1.2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all var(--ease-normal)',
                position: 'relative',
                overflow: 'hidden',
                borderColor: isEnabled ? card.borderColor : 'var(--border-subtle)',
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = card.borderColor;
              e.currentTarget.style.boxShadow = `0 8px 24px -4px rgba(0,0,0,0.5), 0 0 0 1px ${card.borderColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            {/* Subtle corner glow */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 80,
                height: 80,
                background: `radial-gradient(circle at top right, ${card.borderColor}30 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Icon box */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                background: card.bgColor,
                border: `1px solid ${card.borderColor}`,
                color: card.iconColor,
                display: 'grid',
                placeContent: 'center',
                fontSize: card.iconText ? '0.75rem' : '1.1rem',
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: card.iconText ? 'var(--font-mono)' : 'inherit',
                letterSpacing: card.iconText === '</>' ? '-0.05em' : 'normal',
              }}
            >
              {card.icon || card.iconText}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                <h4
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-white)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.title}
                </h4>
                {card.tag && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      background: card.tagColor,
                      color: card.tagText,
                      borderRadius: 'var(--radius-full)',
                      padding: '0.1rem 0.45rem',
                      flexShrink: 0,
                    }}
                  >
                    {card.tag}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {card.desc}
              </p>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};
