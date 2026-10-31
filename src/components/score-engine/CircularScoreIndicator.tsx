import React from 'react';

interface CircularScoreIndicatorProps {
  score: number; // 0 to 100
  size?: number; // width & height in px, default 120
  strokeWidth?: number; // stroke width in px, default 10
  showLabel?: boolean;
  className?: string;
}

export const CircularScoreIndicator: React.FC<CircularScoreIndicatorProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  className = '',
}) => {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine stroke color based on score grade (using forest green as primary)
  const getStrokeColor = (s: number) => {
    if (s >= 85) return '#1B4332'; // Forest Green
    if (s >= 75) return '#2D6A4F'; // Medium Forest / Sage
    if (s >= 60) return '#B07D38'; // Muted Warm Amber
    return '#A34848'; // Muted Red
  };

  const strokeColor = getStrokeColor(normalizedScore);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={normalizedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Resume Compatibility Score: ${normalizedScore} out of 100`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#E5E1D7"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-bold tracking-tight text-[#1C201D] font-mono tabular-nums leading-none"
          style={{ fontSize: `${size * 0.28}px` }}
        >
          {normalizedScore}
        </span>
        {showLabel && (
          <span
            className="text-[10px] font-semibold tracking-wider uppercase text-[#848E88] mt-1"
            style={{ fontSize: `${Math.max(10, size * 0.09)}px` }}
          >
            / 100 Match
          </span>
        )}
      </div>
    </div>
  );
};
