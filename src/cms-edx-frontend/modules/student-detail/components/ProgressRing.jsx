export default function ProgressRing({
  percentage,
  color,
  label,
  size = 100,
  strokeWidth = 8,
  labelColor = "#364153",
}) {
  const safe = Number.isFinite(percentage) ? percentage : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (safe / 100) * circumference

  return (
    <div className="tp-student-progress-ring">
      <div className="tp-student-progress-ring-chart" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="tp-student-progress-ring-svg" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="tp-student-progress-ring-value" style={{ color: labelColor }}>
          {safe.toFixed(2)}%
        </span>
      </div>
      {label ? <span className="tp-student-progress-ring-label">{label}</span> : null}
    </div>
  )
}
