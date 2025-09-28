export interface Color {
  hex: string;
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  rgb: {
    r: number;
    g: number;
    b: number;
  };
}

export interface PaletteGenerationParams {
  baseColors: string[];
  colorCount: number;
  algorithm: PaletteAlgorithm;
  hueShift: number;
  saturationShift: number;
  lightnessShift: number;
}

export type PaletteAlgorithm = 
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'monochromatic'
  | 'split-complementary'
  | 'tetradic'
  | 'auto';

export interface Palette {
  colors: Color[];
  algorithm: PaletteAlgorithm;
  baseColor: string;
  generatedAt: Date;
}

export interface PaletteSeries {
  baseColor: string;
  palette: Color[];
  lockedColors?: boolean[]; // Track which colors are locked
}

export interface LockedColor {
  color: Color;
  index: number;
}
