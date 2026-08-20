<script lang="ts">
  import { player } from "../../core/state";

  const skills = [
    { id: "strike",   name: "Strike",   glyph: "⚔", key: "X",  cooldown: 0 },
    { id: "whirlwind",name: "Whirlwind",glyph: "✸", key: "Y",  cooldown: 30 },
    { id: "dodge",    name: "Dodge",    glyph: "♦", key: "B",  cooldown: 12 },
    { id: "potion",   name: "Potion",   glyph: "⚗", key: "Start", cooldown: 0 },
  ];
</script>

<div class="action-bar">
  <div class="skill-key">F1</div>
  <div class="skill-key">F2</div>
  <div class="skill-key">F3</div>
  <div class="skill-key">F4</div>
  <div class="skill-key">F5</div>
  <div class="skill-key">F6</div>
  <div class="skill-key">F7</div>
  <div class="skill-key">F8</div>
</div>

<style>
  .action-bar {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
    padding: 8px 16px;
    border-top: 1px solid var(--bg-3);
    background: linear-gradient(0deg, rgba(20, 20, 28, 0.95) 0%, transparent 100%);
  }

  .skill-key {
    aspect-ratio: 1.2;
    background: var(--bg-2);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--fg-3);
  }
</style>
