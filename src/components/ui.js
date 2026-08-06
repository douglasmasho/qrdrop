import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, shadow } from "../theme";

// --- Text ------------------------------------------------------------------
// A single Text wrapper so every label uses Manrope. Variants change weight and
// tone only, never the typeface.
export function T({ variant = "body", tone = "ink", center, style, children }) {
  return (
    <Text style={[styles.tBase, variants[variant], tones[tone], center && styles.center, style]}>
      {children}
    </Text>
  );
}

// --- Card ------------------------------------------------------------------
export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// --- Button ----------------------------------------------------------------
export function Button({ title, onPress, variant = "primary", disabled, icon, style }) {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isPrimary && styles.btnPrimary,
        isGhost && styles.btnGhost,
        variant === "quiet" && styles.btnQuiet,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {icon ? <Text style={[styles.btnIcon, isPrimary && styles.btnTextPrimary]}>{icon}</Text> : null}
      <Text style={[styles.btnText, isPrimary ? styles.btnTextPrimary : styles.btnTextDark]}>
        {title}
      </Text>
    </Pressable>
  );
}

// --- Segmented control (the Send / Receive switch) -------------------------
export function Segmented({ value, options, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active ? styles.segmentTextActive : styles.segmentTextIdle]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- Chip ------------------------------------------------------------------
export function Chip({ label, tone = "neutral" }) {
  const map = {
    neutral: [styles.chipNeutralBg, colors.inkSoft],
    brand: [styles.chipBrandBg, colors.brand700],
    warn: [styles.chipWarnBg, colors.warnSoftText],
    ok: [{ backgroundColor: "#e7f6ef" }, colors.ok],
  };
  const [bg, textColor] = map[tone];
  return (
    <View style={[styles.chip, bg]}>
      <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// --- WhyNote (Reko's signature soft-blue info note) ------------------------
export function WhyNote({ children }) {
  return (
    <View style={styles.why}>
      <Text style={styles.whyText}>{children}</Text>
    </View>
  );
}

const variants = StyleSheet.create({
  h1: { fontFamily: font.extrabold, fontSize: 26, letterSpacing: -0.4 },
  h2: { fontFamily: font.bold, fontSize: 18, letterSpacing: -0.2 },
  title: { fontFamily: font.bold, fontSize: 16 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: font.semibold, fontSize: 13 },
  small: { fontFamily: font.regular, fontSize: 13, lineHeight: 19 },
  mono: { fontFamily: font.bold, fontSize: 15 },
});

const tones = StyleSheet.create({
  ink: { color: colors.ink },
  soft: { color: colors.inkSoft },
  muted: { color: colors.inkMuted },
  faint: { color: colors.inkFaint },
  brand: { color: colors.brand600 },
  white: { color: colors.white },
  warn: { color: colors.warnSoftText },
  ok: { color: colors.ok },
});

const styles = StyleSheet.create({
  tBase: { color: colors.ink },
  center: { textAlign: "center" },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    ...shadow.card,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  btnPrimary: { backgroundColor: colors.brand600 },
  btnGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  btnQuiet: { backgroundColor: "transparent" },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontFamily: font.bold, fontSize: 15 },
  btnTextPrimary: { color: colors.white },
  btnTextDark: { color: colors.inkSoft },
  btnIcon: { fontSize: 15 },

  segment: {
    flexDirection: "row",
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 4,
    gap: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: radius.md, alignItems: "center" },
  segmentItemActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
    shadowOpacity: 0.05,
  },
  segmentText: { fontFamily: font.bold, fontSize: 14 },
  segmentTextActive: { color: colors.ink },
  segmentTextIdle: { color: colors.inkMuted },

  chip: { alignSelf: "flex-start", borderRadius: radius.full, paddingHorizontal: 11, paddingVertical: 4 },
  chipText: { fontFamily: font.bold, fontSize: 12 },
  chipNeutralBg: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  chipBrandBg: { backgroundColor: colors.brand50 },
  chipWarnBg: { backgroundColor: colors.warnSoftBg },

  why: {
    backgroundColor: colors.brand50,
    borderWidth: 1,
    borderColor: colors.brand100,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  whyText: { fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: colors.brand900 },
});
