// QRDrop theme — carried over directly from the Reko design system so the two
// apps feel like one family: Manrope everywhere, a single blue accent, a calm
// canvas, and quiet ink-toned text. One font family, used at different weights.

export const colors = {
  // Reko blue — the single accent that carries the brand.
  brand50: "#eef4ff",
  brand100: "#d9e6ff",
  brand500: "#3366ff",
  brand600: "#1f4ff5",
  brand700: "#173de1",
  brand900: "#1a338f",

  // Ink — text tones from strong to faint.
  ink: "#0d1220",
  inkSoft: "#3b4256",
  inkMuted: "#6b7284",
  inkFaint: "#9aa0b0",

  canvas: "#f5f7fb",
  white: "#ffffff",
  line: "#e7eaf1",

  // Semantic tones, used sparingly.
  ok: "#0f9d6a",
  warn: "#e0603a",
  warnSoftBg: "#fff3ee",
  warnSoftText: "#b23c1a",
};

// One font family. Weight, not typeface, carries hierarchy.
export const font = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
};

export const radius = {
  md: 12,
  lg: 14,
  xl: 18,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};
