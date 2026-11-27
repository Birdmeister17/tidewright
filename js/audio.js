/* Tiny synthesized sounds (no audio files). The context is created and resumed on the first tap (iOS). */
(function () {
  var ctx = null;
  function unlock() {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === 'suspended') ctx.resume();
      var b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
    } catch (e) { ctx = null; }
  }
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('touchend', unlock, { capture: true, passive: true });
  function tone(freq, dur, type, gain, slide) {
    if (!ctx || !window.TW_STORE.sound()) return;
    var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  window.TW_AUDIO = {
    place: function () { tone(520, 0.08, 'triangle', 0.08); },
    rotate: function () { tone(660, 0.05, 'triangle', 0.06); },
    fill: function () { tone(880, 0.12, 'sine', 0.1, 1100); },
    spill: function () { tone(300, 0.08, 'sine', 0.04, 180); },
    collapse: function () { tone(140, 0.3, 'triangle', 0.14, 60); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tone(f, 0.25, 'sine', 0.1); }, i * 120); }); },
    lose: function () { tone(330, 0.4, 'sine', 0.08, 200); }
  };
})();
