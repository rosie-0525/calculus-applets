/*
 * Sound effects for the 3-D game, synthesized with the Web Audio API (no
 * files). The browser only allows sound after a click, so nothing plays until
 * `unlock()` is called from one; the demo that runs by itself stays silent.
 */
export default class Sfx {
  constructor() {
    this.ctx = null;
    this.on = true;
  }

  /** Call from a pointer event: creates or resumes the audio context. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.connect(this.ctx.destination);
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(comp);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  get ready() {
    return this.on && this.ctx && this.ctx.state === 'running';
  }

  dispose() {
    this.ctx?.close();
    this.ctx = null;
  }

  /* ---- building blocks ---- */

  env(gain, t0, peak, decay) {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
  }

  tone(type, f0, f1, dur, peak, { at = 0, filter } = {}) {
    const { ctx } = this;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    this.env(g, t0, peak, dur);
    let node = osc;
    if (filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter;
      node.connect(f);
      node = f;
    }
    node.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  hiss(type, f0, f1, dur, peak, { q = 1, at = 0 } = {}) {
    const { ctx } = this;
    const t0 = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    this.env(g, t0, peak, dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }

  /* ---- the effects ---- */

  fire() {
    if (!this.ready) return;
    this.tone('sawtooth', 1400, 160, 0.16, 0.22, { filter: 3200 });
    this.tone('square', 700, 90, 0.12, 0.08, { filter: 1800 });
    this.hiss('highpass', 3000, 1200, 0.07, 0.25);
  }

  /** A bullet stopped by a roof: a metallic ting and a ricochet whine. */
  ting() {
    if (!this.ready) return;
    [2350, 3520, 5180].forEach((f, i) => this.tone('sine', f, f * 0.98, 0.35 - i * 0.08, 0.12 - i * 0.03));
    this.tone('sine', 3200, 1100, 0.32, 0.05, { at: 0.03 });
    this.hiss('bandpass', 4000, 2500, 0.05, 0.3, { q: 3 });
  }

  thud() {
    if (!this.ready) return;
    this.hiss('lowpass', 900, 200, 0.18, 0.35);
    this.tone('sine', 140, 60, 0.15, 0.2);
  }

  boom() {
    if (!this.ready) return;
    this.hiss('lowpass', 2400, 90, 0.9, 0.9);
    this.tone('sine', 120, 32, 0.6, 0.7);
    this.tone('square', 60, 30, 0.3, 0.12, { filter: 400 });
    [880, 1320, 1760].forEach((f, i) => this.tone('triangle', f, f * 1.5, 0.12, 0.08, { at: 0.02 + i * 0.05 }));
  }

  zap() {
    if (!this.ready) return;
    this.tone('sawtooth', 520, 140, 0.35, 0.07, { filter: 1500 });
    this.hiss('bandpass', 1800, 500, 0.3, 0.12, { q: 2 });
  }

  whoosh(down = true) {
    if (!this.ready) return;
    if (down) {
      this.hiss('bandpass', 2600, 180, 0.7, 0.35, { q: 1.4 });
      this.tone('sine', 220, 55, 0.8, 0.25);
    } else {
      this.hiss('bandpass', 250, 2400, 0.45, 0.25, { q: 1.4 });
    }
  }

  spawn() {
    if (!this.ready) return;
    [392, 523, 784].forEach((f, i) => this.tone('triangle', f, f * 1.01, 0.16, 0.04, { at: i * 0.06 }));
  }
}
