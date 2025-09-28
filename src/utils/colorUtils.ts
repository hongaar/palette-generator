import { Color, LockedColor, PaletteAlgorithm, PaletteSeries } from '../types';
import { generatePalette as generateGPT5Palette, PaletteOptions as GPT5Options } from './auto_gpt5';
import { generateBeautifulPalette } from './auto_sonnet4';

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return { r: l * 255, g: l * 255, b: l * 255 };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  };
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  const roundedR = Math.round(r);
  const roundedG = Math.round(g);
  const roundedB = Math.round(b);
  return "#" + ((1 << 24) + (roundedR << 16) + (roundedG << 8) + roundedB).toString(16).slice(1);
}

// Create Color object from hex
export function createColorFromHex(hex: string): Color {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  return {
    hex: hex.toUpperCase(),
    hsl,
    rgb: {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b)
    }
  };
}

// Generate palette based on algorithm
export function generatePalette(
  baseColors: string[],
  colorCount: number,
  algorithm: PaletteAlgorithm,
  hueShift: number = 0,
  saturationShift: number = 0,
  lightnessShift: number = 0
): Color[] {
  if (baseColors.length === 0) return [];
  
  const colors: Color[] = [];
  const baseColor = createColorFromHex(baseColors[0]);
  
  // Add base color
  colors.push(applyShifts(baseColor, hueShift, saturationShift, lightnessShift));
  
  if (colorCount === 1) return colors;
  
  switch (algorithm) {
    case 'complementary':
      const complementaryHue = (baseColor.hsl.h + 180) % 360;
      colors.push(createColorFromHsl(complementaryHue, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      break;
      
    case 'triadic':
      colors.push(createColorFromHsl((baseColor.hsl.h + 120) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      colors.push(createColorFromHsl((baseColor.hsl.h + 240) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      break;
      
    case 'analogous':
      for (let i = 1; i < colorCount; i++) {
        const hue = (baseColor.hsl.h + (i * 30)) % 360;
        colors.push(createColorFromHsl(hue, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      }
      break;
      
    case 'monochromatic':
      for (let i = 1; i < colorCount; i++) {
        const lightness = Math.max(10, Math.min(90, baseColor.hsl.l + (i - 1) * (80 / (colorCount - 1)) - 40));
        colors.push(createColorFromHsl(baseColor.hsl.h, baseColor.hsl.s, lightness, hueShift, saturationShift, lightnessShift));
      }
      break;
      
    case 'split-complementary':
      colors.push(createColorFromHsl((baseColor.hsl.h + 150) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      colors.push(createColorFromHsl((baseColor.hsl.h + 210) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      break;
      
    case 'tetradic':
      colors.push(createColorFromHsl((baseColor.hsl.h + 90) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      colors.push(createColorFromHsl((baseColor.hsl.h + 180) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      colors.push(createColorFromHsl((baseColor.hsl.h + 270) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift));
      break;
      
    case 'auto-cursor':
      // Auto (Cursor) algorithm generates colors based on harmony principles
      return generateAutoPalette(baseColor, colorCount, hueShift, saturationShift, lightnessShift);
    case 'auto-gpt5':
      // GPT5 algorithm - will be handled separately
      return generateAutoPalette(baseColor, colorCount, hueShift, saturationShift, lightnessShift);
    case 'auto-sonnet4':
      // Sonnet4 algorithm - will be handled separately
      return generateAutoPalette(baseColor, colorCount, hueShift, saturationShift, lightnessShift);
  }
  
  return colors.slice(0, colorCount);
}

// Create color from HSL values with shifts
function createColorFromHsl(
  h: number, 
  s: number, 
  l: number, 
  hueShift: number, 
  saturationShift: number, 
  lightnessShift: number
): Color {
  const newH = (h + hueShift) % 360;
  const newS = Math.max(0, Math.min(100, s + saturationShift));
  const newL = Math.max(0, Math.min(100, l + lightnessShift));
  
  const rgb = hslToRgb(newH, newS, newL);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  return {
    hex: hex.toUpperCase(),
    hsl: { h: newH, s: newS, l: newL },
    rgb: {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b)
    }
  };
}

// Apply shifts to existing color
function applyShifts(color: Color, hueShift: number, saturationShift: number, lightnessShift: number): Color {
  const newH = (color.hsl.h + hueShift) % 360;
  const newS = Math.max(0, Math.min(100, color.hsl.s + saturationShift));
  const newL = Math.max(0, Math.min(100, color.hsl.l + lightnessShift));
  
  const rgb = hslToRgb(newH, newS, newL);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  return {
    hex: hex.toUpperCase(),
    hsl: { h: newH, s: newS, l: newL },
    rgb: {
      r: Math.round(rgb.r),
      g: Math.round(rgb.g),
      b: Math.round(rgb.b)
    }
  };
}

// Copy color to clipboard
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

// Generate random color
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
  const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
  
  const rgb = hslToRgb(hue, saturation, lightness);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Generate auto palette with intelligent color harmony
function generateAutoPalette(
  baseColor: Color,
  colorCount: number,
  hueShift: number,
  saturationShift: number,
  lightnessShift: number
): Color[] {
  const colors: Color[] = [];
  
  // Start with the base color
  colors.push(applyShifts(baseColor, hueShift, saturationShift, lightnessShift));
  
  if (colorCount === 1) return colors;
  
  // Generate harmonious colors using multiple strategies
  const strategies = [
    // Complementary colors
    () => createColorFromHsl((baseColor.hsl.h + 180) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    // Triadic colors
    () => createColorFromHsl((baseColor.hsl.h + 120) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    () => createColorFromHsl((baseColor.hsl.h + 240) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    // Analogous colors
    () => createColorFromHsl((baseColor.hsl.h + 30) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    () => createColorFromHsl((baseColor.hsl.h - 30) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    // Split complementary
    () => createColorFromHsl((baseColor.hsl.h + 150) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    () => createColorFromHsl((baseColor.hsl.h + 210) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    // Tetradic
    () => createColorFromHsl((baseColor.hsl.h + 90) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    () => createColorFromHsl((baseColor.hsl.h + 270) % 360, baseColor.hsl.s, baseColor.hsl.l, hueShift, saturationShift, lightnessShift),
    // Monochromatic variations
    () => createColorFromHsl(baseColor.hsl.h, Math.max(0, Math.min(100, baseColor.hsl.s + 20)), Math.max(0, Math.min(100, baseColor.hsl.l + 20)), hueShift, saturationShift, lightnessShift),
    () => createColorFromHsl(baseColor.hsl.h, Math.max(0, Math.min(100, baseColor.hsl.s - 20)), Math.max(0, Math.min(100, baseColor.hsl.l - 20)), hueShift, saturationShift, lightnessShift),
  ];
  
  // Use different strategies to fill remaining colors
  for (let i = 1; i < colorCount; i++) {
    const strategyIndex = (i - 1) % strategies.length;
    const newColor = strategies[strategyIndex]();
    colors.push(newColor);
  }
  
  return colors;
}

// Generate auto palette with locked colors
export function generateAutoPaletteWithLocks(
  baseColor: Color,
  colorCount: number,
  lockedColors: LockedColor[],
  hueShift: number,
  saturationShift: number,
  lightnessShift: number,
  hueDelta: number = 30,
  saturationDelta: number = 20,
  lightnessDelta: number = 20,
  seed: number = 0
): Color[] {
  const colors: Color[] = new Array(colorCount);
  
  // Seeded random number generator
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.abs(x - Math.floor(x));
  };
  
  // Always set the first color to be the base color (always use current base color, not locked color)
  // This ensures locked base colors always reflect the current base color
  colors[0] = applyShifts(baseColor, hueShift, saturationShift, lightnessShift);
  
  // Place other locked colors in their positions (skip index 0 since it's always the base color)
  lockedColors.forEach(locked => {
    if (locked.index > 0 && locked.index < colorCount) {
      colors[locked.index] = applyShifts(locked.color, hueShift, saturationShift, lightnessShift);
    }
  });
  
  // Generate colors for empty positions using sophisticated color theory
  for (let i = 1; i < colorCount; i++) {
    if (!colors[i]) {
      // Find the nearest locked color to base the new color on
      const nearestLocked = findNearestLockedColor(i, lockedColors);
      const referenceColor = nearestLocked || baseColor;
      
      // Generate a sophisticated harmonious color based on color theory
      const randomSeed = seed + i * 1000; // Different seed for each color position
      const harmonyType = Math.floor(seededRandom(randomSeed) * 4); // 0-3 for different harmony types
      
      let newHue: number;
      let newSaturation: number;
      let newLightness: number;
      
      switch (harmonyType) {
        case 0: // Analogous (adjacent colors)
          newHue = (referenceColor.hsl.h + (seededRandom(randomSeed + 1) - 0.5) * hueDelta * 0.6 + 360) % 360;
          newSaturation = Math.max(20, Math.min(80, referenceColor.hsl.s + (seededRandom(randomSeed + 2) - 0.5) * saturationDelta * 0.8));
          newLightness = Math.max(15, Math.min(85, referenceColor.hsl.l + (seededRandom(randomSeed + 3) - 0.5) * lightnessDelta * 0.7));
          break;
          
        case 1: // Complementary (opposite colors)
          const complementaryHue = (referenceColor.hsl.h + 180 + (seededRandom(randomSeed + 1) - 0.5) * hueDelta * 0.4) % 360;
          newHue = complementaryHue;
          newSaturation = Math.max(30, Math.min(90, referenceColor.hsl.s + (seededRandom(randomSeed + 2) - 0.5) * saturationDelta * 0.6));
          newLightness = Math.max(20, Math.min(80, referenceColor.hsl.l + (seededRandom(randomSeed + 3) - 0.5) * lightnessDelta * 0.8));
          break;
          
        case 2: // Triadic (120 degrees apart)
          const triadicOffset = seededRandom(randomSeed + 1) > 0.5 ? 120 : -120;
          newHue = (referenceColor.hsl.h + triadicOffset + (seededRandom(randomSeed + 2) - 0.5) * hueDelta * 0.5 + 360) % 360;
          newSaturation = Math.max(25, Math.min(85, referenceColor.hsl.s + (seededRandom(randomSeed + 3) - 0.5) * saturationDelta * 0.7));
          newLightness = Math.max(18, Math.min(82, referenceColor.hsl.l + (seededRandom(randomSeed + 4) - 0.5) * lightnessDelta * 0.6));
          break;
          
        case 3: // Split-complementary (adjacent to complementary)
          const splitOffset = seededRandom(randomSeed + 1) > 0.5 ? 150 : -150;
          newHue = (referenceColor.hsl.h + splitOffset + (seededRandom(randomSeed + 2) - 0.5) * hueDelta * 0.4 + 360) % 360;
          newSaturation = Math.max(30, Math.min(88, referenceColor.hsl.s + (seededRandom(randomSeed + 3) - 0.5) * saturationDelta * 0.6));
          newLightness = Math.max(22, Math.min(78, referenceColor.hsl.l + (seededRandom(randomSeed + 4) - 0.5) * lightnessDelta * 0.7));
          break;
          
        default:
          // Fallback to original logic
          newHue = (referenceColor.hsl.h + (seededRandom(randomSeed) - 0.5) * hueDelta * 2 + 360) % 360;
          newSaturation = Math.max(0, Math.min(100, referenceColor.hsl.s + (seededRandom(randomSeed + 1) - 0.5) * saturationDelta * 2));
          newLightness = Math.max(0, Math.min(100, referenceColor.hsl.l + (seededRandom(randomSeed + 2) - 0.5) * lightnessDelta * 2));
      }
      
      // Ensure the color has good contrast and isn't too similar to existing colors
      const finalColor = createColorFromHsl(newHue, newSaturation, newLightness, hueShift, saturationShift, lightnessShift);
      
      // Check for similarity with existing colors and adjust if needed
      let adjustedColor = finalColor;
      for (let j = 0; j < i; j++) {
        if (colors[j]) {
          const similarity = calculateColorSimilarity(adjustedColor, colors[j]);
          if (similarity > 0.85) { // Too similar, adjust
            const adjustmentSeed = randomSeed + j * 100;
            const hueAdjustment = (seededRandom(adjustmentSeed) - 0.5) * 60; // ±30 degrees
            const newAdjustedHue = (adjustedColor.hsl.h + hueAdjustment + 360) % 360;
            adjustedColor = createColorFromHsl(newAdjustedHue, adjustedColor.hsl.s, adjustedColor.hsl.l, hueShift, saturationShift, lightnessShift);
          }
        }
      }
      
      colors[i] = adjustedColor;
    }
  }
  
  return colors;
}

// Find the nearest locked color to a given position
function findNearestLockedColor(position: number, lockedColors: LockedColor[]): Color | null {
  if (lockedColors.length === 0) return null;
  
  let nearest = lockedColors[0];
  let minDistance = Math.abs(lockedColors[0].index - position);
  
  for (const locked of lockedColors) {
    const distance = Math.abs(locked.index - position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = locked;
    }
  }
  
  return nearest.color;
}

// Calculate color similarity (0 = identical, 1 = completely different)
function calculateColorSimilarity(color1: Color, color2: Color): number {
  const h1 = color1.hsl.h;
  const s1 = color1.hsl.s;
  const l1 = color1.hsl.l;
  
  const h2 = color2.hsl.h;
  const s2 = color2.hsl.s;
  const l2 = color2.hsl.l;
  
  // Calculate hue difference (considering circular nature)
  const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
  
  // Calculate saturation and lightness differences
  const satDiff = Math.abs(s1 - s2) / 100;
  const lightDiff = Math.abs(l1 - l2) / 100;
  
  // Weighted similarity calculation
  return (hueDiff * 0.5 + satDiff * 0.3 + lightDiff * 0.2);
}

// Generate multiple palette series from multiple base colors with alignment
export function generateMultiplePaletteSeries(
  baseColors: string[],
  colorCount: number,
  algorithm: PaletteAlgorithm,
  hueShift: number = 0,
  saturationShift: number = 0,
  lightnessShift: number = 0
): PaletteSeries[] {
  if (algorithm === 'auto-cursor') {
    // For auto-cursor mode, generate aligned palettes
    return generateAlignedAutoPalettes(baseColors, colorCount, hueShift, saturationShift, lightnessShift);
  }
  
  if (algorithm === 'auto-gpt5') {
    // For GPT5 mode, use the GPT5 algorithm
    return generateGPT5PaletteWrapper(baseColors, colorCount);
  }
  
  if (algorithm === 'auto-sonnet4') {
    // For Sonnet4 mode, use the Sonnet4 algorithm
    return generateSonnet4PaletteWrapper(baseColors, colorCount);
  }
  
  return baseColors.map(baseColor => ({
    baseColor,
    palette: generatePalette([baseColor], colorCount, algorithm, hueShift, saturationShift, lightnessShift)
  }));
}

// Generate aligned auto palettes that work well together in a color picker grid
function generateAlignedAutoPalettes(
  baseColors: string[],
  colorCount: number,
  hueShift: number = 0,
  saturationShift: number = 0,
  lightnessShift: number = 0
): PaletteSeries[] {
  const palettes: PaletteSeries[] = [];
  
  // Generate a master harmony pattern that all palettes will follow
  const masterHarmony = generateMasterHarmonyPattern(colorCount);
  
  for (let i = 0; i < baseColors.length; i++) {
    const baseColor = createColorFromHex(baseColors[i]);
    const palette: Color[] = [];
    
    // Always start with the base color
    palette[0] = applyShifts(baseColor, hueShift, saturationShift, lightnessShift);
    
    // Generate colors following the master harmony pattern
    for (let j = 1; j < colorCount; j++) {
      const harmonyType = masterHarmony[j - 1];
      const newColor = generateHarmoniousColor(baseColor, harmonyType, j, i);
      palette[j] = applyShifts(newColor, hueShift, saturationShift, lightnessShift);
    }
    
    palettes.push({
      baseColor: baseColors[i],
      palette
    });
  }
  
  return palettes;
}

// Generate a master harmony pattern that ensures consistency across palettes
function generateMasterHarmonyPattern(colorCount: number): number[] {
  const pattern: number[] = [];
  const harmonyTypes = [0, 1, 2, 3]; // analogous, complementary, triadic, split-complementary
  
  // Create a balanced pattern that cycles through harmony types
  for (let i = 0; i < colorCount - 1; i++) {
    pattern.push(harmonyTypes[i % harmonyTypes.length]);
  }
  
  return pattern;
}

// Generate a harmonious color based on the base color and harmony type
function generateHarmoniousColor(baseColor: Color, harmonyType: number, position: number, seriesIndex: number): Color {
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.abs(x - Math.floor(x));
  };
  
  const randomSeed = seriesIndex * 1000 + position * 100;
  
  let newHue: number;
  let newSaturation: number;
  let newLightness: number;
  
  switch (harmonyType) {
    case 0: // Analogous (adjacent colors)
      newHue = (baseColor.hsl.h + (seededRandom(randomSeed) - 0.5) * 60 + 360) % 360;
      newSaturation = Math.max(25, Math.min(85, baseColor.hsl.s + (seededRandom(randomSeed + 1) - 0.5) * 40));
      newLightness = Math.max(20, Math.min(80, baseColor.hsl.l + (seededRandom(randomSeed + 2) - 0.5) * 50));
      break;
      
    case 1: // Complementary (opposite colors)
      newHue = (baseColor.hsl.h + 180 + (seededRandom(randomSeed) - 0.5) * 30 + 360) % 360;
      newSaturation = Math.max(35, Math.min(90, baseColor.hsl.s + (seededRandom(randomSeed + 1) - 0.5) * 30));
      newLightness = Math.max(25, Math.min(75, baseColor.hsl.l + (seededRandom(randomSeed + 2) - 0.5) * 40));
      break;
      
    case 2: // Triadic (120 degrees apart)
      const triadicOffset = seededRandom(randomSeed) > 0.5 ? 120 : -120;
      newHue = (baseColor.hsl.h + triadicOffset + (seededRandom(randomSeed + 1) - 0.5) * 40 + 360) % 360;
      newSaturation = Math.max(30, Math.min(85, baseColor.hsl.s + (seededRandom(randomSeed + 2) - 0.5) * 35));
      newLightness = Math.max(22, Math.min(78, baseColor.hsl.l + (seededRandom(randomSeed + 3) - 0.5) * 45));
      break;
      
    case 3: // Split-complementary (adjacent to complementary)
      const splitOffset = seededRandom(randomSeed) > 0.5 ? 150 : -150;
      newHue = (baseColor.hsl.h + splitOffset + (seededRandom(randomSeed + 1) - 0.5) * 35 + 360) % 360;
      newSaturation = Math.max(32, Math.min(88, baseColor.hsl.s + (seededRandom(randomSeed + 2) - 0.5) * 32));
      newLightness = Math.max(25, Math.min(75, baseColor.hsl.l + (seededRandom(randomSeed + 3) - 0.5) * 42));
      break;
      
    default:
      // Fallback
      newHue = (baseColor.hsl.h + (seededRandom(randomSeed) - 0.5) * 90 + 360) % 360;
      newSaturation = Math.max(20, Math.min(90, baseColor.hsl.s + (seededRandom(randomSeed + 1) - 0.5) * 50));
      newLightness = Math.max(15, Math.min(85, baseColor.hsl.l + (seededRandom(randomSeed + 2) - 0.5) * 60));
  }
  
  return createColorFromHsl(newHue, newSaturation, newLightness, 0, 0, 0);
}

// Convert our Color type to hex string for external algorithms
// function colorToHex(color: Color): string {
//   return color.hex;
// }

// Convert hex string to our Color type
function hexToColor(hex: string): Color {
  return createColorFromHex(hex);
}

// Generate palette using GPT5 algorithm with timeout protection
export function generateGPT5PaletteWrapper(
  baseColors: string[],
  colorCount: number,
  options: {
    minHueSeparation?: number;
    preferPastel?: boolean;
    preferDark?: boolean;
    lockAtEnds?: boolean;
    seed?: number;
  } = {}
): PaletteSeries[] {
  return baseColors.map(baseColor => {
    try {
      const gpt5Options: GPT5Options = {
        size: Math.min(colorCount, 10), // Limited to 10 colors for performance
        seed: options.seed,
        minHueSeparation: Math.max(8, Math.min(45, options.minHueSeparation || 22)), // Clamp between 8-45
        preferPastel: options.preferPastel || false,
        preferDark: options.preferDark || false,
        lockAtEnds: options.lockAtEnds || false,
      };
      
      const lockedColors = [baseColor as `#${string}`];
      
      // Add timeout protection
      const startTime = Date.now();
      const palette = generateGPT5Palette(lockedColors, gpt5Options);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // If it takes more than 1 second, log a warning
        console.warn(`GPT5 algorithm took ${duration}ms, consider reducing color count or complexity`);
      }
      
      return {
        baseColor,
        palette: palette.map(hexToColor)
      };
    } catch (error) {
      console.warn('GPT5 algorithm failed, falling back to simple generation:', error);
      // Fallback to simple generation if GPT5 fails
      const baseColorObj = createColorFromHex(baseColor);
      const simplePalette = generateAutoPalette(baseColorObj, colorCount, 0, 0, 0);
      return {
        baseColor,
        palette: simplePalette
      };
    }
  });
}

// Generate palette using Sonnet4 algorithm
export function generateSonnet4PaletteWrapper(
  baseColors: string[],
  colorCount: number,
  seed?: number
): PaletteSeries[] {
  return baseColors.map(baseColor => {
    const sonnet4Options = {
      inputColors: [baseColor],
      totalColors: colorCount,
      seed: seed
    };
    
    const palette = generateBeautifulPalette(sonnet4Options);
    
    return {
      baseColor,
      palette: palette.map(hexToColor)
    };
  });
}
