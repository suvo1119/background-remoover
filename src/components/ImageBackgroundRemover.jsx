import React, { useState } from 'react';
import BackgroundColorChanger from './BackgroundColorChanger';
import useImageHistory from '../hooks/useImageHistory';

const ImageBackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Use history hook
  const {
    currentState: editedImage,
    addToHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    historyLength,
    currentIndex
  } = useImageHistory();

  const getApiKey = () => {
    const envKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (envKey && envKey !== 'your_actual_key_here') {
      return envKey;
    }
    return null;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setProcessedImage(null);
      clearHistory();
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    if (!originalImage) return;

    setLoading(true);
    setError('');

    try {
      const REMOVE_BG_API_KEY = getApiKey();

      if (!REMOVE_BG_API_KEY) {
        throw new Error('Remove.bg API key not found. Please check your .env file');
      }

      const response = await fetch(originalImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image_file', blob);

      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        let errorMessage = 'Failed to remove background';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.errors?.[0]?.title || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${apiResponse.status}: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const resultBlob = await apiResponse.blob();
      const processedImageUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(processedImageUrl);
      addToHistory(processedImageUrl);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to update the edited image with history
  const handleImageUpdate = (updatedImage) => {
    addToHistory(updatedImage);
  };

  // Function to handle download
  const handleDownloadEdited = (imageData, filename) => {
    const link = document.createElement('a');
    link.href = imageData || editedImage;
    link.download = filename || 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle undo/redo
  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const resetImages = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    clearHistory();
    setError('');
  };

  const displayImage = editedImage || processedImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Background Remover & Editor
          </h1>
          <p className="text-lg text-gray-600">
            Remove backgrounds and change colors with full edit history
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-lg font-medium text-gray-600">
                    {originalImage ? 'Change Image' : 'Click to upload an image'}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    PNG, JPG, JPEG up to 5MB
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* History Controls */}
          {displayImage && historyLength > 1 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Edit History:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        canUndo
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ↶ Undo
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        canRedo
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ↷ Redo
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Step {currentIndex + 1} of {historyLength}
                </div>
              </div>
              
              {/* History Timeline */}
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${((currentIndex + 1) / historyLength) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Images Preview */}
          {(originalImage || displayImage) && (
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Original Image */}
                {originalImage && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Original Image
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-64 object-contain bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Processed/Edited Image */}
                {displayImage && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      {editedImage !== processedImage ? 'Edited Image' : 'Background Removed'}
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={displayImage}
                        alt="Processed"
                        className="w-full h-64 object-contain"
                      />
                    </div>
                    {editedImage !== processedImage && (
                      <p className="text-sm text-green-600 mt-2 text-center">
                        ✓ Edited ({currentIndex + 1}/{historyLength})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {originalImage && !processedImage && !loading && (
              <button
                onClick={removeBackground}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Remove Background
              </button>
            )}

            {loading && (
              <button
                disabled
                className="px-6 py-3 bg-indigo-400 text-white rounded-lg font-medium cursor-not-allowed"
              >
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Removing Background...
                </div>
              </button>
            )}

            {processedImage && (
              <button
                onClick={resetImages}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Process Another Image
              </button>
            )}
          </div>

          {/* BACKGROUND COLOR CHANGER COMPONENT */}
          {processedImage && (
            <BackgroundColorChanger 
              processedImage={processedImage}
              editedImage={editedImage}
              onImageUpdate={handleImageUpdate}
              onDownload={handleDownloadEdited}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBackgroundRemover;