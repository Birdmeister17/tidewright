/* Tidewright water simulation. Pure logic, no DOM: runs in the browser and in Node.
   Implements the design doc sections 1.4 (tick order), 1.5 (numbers) and 1.6 (win/lose).

   Sides: 0 = N, 1 = E, 2 = S, 3 = W (clockwise).
   A tile is { type: 'clay'|'sand'|'fork'|'aqueduct', rot: n, locked?: bool }.
   rot indexes ORIENTS[type]. A plan is an object keyed by cell index (y * cols + x). */
(function (root) {
  var TUNING = (typeof module !== 'undefined' && module.exports) ? require('./tuning.js') : root.TW_TUNING;

  var N = 0, E = 1, S = 2, W = 3;
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var SIDE_NAMES = ['N', 'E', 'S', 'W'];
  function opp(s) { return (s + 2) % 4; }

  // Orientation cycles from section 1.3. Each entry lists connected sides.
  var ORIENTS = {
    clay:     [[W, E], [N, S], [N, E], [E, S], [S, W], [N, W]],   // ─ │ └ ┌ ┐ ┘
    sand:     [[W, E], [N, S], [N, E], [E, S], [S, W], [N, W]],   // ═ ║ ╚ ╔ ╗ ╝
    fork:     [[W, E, S], [W, N, S], [W, E, N], [N, S, E]],       // ┬ ┤ ┴ ├
    aqueduct: [[N, E, S, W]]                                      // ┼ (two straight passages)
  };
  var GLYPHS = {
    clay: ['─', '│', '└', '┌', '┐', '┘'],
    sand: ['═', '║', '╚', '╔', '╗', '╝'],
    fork: ['┬', '┤', '┴', '├'],
    aqueduct: ['┼']
  };
  var TYPES = ['clay', 'sand', 'fork', 'aqueduct'];

  function glyphToTile(g) {
    for (var i = 0; i < TYPES.length; i++) {
      var r = GLYPHS[TYPES[i]].indexOf(g);
      if (r >= 0) return { type: TYPES[i], rot: r };
    }
    throw new Error('Unknown glyph ' + g);
  }
  function tileGlyph(t) { return GLYPHS[t.type][t.rot]; }
  function sides(t) { return ORIENTS[t.type][t.rot]; }
  function hasSide(t, s) { return sides(t).indexOf(s) >= 0; }

  // Where a drop entering tile t by side e leaves. forkCount is the tile's entry counter after this entry.
  function forkExits(t, e) {
    var ss = sides(t), out = [];
    for (var k = 1; k <= 3; k++) { var s = (e + k) % 4; if (ss.indexOf(s) >= 0) out.push(s); }
    return out; // [Exit 1, Exit 2]
  }
  function exitFor(t, e, count) {
    if (t.type === 'aqueduct') return opp(e);
    if (t.type === 'fork') { var ex = forkExits(t, e); return (count % 2 === 1) ? ex[0] : ex[1]; }
    var ss = sides(t); return ss[0] === e ? ss[1] : ss[0];
  }

  // ---- Level parsing ----
  function cellIndex(level, name) {
    var x = name.charCodeAt(0) - 65, y = parseInt(name.slice(1), 10) - 1;
    return y * level.cols + x;
  }
  function cellName(level, i) {
    return String.fromCharCode(65 + (i % level.cols)) + (Math.floor(i / level.cols) + 1);
  }
  // Returns a board description: kinds per cell, springs, fields, locked tiles.
  function parseLevel(level) {
    var cols = level.cols, rows = level.rows, kind = [], need = {}, fields = [], springs = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var c = level.map[y][x], i = y * cols + x;
      if (c === '#') kind[i] = 'rock';
      else if (c === 'S') kind[i] = 'spring';
      else if (c >= '1' && c <= '9') { kind[i] = 'field'; need[i] = +c; fields.push(i); }
      else kind[i] = 'soil';
    }
    level.springs.forEach(function (s) {
      springs.push({ cell: cellIndex(level, s.cell), exit: SIDE_NAMES.indexOf(s.exit) });
    });
    springs.sort(function (a, b) { return a.cell - b.cell; }); // reading order
    var locked = {};
    (level.locked || []).forEach(function (l) {
      var t = glyphToTile(l.glyph); t.locked = true; locked[cellIndex(level, l.cell)] = t;
    });
    return { cols: cols, rows: rows, kind: kind, need: need, fields: fields, springs: springs, locked: locked, T: level.T };
  }
  function neighbor(board, i, s) {
    var x = i % board.cols + DX[s], y = Math.floor(i / board.cols) + DY[s];
    if (x < 0 || y < 0 || x >= board.cols || y >= board.rows) return -1;
    return y * board.cols + x;
  }
  // Placements string like "B2 ─  C2 ─" -> plan object.
  function parsePlacements(level, str) {
    var plan = {}, parts = str.trim() ? str.trim().split(/\s+/) : [];
    for (var k = 0; k < parts.length; k += 2) plan[cellIndex(level, parts[k])] = glyphToTile(parts[k + 1]);
    return plan;
  }

  // ---- The run ----
  function createRun(level, plan) {
    var board = parseLevel(level);
    var tiles = {};
    Object.keys(board.locked).forEach(function (k) { var t = board.locked[k]; tiles[k] = mkTile(t); });
    Object.keys(plan).forEach(function (k) { tiles[k] = mkTile(plan[k]); });
    var fill = {}, fillTicks = {};
    board.fields.forEach(function (f) { fill[f] = 0; fillTicks[f] = []; });
    return {
      level: level, board: board, tiles: tiles, collapsed: {}, drops: [], nextId: 1,
      tick: 0, waste: 0, fill: fill, fillTicks: fillTicks,
      spills: [], collapses: [], evaporations: [], done: false, result: null, events: []
    };
  }
  function mkTile(t) {
    return { type: t.type, rot: t.rot, locked: !!t.locked, wear: 0, entries: 0 };
  }

  // Advance one tick (section 1.4 steps 1 to 6). Returns this tick's events for the renderer.
  function step(run) {
    if (run.done) return [];
    var b = run.board, ev = [];
    run.tick++;
    var t = run.tick;

    // 1. Age
    run.drops.forEach(function (d) { if (!d.atSpring) d.timer--; });

    // 2. Emit (reading order)
    b.springs.forEach(function (s) {
      run.drops.push({ id: run.nextId++, cell: s.cell, exit: s.exit, timer: 0, atSpring: true, enterTick: t, entry: -1 });
    });

    // 3. Move: due drops, lowest number first
    var due = run.drops.filter(function (d) { return d.timer <= 0; }).sort(function (a, c) { return a.id - c.id; });
    var gone = {};
    function spill(d, y, from, why) {
      run.waste++; gone[d.id] = true;
      var sp = { tick: t, cell: y, from: from, side: d.exit, why: why };
      run.spills.push(sp); ev.push({ kind: 'spill', drop: d.id, cell: y, from: from, side: d.exit, why: why });
      var zone = [y].concat([0, 1, 2, 3].map(function (s) { return y < 0 ? -1 : neighbor(b, y, s); }));
      if (y < 0) zone = [0, 1, 2, 3].map(function (s) { return offNeighbor(b, from, d.exit, s); });
      zone.forEach(function (z) { if (z >= 0 && run.tiles[z]) run.tiles[z].wear++; });
    }
    due.forEach(function (d) {
      var from = d.cell, y = neighbor(b, from, d.exit);
      var k = y < 0 ? 'edge' : b.kind[y];
      d.atSpring = false;
      if (k === 'edge' || k === 'rock' || k === 'spring') return spill(d, y, from, k);
      if (k === 'field') {
        if (run.fill[y] < b.need[y]) {
          run.fill[y]++; run.fillTicks[y].push(t); gone[d.id] = true;
          ev.push({ kind: 'fill', drop: d.id, cell: y, from: from });
          return;
        }
        return spill(d, y, from, 'overflow');
      }
      var tile = run.tiles[y];
      if (!tile) return spill(d, y, from, 'soil');
      var e = opp(d.exit);
      if (!hasSide(tile, e)) return spill(d, y, from, 'blank');
      tile.entries++;
      if (tile.type === 'sand' && tile.entries % TUNING.sandEvaporateEvery === 0) {
        run.waste++; gone[d.id] = true; run.evaporations.push({ tick: t, cell: y });
        ev.push({ kind: 'evaporate', drop: d.id, cell: y, from: from });
        return;
      }
      d.cell = y; d.entry = e; d.exit = exitFor(tile, e, tile.entries);
      d.timer = TUNING.delay[tile.type]; d.enterTick = t; d.delay = d.timer;
      ev.push({ kind: 'enter', drop: d.id, cell: y, from: from, entry: e, exit: d.exit });
    });
    run.drops = run.drops.filter(function (d) { return !gone[d.id]; });

    // 5. Collapse
    Object.keys(run.tiles).forEach(function (k) {
      var tile = run.tiles[k];
      if (tile.wear >= TUNING.wearLimit[tile.type]) {
        var c = +k, lost = 0;
        delete run.tiles[k];
        run.collapsed[c] = tile;
        run.drops = run.drops.filter(function (d) { if (d.cell === c) { lost++; return false; } return true; });
        run.waste += lost;
        run.collapses.push({ tick: t, cell: c, tile: tile, lost: lost });
        ev.push({ kind: 'collapse', cell: c, lost: lost });
      }
    });

    // 6. Check
    var allFull = b.fields.every(function (f) { return run.fill[f] >= b.need[f]; });
    if (allFull) { run.done = true; run.result = 'win'; }
    else if (t >= b.T) { run.done = true; run.result = 'lose'; }
    run.events = ev;
    return ev;
  }
  // Splash cells around an off-board spill point (only on-board cells count; the
  // only on-board neighbor of an off-board point is the cell the drop came from).
  function offNeighbor(b, from, exit, s) { return s === opp(exit) ? from : -1; }

  function runToEnd(level, plan) {
    var run = createRun(level, plan);
    while (!run.done) step(run);
    return run;
  }

  // Summary used by tests and the result screen.
  function summarize(run) {
    var level = run.level, b = run.board, fills = {};
    b.fields.forEach(function (f) { fills[cellName(level, f)] = run.fillTicks[f].slice(); });
    return {
      result: run.result, tick: run.tick, waste: run.waste, fills: fills,
      collapses: run.collapses.map(function (c) { return { cell: cellName(level, c.cell), tick: c.tick }; })
    };
  }

  // ---- Stars (section 4) ----
  function countPlaced(plan) { return Object.keys(plan).filter(function (k) { return !plan[k].locked; }).length; }
  function stars(level, plan, run) {
    var tiles = countPlaced(plan), won = run.result === 'win';
    var lean = won && tiles <= level.leanPar, frugal = won && run.waste <= level.frugalPar;
    return { flood: won, lean: lean, frugal: frugal, perfect: lean && frugal,
             tiles: tiles, waste: run.waste, tilesOver: Math.max(0, tiles - level.leanPar),
             wasteOver: Math.max(0, run.waste - level.frugalPar) };
  }

  // ---- Plan-time analysis (section 8 items 4 and 8): static trace of where water can go ----
  // Returns { forkInputs: {cell: side|null}, openEnds: [{cell, side}], unfedFields: [cell], wet: {cell:true} }.
  function analyze(level, plan) {
    var b = parseLevel(level), tiles = {};
    Object.keys(b.locked).forEach(function (k) { tiles[k] = b.locked[k]; });
    Object.keys(plan).forEach(function (k) { tiles[k] = plan[k]; });
    var seen = {}, forkIn = {}, fed = {}, wet = {}, openEnds = [], queue = [];
    b.springs.forEach(function (s) { queue.push({ from: s.cell, exit: s.exit }); });
    while (queue.length) {
      var q = queue.shift(), y = neighbor(b, q.from, q.exit);
      var key = q.from + ':' + q.exit;
      if (seen[key]) continue; seen[key] = true;
      var k = y < 0 ? 'edge' : b.kind[y];
      if (k === 'field') { fed[y] = true; continue; }
      var t = tiles[y];
      if (k !== 'soil' || !t || !hasSide(t, opp(q.exit))) { openEnds.push({ cell: q.from, side: q.exit }); continue; }
      wet[y] = true;
      var e = opp(q.exit);
      if (t.type === 'fork') {
        (forkIn[y] = forkIn[y] || {})[e] = true;
        forkExits(t, e).forEach(function (s) { queue.push({ from: y, exit: s }); });
      } else queue.push({ from: y, exit: exitFor(t, e, 1) });
    }
    // Open ends on tiles water never reaches still deserve a hint.
    Object.keys(tiles).forEach(function (kk) {
      var i = +kk; if (wet[i]) return;
      sides(tiles[i]).forEach(function (s) {
        var y = neighbor(b, i, s), k = y < 0 ? 'edge' : b.kind[y];
        var t = tiles[y];
        var ok = (k === 'field') || (k === 'spring') || (k === 'soil' && t && hasSide(t, opp(s)));
        if (!ok) openEnds.push({ cell: i, side: s });
      });
    });
    var forkInputs = {};
    Object.keys(tiles).forEach(function (kk) {
      if (tiles[kk].type !== 'fork') return;
      var ins = forkIn[kk] ? Object.keys(forkIn[kk]).map(Number) : [];
      forkInputs[kk] = ins.length === 1 ? ins[0] : null;
    });
    return { forkInputs: forkInputs, openEnds: openEnds,
             unfedFields: b.fields.filter(function (f) { return !fed[f]; }), wet: wet };
  }

  var API = {
    N: N, E: E, S: S, W: W, DX: DX, DY: DY, SIDE_NAMES: SIDE_NAMES, opp: opp,
    ORIENTS: ORIENTS, GLYPHS: GLYPHS, TYPES: TYPES,
    glyphToTile: glyphToTile, tileGlyph: tileGlyph, sides: sides, hasSide: hasSide,
    forkExits: forkExits, exitFor: exitFor,
    cellIndex: cellIndex, cellName: cellName, parseLevel: parseLevel, neighbor: neighbor,
    parsePlacements: parsePlacements,
    createRun: createRun, step: step, runToEnd: runToEnd, summarize: summarize,
    countPlaced: countPlaced, stars: stars, analyze: analyze
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.TW_SIM = API;
})(this);
