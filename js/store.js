/* Save data in localStorage: best stars per level, the Perfect frame, autosaved plans, and the sound setting. */
(function () {
  var KEY = 'tidewright.save.v1';
  var data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }
  data.progress = data.progress || {}; data.plans = data.plans || {}; if (data.sound === undefined) data.sound = true;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode: play on without saving */ } }
  window.TW_STORE = {
    progress: function (id) { return data.progress[id] || { flood: false, lean: false, frugal: false, perfect: false }; },
    // Stars are kept as the best over all runs; each one is earned on its own.
    record: function (id, st) {
      var p = this.progress(id);
      p = { flood: p.flood || st.flood, lean: p.lean || st.lean, frugal: p.frugal || st.frugal, perfect: p.perfect || st.perfect };
      data.progress[id] = p; save(); return p;
    },
    plan: function (id) { return data.plans[id] || null; },
    savePlan: function (id, plan) { data.plans[id] = plan; save(); },
    sound: function () { return data.sound; },
    setSound: function (on) { data.sound = on; save(); }
  };
})();
