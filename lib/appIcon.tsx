// Shared mark for every generated icon (favicon, apple-touch-icon, PWA
// manifest icons) — rendered server-side via next/og's ImageResponse
// (Satori), so it never depends on a browser to produce correct pixels.
// Mirrors the navbar's gradient "D" logo (app/components/NavBar.tsx).
export function AppIconMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4C7DFF, #A78BFA)",
      }}
    >
      <span
        style={{
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: size * 0.55,
          color: "#fff",
        }}
      >
        D
      </span>
    </div>
  );
}
