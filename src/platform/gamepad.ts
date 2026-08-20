/**
 * Gamepad module — Web Gamepad API.
 * Polls inside the rAF loop, dispatches direction events, maintains focus.
 * Falls back to keyboard + touch for development / non-gamepad devices.
 */
import { gamepadConnected, lastInput } from "../core/state";

// Standard mapping (Xbox / PlayStation / most handhelds)
export const BTN = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  SELECT: 8,
  START: 9,
  L3: 10,
  R3: 11,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
} as const;

export const AXIS = {
  LX: 0, LY: 1,
  RX: 2, RY: 3,
} as const;

type Direction = "up" | "down" | "left" | "right" | null;

export interface GamepadState {
  index: number;
  id: string;
  buttons: { pressed: boolean; value: number }[];
  axes: number[];
  lastDirection: Direction;
  repeatTimers: Partial<Record<"up" | "down" | "left" | "right", { tick: number; interval: number }>>;
}

let connected: GamepadState | null = null;
let releaseTimers = new Map<number, number>();

const REPEAT_DELAY = 280;     // ms before held direction repeats
const REPEAT_INTERVAL = 90;   // ms between repeats

export function initGamepad() {
  window.addEventListener("gamepadconnected", (e: any) => {
    const gp = e.gamepad;
    connected = {
      index: gp.index,
      id: gp.id,
      buttons: gp.buttons.map((b: any) => ({ pressed: b.pressed, value: b.value })),
      axes: [...gp.axes],
      lastDirection: null,
      repeatTimers: {},
    };
    gamepadConnected.set(true);
    lastInput.set("gamepad");
    console.info("[gamepad] connected:", gp.id);
  });

  window.addEventListener("gamepaddisconnected", (e: any) => {
    if (connected && connected.index === e.gamepad.index) {
      connected = null;
      gamepadConnected.set(false);
      console.info("[gamepad] disconnected");
    }
  });

  // Map right-stick as mouse / D-pad equivalent. Trigger periodic poller.
  startPoller();
}

function startPoller() {
  function tick() {
    poll();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function poll() {
  // Some browsers forget to fire gamepadconnected if the page loads after
  // the gamepad is already paired. Refresh from navigator.getGamepads().
  if (!connected) {
    const pads = navigator.getGamepads?.();
    if (pads) {
      for (const p of pads) {
        if (p && p.connected) {
          connected = {
            index: p.index,
            id: p.id,
            buttons: p.buttons.map((b) => ({ pressed: b.pressed, value: b.value })),
            axes: [...p.axes],
            lastDirection: null,
            repeatTimers: {},
          };
          gamepadConnected.set(true);
          lastInput.set("gamepad");
          break;
        }
      }
    }
  }

  if (!connected) return;

  const pads = navigator.getGamepads?.();
  const gp = pads?.[connected.index];
  if (!gp) return;

  // Update state
  for (let i = 0; i < gp.buttons.length; i++) {
    const wasPressed = connected.buttons[i]?.pressed;
    const pressed = gp.buttons[i].pressed;
    connected.buttons[i] = { pressed, value: gp.buttons[i].value };
    if (pressed && !wasPressed) {
      dispatchButton(i, true);
    } else if (!pressed && wasPressed) {
      dispatchButton(i, false);
    }
  }

  for (let i = 0; i < gp.axes.length; i++) {
    connected.axes[i] = gp.axes[i];
  }

  // D-pad via dpad buttons
  const dpadUp = connected.buttons[BTN.UP]?.pressed;
  const dpadDown = connected.buttons[BTN.DOWN]?.pressed;
  const dpadLeft = connected.buttons[BTN.LEFT]?.pressed;
  const dpadRight = connected.buttons[BTN.RIGHT]?.pressed;

  // Left stick as D-pad
  const lx = connected.axes[AXIS.LX] ?? 0;
  const ly = connected.axes[AXIS.LY] ?? 0;
  const deadzone = 0.4;

  let dir: Direction = null;
  if (dpadUp || ly < -deadzone) dir = "up";
  else if (dpadDown || ly > deadzone) dir = "down";
  else if (dpadLeft || lx < -deadzone) dir = "left";
  else if (dpadRight || lx > deadzone) dir = "right";

  handleDirection(dir);
}

function handleDirection(dir: Direction) {
  if (!connected) return;
  // Cancel repeat timers for non-pressed directions
  for (const k of ["up", "down", "left", "right"] as const) {
    if (dir !== k) {
      const t = connected.repeatTimers[k];
      if (t) {
        clearTimeout(t.tick);
        delete connected.repeatTimers[k];
      }
    }
  }

  if (!dir) {
    connected.lastDirection = null;
    return;
  }

  if (dir !== connected.lastDirection) {
    // New direction — emit immediately
    dispatchDirection(dir);
    connected.lastDirection = dir;
    // Schedule repeat
    const tickId = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        if (connected?.lastDirection === dir) {
          dispatchDirection(dir);
        } else {
          clearInterval(interval);
        }
      }, REPEAT_INTERVAL);
      // Store interval for cleanup
      if (connected) connected.repeatTimers[dir] = { tick: 0, interval: interval as any };
    }, REPEAT_DELAY);
    if (connected) connected.repeatTimers[dir] = { tick: tickId, interval: 0 };
  }
}

function dispatchDirection(dir: Direction) {
  if (!dir) return;
  lastInput.set("gamepad");
  window.dispatchEvent(new CustomEvent("gamepad:dpad", { detail: { dir } }));
}

function dispatchButton(index: number, pressed: boolean) {
  if (!pressed) return;
  lastInput.set("gamepad");
  window.dispatchEvent(new CustomEvent("gamepad:button", { detail: { index } }));
}

export function getActiveGamepad(): GamepadState | null {
  return connected;
}
