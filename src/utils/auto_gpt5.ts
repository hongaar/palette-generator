/* Creative Palette Generator (TypeScript, no deps)
   - Keeps input colors (locks)
   - Avoids obvious Complementary/Triadic templates
   - Uses low-discrepancy sampling + soft constraints for harmony
   - Deterministic with seed
*/

export type Hex = `#${string}`;
export interface PaletteOptions {
  size: number;                 // total colors wanted (>= locked.length)
  seed?: number;                // for reproducibility
  minHueSeparation?: number;    // degrees, soft minimum between distinct hues
  preferPastel?: boolean;       // nudge saturation/lightness toward soft palettes
  preferDark?: boolean;         // nudge toward deeper/lightness values
  lockAtEnds?: boolean;         // keep locked colors at extremes of lightness ordering
}

export function generatePalette(locked: Hex[], opts: PaletteOptions): Hex[] {
  const size = Math.max(opts.size, locked.length);
  const rng = mulberry32(opts.seed ?? hashString(locked.join(",")) ^ 0x9E3779B9);
  const minSep = clamp(opts.minHueSeparation ?? 22, 8, 90); // gentle default spacing

  // Normalize and store locks
  const locksHSL = dedupeHexes(locked).map(hex => rgbToHsl(hexToRgb(normHex(hex))));
  // Build a working set with locks
  const pool: HSL[] = [...locksHSL];

  // Determine a palette "mood" once, then mix strategies per-swatch
  const mood = pickMood(rng, { preferPastel: !!opts.preferPastel, preferDark: !!opts.preferDark });

  // Optionally sort locks to ends by lightness
  if (opts.lockAtEnds && pool.length >= 2) {
    pool.sort((a, b) => a.l - b.l);
  }

  // Prepare hue occupancy (for blue-noise spacing)
  const hueSet = new HueSet(minSep);
  pool.forEach(c => hueSet.add(c.h));

  // Golden-angle base to avoid obvious symmetry
  const golden = 137.50776405003785;

  // If we have no locks, seed a base hue randomly
  if (pool.length === 0) {
    const h = rng() * 360;
    const s = 0.55 + (rng() - 0.5) * 0.2; // 0.45–0.65
    const l = 0.55 + (rng() - 0.5) * 0.2; // 0.45–0.65
    const c = { h: wrapHue(h), s: clamp01(s), l: clamp01(l) };
    pool.push(c);
    hueSet.add(c.h);
  }

  // Generate until we hit size
  let i = 0;
  const maxIterations = Math.min(size * 12, 100); // Increased iterations for better coverage
  while (pool.length < size && i < maxIterations) { // safety cap
    i++;
    // Base from an existing color (rotate through pool to encourage relationships)
    const base = pool[Math.floor(vdc(i) * pool.length)];
    const mode = pickMode(rng, mood);

    let candidate = proposeCandidate(base, mode, rng, hueSet, mood);

    // Post-process: gentle pull toward mood
    candidate = nudgeToMood(candidate, mood, rng);

    // Avoid duplicates & keep in gamut
    candidate.s = clamp01(candidate.s);
    candidate.l = clamp01(candidate.l);

    // Start with relaxed distinctness criteria
    let distinctnessThreshold = mode === "analogCluster" ? 2 : 4;
    
    // If we're getting close to max iterations, be more lenient
    if (i > maxIterations * 0.7) {
      distinctnessThreshold = 1;
    }

    // Minimal distinctness check (in HSL-ish metric) - very relaxed criteria
    if (!isDistinct(candidate, pool, distinctnessThreshold)) continue;

    // For non-analog modes, try to respect hue separation but be more lenient
    if (mode !== "analogCluster" && !hueSet.canPlace(candidate.h)) {
      // try a few golden hops
      let placed = false;
      for (let k = 0; k < 6; k++) { // Increased attempts
        candidate.h = wrapHue(candidate.h + golden * (rng() > 0.5 ? 1 : -1));
        if (hueSet.canPlace(candidate.h)) { placed = true; break; }
      }
      // If still can't place, just add it anyway if we're desperate
      if (!placed && i > maxIterations * 0.8) {
        // Force add if we're running out of attempts
      } else if (!placed) {
        continue;
      }
    }
    pool.push(candidate);
    hueSet.add(candidate.h);
  }

  // If still short, loosen constraints and fill via subtle ramps
  let fallbackAttempts = 0;
  const maxFallbackAttempts = Math.max(30, size * 3); // More aggressive fallback
  while (pool.length < size && fallbackAttempts < maxFallbackAttempts) {
    fallbackAttempts++;
    const base = pool[Math.floor(rng() * pool.length)];
    
    // Create variations with different strategies
    let c: HSL;
    if (fallbackAttempts % 3 === 0) {
      // Lightness variation
      c = { ...base, l: clamp01(base.l + (rng() - 0.5) * 0.3) };
    } else if (fallbackAttempts % 3 === 1) {
      // Saturation variation
      c = { ...base, s: clamp01(base.s + (rng() - 0.5) * 0.3) };
    } else {
      // Hue variation
      c = { ...base, h: wrapHue(base.h + (rng() - 0.5) * 60) };
    }
    
    // Very relaxed distinctness criteria in fallback
    const distinctnessThreshold = Math.max(1, 4 - Math.floor(fallbackAttempts / 10));
    if (isDistinct(c, pool, distinctnessThreshold)) {
      pool.push(c);
    } else if (fallbackAttempts > maxFallbackAttempts * 0.8) {
      // Force add if we're really desperate
      pool.push(c);
    }
  }

  // Final safety check - if we still don't have enough colors, generate simple variations
  while (pool.length < size) {
    const base = pool[Math.floor(rng() * pool.length)];
    const variation = {
      h: wrapHue(base.h + (rng() - 0.5) * 120), // ±60 degrees
      s: clamp01(base.s + (rng() - 0.5) * 0.4), // ±20%
      l: clamp01(base.l + (rng() - 0.5) * 0.4)  // ±20%
    };
    pool.push(variation);
  }

  // Arrange palette to look pleasant in UI:
  // 1) sort by hue buckets, then by lightness rhythm
  const sorted = smartOrder(pool);

  // Convert back to hex; ensure locked stay present (and in order preference if requested)
  const result = sorted.map(hsl => rgbToHex(hslToRgb(hsl)));

  // If lockAtEnds: ensure the extreme light/dark locked colors are at ends
  if (opts.lockAtEnds && locksHSL.length >= 2) {
    // const lockHexes = locksHSL.map(c => rgbToHex(hslToRgb(c)));
    const extremes = [...locksHSL].sort((a, b) => a.l - b.l);
    const lo = rgbToHex(hslToRgb(extremes[0]));
    const hi = rgbToHex(hslToRgb(extremes[extremes.length - 1]));
    return putAtEnds(result, lo, hi);
  }

  return uniqueKeepOrder(result);
}

