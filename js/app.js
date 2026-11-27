/* Tidewright app: menu, plan phase (placing tiles), run phase (playback of the sim), result.
   All rules live in sim.js; this file only draws and handles input. */
(function () {
  'use strict';
  var SIM = window.TW_SIM, LEVELS = window.TW_LEVELS, TUNING = window.TW_TUNING;
  var ART = window.TW_ART, STORE = window.TW_STORE, AUDIO = window.TW_AUDIO;
  var $ = function (id) { return document.getElementById(id); };
  var TYPE_LABEL = { clay: 'Clay', sand: 'Sand', fork: 'Fork', aqueduct: 'Aqueduct' };

  var G = null;                 // current level state
  var canvas = $('board'), ctx = canvas.getContext('2d');
  var ghost = $('ghost'), gctx = ghost.getContext('2d');
  var dpr = 1, cell = 48, bt = 12;

  // ---------- Menu ----------
  function unlocked(i) { return i === 0 || STORE.progress(LEVELS[i - 1].id).flood; }
  function renderMenu() {
    var grid = $('levelGrid'); grid.innerHTML = '';
    LEVELS.forEach(function (lv, i) {
      var p = STORE.progress(lv.id), open = unlocked(i);
      var b = document.createElement('button');
      b.className = 'level-card' + (open ? '' : ' locked') + (p.perfect ? ' perfect' : '');
      b.disabled = !open;
      var stars = ['flood', 'lean', 'frugal'].map(function (s) {
        return '<img class="s" alt="' + s + (p[s] ? ' earned' : ' not earned') + '" src="' + ART.url('star_' + s + (p[s] ? '' : '_empty')) + '">';
      }).join('');
      b.innerHTML = '<span class="num">' + lv.id + (open ? '' : ' &middot; locked') + '</span><span class="name">' + lv.name + '</span>' +
        '<span class="stars">' + (p.perfect ? '<img class="pf" alt="" src="' + ART.url('ui_perfect_frame_gold') + '">' : '') + stars + '</span>';
      if (open) b.addEventListener('click', function () { openLevel(i); });
      grid.appendChild(b);
    });
    $('soundBtn').textContent = 'Sound: ' + (STORE.sound() ? 'on' : 'off');
  }
  $('soundBtn').addEventListener('click', function () { STORE.setSound(!STORE.sound()); renderMenu(); });
  function showMenu() {
    if (G && G.phase === 'run') stopRun();
    hideInfo();
    G = null; ghost.classList.add('hidden');
    $('game').classList.add('hidden'); $('menu').classList.remove('hidden'); renderMenu();
  }

  // ---------- Plan helpers ----------
  function clonePlan(p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = { type: p[k].type, rot: p[k].rot }; }); return o; }
  function planToSave(p) { return Object.keys(p).map(function (k) { return [+k, p[k].type, p[k].rot]; }); }
  function tileAt(i) { return G.plan[i] || G.board.locked[i] || null; }
  function used(type) { var n = 0; Object.keys(G.plan).forEach(function (k) { if (G.plan[k].type === type) n++; }); return n; }
  function left(type) { return (G.level.tray[type] || 0) - used(type); }
  function isEmptySoil(i) { return i >= 0 && G.board.kind[i] === 'soil' && !tileAt(i); }

  function loadSavedPlan(level, board) {
    var saved = STORE.plan(level.id), plan = {}, count = {};
    if (!saved) return plan;
    saved.forEach(function (r) {
      var i = r[0], type = r[1], rot = r[2];
      if (board.kind[i] !== 'soil' || board.locked[i] || !SIM.ORIENTS[type] || !SIM.ORIENTS[type][rot]) return;
      count[type] = (count[type] || 0) + 1;
      if (count[type] > (level.tray[type] || 0)) return;
      plan[i] = { type: type, rot: rot };
    });
    return plan;
  }

  // ---------- Level ----------
  function openLevel(i) {
    var level = LEVELS[i], board = SIM.parseLevel(level);
    G = { index: i, level: level, board: board, plan: loadSavedPlan(level, board), undo: [], redo: [],
          selected: null, lastRot: { clay: 0, sand: 0, fork: 0, aqueduct: 0 }, phase: 'plan',
          run: null, speed: 1, acc: 0, fx: [], scars: null, drag: null, press: null, splash: null,
          wiggle: null, flood: null, ending: 0, analysis: null, wet: {}, anim: 0 };
    var types = SIM.TYPES.filter(function (t) { return level.tray[t]; });
    G.selected = types.length === 1 ? types[0] : null;
    $('menu').classList.add('hidden'); $('game').classList.remove('hidden');
    $('result').classList.add('hidden'); $('confirm').classList.add('hidden');
    $('lvlTitle').textContent = level.id + ' \u00b7 ' + level.name;
    $('lvlIdea').textContent = 'New: ' + level.idea;
    buildTray(); analyze(); layout(); updateUI();
  }
  function analyze() { G.analysis = SIM.analyze(G.level, G.plan); }

  function commit(fn) {
    var before = clonePlan(G.plan);
    if (fn() === false) return false;
    G.undo.push(before); G.redo = []; afterEdit(); return true;
  }
  function afterEdit() {
    G.scars = null; STORE.savePlan(G.level.id, planToSave(G.plan)); analyze(); updateUI();
  }
  // Auto-orient (section 1.3): connect to the one adjacent open end if exactly one exists.
  function autoRot(type, i) {
    if (type === 'fork' || type === 'aqueduct') return G.lastRot[type];
    var ends = [];
    for (var s = 0; s < 4; s++) {
      var n = SIM.neighbor(G.board, i, s); if (n < 0) continue;
      var t = tileAt(n);
      if (t && SIM.hasSide(t, SIM.opp(s))) ends.push(s);
      G.board.springs.forEach(function (sp) { if (sp.cell === n && sp.exit === SIM.opp(s)) ends.push(s); });
    }
    if (ends.length === 1) {
      var s0 = ends[0], last = G.lastRot[type];
      if (SIM.ORIENTS[type][last].indexOf(s0) >= 0) return last;
      return (s0 === SIM.E || s0 === SIM.W) ? 0 : 1;   // the straight through that side
    }
    return G.lastRot[type];
  }
  function place(type, i) {
    if (!isEmptySoil(i) || left(type) <= 0) return;
    commit(function () { var r = autoRot(type, i); G.plan[i] = { type: type, rot: r }; G.lastRot[type] = r; });
    if (left(type) <= 0 && G.selected === type) G.selected = null;
    AUDIO.place(); updateUI();
  }
  function rotate(i) {
    var t = G.plan[i]; if (!t) return;
    if (t.type === 'aqueduct') { G.wiggle = { cell: i, t0: now() }; AUDIO.rotate(); return; }
    commit(function () { t.rot = (t.rot + 1) % SIM.ORIENTS[t.type].length; G.lastRot[t.type] = t.rot; });
    AUDIO.rotate();
  }
  function moveTile(from, to) { commit(function () { G.plan[to] = G.plan[from]; delete G.plan[from]; }); AUDIO.place(); }
  function removeTile(i) { commit(function () { delete G.plan[i]; }); }
  function undo() { if (!G.undo.length || G.phase !== 'plan') return; G.redo.push(clonePlan(G.plan)); G.plan = G.undo.pop(); afterEdit(); }
  function redo() { if (!G.redo.length || G.phase !== 'plan') return; G.undo.push(clonePlan(G.plan)); G.plan = G.redo.pop(); afterEdit(); }
  function reset() {
    var n = Object.keys(G.plan).length; if (!n || G.phase !== 'plan') return;
    if (n >= 4) { $('confirmText').textContent = 'All ' + n + ' tiles go back to the tray. You can undo this.'; $('confirm').classList.remove('hidden'); return; }
    doReset();
  }
  function doReset() { commit(function () { G.plan = {}; }); }

  // ---------- Tray ----------
  var SPEED = {   // speed words, chevrons and rules for the tray pills and the long-press info card
    clay: { n: 1, word: 'Slow', title: 'Clay Channel', note: 'Reliable and sturdy.' },
    sand: { n: 3, word: 'Fast', title: 'Sand Channel', note: 'Every 3rd drop that enters is lost.' },
    fork: { n: 2, word: 'Med', title: 'Fork', note: 'Splits the stream: alternates exit 1 and 2.' },
    aqueduct: { n: 2, word: 'Med', title: 'Aqueduct', note: 'Two passages that never mix.' }
  };
  var CHEV = '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M1.6 1.6 L6.2 6 L1.6 10.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function chevrons(n) { return new Array(n + 1).join(CHEV); }
  function pillHtml(type, big) {
    var s = SPEED[type];
    return '<span class="pill' + (big ? ' big' : '') + '"><span class="chev">' + chevrons(s.n) + '</span><span class="word">' + s.word + '</span></span>';
  }
  function buildTray() {
    var tray = $('tray'); tray.innerHTML = '';
    SIM.TYPES.forEach(function (type) {
      if (!G.level.tray[type]) return;
      var b = document.createElement('button');
      b.className = 'tray-piece'; b.dataset.type = type; b.setAttribute('aria-label', SPEED[type].title + ', ' + SPEED[type].word);
      b.innerHTML = '<span class="slot"><img alt="" src="' + ART.url('ui_tray_slot') + '"><img class="sel" alt="" src="' + ART.url('ui_tray_slot_selected') + '">' +
        '<canvas width="144" height="144"></canvas></span>' +
        '<span class="count"><img alt="" src="' + ART.url('ui_tray_count_badge') + '"><span></span></span>' +
        '<span class="name">' + TYPE_LABEL[type] + '</span>' + pillHtml(type, false);
      b.addEventListener('pointerdown', function (e) { onDown(e, 'tray', type); });
      tray.appendChild(b);
    });
  }
  function updateTray() {
    Array.prototype.forEach.call($('tray').children, function (b) {
      var type = b.dataset.type, n = left(type), c = b.querySelector('canvas'), x = c.getContext('2d');
      x.clearRect(0, 0, 144, 144); ART.draw(x, 'soil_cell', 0, 0, 144);
      ART.drawTile(x, { type: type, rot: G.lastRot[type] }, 0, 0, 144);
      b.querySelector('.count span').textContent = n;
      b.classList.toggle('selected', G.selected === type);
      b.classList.toggle('empty', n <= 0);
    });
  }
  // Long-press info card at the top of the screen: big chevrons, speed word, delay, rule and wear limit.
  function showInfo(type) {
    var s = SPEED[type], d = TUNING.delay[type], w = TUNING.wearLimit[type];
    var speed = { Slow: 'Slow', Med: 'Medium', Fast: 'Fast' }[s.word];
    $('speedInfo').innerHTML = pillHtml(type, true) + '<div><div class="si-title">' + s.title + '</div>' +
      '<div class="si-line"><b>' + speed + '</b>: ' + d + ' tick' + (d > 1 ? 's' : '') + ' per tile</div>' +
      '<div class="si-line">' + s.note + ' Wears out after ' + w + ' splash' + (w > 1 ? 'es' : '') + '.</div></div>';
    $('speedInfo').classList.remove('hidden');
  }
  function hideInfo() { $('speedInfo').classList.add('hidden'); }

  // ---------- HUD ----------
  function updateUI() {
    if (!G) return;
    var lv = G.level, run = G.run, planning = G.phase === 'plan';
    var tiles = SIM.countPlaced(G.plan);
    $('tilesVal').textContent = tiles + ' / par ' + lv.leanPar; $('tilesPlate').classList.toggle('over', tiles > lv.leanPar);
    var waste = run ? run.waste : null;
    $('wasteVal').textContent = (waste === null ? '\u2013' : waste) + ' / par ' + lv.frugalPar;
    $('wastePlate').classList.toggle('over', waste !== null && waste > lv.frugalPar);
    var tick = run ? run.tick : 0, frac = tick / lv.T;
    $('gaugeFill').style.width = (frac * 100) + '%';
    $('gaugeLine').style.left = (3.75 + 92.5 * frac) + '%';
    $('gaugeLine').style.visibility = tick > 0 ? 'visible' : 'hidden';
    $('tideText').textContent = run ? 'Tick ' + tick + ' / ' + lv.T : 'Tide turns at tick ' + lv.T;
    var chip = $('hintChip'), a = G.analysis, parts = [];
    if (planning && a) {
      var ends = a.openEnds.length, unfed = a.unfedFields.length;
      if (ends) parts.push(ends + ' open end' + (ends > 1 ? 's' : ''));
      if (unfed) parts.push(unfed + ' unfed field' + (unfed > 1 ? 's' : ''));
    }
    $('hintText').textContent = parts.join(', '); chip.classList.toggle('hidden', !parts.length);
    $('planBar').classList.toggle('hidden', !planning);
    $('runBar').classList.toggle('hidden', planning);
    $('tray').classList.toggle('disabled', !planning);
    $('undoBtn').disabled = !G.undo.length; $('redoBtn').disabled = !G.redo.length;
    $('resetBtn').disabled = !Object.keys(G.plan).length || !planning;
    $('fastCap').textContent = G.speed > 1 ? 'Normal' : 'Fast \u00d73';
    var busy = G.phase !== 'run';
    $('fastBtn').disabled = busy; $('skipBtn').disabled = G.phase !== 'run' && G.phase !== 'flood'; $('stopBtn').disabled = busy;
    updateTray();
  }

  // ---------- Layout ----------
  function layout() {
    if (!G) return;
    var wrap = $('boardWrap'), r = wrap.getBoundingClientRect();
    // The art border is a quarter cell thick, so the board is (cols + 0.5) cells wide.
    var availW = r.width, availH = r.height - 8;
    cell = Math.max(20, Math.floor(Math.min(TUNING.maxCellPx, availW / (G.board.cols + 0.5), availH / (G.board.rows + 0.5))));
    bt = Math.round(cell / 4);
    dpr = Math.min(3, window.devicePixelRatio || 1);
    var w = cell * G.board.cols + 2 * bt, h = cell * G.board.rows + 2 * bt;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ghost.width = Math.round(cell * dpr); ghost.height = Math.round(cell * dpr);
    ghost.style.width = cell + 'px'; ghost.style.height = cell + 'px';
  }
  window.addEventListener('resize', function () { layout(); });
  window.addEventListener('orientationchange', function () { setTimeout(layout, 150); });

  function cellAt(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    var x = Math.floor((clientX - r.left - bt) / cell), y = Math.floor((clientY - r.top - bt) / cell);
    if (x < 0 || y < 0 || x >= G.board.cols || y >= G.board.rows) return -1;
    return y * G.board.cols + x;
  }
  function overDock(clientX, clientY) {
    var el = document.elementFromPoint(clientX, clientY);
    return !!(el && el.closest && el.closest('.dock'));
  }

  // ---------- Input (pointer events; hit testing always uses the finger point) ----------
  function onDown(e, src, type) {
    if (!G || e.button > 0) return;
    if (G.phase === 'flood') { finishFlood(); return; }
    if (G.phase !== 'plan' || G.press || G.drag) return;
    e.preventDefault();
    var p = { id: e.pointerId, ptype: e.pointerType, x0: e.clientX, y0: e.clientY, src: src, type: type, moved: false, long: false, timer: null };
    if (src === 'tray') p.timer = setTimeout(function () { if (G && G.press === p && !p.moved) { p.long = true; showInfo(type); } }, TUNING.longPressMs);
    if (src === 'board') {
      p.cell = cellAt(e.clientX, e.clientY);
      var t = p.cell >= 0 ? G.plan[p.cell] : null;
      var isField = p.cell >= 0 && G.board.kind[p.cell] === 'field';
      if (t || isField) p.timer = setTimeout(function () { longPress(p); }, TUNING.longPressMs);
    }
    G.press = p;
  }
  canvas.addEventListener('pointerdown', function (e) { onDown(e, 'board'); });

  function longPress(p) {
    if (!G || G.press !== p || p.moved) return;
    p.long = true;
    if (G.plan[p.cell]) {
      showInfo(G.plan[p.cell].type);
      startDrag({ source: 'board', from: p.cell, tile: G.plan[p.cell], ptype: p.ptype }, p.x0, p.y0);
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (err) { /* ignore */ }
    } else if (G.board.kind[p.cell] === 'field') {
      G.splash = p.cell;
    }
  }
  function startDrag(d, x, y) {
    G.drag = d; d.x = x; d.y = y; d.target = cellAt(x, y);
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0); gctx.clearRect(0, 0, cell, cell);
    gctx.globalAlpha = 0.95; ART.draw(gctx, 'soil_cell', 0, 0, cell);
    ART.drawTile(gctx, d.tile || { type: d.type, rot: G.lastRot[d.type] }, 0, 0, cell); gctx.globalAlpha = 1;
    ghost.classList.remove('hidden'); moveGhost();
  }
  function lift() { return G.drag && G.drag.ptype !== 'mouse' ? TUNING.dragLiftPx : 0; } // visual only
  function moveGhost() {
    var d = G.drag; if (!d) return;
    ghost.style.transform = 'translate(' + (d.x - cell / 2) + 'px,' + (d.y - cell / 2 - lift()) + 'px)';
  }
  window.addEventListener('pointermove', function (e) {
    if (!G || !G.press || e.pointerId !== G.press.id) return;
    var p = G.press;
    if (G.drag) {
      e.preventDefault();
      G.drag.x = e.clientX; G.drag.y = e.clientY; G.drag.target = cellAt(e.clientX, e.clientY); moveGhost(); return;
    }
    var dist = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
    if (dist > TUNING.dragStartPx && !p.moved) {
      p.moved = true; clearTimeout(p.timer); hideInfo();
      if (p.src === 'tray' && left(p.type) > 0) startDrag({ source: 'tray', type: p.type, ptype: p.ptype }, e.clientX, e.clientY);
      G.splash = null;
    }
  }, { passive: false });
  function endPress(e, canceled) {
    if (!G || !G.press || (e && e.pointerId !== G.press.id)) return;
    var p = G.press; clearTimeout(p.timer); G.press = null; G.splash = null; hideInfo();
    if (G.drag) { var d = G.drag; G.drag = null; ghost.classList.add('hidden'); if (!canceled) finishDrag(d, e.clientX, e.clientY); return; }
    if (canceled || p.moved || p.long) return;
    if (p.src === 'tray') {
      if (left(p.type) > 0) G.selected = G.selected === p.type ? null : p.type;
      updateUI(); return;
    }
    tapCell(p.cell);
  }
  window.addEventListener('pointerup', function (e) { endPress(e, false); });
  window.addEventListener('pointercancel', function (e) { endPress(e, true); });

  function tapCell(i) {
    if (i < 0) return;
    if (G.plan[i]) return rotate(i);
    if (G.board.locked[i]) return;               // locked tiles do not respond
    if (isEmptySoil(i) && G.selected) place(G.selected, i);
  }
  function finishDrag(d, x, y) {
    var target = cellAt(x, y);
    if (d.source === 'tray') { if (isEmptySoil(target)) place(d.type, target); return; }
    if (target === d.from) return;
    if (isEmptySoil(target)) return moveTile(d.from, target);
    if (target < 0 || overDock(x, y)) return removeTile(d.from);
    // dropped on a rock, field, spring or another tile: the tile stays where it was
  }

  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); });

  // ---------- Buttons ----------
  $('backBtn').addEventListener('click', showMenu);
  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('resetBtn').addEventListener('click', reset);
  $('confirmYes').addEventListener('click', function () { $('confirm').classList.add('hidden'); doReset(); });
  $('confirmNo').addEventListener('click', function () { $('confirm').classList.add('hidden'); });
  $('releaseBtn').addEventListener('click', release);
  $('fastBtn').addEventListener('click', function () { G.speed = G.speed > 1 ? 1 : TUNING.fastMultiplier; updateUI(); });
  $('skipBtn').addEventListener('click', skip);
  $('stopBtn').addEventListener('click', stopRun);
  $('resRetry').addEventListener('click', function () { $('result').classList.add('hidden'); toPlan(); });
  $('resNext').addEventListener('click', function () { if (G.index + 1 < LEVELS.length) openLevel(G.index + 1); });
  $('resLevels').addEventListener('click', showMenu);

  // ---------- Run ----------
  function now() { return performance.now() / 1000; }
  function release() {
    if (G.phase !== 'plan') return;
    G.selected = null;
    G.snapshot = clonePlan(G.plan);           // the run works on a copy; the plan is never changed
    G.run = SIM.createRun(G.level, G.snapshot);
    G.phase = 'run'; G.speed = 1; G.acc = 0; G.fx = []; G.scars = null; G.wet = {};
    updateUI();
  }
  function stepOnce() {
    var ev = SIM.step(G.run), t = now(), filled = false, spilled = false;
    ev.forEach(function (e) {
      if (e.kind === 'enter') {
        var w = G.wet[e.cell] || (G.wet[e.cell] = { ins: {}, outs: {}, last: -1, axis: {} });
        w.ins[e.entry] = 1; w.outs[e.exit] = 1; w.last = e.entry; w.axis[e.entry % 2] = e.entry;
      }
      else if (e.kind === 'spill') { G.fx.push({ kind: 'splash', cell: e.cell, from: e.from, side: e.side, t0: t }); spilled = true; }
      else if (e.kind === 'evaporate') G.fx.push({ kind: 'steam', cell: e.cell, t0: t });
      else if (e.kind === 'fill') filled = true;
      else if (e.kind === 'collapse') { delete G.wet[e.cell]; G.fx.push({ kind: 'collapse', cell: e.cell, tile: G.run.collapsed[e.cell], t0: t }); AUDIO.collapse(); }
    });
    if (filled) AUDIO.fill(); else if (spilled) AUDIO.spill();
  }
  function skip() {
    if (G.phase === 'flood') return finishFlood();
    if (G.phase !== 'run') return;
    while (!G.run.done) stepOnce();
    G.fx = [];
    endRun(true);
  }
  function stopRun() { if (!G || G.phase !== 'run') return; G.run = null; G.fx = []; G.scars = null; G.phase = 'plan'; updateUI(); }
  function toPlan() { G.phase = 'plan'; G.run = null; G.fx = []; G.flood = null; G.wet = {}; updateUI(); }

  function endRun(skipped) {
    var run = G.run;
    G.scars = buildScars(run);
    G.stars = SIM.stars(G.level, G.snapshot, run);
    G.best = STORE.record(G.level.id, G.stars);
    if (run.result === 'win') {
      AUDIO.win();
      if (!skipped) { G.phase = 'flood'; G.flood = { t0: now(), order: floodOrder(run) }; updateUI(); return; }
    } else AUDIO.lose();
    showResult();
  }
  function finishFlood() { if (G.phase !== 'flood') return; G.flood = null; showResult(); }
  function buildScars(run) {
    var spills = {}, list = [];
    run.spills.forEach(function (s) {
      var key = s.cell >= 0 ? 'c' + s.cell : 'e' + s.from + ':' + s.side;
      if (!spills[key]) { spills[key] = 1; list.push({ cell: s.cell, from: s.from, side: s.side }); }
    });
    var fields = {};
    G.board.fields.forEach(function (f) { fields[f] = run.fill[f]; });
    return { collapsed: Object.keys(run.collapsed).map(Number), spills: list, fields: fields, won: run.result === 'win' };
  }
  function floodOrder(run) {
    var order = {}, n = 0, q = [];
    G.board.springs.forEach(function (s) { q.push({ from: s.cell, exit: s.exit, d: 0 }); });
    var seen = {};
    while (q.length) {
      var c = q.shift(), y = SIM.neighbor(G.board, c.from, c.exit); if (y < 0 || seen[y + ':' + c.exit]) continue;
      seen[y + ':' + c.exit] = 1;
      var t = run.tiles[y];
      if (G.board.kind[y] === 'field') { if (order[y] === undefined) order[y] = c.d + 1; n = Math.max(n, c.d + 1); continue; }
      if (!t || !SIM.hasSide(t, SIM.opp(c.exit))) continue;
      if (order[y] === undefined) order[y] = c.d + 1; n = Math.max(n, c.d + 1);
      var e = SIM.opp(c.exit);
      var outs = t.type === 'fork' ? SIM.forkExits(t, e) : [SIM.exitFor(t, e, 1)];
      outs.forEach(function (s) { q.push({ from: y, exit: s, d: c.d + 1 }); });
    }
    return { at: order, max: Math.max(1, n) };
  }

  function showResult() {
    G.phase = 'result';
    var st = G.stars, run = G.run, lv = G.level, won = run.result === 'win';
    $('resTitle').textContent = won ? 'Flooded!' : 'The tide turned';
    var sub = won ? 'Flood on tick ' + run.tick + ' of ' + lv.T + '<br>' + st.tiles + ' tiles \u00b7 waste ' + run.waste
      : 'Tick ' + lv.T + ' ended with a dry field<br>' + G.board.fields.map(function (f) { return SIM.cellName(lv, f) + ': ' + run.fill[f] + ' of ' + G.board.need[f]; }).join(' \u00b7 ');
    $('resSub').innerHTML = sub;
    var rows = [
      ['flood', 'Flood', st.flood, won ? 'Every field is full' : 'Not won'],
      ['lean', 'Lean', st.lean, !won ? 'Needs a win' : (st.tilesOver ? st.tilesOver + ' tile' + (st.tilesOver > 1 ? 's' : '') + ' over par' : st.tiles + ' tiles, par ' + lv.leanPar)],
      ['frugal', 'Frugal', st.frugal, !won ? 'Needs a win' : (st.wasteOver ? 'waste ' + st.wasteOver + ' over par' : 'waste ' + run.waste + ', par ' + lv.frugalPar)]
    ];
    $('resStars').innerHTML = rows.map(function (r) {
      return '<div class="res-star"><img alt="" src="' + ART.url('star_' + r[0] + (r[2] ? '' : '_empty')) + '"><span>' + r[1] + '</span></div>';
    }).join('');
    $('resStarsBox').classList.toggle('perfect', st.perfect);
    $('resLines').innerHTML = rows.map(function (r) { return '<div><b>' + r[1] + ':</b> ' + r[3] + '</div>'; }).join('');
    var hasNext = G.index + 1 < LEVELS.length;
    $('resNext').classList.toggle('hidden', !hasNext);
    $('resNext').disabled = !(hasNext && unlocked(G.index + 1));
    $('resRetry').textContent = won ? 'Replay' : 'Retry';
    $('result').classList.remove('hidden');
    updateUI();
  }

  // ---------- Drawing ----------
  var FLOW_FPS = 10, FONT = "'Fredoka', system-ui, sans-serif";
  var SIDE_LETTER = 'nesw';
  function cellXY(i) { return [(i % G.board.cols) * cell, Math.floor(i / G.board.cols) * cell]; }

  function drawBorder() {
    var b = G.board, c = cell, W = b.cols * c + 2 * bt, H = b.rows * c + 2 * bt;
    for (var i = 0; i < b.cols; i++) { ART.draw(ctx, 'border_edge_n', bt + i * c, 0, c, bt); ART.draw(ctx, 'border_edge_s', bt + i * c, H - bt, c, bt); }
    for (var j = 0; j < b.rows; j++) { ART.draw(ctx, 'border_edge_w', 0, bt + j * c, bt, c); ART.draw(ctx, 'border_edge_e', W - bt, bt + j * c, bt, c); }
    ART.draw(ctx, 'border_corner_nw', 0, 0, bt); ART.draw(ctx, 'border_corner_ne', W - bt, 0, bt);
    ART.draw(ctx, 'border_corner_sw', 0, H - bt, bt); ART.draw(ctx, 'border_corner_se', W - bt, H - bt, bt);
  }

  function drawBoard(t) {
    var b = G.board, c = cell, run = G.run, inRun = !!run && G.phase !== 'plan';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorder();
    ctx.setTransform(dpr, 0, 0, dpr, bt * dpr, bt * dpr);
    var springIdx = {}; b.springs.forEach(function (s, k) { springIdx[s.cell] = { k: k, exit: s.exit }; });
    var collapsedNow = inRun ? run.collapsed : {};
    var scarred = {}; if (G.scars && G.phase === 'plan') G.scars.collapsed.forEach(function (i) { scarred[i] = 1; });
    for (var i = 0; i < b.cols * b.rows; i++) {
      var xy = cellXY(i), x = xy[0], y = xy[1], k = b.kind[i];
      if (k === 'rock') { ART.draw(ctx, 'rock_cell', x, y, c); continue; }
      ART.draw(ctx, 'soil_cell', x, y, c);
      if (k === 'spring') { var sp = springIdx[i]; ART.draw(ctx, 'spring_' + (sp.k === 0 ? 'a' : 'b') + '_exit_' + SIDE_LETTER[sp.exit], x, y, c); }
      else if (k === 'field') drawField(i, x, y, c, inRun);
      else if (collapsedNow[i]) ART.draw(ctx, 'tile_collapsed_scar', x, y, c);
    }

    // tiles, then flow, wear, rivets, Sand meter and Fork labels
    var tiles = inRun ? run.tiles : null;
    for (var j = 0; j < b.cols * b.rows; j++) {
      var tile = inRun ? tiles[j] : tileAt(j);
      if (!tile) continue;
      if (G.drag && G.drag.source === 'board' && G.drag.from === j) continue;
      var p = cellXY(j), tx = p[0], ty = p[1];
      ctx.save();
      if (G.wiggle && G.wiggle.cell === j) {
        var w = t - G.wiggle.t0; if (w < 0.3) { ctx.translate(tx + c / 2, ty + c / 2); ctx.rotate(Math.sin(w * 40) * 0.08 * (1 - w / 0.3)); ctx.translate(-tx - c / 2, -ty - c / 2); } else G.wiggle = null;
      }
      ART.drawTile(ctx, tile, tx, ty, c);
      ctx.restore();
      if (inRun) drawFlow(tile, j, tx, ty, c);
      if (tile.locked) ART.draw(ctx, 'tile_locked_rivets', tx, ty, c);
      if (scarred[j]) { ctx.globalAlpha = 0.85; ART.draw(ctx, 'tile_collapsed_scar', tx, ty, c); ctx.globalAlpha = 1; }
      if (inRun) { var stage = crackStage(tile); if (stage) ART.draw(ctx, 'wear_crack_stage_' + stage, tx, ty, c); }
      if (tile.type === 'sand' && inRun) { var n = tile.entries % TUNING.sandEvaporateEvery; if (n) ART.draw(ctx, meterId(tile, n), tx, ty, c); }
      if (tile.type === 'fork') drawForkLabels(j, tile, tx, ty, c);
    }
    // collapse animation: the tile at its last crack stage fades out for at least 0.4 s
    G.fx.forEach(function (f) {
      if (f.kind !== 'collapse') return;
      var a = (t - f.t0) / TUNING.collapseSeconds; if (a >= 1) return;
      var q = cellXY(f.cell);
      ctx.save(); ctx.globalAlpha = 1 - a * 0.9; ctx.translate(q[0] + c / 2, q[1] + c / 2 + a * c * 0.12); ctx.scale(1 - a * 0.3, 1 - a * 0.3);
      ART.drawTile(ctx, f.tile, -c / 2, -c / 2, c); ART.draw(ctx, 'wear_crack_stage_3', -c / 2, -c / 2, c); ctx.restore();
    });

    // plan-phase scars and hints
    if (G.phase === 'plan' && G.scars) G.scars.spills.forEach(function (s) { drawSpillMark(s, c); });
    if (G.phase === 'plan' && G.analysis && !G.drag) drawWarnings(c);

    // drops
    if (inRun && G.phase === 'run') drawDrops(c, run.done ? 1 : Math.min(1, G.acc));
    // splashes and Sand evaporation flashes
    G.fx.forEach(function (f) {
      var a = (t - f.t0) / 0.45; if (a >= 1) return;
      if (f.kind === 'splash') drawSplash(f, c, a);
      if (f.kind === 'steam' && run && run.tiles[f.cell]) { var q = cellXY(f.cell); ctx.globalAlpha = 1 - a; ART.draw(ctx, meterId(run.tiles[f.cell], 3), q[0], q[1], c); ctx.globalAlpha = 1; }
    });
    G.fx = G.fx.filter(function (f) { return t - f.t0 < Math.max(0.45, TUNING.collapseSeconds); });

    // flood chain: a burst on each cell in order from the spring outward
    if (G.phase === 'flood' && G.flood) {
      var pr = (t - G.flood.t0) / TUNING.floodChainSeconds, frames = ART.frames('fx_flood_chain_8f');
      Object.keys(G.flood.order.at).forEach(function (k) {
        var age = (pr - G.flood.order.at[k] / G.flood.order.max) * TUNING.floodChainSeconds; if (age < 0) return;
        var fr = Math.min(frames - 1, Math.floor(age / 0.5 * frames)), q = cellXY(+k);
        ART.frame(ctx, 'fx_flood_chain_8f', fr, q[0], q[1], c);
      });
      if (pr >= 1.15) finishFlood();
    }

    // drag target outline (follows the finger, not the lifted ghost)
    if (G.drag && G.drag.target >= 0) {
      var ok = isEmptySoil(G.drag.target) || (G.drag.source === 'board' && G.drag.target === G.drag.from);
      var o = cellXY(G.drag.target);
      ctx.strokeStyle = ok ? '#ffd24a' : '#e8461c'; ctx.lineWidth = 3; ctx.strokeRect(o[0] + 2, o[1] + 2, c - 4, c - 4);
    }
    // splash zone preview (long-press a field)
    if (G.splash !== null && G.splash >= 0) {
      ctx.fillStyle = 'rgba(59,143,217,0.35)';
      [G.splash].concat([0, 1, 2, 3].map(function (s) { return SIM.neighbor(b, G.splash, s); })).forEach(function (z) {
        if (z >= 0) { var q = cellXY(z); ctx.fillRect(q[0], q[1], c, c); }
      });
    }
  }

  // Wear crack stage by tile type (art notes): Clay and Aqueduct 1,2; Fork wear 1 shows stage 2; Sand collapses at once.
  function crackStage(tile) {
    if (tile.wear <= 0) return 0;
    if (tile.type === 'fork') return 2;
    if (tile.type === 'sand') return 3;
    return Math.min(2, tile.wear);
  }
  function meterId(tile, n) { return 'sand_meter_' + (tile.rot === 3 ? 'sw' : 'se') + '_' + n; }

  // Water in a tile: flow strips, played backward when the water enters from the far end.
  function drawFlow(tile, j, x, y, c) {
    var w = G.wet[j]; if (!w) return;
    var f = Math.floor(G.anim * FLOW_FPS) % 8;
    function strip(id, rev) { ART.frame(ctx, 'water_flow_' + id + '_8f', rev ? 7 - f : f, x, y, c); }
    var type = tile.type, rot = tile.rot;
    if (type === 'aqueduct') {
      if (w.axis[1] !== undefined) strip('aqueduct_under_w2e', w.axis[1] === SIM.E);
      if (w.axis[0] !== undefined) strip('straight_n2s', w.axis[0] === SIM.S);
    } else if (type === 'fork') {
      strip('fork_hub', false);
      SIM.sides(tile).forEach(function (s) {
        if (w.ins[s]) strip('fork_arm_' + SIDE_LETTER[s] + '_out', true);
        else if (w.outs[s]) strip('fork_arm_' + SIDE_LETTER[s] + '_out', false);
      });
    } else if (rot === 0) strip('straight_w2e', w.last === SIM.E);
    else if (rot === 1) strip('straight_n2s', w.last === SIM.S);
    else {
      var bend = { 2: ['bend_n2e', SIM.N], 3: ['bend_e2s', SIM.E], 4: ['bend_s2w', SIM.S], 5: ['bend_w2n', SIM.W] }[rot];
      strip(bend[0], w.last !== bend[1]);
    }
  }

  function drawField(i, x, y, c, inRun) {
    var need = G.board.need[i], k = c / 144;
    var count = inRun ? G.run.fill[i] : (G.scars && G.phase === 'plan' ? G.scars.fields[i] : 0);
    ART.draw(ctx, count >= need ? 'field_full' : (count > 0 ? 'field_filling' : 'field_dry'), x, y, c);
    ART.draw(ctx, 'field_digit_' + need, x + (72 - 30) * k, y + (30 - 30) * k, 60 * k);
    for (var n = 0; n < need; n++) {
      var cx = 72 + (n - (need - 1) / 2) * 22;
      ART.draw(ctx, n < count ? 'field_pip_full' : 'field_pip_empty', x + (cx - 12) * k, y + (110 - 12) * k, 24 * k);
    }
    if (G.phase === 'plan' && G.scars && !G.scars.won) {   // "3 of 5" after a lost run
      ctx.font = '700 ' + Math.max(8, Math.round(c * 0.19)) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(2, c * 0.06); ctx.strokeStyle = 'rgba(253,242,214,0.95)'; ctx.fillStyle = '#7a1f00';
      ctx.strokeText(count + ' of ' + need, x + c / 2, y + c * 0.55); ctx.fillText(count + ' of ' + need, x + c / 2, y + c * 0.55);
    }
  }
  // Fork exit labels: 48 px sprites centered 40 px from the cell center along each exit arm.
  function drawForkLabels(i, tile, x, y, c) {
    var input = G.analysis && G.analysis.forkInputs[i];
    if (input === null || input === undefined) return;
    var k = c / 144;
    SIM.forkExits(tile, input).forEach(function (s, n) {
      var cx = 72 + SIM.DX[s] * 40, cy = 72 + SIM.DY[s] * 40;
      ART.draw(ctx, 'fork_label_exit_' + (n + 1), x + (cx - 24) * k, y + (cy - 24) * k, 48 * k);
    });
  }
  function edgePoint(i, side, c) { var q = cellXY(i); return ART.edge(q[0], q[1], c, side); }
  function spillCenter(s, c) {
    if (s.cell >= 0) { var q = cellXY(s.cell); return [q[0] + c / 2, q[1] + c / 2]; }
    return edgePoint(s.from, s.side, c);
  }
  function drawSplash(f, c, a) {
    var p = spillCenter(f, c), fr = Math.min(ART.frames('water_spill_splash_6f') - 1, Math.floor(a * ART.frames('water_spill_splash_6f')));
    ART.frame(ctx, 'water_spill_splash_6f', fr, p[0] - c / 2, p[1] - c / 2, c);
  }
  function drawSpillMark(s, c) { var p = spillCenter(s, c); ART.draw(ctx, 'water_spill_mark', p[0] - c * 0.45, p[1] - c * 0.45, c * 0.9); }
  function drawWarnings(c) {
    var a = G.analysis, s = c * 0.34;
    a.openEnds.forEach(function (o) {
      var p = edgePoint(o.cell, o.side, c);
      ART.draw(ctx, 'ui_warning_chip', p[0] - s / 2 - SIM.DX[o.side] * s * 0.5, p[1] - s / 2 - SIM.DY[o.side] * s * 0.5, s);
    });
    a.unfedFields.forEach(function (f) { var q = cellXY(f); ART.draw(ctx, 'ui_warning_chip', q[0] + c - s - 2, q[1] + 2, s); });
  }
  function drawDrops(c, frac) {
    var run = G.run, b = G.board, ds = Math.max(18, c * 0.5);   // the drop art is drawn at 24 pt on a 48 pt cell
    run.drops.forEach(function (d) {
      var q = cellXY(d.cell), px, py;
      var prog = Math.max(0, Math.min(1, (run.tick + frac - d.enterTick) / d.delay));
      var a = ART.edge(q[0], q[1], c, d.entry), z = ART.edge(q[0], q[1], c, d.exit), m = [q[0] + c / 2, q[1] + c / 2];
      if (prog < 0.5) { px = a[0] + (m[0] - a[0]) * prog * 2; py = a[1] + (m[1] - a[1]) * prog * 2; }
      else { px = m[0] + (z[0] - m[0]) * (prog - 0.5) * 2; py = m[1] + (z[1] - m[1]) * (prog - 0.5) * 2; }
      ART.draw(ctx, 'water_drop_72', px - ds / 2, py - ds / 2, ds);
    });
  }

  // ---------- Main loop ----------
  var lastT = now();
  function frame() {
    var t = now(), dt = Math.min(0.1, t - lastT); lastT = t;
    if (G) {
      G.anim += dt * (G.phase === 'run' ? G.speed : 1);
      if (G.phase === 'run') {
        if (!G.run.done) {
          G.acc += dt * G.speed / TUNING.tickSeconds;
          var stepped = false;
          while (G.acc >= 1 && !G.run.done) { G.acc -= 1; stepOnce(); stepped = true; }
          if (G.run.done) { G.ending = t; G.acc = 1; }
          if (stepped) updateUI();
        } else if (t - G.ending > 0.35) endRun(false);
      }
      drawBoard(t);
    }
    requestAnimationFrame(frame);
  }
  ART.onLoad = function () { if (G) updateTray(); };

  if (document.fonts && document.fonts.load) document.fonts.load("700 16px 'Fredoka'");
  renderMenu();
  requestAnimationFrame(frame);
})();
