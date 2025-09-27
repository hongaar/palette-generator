export interface HSLParameters {
  hueShift: number;
  saturationShift: number;
  lightnessShift: number;
}

export interface PaletteConfig {
  baseColors: string[];
  colorCount: number;
  algorithm: GenerationAlgorithm;
  hslParams: HSLParameters;
}

export type GenerationAlgorithm = 
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'monochromatic'
  | 'split-complementary'
  | 'tetradic';

export interface GeneratedPalette {
  colors: string[];
  config: PaletteConfig;
}