/* ---------- Palette Strategy ---------- */

type Mode = "analogCluster" | "accentContrast" | "pastelRamp" | "deepRamp" | "quirkyOffsets";
interface Mood {
  softness: number;  // 0..1 (higher = pastel)
  darkness: number;  // 0..1 (higher = darker)
  punch: number;     // 0..1 (higher = more saturation variance)
}

function pickMood(rng: RNG, prefs: { preferPastel: boolean; preferDark: boolean }): Mood {
  const softness = clamp01((prefs.preferPastel ? 0.7 : 0.4) + (rng() - 0.5) * 0.25);
  const darkness = clamp01((prefs.preferDark ? 0.65 : 0.45) + (rng() - 0.5) * 0.25);
  const punch = clamp01(0.55 + (rng() - 0.5) * 0.35);
  return { softness, darkness, punch };
}

function pickMode(rng: RNG, mood: Mood): Mode {
  // Weighted blend; avoids classic complementary/triadic patterns
  const weights: Array<[Mode, number]> = [
    ["analogCluster", 0.26 + (1 - mood.punch) * 0.10],
    ["accentContrast", 0.24 + mood.punch * 0.15],
    ["pastelRamp", 0.20 + mood.softness * 0.20],
    ["deepRamp", 0.16 + mood.darkness * 0.15],
    ["quirkyOffsets", 0.14 + 0.05],
  ];
  const sum = weights.reduce((a, [, w]) => a + w, 0);
  let t = rng() * sum;
  for (const [m, w] of weights) {
    if ((t -= w) <= 0) return m;
  }
  return "analogCluster";
}

