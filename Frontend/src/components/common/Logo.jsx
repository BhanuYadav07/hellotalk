
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="22" height="16" rx="5" fill="#2bab8c"/>
      <circle cx="10" cy="16" r="1.8" fill="white"/>
      <circle cx="15" cy="16" r="1.8" fill="white"/>
      <circle cx="20" cy="16" r="1.8" fill="white"/>
      <polygon points="8,24 6,30 14,24" fill="#2bab8c"/>
      <rect x="16" y="4" width="20" height="15" rx="5" fill="#2d3170"/>
      <circle cx="22" cy="11.5" r="1.6" fill="white"/>
      <circle cx="26" cy="11.5" r="1.6" fill="white"/>
      <circle cx="30" cy="11.5" r="1.6" fill="white"/>
      <polygon points="32,19 34,25 26,19" fill="#2d3170"/>
    </svg>
  );
}
export default Logo;