// Pull model. Phygitals publishes, per pack: value bands, band weights and the pack EV.
// It does not publish how values are spread INSIDE a band, so we model density ~ x^-beta inside every band
// and solve one beta so the simulated EV matches the pack's published EV (beta=0 is uniform, bigger = more low-skewed).
(function (root) {
  const I = (lo, hi, p) => Math.abs(p + 1) < 1e-9 ? Math.log(hi / lo) : (Math.pow(hi, p + 1) - Math.pow(lo, p + 1)) / (p + 1);
  const bandMean = (lo, hi, b) => I(lo, hi, 1 - b) / I(lo, hi, -b);
  function sample(lo, hi, b, u) {
    if (Math.abs(b - 1) < 1e-9) b = 1 + 1e-9;
    const e = 1 - b, a = Math.pow(lo, e), c = Math.pow(hi, e);
    return Math.pow(a + u * (c - a), 1 / e);
  }
  function evOf(bands, b) {
    const W = bands.reduce((s, x) => s + x.weight, 0) || 1;
    return bands.reduce((s, x) => s + x.weight / W * bandMean(x.lower, x.upper, b), 0);
  }
  function solveBeta(bands, target) {
    let lo = 0, hi = 8;
    if (evOf(bands, lo) <= target) return lo;   // even uniform is below target
    if (evOf(bands, hi) >= target) return hi;   // cannot get low enough
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (evOf(bands, m) > target ? (lo = m) : (hi = m)); }
    return (lo + hi) / 2;
  }
  function buildModel(info) {
    const bands = (info.rarity_distribution || []).filter(b => b.weight > 0).sort((a, b) => a.id - b.id);
    const beta = solveBeta(bands, +info.ev || evOf(bands, 0));
    return { bands, beta, W: bands.reduce((s, x) => s + x.weight, 0), ev: evOf(bands, beta) };
  }
  function roll(model, rnd) {
    let r = rnd() * model.W, i = 0;
    for (; i < model.bands.length - 1; i++) { r -= model.bands[i].weight; if (r < 0) break; }
    const b = model.bands[i];
    return { band: b, top: i === model.bands.length - 1, v: +sample(b.lower, b.upper, model.beta, rnd()).toFixed(2) };
  }
  const api = { buildModel, roll, evOf, solveBeta };
  if (typeof module !== "undefined") module.exports = api; else root.PhyModel = api;
})(this);
