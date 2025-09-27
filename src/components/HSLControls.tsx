import React from 'react';
import type { HSLParameters } from '../types';

interface HSLControlsProps {
  parameters: HSLParameters;
  onChange: (parameters: HSLParameters) => void;
}

export const HSLControls: React.FC<HSLControlsProps> = ({
  parameters,
  onChange,
}) => {
  const handleChange = (key: keyof HSLParameters, value: number) => {
    onChange({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="section">
      <h3 className="sectionTitle">HSL Adjustments</h3>
      
      <div className="sliderContainer">
        <div className="sliderHeader">
          <label className="sliderLabel">Hue Shift</label>
          <span className="sliderValue">{parameters.hueShift}°</span>
        </div>
        <input
          type="range"
          className="slider"
          min={-180}
          max={180}
          step={1}
          value={parameters.hueShift}
          onChange={(e) => handleChange('hueShift', parseInt(e.target.value))}
        />
      </div>

      <div className="sliderContainer">
        <div className="sliderHeader">
          <label className="sliderLabel">Saturation Shift</label>
          <span className="sliderValue">{parameters.saturationShift}%</span>
        </div>
        <input
          type="range"
          className="slider"
          min={-100}
          max={100}
          step={1}
          value={parameters.saturationShift}
          onChange={(e) => handleChange('saturationShift', parseInt(e.target.value))}
        />
      </div>

      <div className="sliderContainer">
        <div className="sliderHeader">
          <label className="sliderLabel">Lightness Shift</label>
          <span className="sliderValue">{parameters.lightnessShift}%</span>
        </div>
        <input
          type="range"
          className="slider"
          min={-100}
          max={100}
          step={1}
          value={parameters.lightnessShift}
          onChange={(e) => handleChange('lightnessShift', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};