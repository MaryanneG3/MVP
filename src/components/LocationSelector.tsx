import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface LocationSelectorProps {
  userLocation: string;
  onLocationChange: (location: string) => void;
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
  'Westgate, Auckland'
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  userLocation,
  onLocationChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 lg:space-x-2 text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
        <span className="text-xs lg:text-sm font-medium hidden sm:inline truncate max-w-32 lg:max-w-none">
          {userLocation}
        </span>
        <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 text-sm lg:text-base">Select Your Location</h3>
              <p className="text-xs lg:text-sm text-gray-600">Choose your area to see nearby stores</p>
            </div>
            <div className="max-h-48 lg:max-h-64 overflow-y-auto">
              {aucklandAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => {
                    onLocationChange(area);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs lg:text-sm hover:bg-gray-50 transition-colors ${
                    userLocation === area ? 'bg-green-50 text-green-600' : 'text-gray-700'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};