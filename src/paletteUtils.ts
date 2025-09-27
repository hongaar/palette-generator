import { colord, Colord } from 'colord';
import type { PaletteConfig, GenerationAlgorithm } from './types';

export function generatePalette(config: PaletteConfig): string[] {
  const { baseColors, colorCount, algorithm, hslParams } = config;
  
  if (baseColors.length === 0) {
    return [];
  }

  const baseColor = colord(baseColors[0]);
  const hsl = baseColor.toHsl();
  
  // Apply HSL adjustments to the base color
  const adjustedBase = colord({
    h: (hsl.h + hslParams.hueShift) % 360,
    s: Math.max(0, Math.min(100, hsl.s + hslParams.saturationShift)),
    l: Math.max(0, Math.min(100, hsl.l + hslParams.lightnessShift))
  });

  switch (algorithm) {
    case 'complementary':
      return generateComplementary(adjustedBase, colorCount);
    case 'triadic':
      return generateTriadic(adjustedBase, colorCount);
    case 'analogous':
      return generateAnalogous(adjustedBase, colorCount);
    case 'monochromatic':
      return generateMonochromatic(adjustedBase, colorCount);
    case 'split-complementary':
      return generateSplitComplementary(adjustedBase, colorCount);
    case 'tetradic':
      return generateTetradic(adjustedBase, colorCount);
    default:
      return [adjustedBase.toHex()];
  }
}

function generateComplementary(baseColor: Colord, count: number): string[] {
  const colors = [baseColor.toHex()];
  const complement = baseColor.rotate(180);
  
  if (count <= 2) {
    return [baseColor.toHex(), complement.toHex()].slice(0, count);
  }
  
  // Add variations of base and complement
  for (let i = 1; i < count; i++) {
    if (i % 2 === 1) {
      const hsl = baseColor.toHsl();
      const lightness = 20 + (60 * i / count);
      colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
    } else {
      const hsl = complement.toHsl();
      const lightness = 20 + (60 * i / count);
      colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
    }
  }
  
  return colors.slice(0, count);
}

function generateTriadic(baseColor: Colord, count: number): string[] {
  const colors = [baseColor.toHex()];
  
  if (count <= 3) {
    return [
      baseColor.toHex(),
      baseColor.rotate(120).toHex(),
      baseColor.rotate(240).toHex()
    ].slice(0, count);
  }
  
  // Add variations
  const step = Math.floor(count / 3);
  for (let i = 0; i < 3; i++) {
    const rotated = baseColor.rotate(i * 120);
    const hsl = rotated.toHsl();
    for (let j = 1; j < step; j++) {
      const lightness = 30 + (40 * j / step);
      colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
    }
  }
  
  return colors.slice(0, count);
}

function generateAnalogous(baseColor: Colord, count: number): string[] {
  const colors = [baseColor.toHex()];
  const step = 30;
  
  for (let i = 1; i < count; i++) {
    const rotation = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * step;
    colors.push(baseColor.rotate(rotation).toHex());
  }
  
  return colors.slice(0, count);
}

function generateMonochromatic(baseColor: Colord, count: number): string[] {
  const colors = [];
  const hsl = baseColor.toHsl();
  
  for (let i = 0; i < count; i++) {
    const lightness = 15 + (70 * i / (count - 1));
    colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
  }
  
  return colors;
}

function generateSplitComplementary(baseColor: Colord, count: number): string[] {
  const colors = [baseColor.toHex()];
  
  if (count <= 3) {
    return [
      baseColor.toHex(),
      baseColor.rotate(150).toHex(),
      baseColor.rotate(210).toHex()
    ].slice(0, count);
  }
  
  // Add variations
  const angles = [0, 150, 210];
  for (let i = 1; i < count; i++) {
    const angle = angles[i % 3];
    const rotated = baseColor.rotate(angle);
    const hsl = rotated.toHsl();
    const lightness = 20 + (60 * Math.floor(i / 3) / Math.floor(count / 3));
    colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
  }
  
  return colors.slice(0, count);
}

function generateTetradic(baseColor: Colord, count: number): string[] {
  const colors = [baseColor.toHex()];
  
  if (count <= 4) {
    return [
      baseColor.toHex(),
      baseColor.rotate(90).toHex(),
      baseColor.rotate(180).toHex(),
      baseColor.rotate(270).toHex()
    ].slice(0, count);
  }
  
  // Add variations
  const angles = [0, 90, 180, 270];
  for (let i = 1; i < count; i++) {
    const angle = angles[i % 4];
    const rotated = baseColor.rotate(angle);
    const hsl = rotated.toHsl();
    const lightness = 20 + (60 * Math.floor(i / 4) / Math.floor(count / 4));
    colors.push(colord({ h: hsl.h, s: hsl.s, l: lightness }).toHex());
  }
  
  return colors.slice(0, count);
}

export function encodeConfigToUrl(config: PaletteConfig): string {
  const params = new URLSearchParams({
    colors: config.baseColors.join(','),
    count: config.colorCount.toString(),
    algorithm: config.algorithm,
    hue: config.hslParams.hueShift.toString(),
    sat: config.hslParams.saturationShift.toString(),
    light: config.hslParams.lightnessShift.toString()
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeConfigFromUrl(): Partial<PaletteConfig> | null {
  const params = new URLSearchParams(window.location.search);
  
  if (!params.has('colors')) return null;
  
  return {
    baseColors: params.get('colors')?.split(',').filter(Boolean) || [],
    colorCount: parseInt(params.get('count') || '8'),
    algorithm: (params.get('algorithm') as GenerationAlgorithm) || 'complementary',
    hslParams: {
      hueShift: parseInt(params.get('hue') || '0'),
      saturationShift: parseInt(params.get('sat') || '0'),
      lightnessShift: parseInt(params.get('light') || '0')
    }
  };
}