import { Linking, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { useCameraPermissions } from "expo-camera";
import { Button, Card, Chip, T } from "../components/ui";
import { colors } from "../theme";

export default function SettingsScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const granted = permission?.granted;
  const canAsk = permission?.canAskAgain ?? true;
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={styles.container}>
      {/* Camera — the one permission QRDrop needs, used only to receive. */}
      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <T variant="title">Camera</T>
            <T variant="small" tone="muted" style={styles.rowBlurb}>
              Used only on the Receive screen to scan the other phone's QR codes.
              Nothing is recorded.
            </T>
          </View>
          <Chip
            label={granted ? "Allowed" : "Not allowed"}
            tone={granted ? "ok" : "warn"}
          />
        </View>
        {!granted ? (
          <Button
            title={canAsk ? "Allow camera" : "Open device settings"}
            onPress={canAsk ? requestPermission : () => Linking.openSettings()}
            style={styles.action}
          />
        ) : (
          <Button
            title="Manage in device settings"
            variant="ghost"
            onPress={() => Linking.openSettings()}
            style={styles.action}
          />
        )}
      </Card>

      {/* Files — no storage permission exists to grant; access is per-pick. */}
      <Card>
        <T variant="title">File access</T>
        <T variant="small" tone="muted" style={styles.rowBlurb}>
          QRDrop can only read a file at the moment you pick it, and only that one
          file. There is no storage permission to turn on, and QRDrop never browses
          your files on its own. Received files are saved through the system share
          sheet, so you choose where they land.
        </T>
      </Card>

      {/* About */}
      <Card>
        <T variant="title">About QRDrop</T>
        <T variant="small" tone="muted" style={styles.rowBlurb}>
          Files move from one phone to another as animated QR codes, scanned by the
          other phone's camera. No backend, no internet, no server. Everything stays
          on your two devices.
        </T>
        <View style={styles.metaRow}>
          <T variant="label" tone="faint">Version</T>
          <T variant="label" tone="soft">{version}</T>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  rowText: { flex: 1 },
  rowBlurb: { marginTop: 6 },
  action: { marginTop: 16, alignSelf: "stretch" },
  metaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
