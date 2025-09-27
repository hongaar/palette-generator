import React from 'react';
import type { GenerationAlgorithm } from '../types';

interface AlgorithmSelectorProps {
  algorithm: GenerationAlgorithm;
  colorCount: number;
  onAlgorithmChange: (algorithm: GenerationAlgorithm) => void;
  onColorCountChange: (count: number) => void;
}

const algorithmOptions = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'monochromatic', label: 'Monochromatic' },
  { value: 'split-complementary', label: 'Split Complementary' },
  { value: 'tetradic', label: 'Tetradic' },
] as const;

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithm,
  colorCount,
  onAlgorithmChange,
  onColorCountChange,
}) => {
  return (
    <div className="section">
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="algorithm" className="sectionTitle">Generation Algorithm</label>
        <select
          id="algorithm"
          className="select"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as GenerationAlgorithm)}
        >
          {algorithmOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="colorCount" className="sectionTitle">Number of Colors</label>
        <input
          id="colorCount"
          type="number"
          className="numberInput"
          value={colorCount}
          onChange={(e) => onColorCountChange(parseInt(e.target.value) || 2)}
          min={2}
          max={20}
        />
      </div>
    </div>
  );
};