function proposeCandidate(base: HSL, mode: Mode, rng: RNG, hues: HueSet, mood: Mood): HSL {
  const golden = 137.50776405003785;
  const jitter = () => (rng() - 0.5);

  let h = base.h, s = base.s, l = base.l;

  switch (mode) {
    case "analogCluster": {
      // Tight hue neighborhood, subtle s/l wobble
      const span = 16 + rng() * 18; // 16–34°
      h = wrapHue(base.h + (jitter() * span));
      s = clamp01(base.s + jitter() * (0.10 + mood.punch * 0.08));
      l = clamp01(base.l + jitter() * (0.10 + (1 - mood.darkness) * 0.06));
      break;
    }
    case "accentContrast": {
      // Not complementary; use golden-angle-ish hop with offset that avoids 180° mirror
      const hop = golden * (rng() > 0.5 ? 1 : -1);
      const bias = (rng() * 40 - 20); // +/- 20° avoids perfect symmetry
      h = wrapHue(base.h + hop + bias);
      // Boost contrast by pushing either saturation or lightness away
      s = clamp01(lerp(base.s, 0.75 + 0.2 * rng(), 0.6));
      l = clamp01(lerp(base.l, rng() > 0.5 ? 0.25 + 0.2 * rng() : 0.75 - 0.2 * rng(), 0.55));
      break;
    }
    case "pastelRamp": {
      // Gentle saturation, mid-high lightness, small hue drift using van der Corput
      h = wrapHue(base.h + (rng() > 0.5 ? 1 : -1) * (22 + rng() * 28));
      s = clamp01(0.25 + (1 - mood.punch) * 0.25 + rng() * 0.15);
      l = clamp01(0.70 + (1 - mood.darkness) * 0.15 + jitter() * 0.06);
      break;
    }
    case "deepRamp": {
      // Lower lightness, richer saturation, hue drift by golden hops
      h = wrapHue(base.h + golden * (rng() > 0.5 ? 1 : -1) + (rng() - 0.5) * 18);
      s = clamp01(0.60 + mood.punch * 0.30 + jitter() * 0.10);
      l = clamp01(0.28 + mood.darkness * 0.25 + jitter() * 0.06);
      break;
    }
    case "quirkyOffsets": {
      // Two-step offset to avoid symmetry; slight “wonkiness” yields fresh accents
      const step1 = 95 + rng() * 60;   // 95–155°
      const step2 = 40 + rng() * 50;   // 40–90°
      const dir = rng() > 0.5 ? 1 : -1;
      h = wrapHue(base.h + dir * step1 + (rng() > 0.5 ? step2 : -step2));
      s = clamp01(0.45 + jitter() * 0.25 + mood.punch * 0.15);
      // Flip a coin to go bright or moody
      l = clamp01((rng() > 0.5 ? 0.68 : 0.36) + jitter() * 0.08);
      break;
    }
  }

  // If hue space is crowded at h, nudge via micro golden hops
  if (!hues.canPlace(h)) {
    for (let k = 0; k < 3; k++) {
      h = wrapHue(h + (golden * (rng() > 0.5 ? 1 : -1)) * 0.35);
      if (hues.canPlace(h)) break;
    }
  }

  return { h, s, l };
}

function nudgeToMood(c: HSL, mood: Mood, rng: RNG): HSL {
  // Soft pull toward mood targets, with tiny randomness to avoid “flatness”
  const targetL = clamp01(lerp(0.32, 0.78, 1 - (mood.darkness * 0.8)));
  const targetS = clamp01(lerp(0.28, 0.70, mood.punch * 0.9) * (mood.softness > 0.55 ? 0.85 : 1));
  return {
    h: c.h,
    s: clamp01(lerp(c.s, targetS, 0.18 + rng() * 0.12) + (rng() - 0.5) * 0.02),
    l: clamp01(lerp(c.l, targetL, 0.18 + rng() * 0.12) + (rng() - 0.5) * 0.02),
  };
}

/* ---------- Ordering for presentation ---------- */

function smartOrder(colors: HSL[]): HSL[] {
  // Bucket hues into 12 sectors, then within each, sort by L (alternating direction for rhythm)
  const sectors: HSL[][] = Array.from({ length: 12 }, () => []);
  colors.forEach(c => sectors[Math.floor(wrapHue(c.h) / 30) % 12].push(c));
  sectors.forEach((bucket, i) => {
    bucket.sort((a, b) => a.l - b.l);
    if (i % 2 === 1) bucket.reverse();
  });
  // Merge buckets, then do a small traveling-salesman pass minimizing HSL distance
  const linear = sectors.flat();
  return greedyReorder(linear);
}

