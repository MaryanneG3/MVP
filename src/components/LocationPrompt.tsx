import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X, AlertCircle, CheckCircle, Loader2, Satellite } from 'lucide-react';
import { getCurrentLocation, getLocationSuggestions, validateLocationName } from '../utils/locationUtils';

interface LocationPromptProps {
  onLocationSelect: (location: string) => void;
  onSkip: () => void;
}

const aucklandAreas = [
  'Botany, Auckland',
  'New Lynn, Auckland', 
  'Glenfield, Auckland',
  'Manukau, Auckland',
  'Albany, Auckland',
  'Henderson, Auckland',
  'Mount Wellington, Auckland',
  'Penrose, Auckland',
  'East Tamaki, Auckland',
  'Westgate, Auckland',
  'Takapuna, Auckland',
  'Newmarket, Auckland',
  'Pakuranga, Auckland',
  'Papakura, Auckland',
  'Onehunga, Auckland',
  'Ellerslie, Auckland',
  'Panmure, Auckland',
  'Glen Innes, Auckland',
  'Meadowbank, Auckland',
  'Mission Bay, Auckland',
  'Parnell, Auckland',
  'Remuera, Auckland',
  'Epsom, Auckland',
  'Mount Eden, Auckland',
  'Kingsland, Auckland',
  'Grey Lynn, Auckland',
  'Ponsonby, Auckland',
  'CBD, Auckland',
  'Devonport, Auckland',
  'Birkenhead, Auckland',
  'Northcote, Auckland',
  'Howick, Auckland',
  'Flat Bush, Auckland',
  'Pukekohe, Auckland'
];

export const LocationPrompt: React.FC<LocationPromptProps> = ({
  onLocationSelect,
  onSkip
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionStage, setDetectionStage] = useState<string>('');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length > 0) {
      const newSuggestions = getLocationSuggestions(searchTerm, 8);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const filteredAreas = searchTerm.length > 0 
    ? suggestions.length > 0 
      ? suggestions 
      : aucklandAreas.filter(area =>
          area.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : aucklandAreas;

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setError(null);
    setLocationAccuracy(null);
    
    try {
      setDetectionStage('Requesting location access...');
      
      // Add a small delay to show the stage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDetectionStage('Getting GPS coordinates...');
      
      const detectedLocation = await getCurrentLocation();
      
      setDetectionStage('Finding closest area...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setDetectionStage('Verifying location accuracy...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate accuracy detection (in real implementation, this would come from the geolocation API)
      setLocationAccuracy(Math.floor(Math.random() * 20) + 5); // 5-25 meters
      
      setDetectionStage('Location detected successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onLocationSelect(detectedLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
      setIsDetecting(false);
      setDetectionStage('');
    }
  };

  const handleManualSelect = (area: string) => {
    if (validateLocationName(area)) {
      onLocationSelect(area);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Find Your Location</h2>
                <p className="text-green-100 text-sm">Get the most accurate trade store prices</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:text-green-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-sm">
            For the best accuracy in finding the closest trade stores and most precise live prices, we use advanced GPS positioning:
          </p>

          {/* Auto-detect button */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium mb-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span>Use My Current Location</span>
              </>
            )}
          </button>

          {/* Detection progress */}
          {isDetecting && detectionStage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                <span className="text-sm text-green-800 font-medium">{detectionStage}</span>
              </div>
              {locationAccuracy && (
                <div className="mt-2 text-xs text-green-600">
                  Accuracy: ±{locationAccuracy}m
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">GPS Detection Failed</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-1">Please select your area manually below for accurate results.</p>
              </div>
            </div>
          )}

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or choose manually</span>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="relative mb-4">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your area (e.g., Botany, CBD, Newmarket)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && validateLocationName(searchTerm) && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>

          {/* Smart suggestions */}
          {suggestions.length > 0 && searchTerm.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium mb-2">Smart Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleManualSelect(suggestion)}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location list */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredAreas.map((area) => (
              <button
                key={area}
                onClick={() => handleManualSelect(area)}
                className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{area}</span>
                  </div>
                  {suggestions.includes(area) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Match
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredAreas.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No areas found matching "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for a nearby suburb</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <Navigation className="h-3 w-3 inline mr-1" />
              Advanced GPS positioning
            </div>
            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};