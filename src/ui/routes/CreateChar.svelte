<script lang="ts">
  import { navigate } from "../../core/router";
  import { newCharacter } from "../../core/save";

  let selectedClass = "warrior";
  let name = "Wanderer";

  const classes = [
    { id: "warrior",      name: "Warrior",      glyph: "W", desc: "Melee. Tough. Crushes with steel." },
    { id: "ranger",       name: "Ranger",       glyph: "R", desc: "Ranged. Traps. Hunts from afar." },
    { id: "mage",         name: "Mage",         glyph: "M", desc: "Elemental devastation. Glass cannon." },
    { id: "necromancer",  name: "Necromancer",  glyph: "N", desc: "Summons. Curses. Life is currency." },
    { id: "paladin",      name: "Paladin",      glyph: "P", desc: "Holy. Auras. Stand between darkness." },
    { id: "rogue",        name: "Rogue",        glyph: "G", desc: "Crits. Traps. Vanishes in shadow." },
  ];

  async function start() {
    await newCharacter(name, selectedClass);
    navigate("/town");
  }
</script>

<div class="create">
  <div class="header">
    <h2 class="title">Choose Your Class</h2>
    <p class="subtitle">A single choice, a thousand builds.</p>
  </div>

  <div class="grid">
    {#each classes as cls}
      <button
        class="class-card focusable"
        class:selected={selectedClass === cls.id}
        onclick={() => (selectedClass = cls.id)}
        data-id="class-{cls.id}"
      >
        <div class="glyph">{cls.glyph}</div>
        <div class="name">{cls.name}</div>
        <div class="desc">{cls.desc}</div>
      </button>
    {/each}
  </div>

  <div class="footer">
    <label class="name-label">
      Name:
      <input class="name-input focusable" type="text" bind:value={name} maxlength="20" data-id="name" />
    </label>
    <button class="btn primary focusable" onclick={start} data-id="start">▶ Begin</button>
    <button class="btn focusable" onclick={() => navigate("/")} data-id="back">◀ Back</button>
  </div>
</div>

<style>
  .create {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 40px;
    gap: 30px;
  }

  .header {
    text-align: center;
  }

  .header .title {
    font-size: 36px;
    margin-bottom: 6px;
  }

  .subtitle {
    color: var(--fg-2);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.1em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  .class-card {
    background: linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%);
    border: 2px solid var(--bg-3);
    border-radius: 6px;
    padding: 20px;
    cursor: pointer;
    transition: all 120ms ease;
    font-family: var(--font-sans);
    color: var(--fg-0);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .class-card:hover {
    border-color: var(--accent-soft);
    background: linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%);
  }

  .class-card.focused,
  .class-card.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring-glow), inset 0 0 24px rgba(255, 215, 0, 0.15);
  }

  .glyph {
    font-size: 48px;
    font-family: var(--font-mono);
    color: var(--accent);
    text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  }

  .name {
    font-family: var(--font-display);
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .desc {
    font-size: 12px;
    color: var(--fg-2);
    font-family: var(--font-mono);
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: auto;
  }

  .name-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fg-2);
    font-family: var(--font-mono);
    font-size: 14px;
  }

  .name-input {
    background: var(--bg-2);
    border: 1px solid var(--bg-4);
    color: var(--fg-0);
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-size: 14px;
    border-radius: 3px;
    outline: none;
  }

  .name-input:focus {
    border-color: var(--accent);
  }
</style>
