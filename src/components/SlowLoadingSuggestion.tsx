// Component to suggest using mock data when live data takes too long to load
import React from 'react';
import { Clock, Database, Zap, CheckCircle } from 'lucide-react';

interface SlowLoadingSuggestionProps {
  isVisible: boolean;
  loadingTime: number;
  dataType: 'stores' | 'products';
  onUseMockData: () => void;
  onDismiss?: () => void;
}

export const SlowLoadingSuggestion: React.FC<SlowLoadingSuggestionProps> = ({
  isVisible,
  loadingTime,
  dataType,
  onUseMockData,
  onDismiss
}) => {
  if (!isVisible) return null;

  const dataTypeText = dataType === 'stores' ? 'store locations' : 'product data';
  const mockDataDescription = dataType === 'stores' 
    ? '50+ real NZ trade store locations with accurate addresses, phone numbers, and GPS coordinates'
    : '25+ real products from major NZ trade stores with accurate pricing and descriptions';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Slow Loading Detected</h2>
              <p className="text-blue-100 text-sm">Live data is taking longer than expected</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Loading time: <span className="font-semibold">{loadingTime} seconds</span>
            </span>
          </div>

          <p className="text-gray-700 mb-4 text-sm">
            Live {dataTypeText} scraping is taking longer than usual. This could be due to:
          </p>

          <ul className="text-sm text-gray-600 mb-6 space-y-1">
            <li>• Heavy server load during peak hours</li>
            <li>• Slow network connection</li>
            <li>• Trade store websites being slow to respond</li>
            <li>• Complex data processing in progress</li>
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Use Comprehensive Mock Data</h3>
                <p className="text-sm text-green-700 mb-3">
                  {mockDataDescription}
                </p>
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Instant loading</span>
                  <CheckCircle className="h-3 w-3" />
                  <span>Real NZ data</span>
                  <CheckCircle className="h-3 w-3" />
                  <span>Full functionality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onUseMockData}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Use Mock Data Now</span>
            </button>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Keep Waiting
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You can always refresh to try live data again later
          </p>
        </div>
      </div>
    </div>
  );
};