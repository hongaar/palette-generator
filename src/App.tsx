import { useState, useEffect } from 'react';
import { ColorInput } from './components/ColorInput';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { HSLControls } from './components/HSLControls';
import { PaletteDisplay } from './components/PaletteDisplay';
import { PaletteActions } from './components/PaletteActions';
import { generatePalette, decodeConfigFromUrl } from './paletteUtils';
import type { PaletteConfig, HSLParameters } from './types';

function App() {
  const [config, setConfig] = useState<PaletteConfig>({
    baseColors: ['#3182ce'],
    colorCount: 8,
    algorithm: 'complementary',
    hslParams: {
      hueShift: 0,
      saturationShift: 0,
      lightnessShift: 0,
    },
  });

  const [generatedColors, setGeneratedColors] = useState<string[]>([]);

  // Load configuration from URL on component mount
  useEffect(() => {
    const urlConfig = decodeConfigFromUrl();
    if (urlConfig) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        ...urlConfig,
      }));
    }
  }, []);

  // Generate palette whenever configuration changes
  useEffect(() => {
    try {
      const colors = generatePalette(config);
      setGeneratedColors(colors);
    } catch (error) {
      console.error('Error generating palette:', error);
      setGeneratedColors([]);
    }
  }, [config]);

  const updateConfig = (updates: Partial<PaletteConfig>) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...updates,
    }));
  };

  const updateHSLParams = (hslParams: HSLParameters) => {
    updateConfig({ hslParams });
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="title">Color Palette Generator</h1>
          <p className="subtitle">
            Generate beautiful color palettes using various algorithms and real-time adjustments
          </p>
        </div>

        {/* Main Content */}
        <div className="mainGrid">
          {/* Controls Panel */}
          <div className="panel">
            <ColorInput
              colors={config.baseColors}
              onChange={(colors) => updateConfig({ baseColors: colors })}
            />
            
            <hr className="divider" />
            
            <AlgorithmSelector
              algorithm={config.algorithm}
              colorCount={config.colorCount}
              onAlgorithmChange={(algorithm) => updateConfig({ algorithm })}
              onColorCountChange={(colorCount) => updateConfig({ colorCount })}
            />
            
            <hr className="divider" />
            
            <HSLControls
              parameters={config.hslParams}
              onChange={updateHSLParams}
            />
            
            <hr className="divider" />
            
            <PaletteActions
              config={config}
              onNewPalette={setGeneratedColors}
            />
          </div>

          {/* Palette Display */}
          <div className="panel">
            <PaletteDisplay colors={generatedColors} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
