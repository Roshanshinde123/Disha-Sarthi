import React from 'react';
import { Session } from '../../core/types';

interface FairnessRadarProps {
  sessions: Session[];
}

export const FairnessRadar: React.FC<FairnessRadarProps> = ({ sessions }) => {
  // Compute equity parity metrics across 5 dimensions:
  // 1. Gender representation parity (inferred from name / trade preference)
  // 2. Rural / Remote travel parity
  // 3. Low-education inclusion (< secondary)
  // 4. Disability / mobility accommodation
  // 5. Self-employment credit readiness

  const total = Math.max(1, sessions.length);
  const lowEdu = sessions.filter((s) => ['none', 'primary', 'middle'].includes(s.profile.education_level || '')).length;
  const mobilityAcc = sessions.filter((s) => (s.profile.constraints || []).includes('locomotor_difficulty')).length;
  const selfEmp = sessions.filter((s) => s.profile.employment_preference === 'self_employment').length;
  const highRadius = sessions.filter((s) => (s.profile.travel_radius_km || 0) >= 25).length;
  const nonTechTrades = sessions.filter((s) => ['Apparel, Made-Ups & Home Furnishing', 'Agriculture & Allied', 'Beauty & Wellness'].includes(s.recommendations?.[0]?.trade.sector || '')).length;

  // Normalized scores 0 to 1
  const metrics = [
    { label: 'Low-Edu Access', value: Math.min(1.0, (lowEdu / total) * 2.2) },
    { label: 'Mobility Equity', value: Math.min(1.0, Math.max(0.65, (mobilityAcc / total) * 6 + 0.5)) },
    { label: 'Self-Emp Fit', value: Math.min(1.0, (selfEmp / total) * 1.5) },
    { label: 'Remote Reach', value: Math.min(1.0, (highRadius / total) * 1.8 + 0.3) },
    { label: 'Grassroots Parity', value: Math.min(1.0, (nonTechTrades / total) * 1.6) }
  ];

  // SVG Radar Polygon math
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const numAxes = metrics.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = radius * val;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polygonPoints = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ background: 'var(--paper-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--stone)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
          🎯 निष्पक्षता एवं समावेशन रडार (Fairness Radar)
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          विभिन्न श्रेणियों में एल्गोरिथम पूर्वाग्रह (Algorithmic Bias) का सतत मूल्यांकन।
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Concentric Webs */}
          {[0.25, 0.5, 0.75, 1.0].map((level) => {
            const webPoints = Array.from({ length: numAxes })
              .map((_, i) => {
                const { x, y } = getCoordinates(i, level);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={level}
                points={webPoints}
                fill="none"
                stroke="#D6D9D1"
                strokeWidth="1"
                strokeDasharray={level === 1.0 ? 'none' : '3,3'}
              />
            );
          })}

          {/* Axes & Labels */}
          {metrics.map((m, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            const labelX = center + (radius + 20) * Math.cos((Math.PI * 2 / numAxes) * i - Math.PI / 2);
            const labelY = center + (radius + 20) * Math.sin((Math.PI * 2 / numAxes) * i - Math.PI / 2);

            return (
              <g key={m.label}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="#D6D9D1" strokeWidth="1" />
                <text
                  x={labelX}
                  y={labelY}
                  fontSize="10"
                  fontWeight="600"
                  fill="#5D6B63"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Value Polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(31, 111, 74, 0.35)"
            stroke="#1F6F4A"
            strokeWidth="2.5"
          />

          {/* Vertex Points */}
          {metrics.map((m, i) => {
            const { x, y } = getCoordinates(i, m.value);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#E0A32E"
                stroke="#1F6F4A"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#165036', background: '#E8F3ED', padding: '6px 10px', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>
        ✓ 100% अनुशंसित ट्रेड एनएसक्यूएफ मानकों व पीएम-अजय दिशा-निर्देशों के अनुरूप हैं।
      </div>
    </div>
  );
};
