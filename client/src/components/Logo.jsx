function Logo({ size = 40 }) {
  return (
    <div style={{ width: size, height: size }} className="fai-logo-tile">
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#7c6bf7" strokeWidth="1.8" />
        <path d="M8 9h8M8 13h8M8 17h5" stroke="#7c6bf7" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="fai-logo-tile__spark">✦</span>
    </div>
  );
}

export default Logo;