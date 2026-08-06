import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import QRCode from "react-native-qrcode-svg";
import { Button, Card, Chip, T, WhyNote } from "../components/ui";
import { buildFrames, formatBytes, SIZE_WARN_BYTES } from "../lib/protocol";
import { readAsBase64 } from "../lib/readFile";
import { colors, font, radius } from "../theme";

// Frames per second the sender cycles at. The camera on the other phone can only
// decode so many distinct frames per second, so beyond ~8 fps extra speed mostly
// turns into missed frames (recovered on the next loop) rather than faster
// transfer. Slow stays low for tricky lighting or older phones.
const SPEEDS = [
  { value: 2, label: "Slow" },
  { value: 5, label: "Normal" },
  { value: 8, label: "Fast" },
];

export default function SendScreen() {
  const { width } = useWindowDimensions();
  const qrSize = Math.min(width - 72, 340);

  const [file, setFile] = useState(null); // { name, type, size }
  const [frames, setFrames] = useState(null); // array of frame objects
  const [current, setCurrent] = useState(0);
  const [fps, setFps] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const timer = useRef(null);

  // Drive the animation loop. It keeps looping so a receiver can restart and
  // still catch every frame on the next pass.
  useEffect(() => {
    if (!frames) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % frames.length);
    }, Math.round(1000 / fps));
    return () => clearInterval(timer.current);
  }, [frames, fps]);

  useEffect(() => () => clearInterval(timer.current), []);

  async function pickFile() {
    setError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.canceled) return;
      const asset = res.assets[0];
      setBusy(true);
      setFrames(null);
      setCurrent(0);

      const base64 = await readAsBase64(asset.uri);
      const built = buildFrames(base64, asset.name, asset.mimeType || "application/octet-stream");

      setFile({ name: asset.name, type: asset.mimeType, size: asset.size });
      setFrames(built);
    } catch (e) {
      setError(`Could not read that file: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    clearInterval(timer.current);
    setFile(null);
    setFrames(null);
    setCurrent(0);
    setError(null);
  }

  const oversize = file?.size != null && file.size > SIZE_WARN_BYTES;
  const frameData = useMemo(
    () => (frames ? JSON.stringify(frames[current]) : ""),
    [frames, current],
  );

  // --- Empty state: pick a file -------------------------------------------
  if (!frames) {
    return (
      <View style={styles.container}>
        <Card style={styles.pickCard}>
          <View style={styles.iconBubble}>
            <T style={styles.bigGlyph}>⬆</T>
          </View>
          <T variant="h2" center>Send a file</T>
          <T variant="small" tone="muted" center style={styles.pickBlurb}>
            Pick a file and QRDrop turns it into a stream of QR codes. Point the other
            phone's camera at your screen to receive it.
          </T>
          {busy ? (
            <View style={styles.busyRow}>
              <ActivityIndicator color={colors.brand600} />
              <T variant="label" tone="muted">Reading file…</T>
            </View>
          ) : (
            <Button title="Choose a file" icon="＋" onPress={pickFile} style={styles.pickBtn} />
          )}
          {error ? <T variant="small" tone="warn" center style={styles.errText}>{error}</T> : null}
        </Card>
      </View>
    );
  }

  // --- Sending state: animated QR -----------------------------------------
  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.fileRow}>
          <View style={styles.fileMeta}>
            <T variant="title" numberOfLines={1}>{file?.name}</T>
            <T variant="small" tone="muted">{formatBytes(file?.size)} · {frames.length} frames</T>
          </View>
          <Chip label={`${fps} fps`} tone="brand" />
        </View>

        {oversize ? (
          <View style={styles.warnBox}>
            <T variant="small" tone="warn">
              This file is over 150 KB, which makes for a long transfer. Smaller files send
              faster and scan more reliably.
            </T>
          </View>
        ) : null}

        <View style={styles.qrWrap}>
          <View style={[styles.qrFrame, { width: qrSize + 24, height: qrSize + 24 }]}>
            <QRCode
              value={frameData}
              size={qrSize}
              ecl="L"
              backgroundColor={colors.white}
              color={colors.ink}
            />
          </View>
          <T variant="label" tone="muted" style={styles.frameCounter}>
            Frame {current + 1} / {frames.length}
          </T>
        </View>
      </Card>

      <Card style={styles.speedCard}>
        <T variant="label" tone="soft" style={styles.speedLabel}>Speed</T>
        <View style={styles.speedRow}>
          {SPEEDS.map((s) => {
            const active = s.value === fps;
            return (
              <Pressable
                key={s.value}
                onPress={() => setFps(s.value)}
                style={[styles.speedPill, active && styles.speedPillActive]}
              >
                <T style={[styles.speedText, active ? styles.speedTextActive : styles.speedTextIdle]}>
                  {s.label}
                </T>
                <T style={[styles.speedSub, active ? styles.speedTextActive : styles.speedSubIdle]}>
                  {s.value} fps
                </T>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <WhyNote>
        Keep both phones still and about 20 cm apart. The codes loop forever, so the receiver
        can start any time and still collect every frame.
      </WhyNote>

      <Button title="Send another file" variant="ghost" onPress={reset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  pickCard: { alignItems: "center", paddingVertical: 34, gap: 6 },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bigGlyph: { fontSize: 28, color: colors.brand600, fontFamily: font.bold },
  pickBlurb: { marginTop: 4, maxWidth: 300 },
  pickBtn: { marginTop: 18, alignSelf: "stretch" },
  busyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20 },
  errText: { marginTop: 14 },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  fileMeta: { flex: 1, gap: 2 },

  warnBox: {
    marginTop: 14,
    backgroundColor: colors.warnSoftBg,
    borderRadius: radius.md,
    padding: 12,
  },

  qrWrap: { alignItems: "center", marginTop: 18 },
  qrFrame: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  frameCounter: { marginTop: 14 },

  speedCard: { paddingVertical: 14 },
  speedLabel: { marginBottom: 10 },
  speedRow: { flexDirection: "row", gap: 8 },
  speedPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 1,
  },
  speedPillActive: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  speedText: { fontFamily: font.bold, fontSize: 14 },
  speedSub: { fontFamily: font.semibold, fontSize: 11 },
  speedTextActive: { color: colors.white },
  speedTextIdle: { color: colors.ink },
  speedSubIdle: { color: colors.inkMuted },
});
