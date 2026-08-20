<script lang="ts">
  import { settings } from "../../core/state";
  import { saveSettings } from "../../core/save";
  import { navigate } from "../../core/router";

  async function update() {
    const s = $settings;
    await saveSettings({
      id: "global",
      musicVolume: s.musicVolume,
      sfxVolume: s.sfxVolume,
      ambienceVolume: s.ambienceVolume,
      particlesEnabled: s.particlesEnabled,
      motionBlur: s.motionBlur,
      reduceMotion: s.reduceMotion,
      colorblindMode: s.colorblindMode,
      textSize: s.textSize,
      gamepadBindings: {},
      gamepadDeadzone: s.gamepadDeadzone,
      showTouchOverlay: s.showTouchOverlay,
    });
  }

  function back() {
    update();
    navigate("/");
  }
</script>

<div class="settings">
  <div class="header">
    <button class="back focusable" onclick={back} data-id="back">◀ Back</button>
    <h1 class="title">Settings</h1>
  </div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">Audio</h2>
      <div class="row">
        <label class="field">
          <span>Music</span>
          <input type="range" min="0" max="1" step="0.05" bind:value={$settings.musicVolume} input={update} class="focusable" data-id="music" />
          <span class="val">{$settings.musicVolume.toFixed(2)}</span>
        </label>
        <label class="field">
          <span>SFX</span>
          <input type="range" min="0" max="1" step="0.05" bind:value={$settings.sfxVolume} input={update} class="focusable" data-id="sfx" />
          <span class="val">{$settings.sfxVolume.toFixed(2)}</span>
        </label>
        <label class="field">
          <span>Ambience</span>
          <input type="range" min="0" max="1" step="0.05" bind:value={$settings.ambienceVolume} input={update} class="focusable" data-id="amb" />
          <span class="val">{$settings.ambienceVolume.toFixed(2)}</span>
        </label>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Display</h2>
      <div class="row">
        <label class="checkbox">
          <input type="checkbox" bind:checked={$settings.particlesEnabled} change={update} class="focusable" data-id="particles" />
          <span>Particles</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" bind:checked={$settings.motionBlur} change={update} class="focusable" data-id="motionblur" />
          <span>Motion Blur</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" bind:checked={$settings.reduceMotion} change={update} class="focusable" data-id="reducemotion" />
          <span>Reduce Motion</span>
        </label>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Controls</h2>
      <div class="row">
        <label class="field">
          <span>Gamepad Deadzone</span>
          <input type="range" min="0" max="0.6" step="0.05" bind:value={$settings.gamepadDeadzone} input={update} class="focusable" data-id="dz" />
          <span class="val">{$settings.gamepadDeadzone.toFixed(2)}</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" bind:checked={$settings.showTouchOverlay} change={update} class="focusable" data-id="touch" />
          <span>Show Touch Overlay</span>
        </label>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Accessibility</h2>
      <div class="row">
        <label class="field">
          <span>Text Size</span>
          <select bind:value={$settings.textSize} change={update} class="focusable" data-id="text">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label class="field">
          <span>Colorblind</span>
          <select bind:value={$settings.colorblindMode} change={update} class="focusable" data-id="cb">
            <option value="none">None</option>
            <option value="protan">Protan</option>
            <option value="deutan">Deutan</option>
            <option value="tritan">Tritan</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .settings {
    position: absolute;
    inset: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--bg-3);
    margin-bottom: 16px;
  }

  .back {
    background: var(--bg-2);
    border: 1px solid var(--bg-4);
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
    color: var(--fg-0);
  }

  .title {
    font-size: 24px;
    color: var(--accent);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    padding: 12px 16px;
  }

  .section-title {
    font-size: 14px;
    color: var(--accent-soft);
    margin-bottom: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: grid;
    grid-template-columns: 140px 1fr 50px;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-1);
  }

  .field .val {
    text-align: right;
    color: var(--accent);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-1);
    cursor: pointer;
  }

  input[type="range"] {
    width: 100%;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  select {
    background: var(--bg-2);
    border: 1px solid var(--bg-4);
    color: var(--fg-0);
    padding: 6px 10px;
    border-radius: 3px;
    cursor: pointer;
  }
</style>
