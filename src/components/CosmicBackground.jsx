import { useTheme } from "next-themes";

// Fixed, animated cosmic background (stars + nebula) that sits behind all content
// - Theme-aware (light/dark)
// - Respects prefers-reduced-motion
// - Pure CSS animations for performance
export default function CosmicBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="cosmic-bg fixed inset-0 pointer-events-none"
  style={{ zIndex: 0 }}
      aria-hidden="true"
      data-theme={isDark ? "dark" : "light"}
    >
  {/* Base gradient layer for tone and visibility */}
  <div className="cosmic-base" />

      {/* Large soft nebulas (very subtle in light, richer in dark) */}
      <div className="cosmic-nebula cosmic-nebula-a" />
      <div className="cosmic-nebula cosmic-nebula-b" />

      {/* Star layers (different densities/sizes) */}
      <div className="cosmic-stars cosmic-stars-sm" />
      <div className="cosmic-stars cosmic-stars-md" />
      <div className="cosmic-stars cosmic-stars-lg" />

      {/* Gentle haze to improve contrast subtly */}
      <div className="cosmic-haze" />
    </div>
  );
}
