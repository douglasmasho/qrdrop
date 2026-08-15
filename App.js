import { useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Segmented, T } from "./src/components/ui";
import SendScreen from "./src/screens/SendScreen";
import ReceiveScreen from "./src/screens/ReceiveScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { colors } from "./src/theme";

const TABS = [
  { value: "send", label: "Send" },
  { value: "receive", label: "Receive" },
  { value: "settings", label: "Settings" },
];

export default function App() {
  const [tab, setTab] = useState("send");
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
        <View style={styles.header}>
          <Image
            source={require("./assets/wordmark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <T variant="small" tone="muted" style={styles.tagline}>Phone to phone, no internet</T>
        </View>

        <View style={styles.tabsWrap}>
          <Segmented value={tab} options={TABS} onChange={setTab} />
        </View>

        {/* Mounting only the active screen means switching tabs unmounts the
            other one — the receive buffer and camera are torn down on switch. */}
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {tab === "send" ? (
            <SendScreen />
          ) : tab === "receive" ? (
            <ReceiveScreen />
          ) : (
            <SettingsScreen />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  splash: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  logo: { width: 132, height: 34 },
  tagline: { marginTop: 5 },
  tabsWrap: { paddingHorizontal: 20, paddingTop: 12 },
  body: { padding: 20, paddingBottom: 40 },
});
