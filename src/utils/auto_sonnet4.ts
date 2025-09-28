interface HSL {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
  }
  
  interface RGB {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  }
  
  interface PaletteOptions {
    inputColors: string[]; // Hex colors to lock in palette
    totalColors: number;   // Total desired colors in palette
    seed?: number;        // Optional seed for reproducible results
  }
  
  class PaletteGenerator {
    private rng: () => number;
    
    constructor(seed?: number) {
      // Simple seeded random number generator for reproducible results
      if (seed !== undefined) {
        let s = seed;
        this.rng = () => {
          s = Math.sin(s) * 10000;
          return s - Math.floor(s);
        };
      } else {
        this.rng = Math.random;
      }
    }
  
    // Convert hex to HSL
    private hexToHsl(hex: string): HSL {
      const rgb = this.hexToRgb(hex);
      return this.rgbToHsl(rgb);
    }
  
    // Convert hex to RGB
    private hexToRgb(hex: string): RGB {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    }
  
    // Convert RGB to HSL
    private rgbToHsl(rgb: RGB): HSL {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
  
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const sum = max + min;
      
      let h = 0;
      const s = diff === 0 ? 0 : (max + min < 1 ? diff / sum : diff / (2 - sum));
      const l = sum / 2;
  
      if (diff !== 0) {
        switch (max) {
          case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / diff + 2) / 6; break;
          case b: h = ((r - g) / diff + 4) / 6; break;
        }
      }
  
      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    }
  
    // Convert HSL to hex
    private hslToHex(hsl: HSL): string {
      const h = hsl.h / 360;
      const s = hsl.s / 100;
      const l = hsl.l / 100;
  
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
  
      let r, g, b;
  
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
  
      const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
  
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  
    // Calculate perceptual distance between two colors
    // private perceptualDistance(hsl1: HSL, hsl2: HSL): number {
    //   const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
    //   const sDiff = Math.abs(hsl1.s - hsl2.s);
    //   const lDiff = Math.abs(hsl1.l - hsl2.l);
    //   
    //   // Weight hue differences more heavily for perceptual harmony
    //   return Math.sqrt((hDiff * 2) ** 2 + sDiff ** 2 + lDiff ** 2);
    // }
  
    // Generate palette using creative algorithms
    public generatePalette(options: PaletteOptions): string[] {
      const { inputColors, totalColors, seed } = options;
      
      if (seed !== undefined) {
        this.rng = (() => {
          let s = seed;
          return () => {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
          };
        })();
      }
  
      const palette: string[] = [...inputColors];
      const inputHSLs = inputColors.map(color => this.hexToHsl(color));
      const neededColors = totalColors - inputColors.length;
  
      if (neededColors <= 0) {
        return palette.slice(0, totalColors);
      }
  
      // Choose a generation strategy randomly
      const strategies = [
        'goldenRatioHarmony',
        'perceptualFlow',
        'contrastWaves',
        'chromaticDrift',
        'luminanceSteps',
        'saturationPlay'
      ];
      
      const strategy = strategies[Math.floor(this.rng() * strategies.length)];
      
      switch (strategy) {
        case 'goldenRatioHarmony':
          this.addGoldenRatioColors(palette, inputHSLs, neededColors);
          break;
        case 'perceptualFlow':
          this.addPerceptualFlowColors(palette, inputHSLs, neededColors);
          break;
        case 'contrastWaves':
          this.addContrastWaveColors(palette, inputHSLs, neededColors);
          break;
        case 'chromaticDrift':
          this.addChromaticDriftColors(palette, inputHSLs, neededColors);
          break;
        case 'luminanceSteps':
          this.addLuminanceStepColors(palette, inputHSLs, neededColors);
          break;
        case 'saturationPlay':
          this.addSaturationPlayColors(palette, inputHSLs, neededColors);
          break;
      }
  
      return palette;
    }
  
    // Golden ratio-based hue relationships
    private addGoldenRatioColors(palette: string[], baseHSLs: HSL[], count: number): void {
      const goldenAngle = 137.508; // Golden angle in degrees
      
      for (let i = 0; i < count; i++) {
        const baseColor = baseHSLs[i % baseHSLs.length];
        const hueShift = (goldenAngle * (i + 1) + this.rng() * 30 - 15) % 360;
        
        // Create variations in saturation and lightness
        const saturationVariation = (this.rng() - 0.5) * 40;
        const lightnessVariation = (this.rng() - 0.5) * 30;
        
        const newColor: HSL = {
          h: (baseColor.h + hueShift) % 360,
          s: Math.max(10, Math.min(90, baseColor.s + saturationVariation)),
          l: Math.max(15, Math.min(85, baseColor.l + lightnessVariation))
        };
        
        palette.push(this.hslToHex(newColor));
      }
    }
  
    // Flow through perceptual color space
    private addPerceptualFlowColors(palette: string[], baseHSLs: HSL[], count: number): void {
      const steps = count + 1;
      
      for (let i = 1; i <= count; i++) {
        const progress = i / steps;
        const baseA = baseHSLs[0];
        const baseB = baseHSLs[baseHSLs.length - 1];
        
        // Create a curved path through color space
        const curveFactor = Math.sin(progress * Math.PI);
        const hueFlow = (baseA.h + (baseB.h - baseA.h) * progress + curveFactor * 60) % 360;
        
        const newColor: HSL = {
          h: hueFlow,
          s: baseA.s + (baseB.s - baseA.s) * progress + (this.rng() - 0.5) * 20,
          l: baseA.l + (baseB.l - baseA.l) * progress + (this.rng() - 0.5) * 15
        };
        
        newColor.s = Math.max(10, Math.min(90, newColor.s));
        newColor.l = Math.max(15, Math.min(85, newColor.l));
        
        palette.push(this.hslToHex(newColor));
      }
    }
  
    // Alternating contrast waves
    private addContrastWaveColors(palette: string[], baseHSLs: HSL[], count: number): void {
      for (let i = 0; i < count; i++) {
        const baseColor = baseHSLs[i % baseHSLs.length];
        const wavePhase = (i / count) * Math.PI * 2;
        
        // Create contrasting relationships with wave patterns
        const hueWave = Math.sin(wavePhase) * 180;
        const satWave = Math.cos(wavePhase * 1.5) * 30;
        const lightWave = Math.sin(wavePhase * 0.7) * 25;
        
        const newColor: HSL = {
          h: (baseColor.h + hueWave + this.rng() * 40 - 20) % 360,
          s: Math.max(15, Math.min(85, baseColor.s + satWave)),
          l: Math.max(20, Math.min(80, baseColor.l + lightWave))
        };
        
        palette.push(this.hslToHex(newColor));
      }
    }
  
    // Chromatic drift with organic variations
    private addChromaticDriftColors(palette: string[], baseHSLs: HSL[], count: number): void {
      let currentHue = baseHSLs[0].h;
      const drift = 15 + this.rng() * 25; // Drift amount per step
      
      for (let i = 0; i < count; i++) {
        currentHue = (currentHue + drift + (this.rng() - 0.5) * 20) % 360;
        
        const baseColor = baseHSLs[i % baseHSLs.length];
        
        const newColor: HSL = {
          h: currentHue,
          s: Math.max(20, Math.min(80, baseColor.s + (this.rng() - 0.5) * 30)),
          l: Math.max(25, Math.min(75, baseColor.l + (this.rng() - 0.5) * 20))
        };
        
        palette.push(this.hslToHex(newColor));
      }
    }
  
    // Stepped luminance with hue variations
    private addLuminanceStepColors(palette: string[], baseHSLs: HSL[], count: number): void {
      // const avgLightness = baseHSLs.reduce((sum, hsl) => sum + hsl.l, 0) / baseHSLs.length;
      const stepSize = (85 - 15) / (count + 1);
      
      for (let i = 0; i < count; i++) {
        const targetLightness = 15 + (i + 1) * stepSize;
        const baseColor = baseHSLs[i % baseHSLs.length];
        
        const newColor: HSL = {
          h: (baseColor.h + (this.rng() - 0.5) * 60) % 360,
          s: Math.max(20, Math.min(80, baseColor.s + (this.rng() - 0.5) * 25)),
          l: targetLightness
        };
        
        palette.push(this.hslToHex(newColor));
      }
    }
  
    // Saturation play with complementary hints
    private addSaturationPlayColors(palette: string[], baseHSLs: HSL[], count: number): void {
      for (let i = 0; i < count; i++) {
        const baseColor = baseHSLs[i % baseHSLs.length];
        
        // Play with saturation levels and add subtle complementary hints
        const saturationLevels = [15, 45, 75];
        const targetSat = saturationLevels[i % saturationLevels.length];
        
        const hueShift = i % 2 === 0 ? 
          (this.rng() - 0.5) * 30 : // Analogous
          180 + (this.rng() - 0.5) * 60; // Complementary-ish
        
        const newColor: HSL = {
          h: (baseColor.h + hueShift) % 360,
          s: targetSat + (this.rng() - 0.5) * 15,
          l: Math.max(20, Math.min(80, baseColor.l + (this.rng() - 0.5) * 25))
        };
        
        newColor.s = Math.max(10, Math.min(90, newColor.s));
        
        palette.push(this.hslToHex(newColor));
      }
    }
  }
  
  // Usage examples and utility functions
  export function generateBeautifulPalette(options: PaletteOptions): string[] {
    const generator = new PaletteGenerator(options.seed);
    return generator.generatePalette(options);
  }
  
  // Example usage:
  export function exampleUsage() {
    // Generate a 5-color palette with one locked color
    const palette1 = generateBeautifulPalette({
      inputColors: ['#FF6B6B'],
      totalColors: 5
    });
    
    console.log('Palette 1:', palette1);
    
    // Generate a 7-color palette with two locked colors
    const palette2 = generateBeautifulPalette({
      inputColors: ['#4ECDC4', '#FFE66D'],
      totalColors: 7,
      seed: 12345 // For reproducible results
    });
    
    console.log('Palette 2:', palette2);
    
    // Generate a 4-color palette with three locked colors
    const palette3 = generateBeautifulPalette({
      inputColors: ['#A8E6CF', '#FF8B94', '#C7CEEA'],
      totalColors: 6
    });
    
    console.log('Palette 3:', palette3);
    
    return { palette1, palette2, palette3 };
  }