import React from 'react';

interface LocationIconProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Small map pin icon to prefix location text.
 * Matches the style of other UI icons (16x16, round stroke, currentColor).
 */
const LocationIcon: React.FC<LocationIconProps> = ({ size = 16, className, title = 'Location' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : 'presentation'}
    className={className}
  >
    {title ? <title>{title}</title> : null}
    {/* Pin outline */}
    <path
      d="M8 1.5C5.514 1.5 3.5 3.514 3.5 6c0 3.25 4.5 8.5 4.5 8.5S12.5 9.25 12.5 6C12.5 3.514 10.486 1.5 8 1.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center dot */}
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default LocationIcon;
