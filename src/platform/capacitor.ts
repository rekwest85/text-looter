/**
 * Capacitor bridge — detects native environment, configures status bar,
 * haptics, immersive mode. Silently no-ops in browser.
 */
import { isNative } from "../core/state";

export async function initCapacitor(): Promise<void> {
  try {
    // Capacitor exposes itself on window when running in the native container
    const cap = (window as any).Capacitor;
    if (!cap || !cap.isNativePlatform) {
      isNative.set(false);
      return;
    }

    isNative.set(true);

    // Status bar
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#00000000" });
    } catch (_) { /* plugin not available */ }

    // App lifecycle (pause on background)
    try {
      const { App } = await import("@capacitor/app");
      App.addListener("appStateChange", ({ isActive }: { isActive: boolean }) => {
        if (!isActive) {
          // Pause game logic, save state
          window.dispatchEvent(new CustomEvent("game:pause"));
        } else {
          window.dispatchEvent(new CustomEvent("game:resume"));
        }
      });
    } catch (_) { /* plugin not available */ }

    // Screen orientation — lock to landscape (handheld PC consoles)
    try {
      const { ScreenOrientation } = await import("@capacitor/screen-orientation");
      await ScreenOrientation.lock({ orientation: "landscape" });
    } catch (_) { /* plugin not available */ }
  } catch (e) {
    console.warn("Capacitor init failed", e);
    isNative.set(false);
  }
}

/**
 * Trigger a haptic impact. Intensity: 0=light, 1=medium, 2=heavy.
 */
export async function hapticImpact(intensity: 0 | 1 | 2 = 1): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const styles = [ImpactStyle.Light, ImpactStyle.Medium, ImpactStyle.Heavy];
    await Haptics.impact({ style: styles[intensity] });
  } catch (_) { /* not in native context */ }
}

export async function hapticNotification(
  type: "success" | "warning" | "error" = "success"
): Promise<void> {
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    const map = { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error };
    await Haptics.notification({ type: map[type] });
  } catch (_) { /* no-op */ }
}
