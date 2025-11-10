import React, { useState, useRef, useEffect } from 'react';

const BackgroundColorChanger = ({ processedImage, onImageUpdate, onDownload }) => {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageWithBackground, setImageWithBackground] = useState(processedImage);
  const canvasRef = useRef(null);

  // Predefined color options
  const colorOptions = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ff69b4', '#40e0d0', '#d2691e', '#2e8b57', '#daa520',
    '#transparent' // Special option for transparent background
  ];

  // Update when processedImage changes
  useEffect(() => {
    setImageWithBackground(processedImage);
  }, [processedImage]);

  const applyBackgroundColor = (color = backgroundColor) => {
    if (!processedImage) return;

    // If transparent, return original processed image
    if (color === '#transparent') {
      setImageWithBackground(processedImage);
      if (onImageUpdate) {
        onImageUpdate(processedImage);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill with selected background color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the transparent image on top
      ctx.drawImage(img, 0, 0);

      // Convert to data URL and update state
      const newImageWithBackground = canvas.toDataURL('image/png');
      setImageWithBackground(newImageWithBackground);
      
      if (onImageUpdate) {
        onImageUpdate(newImageWithBackground);
      }
    };

    img.src = processedImage;
  };

  const handleColorChange = (color) => {
    setBackgroundColor(color);
    setShowColorPicker(false);
    applyBackgroundColor(color);
  };

  const handleDownload = () => {
    if (onDownload) {
      const filename = backgroundColor === '#transparent' 
        ? 'transparent-background.png' 
        : `background-${backgroundColor.replace('#', '')}.png`;
      onDownload(imageWithBackground, filename);
    }
  };

  const getDisplayColor = (color) => {
    if (color === '#transparent') {
      return 'conic-gradient(#ccc 25%, #999 25%, #999 50%, #ccc 50%, #ccc 75%, #999 75%)';
    }
    return color;
  };

  if (!processedImage) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">🎨 Change Background Color</h3>
      
      {/* Color Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">
            Select Background Color:
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm flex items-center justify-center"
                style={{ 
                  background: backgroundColor === '#transparent' 
                    ? 'conic-gradient(#ccc 25%, #999 25%, #999 50%, #ccc 50%, #ccc 75%, #999 75%)'
                    : backgroundColor 
                }}
                title={backgroundColor === '#transparent' ? 'Transparent' : backgroundColor}
              >
                {backgroundColor === '#transparent' && (
                  <span className="text-xs font-bold text-gray-600">T</span>
                )}
              </button>
              
              {showColorPicker && (
                <div className="absolute top-12 right-0 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-10 w-64">
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          backgroundColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        } hover:scale-105 transition-all flex items-center justify-center`}
                        style={{ 
                          background: color === '#transparent' 
                            ? 'conic-gradient(#ccc 25%, #999 25%, #999 50%, #ccc 50%, #ccc 75%, #999 75%)'
                            : color 
                        }}
                        title={color === '#transparent' ? 'Transparent' : color}
                      >
                        {color === '#transparent' && (
                          <span className="text-xs font-bold text-gray-600">T</span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 border-t border-gray-200 pt-3">
                    <input
                      type="color"
                      value={backgroundColor === '#transparent' ? '#ffffff' : backgroundColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 cursor-pointer rounded"
                    />
                    <span className="text-sm text-gray-600 flex-1">Custom Color</span>
                    <button
                      onClick={() => handleColorChange('#transparent')}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Transparent
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {backgroundColor === '#transparent' ? 'Transparent' : backgroundColor.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quick Color Palette */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Colors:</h4>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded border-2 ${
                  backgroundColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                } hover:scale-105 transition-all flex items-center justify-center`}
                style={{ 
                  background: color === '#transparent' 
                    ? 'conic-gradient(#ccc 25%, #999 25%, #999 50%, #ccc 50%, #ccc 75%, #999 75%)'
                    : color 
                }}
                title={color === '#transparent' ? 'Transparent' : color}
              >
                {color === '#transparent' && (
                  <span className="text-xs font-bold text-gray-600">T</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4">
          <img
            src={imageWithBackground}
            alt="With background"
            className="max-w-full max-h-64 mx-auto object-contain"
            style={{ 
              backgroundColor: backgroundColor === '#transparent' ? 'transparent' : backgroundColor 
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => applyBackgroundColor()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Apply Background
        </button>
        
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
        >
          Download Edited Image
        </button>

        <button
          onClick={() => handleColorChange('#transparent')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
        >
          Reset to Transparent
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> The image will maintain its transparency when downloaded. 
          Choose "Transparent" to keep the original transparent background.
        </p>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default BackgroundColorChanger;