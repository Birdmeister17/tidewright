/* Art layer: every visual goes through an id from assets/manifest.js.
   Present assets are drawn from their PNG; an id without art (present:false) draws a plain placeholder box. */
(function () {
  var M = window.TW_MANIFEST;
  var images = {}, byId = {}, stats = { total: 0, loaded: 0, failed: [] };
  M.assets.forEach(function (a) {
    byId[a.id] = a;
    if (!a.present) return;
    stats.total++;
    var img = new Image();
    img.onload = function () { images[a.id] = img; stats.loaded++; if (ART.onLoad) ART.onLoad(); };
    img.onerror = function () { stats.failed.push(a.id); };
    img.src = 'assets/' + a.file;
  });

  // Sprite names per orientation (rot index from sim.js). Tile sprites are never rotated.
  var CLAY_SAND = ['straight_ew', 'straight_ns', 'bend_ne', 'bend_es', 'bend_sw', 'bend_nw'];
  var FORK = ['esw', 'nsw', 'new', 'nes'];
  function tileId(t) {
    if (t.type === 'aqueduct') return 'aqueduct_cross';
    if (t.type === 'fork') return 'fork_t_' + FORK[t.rot];
    return t.type + '_' + CLAY_SAND[t.rot];
  }
  function edge(x, y, s, side) {
    var h = s / 2;
    return [[x + h, y], [x + s, y + h], [x + h, y + s], [x, y + h]][side];
  }
  function placeholder(ctx, id, x, y, w, h) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#6e3b20'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  var ART = {
    manifest: M, onLoad: null, edge: edge, tileId: tileId, stats: stats,
    has: function (id) { return !!images[id]; },
    url: function (id) { var a = byId[id]; return a && a.present ? 'assets/' + a.file : ''; },
    // Draw a whole sprite scaled into (x, y, w, h); h defaults to w.
    draw: function (ctx, id, x, y, w, h) {
      if (!byId[id]) throw new Error('Asset id missing from manifest: ' + id);
      h = h === undefined ? w : h;
      if (images[id]) ctx.drawImage(images[id], x, y, w, h); else placeholder(ctx, id, x, y, w, h);
    },
    // Draw frame n of a strip (frames laid out horizontally).
    frame: function (ctx, id, n, x, y, w, h) {
      var a = byId[id], img = images[id]; if (!img) return;
      h = h === undefined ? w : h;
      ctx.drawImage(img, n * a.frameW, 0, a.frameW, a.h, x, y, w, h);
    },
    frames: function (id) { return byId[id].frames; },
    drawTile: function (ctx, t, x, y, s) { ART.draw(ctx, tileId(t), x, y, s); },
    // Fill <img data-art="id"> elements and the page background from the manifest.
    bindDom: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('img[data-art]'), function (el) { el.src = ART.url(el.dataset.art); });
    }
  };
  window.TW_ART = ART;
  var bg = ART.url('valley_background_1080x1920');
  if (bg) document.body.style.backgroundImage = 'url("' + bg + '")';
  var ic = ART.url('app_icon_1024');
  if (ic) ['icon', 'apple-touch-icon'].forEach(function (rel) { var l = document.createElement('link'); l.rel = rel; l.href = ic; document.head.appendChild(l); });
  ART.bindDom();
})();
