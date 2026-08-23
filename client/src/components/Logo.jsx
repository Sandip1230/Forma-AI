import { useId } from "react";

function Logo({ size = 40 }) {
  const gradId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Forma AI">
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6d5bf5" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* the "forma" mark: a squared form that melts into a circle at one
          corner — structure becoming fluid, echoing forma = "shape" */}
      <path
        d="M12,4 L28,4 A8,8 0 0 1 36,12 L36,18 A18,18 0 0 1 18,36 L12,36 A8,8 0 0 1 4,28 L4,12 A8,8 0 0 1 12,4 Z"
        fill={`url(#${gradId})`}
      />

      {/* form-field ticks, referencing the actual product */}
      <path d="M12 15h10M12 20h7" stroke="white" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />

      {/* AI spark */}
      <path d="M28 24l1.2 2.8L32 28l-2.8 1.2L28 32l-1.2-2.8L24 28l2.8-1.2z" fill="white" />
    </svg>
  );
}

export default Logo;