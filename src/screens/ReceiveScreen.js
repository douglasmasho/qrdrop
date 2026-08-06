import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
// SDK 57's first-class file API: cache the rebuilt file, and let the user pick a
// real folder to save it into via Directory.pickDirectoryAsync (Android SAF).
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Button, Card, T, WhyNote } from "../components/ui";
import { parseFrame } from "../lib/protocol";
import { colors, font, radius } from "../theme";

export default function ReceiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  // Transfer buffer. Chunks live in a ref (they never need to trigger a render);
  // the header/meta live in state so progress updates the UI.
  const chunks = useRef([]); // sparse array indexed by frame.index
  const [meta, setMeta] = useState(null); // { total, name, type }
  const [received, setReceived] = useState(0);
  const [done, setDone] = useState(false);
  const [savedUri, setSavedUri] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const assembling = useRef(false);
  const rebuilt = useRef(null); // the assembled base64, kept for saving

  const reset = useCallback(() => {
    chunks.current = [];
    rebuilt.current = null;
    setMeta(null);
    setReceived(0);
    setDone(false);
    setSavedUri(null);
    setError(null);
    setNotice(null);
    setSaving(false);
    assembling.current = false;
  }, []);

  // Clear the buffer whenever this screen is unmounted (i.e. the user switches
  // to Send), so returning always starts fresh.
  useEffect(() => reset, [reset]);

  const onScan = useCallback(
    ({ data }) => {
      if (done || assembling.current) return;
      const frame = parseFrame(data);
      if (!frame) return;

      // Ignore duplicates — only store an index we have not seen.
      if (chunks.current[frame.index] !== undefined) return;

      chunks.current[frame.index] = frame.data;
      if (!meta) setMeta({ total: frame.total, name: frame.name, type: frame.type });

      // Count how many distinct frames we hold.
      let count = 0;
      for (let i = 0; i < frame.total; i++) if (chunks.current[i] !== undefined) count++;
      setReceived(count);

      if (count === frame.total) finish(frame);
    },
    [done, meta],
  );

  async function finish(frame) {
    assembling.current = true;
    try {
      const base64 = chunks.current.slice(0, frame.total).join("");
      const safeName = (frame.name || "qrdrop-file").replace(/[^\w.\-]+/g, "_");
      const out = new File(Paths.cache, safeName);
      out.create({ overwrite: true });
      out.write(base64, { encoding: "base64" });
      rebuilt.current = base64;
      setSavedUri(out.uri);
      setDone(true);
    } catch (e) {
      setError(`The file arrived but could not be rebuilt: ${e?.message || e}`);
      assembling.current = false;
    }
  }

  // Actually write the file to a folder the user chooses (Downloads, Documents,
  // etc.) through the system directory picker — a real save, not a share.
  async function saveToDevice() {
    if (!rebuilt.current) return;
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      const dir = await Directory.pickDirectoryAsync();
      const safeName = (meta?.name || "qrdrop-file").replace(/[^\w.\-]+/g, "_");
      const dest = dir.createFile(safeName, meta?.type || "application/octet-stream");
      dest.write(rebuilt.current, { encoding: "base64" });
      setNotice(`Saved ${safeName} to the folder you chose.`);
    } catch (e) {
      // The picker rejects when the user backs out — treat that as a no-op.
      const msg = String(e?.message || e);
      if (!/cancel/i.test(msg)) setError(`Could not save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Hand the file to another app (open in a viewer, send to chat, etc.).
  async function openElsewhere() {
    if (!savedUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(savedUri, { mimeType: meta?.type });
    } else {
      setError("Opening in another app is not available on this device.");
    }
  }

  // --- Permission states ---------------------------------------------------
  if (!permission) {
    return (
      <View style={styles.container}>
        <Card style={styles.centerCard}>
          <T variant="small" tone="muted">Preparing camera…</T>
        </Card>
      </View>
    );
  }

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <View style={styles.container}>
        <Card style={styles.centerCard}>
          <View style={styles.iconBubble}>
            <T style={styles.bigGlyph}>◉</T>
          </View>
          <T variant="h2" center>Camera access needed</T>
          <T variant="small" tone="muted" center style={styles.blurb}>
            QRDrop scans the QR codes on the other phone using your camera. Nothing is
            recorded and nothing leaves this device.
          </T>
          <Button
            title={blocked ? "Open settings" : "Allow camera"}
            onPress={blocked ? () => Linking.openSettings() : requestPermission}
            style={styles.permBtn}
          />
        </Card>
      </View>
    );
  }

  // --- Success state -------------------------------------------------------
  if (done) {
    return (
      <View style={styles.container}>
        <Card style={styles.centerCard}>
          <View style={[styles.iconBubble, styles.okBubble]}>
            <T style={[styles.bigGlyph, { color: colors.ok }]}>✓</T>
          </View>
          <T variant="h2" center>File received</T>
          <T variant="title" center numberOfLines={1} style={styles.doneName}>{meta?.name}</T>
          <T variant="small" tone="muted" center>{meta?.total} frames · complete</T>
          <Button
            title={saving ? "Saving…" : "Save to device"}
            icon="⬇"
            onPress={saveToDevice}
            disabled={saving}
            style={styles.permBtn}
          />
          <Button title="Open in another app" variant="ghost" onPress={openElsewhere} style={styles.secondaryBtn} />
          <Button title="Receive another" variant="quiet" onPress={reset} style={styles.secondaryBtn} />
          {notice ? <T variant="small" tone="ok" center style={styles.errText}>{notice}</T> : null}
          {error ? <T variant="small" tone="warn" center style={styles.errText}>{error}</T> : null}
        </Card>
      </View>
    );
  }

  // --- Scanning state ------------------------------------------------------
  const total = meta?.total ?? null;
  const pct = total ? received / total : 0;

  return (
    <View style={styles.container}>
      <Card style={styles.cameraCard}>
        <View style={styles.cameraBox}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onScan}
          />
          <View style={styles.reticle} pointerEvents="none" />
        </View>

        <View style={styles.progressWrap}>
          {total ? (
            <>
              <T variant="title" center>{received} of {total} frames received</T>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
              </View>
              <T variant="small" tone="muted" center numberOfLines={1}>{meta?.name}</T>
            </>
          ) : (
            <T variant="title" tone="muted" center>Point at the other phone's QR codes</T>
          )}
        </View>
      </Card>

      <WhyNote>
        Hold steady until the bar fills. Frames can arrive in any order and repeats are
        skipped, so it is fine if the code loops past you.
      </WhyNote>

      {received > 0 ? (
        <Button title="Reset and start over" variant="ghost" onPress={reset} />
      ) : null}
      {error ? <T variant="small" tone="warn" center style={styles.errText}>{error}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  centerCard: { alignItems: "center", paddingVertical: 34, gap: 6 },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  okBubble: { backgroundColor: "#e7f6ef" },
  bigGlyph: { fontSize: 28, color: colors.brand600, fontFamily: font.bold },
  blurb: { marginTop: 4, maxWidth: 300 },
  doneName: { marginTop: 10 },
  permBtn: { marginTop: 18, alignSelf: "stretch" },
  secondaryBtn: { marginTop: 10, alignSelf: "stretch" },
  errText: { marginTop: 14 },

  cameraCard: { padding: 14 },
  cameraBox: {
    borderRadius: radius.lg,
    overflow: "hidden",
    aspectRatio: 1,
    backgroundColor: colors.ink,
    position: "relative",
  },
  camera: { flex: 1 },
  reticle: {
    position: "absolute",
    top: "12%",
    left: "12%",
    right: "12%",
    bottom: "12%",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.lg,
  },

  progressWrap: { marginTop: 16, gap: 10 },
  track: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.brand600, borderRadius: radius.full },
});
