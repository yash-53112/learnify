'use client';

interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressRing({
  percent,
  size = 64,
  stroke = 5,
  color = '#c9a84c',
  trackColor = '#1f1f2e',
  showPercent = true,
}: ProgressRingProps) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={center} cy={center} r={r}
        fill="none" stroke={trackColor} strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={center} cy={center} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${center}px ${center}px` }}
      />
      {/* Label */}
      {showPercent && (
        <text
          x={center} y={center}
          textAnchor="middle" dominantBaseline="central"
          fill="#f0efe8"
          fontSize={size < 50 ? '10' : '13'}
          fontFamily="Sora, sans-serif"
          fontWeight="600"
        >
          {Math.round(percent)}%
        </text>
      )}
    </svg>
  );
}