function greedyReorder(arr: HSL[]): HSL[] {
  if (arr.length <= 2) return arr.slice();
  const used = new Set<number>();
  const out: HSL[] = [];
  let idx = 0; // start somewhere stable
  for (let k = 0; k < arr.length; k++) {
    while (used.has(idx)) idx = (idx + 1) % arr.length;
    const current = arr[idx];
    used.add(idx);
    out.push(current);
    // pick next closest by perceptual-ish HSL metric
    let nextIdx = -1, best = Infinity;
    for (let j = 0; j < arr.length; j++) {
      if (used.has(j)) continue;
      const d = hslDistance(current, arr[j]);
      if (d < best) { best = d; nextIdx = j; }
    }
    idx = nextIdx === -1 ? idx : nextIdx;
  }
  return out;
}

/* ---------- Utilities ---------- */

type RNG = () => number;

function mulberry32(a: number): RNG {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function vdc(n: number, base = 2): number {
  // van der Corput sequence in given base (low discrepancy)
  let v = 0, denom = 1;
  while (n > 0) {
    denom *= base;
    v += (n % base) / denom;
    n = Math.floor(n / base);
  }
  return v;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }
function wrapHue(h: number) { h = h % 360; return h < 0 ? h + 360 : h; }

function uniqueKeepOrder<T>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = JSON.stringify(x);
    if (!seen.has(k)) { out.push(x); seen.add(k); }
  }
  return out;
}

function putAtEnds(arr: Hex[], low: Hex, high: Hex): Hex[] {
  const rest = arr.filter(x => x.toLowerCase() !== low.toLowerCase() && x.toLowerCase() !== high.toLowerCase());
  return [low, ...rest, high];
}

/* ---------- Hue spacing helper ---------- */

class HueSet {
  private minSep: number;
  private hues: number[] = [];
  constructor(minSep: number) { this.minSep = minSep; }
  add(h: number) { this.hues.push(wrapHue(h)); }
  canPlace(h: number): boolean {
    h = wrapHue(h);
    return this.hues.every(x => circDistDeg(x, h) >= this.minSep);
  }
}
function circDistDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/* ---------- Distances / distinctness ---------- */

function hslDistance(a: HSL, b: HSL): number {
  // Perceptual-ish distance (weights hue, saturation, and lightness)
  const dh = circDistDeg(a.h, b.h) / 180;     // 0..1
  const ds = Math.abs(a.s - b.s);
  const dl = Math.abs(a.l - b.l);
  return Math.sqrt(dh * dh * 0.9 + ds * ds * 0.6 + dl * dl * 0.8);
}
function isDistinct(c: HSL, pool: HSL[], minScore: number): boolean {
  // minScore ~5..10, larger = more distinct
  const min = pool.reduce((acc, p) => Math.min(acc, hslDistance(c, p)), Infinity);
  return min * 10 >= minScore;
}

/* ---------- Color conversions (sRGB <-> HSL) ---------- */

type RGB = { r: number; g: number; b: number }; // 0..255
type HSL = { h: number; s: number; l: number }; // h: 0..360, s/l: 0..1

function normHex(hex: string): Hex {
  let h = hex.trim().toLowerCase();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    // #rgb -> #rrggbb
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h as Hex;
}

function hexToRgb(hex: Hex): RGB {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex({ r, g, b }: RGB): Hex {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return (`#${to(Math.round(r))}${to(Math.round(g))}${to(Math.round(b))}`) as Hex;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      case B: h = (R - G) / d + 4; break;
    }
    h *= 60;
  }
  return { h: wrapHue(h), s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  h = wrapHue(h);
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const tc = [hk + 1/3, hk, hk - 1/3].map(wrapUnit);
  const rgb = tc.map(t => hue2rgb(p, q, t));
  return { r: rgb[0] * 255, g: rgb[1] * 255, b: rgb[2] * 255 };
}
function wrapUnit(t: number) { t = t % 1; return t < 0 ? t + 1 : t; }
function hue2rgb(p: number, q: number, t: number) {
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

/* ---------- Small helpers ---------- */

function dedupeHexes(arr: Hex[]): Hex[] {
  const seen = new Set<string>();
  const out: Hex[] = [];
  for (const x of arr) {
    const n = normHex(x);
    if (!seen.has(n)) { out.push(n); seen.add(n); }
  }
  return out;
}

/* ---------- Example usage ---------- */

// const palette = generatePalette(
//   ["#0ea5e9", "#f59e0b"], // locked colors (kept in result)
//   { size: 8, seed: 42, preferPastel: false, preferDark: false, lockAtEnds: true }
// );
// console.log(palette);
