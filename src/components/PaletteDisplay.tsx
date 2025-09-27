import React, { useState } from 'react';
import { colord } from 'colord';
import { useToast } from '../hooks/useToast';

interface PaletteDisplayProps {
  colors: string[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      showToast(`${color} copied to clipboard`, 'success');
      setTimeout(() => setCopiedColor(null), 2000);
    } catch {
      showToast('Failed to copy color', 'error');
    }
  };

  const getContrastColor = (backgroundColor: string) => {
    try {
      const color = colord(backgroundColor);
      return color.isLight() ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  };

  if (!colors.length) {
    return (
      <>
        <div className="section">
          <h3 className="sectionTitle">Generated Palette</h3>
          <div className="emptyState">
            <p>No colors to display. Add a base color to get started!</p>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <div className="section">
        <h3 className="sectionTitle">Generated Palette</h3>
        <div className="paletteGrid">
          {colors.map((color, index) => (
            <div
              key={`${color}-${index}`}
              className="colorCard"
              onClick={() => copyToClipboard(color)}
            >
              <div
                className="colorSwatch"
                style={{ backgroundColor: color }}
              >
                <button
                  className={`copyButton ${copiedColor === color ? 'copied' : ''}`}
                  style={{ color: getContrastColor(color) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(color);
                  }}
                  title="Copy color"
                >
                  {copiedColor === color ? '✓' : '📋'}
                </button>
              </div>
              <div className="colorInfo">
                <div className="colorHex">{color.toUpperCase()}</div>
                <div className="colorHsl">
                  {(() => {
                    try {
                      const hsl = colord(color).toHsl();
                      return `HSL: ${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;
                    } catch {
                      return 'Invalid';
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};