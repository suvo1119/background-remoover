import React, { useState } from 'react';

const ImageBackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    if (!originalImage) return;

    setLoading(true);
    setError('');

    try {
      // Convert base64 to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image_file', blob);

      const REMOVE_BG_API_KEY = import.meta.env.VITE_REMOVE_BG_API_KEY;

      if (!REMOVE_BG_API_KEY) {
        throw new Error('Remove.bg API key not found. Please check your .env file');
      }

      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.errors?.[0]?.title || 'Failed to remove background');
      }

      const resultBlob = await apiResponse.blob();
      const processedImageUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(processedImageUrl);
      
    } catch (err) {
      setError(err.message || 'Failed to remove background. Please try again.');
      console.error('Background removal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImages = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Background Remover
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image and remove the background automatically
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

          {/* Images Preview */}
          {(originalImage || processedImage) && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                {/* Processed Image */}
                {processedImage && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Background Removed
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-64 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              <>
                <button
                  onClick={downloadImage}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Download Image
                </button>
                <button
                  onClick={resetImages}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Process Another
                </button>
              </>
            )}
          </div>

          {/* Info Section */}
          {!import.meta.env.VITE_REMOVE_BG_API_KEY && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Setup Required:</h4>
              <p className="text-sm text-yellow-700">
                1. Get a free API key from <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline">remove.bg</a><br/>
                2. Add <code className="bg-yellow-100 px-1 rounded">VITE_REMOVE_BG_API_KEY=your_key_here</code> to your .env file<br/>
                3. Restart the development server
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBackgroundRemover;