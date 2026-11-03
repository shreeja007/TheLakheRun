// Exact copy of PlayerController lateral spring (semi-implicit Euler, omega 26), one lane change 0 -> 2.0m
function sim(fps, frames = 400, omega = 26) {
  const dt = Math.min(1 / fps, 0.1);
  let x = 0, v = 0, target = 2.0, maxX = 0, settled = null, maxAbsDev = 0;
  for (let i = 0; i < frames; i++) {
    const dx = target - x;
    v += (omega * omega * dx - 2 * omega * v) * dt;
    x += v * dt;
    if (Math.abs(target - x) < 0.003 && Math.abs(v) < 0.04) { x = target; v = 0; if (settled === null) settled = (i + 1) * dt; }
    maxX = Math.max(maxX, x);
    if (i > 20) maxAbsDev = Math.max(maxAbsDev, Math.abs(target - x));
    if (!isFinite(x) || Math.abs(x) > 1e6) return { fps, dt: +dt.toFixed(4), result: 'DIVERGED', frame: i };
  }
  return { fps, dt: +dt.toFixed(4), overshootM: +(maxX - target).toFixed(3), settleMs: settled ? Math.round(settled * 1000) : 'never', devAfter20Frames: +maxAbsDev.toFixed(3) };
}
// Exact-solution alternative for comparison (analytic critically damped step)
function simExact(fps, frames = 400, omega = 26) {
  const dt = Math.min(1 / fps, 0.1);
  let x = 0, v = 0, target = 2.0, maxX = 0, settled = null;
  for (let i = 0; i < frames; i++) {
    const e0 = x - target, e = Math.exp(-omega * dt);
    const c = v + omega * e0;
    x = target + (e0 + c * dt) * e;
    v = (c - omega * (e0 + c * dt)) * e;
    if (Math.abs(target - x) < 0.003 && Math.abs(v) < 0.04) { x = target; v = 0; if (settled === null) settled = (i + 1) * dt; }
    maxX = Math.max(maxX, x);
  }
  return { fps, overshootM: +(maxX - target).toFixed(3), settleMs: settled ? Math.round(settled * 1000) : 'never' };
}
console.log('CURRENT (semi-implicit Euler):');
for (const f of [144, 120, 60, 45, 40, 35, 32, 30, 25, 20, 15, 10]) console.log(JSON.stringify(sim(f)));
console.log('ANALYTIC (frame-rate independent) for comparison:');
for (const f of [144, 60, 30, 20, 10]) console.log(JSON.stringify(simExact(f)));
// Stability bound for semi-implicit Euler, critically damped: omega*dt < 2*sqrt(2)-2
console.log('Stability bound: fps >', (26 / (2 * Math.SQRT2 - 2)).toFixed(1));

// Collision tunneling: per-frame Z step at top speed vs combined AABB depth
const top = 15.2, playerDepth = 0.6;
const obs = { LOW_BARRIER: 0.4, ROLLING_MATKA: 0.76, OVERHEAD_BEAM: 0.7, SLIDING_GATE: 0.5, GHAT_STEPS: 0.7 };
for (const [k, d] of Object.entries(obs)) {
  const extra = k === 'ROLLING_MATKA' ? 2.8 : 0;
  const win = playerDepth + d; const minFps = (top + extra) / win;
  console.log(`${k}: overlap window ${win.toFixed(2)}m; can be skipped below ${minFps.toFixed(1)} fps (dt clamp 0.1 => up to ${((top+extra)*0.1).toFixed(2)}m/frame)`);
}
// Speed ramp
const t = Math.log(1 + (15.2 - 10.5) / 0.012 / 875) / 0.012;
console.log('Top speed 15.2 reached at', ((15.2 - 10.5) / 0.012).toFixed(0), 'm, ~', t.toFixed(1), 's of running');
// Dive-roll head height at 180deg: entity origin y = 0.5 - 0.38; head joint 0.86 above origin
console.log('Dive-roll mid-roll head joint world Y ~', (0.5 - 0.38 - 0.86).toFixed(2), 'm (below ground if < 0)');
