/**
 * Touch fallback — virtual D-pad + ABXY buttons.
 * Auto-shown when no gamepad is connected and route is in dungeon.
 */
import { gamepadConnected } from "../core/state";

export function initTouch() {
  const overlay = document.createElement("div");
  overlay.className = "touch-overlay";
  overlay.innerHTML = `
    <div class="touch-dpad" data-tip="dpad">
      <div class="dpad-grid" style="position:relative;width:100%;height:100%;">
        <button class="touch-btn" data-dir="up" style="position:absolute;top:0;left:50%;transform:translateX(-50%);">▲</button>
        <button class="touch-btn" data-dir="down" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);">▼</button>
        <button class="touch-btn" data-dir="left" style="position:absolute;left:0;top:50%;transform:translateY(-50%);">◀</button>
        <button class="touch-btn" data-dir="right" style="position:absolute;right:0;top:50%;transform:translateY(-50%);">▶</button>
      </div>
    </div>
    <div class="touch-buttons" data-tip="btns">
      <div></div>
      <button class="touch-btn" data-btn="3">Y</button>
      <div></div>
      <button class="touch-btn" data-btn="0">A</button>
      <button class="touch-btn" data-btn="1">B</button>
      <button class="touch-btn" data-btn="2">X</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dpad = overlay.querySelector(".touch-dpad") as HTMLElement;
  const buttons = overlay.querySelector(".touch-buttons") as HTMLElement;

  function refresh() {
    const show = !window.__gamepadWasConnected && window.__touchAllowed;
    dpad.classList.toggle("active", show);
    buttons.classList.toggle("active", show);
  }

  gamepadConnected.subscribe((v) => {
    window.__gamepadWasConnected = v;
    refresh();
  });

  window.addEventListener("touchOverlay:set", (e: any) => {
    window.__touchAllowed = e.detail.enabled;
    refresh();
  });

  // Wire dpad
  overlay.querySelectorAll("[data-dir]").forEach((el) => {
    const dir = (el as HTMLElement).dataset.dir;
    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("gamepad:dpad", { detail: { dir } }));
    });
  });
  overlay.querySelectorAll("[data-btn]").forEach((el) => {
    const btn = parseInt((el as HTMLElement).dataset.btn!);
    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("gamepad:button", { detail: { index: btn } }));
    });
  });
}

declare global {
  interface Window {
    __gamepadWasConnected?: boolean;
    __touchAllowed?: boolean;
  }
}
window.__touchAllowed = false;
