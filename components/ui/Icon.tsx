import type { SVGProps } from "react";

const paths = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  external: <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  github: (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  hand: <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1.5v-2a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v2m0-1a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L5 15.5a1.6 1.6 0 0 1 2.7-1.7L8 14.3" />,
};

export type IconName = keyof typeof paths | "whatsapp";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  if (name === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path
          fill="currentColor"
          d="M12.04 2a9.93 9.93 0 0 0-8.5 15.05L2 22l5.08-1.5A9.93 9.93 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.02.9.9-2.94-.2-.3a8.18 8.18 0 1 1 6.8 3.67zm4.5-6.12c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04c0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.17-.47-.29z"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}

/** Nova Web Dz mark: a four-point spark in red and blue. */
export function Mark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="nw-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF2E4D" />
          <stop offset="1" stopColor="#2E7BFF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#0D1328" />
      <path d="M16 4.5c.9 6.5 4.9 10.6 11.5 11.5-6.6.9-10.6 4.9-11.5 11.5-.9-6.6-4.9-10.6-11.5-11.5C11.1 15.1 15.1 11 16 4.5z" fill="url(#nw-g)" />
    </svg>
  );
}
