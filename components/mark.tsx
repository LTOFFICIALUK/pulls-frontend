import type { SVGProps } from "react";

export const Mark = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="14 14 72 80" className={className} aria-hidden="true" {...props}>
    <rect x="33" y="20" width="34" height="56" rx="8" fill="#fff" stroke="#000" strokeWidth="5" transform="rotate(-18 50 92)" />
    <rect x="33" y="20" width="34" height="56" rx="8" fill="#fff" stroke="#000" strokeWidth="5" />
    <rect x="33" y="20" width="34" height="56" rx="8" fill="#fff" stroke="#000" strokeWidth="5" transform="rotate(18 50 92)" />
  </svg>
);
