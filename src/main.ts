import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { initCapacitor } from "./platform/capacitor";

async function boot() {
  // Init Capacitor bridge (no-op in browser, real init in APK)
  await initCapacitor();

  const app = mount(App, { target: document.getElementById("app")! });
  return app;
}

boot();
