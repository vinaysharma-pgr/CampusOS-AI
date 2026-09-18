// src/features/landing/components/RegistrationMark.jsx
export default function RegistrationMark() {
  const cross = "M6 0V12M0 6H12";

  const positions = [
    "-left-1.5 -top-1.5",
    "-right-1.5 -top-1.5",
    "-left-1.5 -bottom-1.5",
    "-right-1.5 -bottom-1.5",
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`pointer-events-none absolute h-3 w-3 text-border-strong ${pos}`}
          aria-hidden="true"
        >
          <path d={cross} stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}