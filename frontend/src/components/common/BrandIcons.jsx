// src/components/common/BrandIcons.jsx

export function GithubIcon({ size = 16, className = "", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M15 22v-3.4a3.3 3.3 0 0 0-.94-2.58c3.13-.35 6.4-1.54 6.4-6.96a5.44 5.44 0 0 0-1.5-3.75 5.06 5.06 0 0 0-.14-3.8s-1.2-.36-4 1.4a13.7 13.7 0 0 0-7.24 0c-2.8-1.76-4-1.4-4-1.4a5.06 5.06 0 0 0-.14 3.8 5.44 5.44 0 0 0-1.5 3.78c0 5.38 3.27 6.6 6.4 6.96A3.3 3.3 0 0 0 8.5 19v3" />
      <path d="M9 20.5c-3 .8-5.5 0-7-2.5" />
    </svg>
  );
}

export function TwitterIcon({ size = 16, className = "", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 4l7.55 10.1L4.44 20H7l5.4-4.98L16.9 20H20l-8-10.7L18.8 4h-2.55l-4.9 4.6L7.2 4H4z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 16, className = "", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.6A5.98 5.98 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}