import React, { useState } from 'react';
import type { PaletteConfig } from '../types';
import { encodeConfigToUrl, generatePalette } from '../paletteUtils';
import { useToast } from '../hooks/useToast';

interface PaletteActionsProps {
  config: PaletteConfig;
  onNewPalette: (colors: string[]) => void;
}

export const PaletteActions: React.FC<PaletteActionsProps> = ({
  config,
  onNewPalette,
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const generateShareUrl = () => {
    const url = encodeConfigToUrl(config);
    setShareUrl(url);
    
    // Update browser URL without page refresh
    window.history.replaceState({}, '', url);
    
    showToast('Share URL generated!', 'success');
  };

  const copyShareUrl = async () => {
    if (!shareUrl) {
      generateShareUrl();
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('URL copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  const regeneratePalette = async () => {
    setIsGenerating(true);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      try {
        const newColors = generatePalette(config);
        onNewPalette(newColors);
        
        showToast('New palette generated!', 'info');
      } catch {
        showToast('Failed to generate palette', 'error');
      } finally {
        setIsGenerating(false);
      }
    }, 300);
  };

  return (
    <>
      <div className="section">
        <h3 className="sectionTitle">Actions</h3>
        
        <div className="actionsContainer">
          <div className="actionsRow">
            <button
              className="button primary"
              onClick={regeneratePalette}
              disabled={isGenerating}
              style={{ flex: 1 }}
            >
              {isGenerating ? '🔄 Generating...' : '🔄 Generate New'}
            </button>
            
            <button
              className="button"
              onClick={generateShareUrl}
              style={{ flex: 1 }}
            >
              🔗 Get Share URL
            </button>
          </div>

          {shareUrl && (
            <div className="shareUrlContainer">
              <div className="shareUrlLabel">Share URL:</div>
              <div className="shareUrlInput">
                <input
                  type="text"
                  className="shareUrl"
                  value={shareUrl}
                  readOnly
                />
                <button
                  className="button"
                  onClick={copyShareUrl}
                  title="Copy URL"
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};