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

export const route: Writable<string> = writable(getInitial());

function getInitial(): string {
  if (typeof window === "undefined") return "/";
  const hash = (window.location.hash || "#/").slice(1);
  // Normalize: "/", "/town", etc.
  return hash.startsWith("/") ? hash : `/${hash}`;
}

export function registerRoute(path: string, component: any) {
  routeComponents[path] = component;
}

export function getComponent(path: string): any {
  return routeComponents[path] ?? routeComponents["/"] ?? null;
}

export function navigate(path: string) {
  const current = get(route);
  if (current === path) return;
  if (typeof window !== "undefined") {
    window.location.hash = path;
  }
  history.push(current);
  route.set(path);
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
    route.set(getInitial());
  });
}
