import { Color, PaletteAlgorithm } from '../types';

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
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Create Color object from hex
export function createColorFromHex(hex: string): Color {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  return {
    hex: hex.toUpperCase(),
    hsl,
    rgb
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
    rgb
  };
}

// Apply shifts to existing color
function applyShifts(color: Color, hueShift: number, saturationShift: number, lightnessShift: number): Color {
  return createColorFromHsl(
    color.hsl.h,
    color.hsl.s,
    color.hsl.l,
    hueShift,
    saturationShift,
    lightnessShift
  );
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
