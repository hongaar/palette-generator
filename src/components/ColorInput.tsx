import React from 'react';
import { colord } from 'colord';

interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ colors, onChange }) => {
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    onChange(newColors);
  };

  const addColor = () => {
    onChange([...colors, '#3182ce']);
  };

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      onChange(newColors);
    }
  };

  const isValidColor = (color: string) => {
    try {
      colord(color);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="section">
      <h3 className="sectionTitle">Base Colors</h3>
      <div className="colorInputs">
        {colors.map((color, index) => (
          <div key={index} className="colorInputRow">
            <div
              className="colorPreview"
              style={{
                backgroundColor: isValidColor(color) ? color : '#ccc'
              }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              placeholder="Enter hex color (e.g., #3182ce)"
              className={`input ${!isValidColor(color) ? 'invalid' : ''}`}
            />
            <button
              className="button danger"
              onClick={() => removeColor(index)}
              disabled={colors.length === 1}
              title="Remove color"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="button"
          onClick={addColor}
          style={{ alignSelf: 'flex-start' }}
        >
          + Add Color
        </button>
      </div>
    </div>
  );
};