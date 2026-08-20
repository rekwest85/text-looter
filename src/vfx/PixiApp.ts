/**
 * Pixi.js overlay — high-performance 2D WebGL layer for particles, beams, FX.
 * Renders on top of the DOM-based UI.
 */
import { Application, Container, Graphics, Sprite, BlurFilter, Color } from "pixi.js";
import { get } from "svelte/store";
import { beamTrigger } from "../core/state";
import { rarityDef } from "../data/rarities";

let app: Application | null = null;
let root: Container | null = null;
let host: HTMLDivElement | null = null;
let initialized = false;

export async function initPixi(parent: HTMLElement): Promise<void> {
  if (initialized) return;
  host = parent;
  host.classList.add("pixi-host");

  app = new Application();
  await app.init({
    background: 0x000000,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    resizeTo: parent,
    powerPreference: "high-performance",
  });

  host.appendChild(app.canvas);

  root = new Container();
  app.stage.addChild(root);

  initialized = true;
  observeBeamTrigger();
}

function observeBeamTrigger() {
  beamTrigger.subscribe(async (trig) => {
    if (!trig || !root) return;
    spawnLootDrop(trig.item, host!.getBoundingClientRect());
  });
}

export function spawnLootDrop(item: any, rect: DOMRect) {
  if (!root || !app) return;
  const r = rarityDef(item.rarity);
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  // Beam from sky to floor
  const beamHeight = Math.min(rect.height * 0.85, 700);
  const beamWidth = 18 + (rd.id * 2);

  const beam = new Graphics();
  beam
    .rect(-beamWidth / 2, -beamHeight, beamWidth, beamHeight)
    .fill({ color: hexToPixi(r.color), alpha: 0.85 });
  beam.x = cx;
  beam.y = cy;
  beam.alpha = 0;
  root.addChild(beam);

  // Glow (a wider, blurry rectangle)
  const glow = new Graphics();
  glow
    .rect(-beamWidth * 3, -beamHeight, beamWidth * 6, beamHeight)
    .fill({ color: hexToPixi(r.color), alpha: 0.4 });
  glow.x = cx;
  glow.y = cy;
  glow.alpha = 0;
  glow.filters = [new BlurFilter({ strength: 20 })];
  root.addChild(glow);

  // Ring expanding on the floor
  const ring = new Graphics();
  ring.circle(0, 0, 8).stroke({ color: hexToPixi(r.color), width: 3, alpha: 1 });
  ring.x = cx;
  ring.y = cy;
  ring.alpha = 0;
  root.addChild(ring);

  // Sparks rising
  const sparkCount = r.hasSparks ? 24 : 8;
  for (let i = 0; i < sparkCount; i++) {
    const spark = new Graphics();
    spark.circle(0, 0, 2 + Math.random() * 2).fill({ color: 0xffffff, alpha: 1 });
    spark.x = cx;
    spark.y = cy;
    spark.tint = hexToPixi(r.color);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    (spark as any)._vx = Math.cos(angle) * speed;
    (spark as any)._vy = -2 - Math.random() * 2;
    root.addChild(spark);
    animateSpark(spark);
  }

  // Animation timeline
  const T0 = Date.now();
  const TOTAL = 1600;
  const tick = () => {
    const t = Date.now() - T0;
    if (t > TOTAL) {
      beam.destroy();
      glow.destroy();
      ring.destroy();
      return;
    }
    // Beam: fade in quickly, hold, fade out
    const aIn = Math.min(1, t / 200);
    const aHold = t < TOTAL - 400 ? 1 : 1 - (t - (TOTAL - 400)) / 400;
    beam.alpha = aIn * aHold;
    beam.scale.x = 1 + Math.sin(t / 80) * 0.05;
    glow.alpha = (aIn * 0.9) * aHold;
    // Ring: expand
    const ringProgress = Math.min(1, t / 800);
    ring.alpha = ringProgress < 1 ? 1 : 1 - (ringProgress - 0.5) * 2;
    ring.scale.set(1 + ringProgress * 18);
    ring.alpha = Math.max(0, 1 - ringProgress);
    requestAnimationFrame(tick);
  };
  tick();
}

function animateSpark(spark: Graphics) {
  const T0 = Date.now();
  const T = 1000 + Math.random() * 800;
  const tick = () => {
    const t = Date.now() - T0;
    if (t > T || !spark.parent) {
      spark.destroy();
      return;
    }
    spark.x += (spark as any)._vx;
    spark.y += (spark as any)._vy;
    (spark as any)._vy += 0.04; // gravity
    spark.alpha = 1 - (t / T);
    requestAnimationFrame(tick);
  };
  tick();
}

function hexToPixi(hex: string): number {
  // Strip leading '#' if present
  const h = hex.replace("#", "");
  return parseInt(h, 16);
}

export function destroyPixi() {
  if (app) {
    app.destroy(true, { children: true });
    app = null;
    root = null;
    initialized = false;
  }
}

export function getApp(): Application | null {
  return app;
}
