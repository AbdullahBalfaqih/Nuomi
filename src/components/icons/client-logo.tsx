import React from 'react';

interface ClientLogoProps extends React.SVGProps<SVGSVGElement> {
  shape: 'circle' | 'square' | 'triangle' | 'hexagon';
}

const ClientLogo: React.FC<ClientLogoProps> = ({ shape, ...props }) => {
  return (
    <svg
      width="158"
      height="48"
      viewBox="0 0 158 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.6" fill="#757575">
        {shape === 'circle' && <circle cx="24" cy="24" r="16" />}
        {shape === "square" && <rect x="8" y="8" width="32" height="32" rx="4" />}
        {shape === 'triangle' && <path d="M24 8L40 40H8L24 8Z" />}
        {shape === 'hexagon' && <path d="M32 12L40 24L32 36H16L8 24L16 12H32Z" />}
        
        <text
          x="56"
          y="30"
          fontFamily="inherit"
          fontSize="18"
          fontWeight="500"
          letterSpacing="0.1em"
          style={{ textTransform: "uppercase" }}
        >
          NUOMI
        </text>
      </g>
    </svg>
  );
};

export default ClientLogo;
