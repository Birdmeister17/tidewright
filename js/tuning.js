/* Tidewright tuning: every gameplay and pacing number in one place.
   Values follow the puzzle design doc (sections 1.2, 1.5, 2 and 8). */
(function (root) {
  var TUNING = {
    // Ticks a drop spends inside each tile type (section 2).
    delay: { clay: 3, sand: 1, fork: 2, aqueduct: 2 },
    // Wear limit per tile type (section 1.5).
    wearLimit: { clay: 3, sand: 1, fork: 2, aqueduct: 3 },
    // Every Nth drop to enter a given Sand tile evaporates.
    sandEvaporateEvery: 3,

    // Pacing (section 1.2): seconds per tick at normal speed, and the Fast multiplier.
    tickSeconds: 0.4,
    fastMultiplier: 3,
    // Flood chain after a win lasts at least this long (section 8).
    floodChainSeconds: 1.6,
    // A collapse animates for at least this long (section 8).
    collapseSeconds: 0.4,

    // Touch (sections 1.3 and 8).
    longPressMs: 350,
    dragLiftPx: 48,          // visual lift of a dragged piece above a finger (>= 40 CSS px)
    dragStartPx: 8,          // movement before a press becomes a drag
    maxCellPx: 64,
    boardMarginPx: 12
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = TUNING;
  else root.TW_TUNING = TUNING;
})(this);
