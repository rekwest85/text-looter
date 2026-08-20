/**
 * Tiny hash-based router — no external dependencies.
 * Replaces svelte-spa-router to eliminate a class of navigation bugs.
 *
 *   <Router>  — current component, swap on $route
 *   navigate("/dungeon")  — change route
 *   back()                 — go to previous route
 */
import { writable, get, type Writable } from "svelte/store";

const routeComponents: Record<string, any> = {};
let history: string[] = [];

// Expose a last-action string for debugging (read by DebugOverlay + Town panel)
let _lastNavInfo = "router ready";
export const lastNavInfo: Writable<string> = writable(_lastNavInfo);
function setNavInfo(msg: string) {
  _lastNavInfo = msg;
  lastNavInfo.set(msg);
  console.log("[router]", msg);
}

export const route: Writable<string> = writable(getInitial());

function getInitial(): string {
  if (typeof window === "undefined") return "/";
  const hash = (window.location.hash || "#/").slice(1);
  return hash.startsWith("/") ? hash : `/${hash}`;
}

export function registerRoute(path: string, component: any) {
  routeComponents[path] = component;
  setNavInfo(`registered ${path}`);
}

export function getComponent(path: string): any {
  const c = routeComponents[path] ?? routeComponents["/"] ?? null;
  setNavInfo(`getComponent(${path}) -> ${c ? "FOUND" : "NULL"}`);
  return c;
}

export function navigate(path: string) {
  const current = get(route);
  setNavInfo(`navigate(${path}) from ${current}`);
  if (current === path) {
    setNavInfo(`navigate(${path}) no-op (same path)`);
    return;
  }
  if (typeof window !== "undefined") {
    setNavInfo(`setting window.location.hash = ${path}`);
    window.location.hash = path;
    setNavInfo(`hash set, current = ${window.location.hash}`);
  }
  history.push(current);
  route.set(path);
  setNavInfo(`route store updated to ${path}`);
}

export function replace(path: string) {
  if (typeof window !== "undefined") {
    window.location.replace(`#${path}`);
  }
  route.set(path);
}

export function back() {
  const prev = history.pop();
  if (prev) {
    if (typeof window !== "undefined") {
      window.location.hash = prev;
    }
    route.set(prev);
  } else {
    navigate("/");
  }
}

// Listen for back button / manual hash changes
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const next = getInitial();
    setNavInfo(`hashchange -> ${next}`);
    route.set(next);
  });
}
