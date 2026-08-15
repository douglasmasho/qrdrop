// QRDrop theme — carried over directly from the Reko design system so the two
// apps feel like one family: Manrope everywhere, a single orange accent, a calm
// canvas, and quiet ink-toned text. One font family, used at different weights.

export const colors = {
  // QRDrop orange — the single accent that carries the brand (#ff7900).
  brand50: "#fff4ec",
  brand100: "#ffe0c7",
  brand500: "#ff7900",
  brand600: "#ef6c00",
  brand700: "#cc5b00",
  brand900: "#7a3a00",

  // Ink — text tones from strong to faint.
  ink: "#0d1220",
  inkSoft: "#3b4256",
  inkMuted: "#6b7284",
  inkFaint: "#9aa0b0",

  canvas: "#f5f7fb",
  white: "#ffffff",
  line: "#e7eaf1",

  // Semantic tones, used sparingly. Warnings lean red so they never read as the
  // orange brand accent.
  ok: "#0f9d6a",
  warn: "#d92d20",
  warnSoftBg: "#fef3f2",
  warnSoftText: "#b42318",
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
