// Component to show data freshness and scraping status
import React from 'react';
import { Clock, Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface DataStatusIndicatorProps {
  lastUpdated: string | null;
  totalStores: number;
  activeScrapers: string[];
  nextUpdate: string;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  lastUpdated,
  totalStores,
  activeScrapers,
  nextUpdate,
  onRefresh,
  isRefreshing
}) => {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just updated';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getDataFreshness = () => {
    if (!lastUpdated) return 'unknown';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 6) return 'fresh';
    if (diffInHours < 24) return 'good';
    if (diffInHours < 48) return 'stale';
    return 'outdated';
  };

  const freshness = getDataFreshness();
  
  const statusColors = {
    fresh: 'text-green-600 bg-green-50 border-green-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    stale: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    outdated: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const statusIcons = {
    fresh: CheckCircle,
    good: CheckCircle,
    stale: AlertCircle,
    outdated: AlertCircle,
    unknown: AlertCircle
  };

  const StatusIcon = statusIcons[freshness];

  return (
    <div className={`border rounded-lg p-3 lg:p-4 ${statusColors[freshness]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-4 w-4" />
          <span className="font-medium text-sm lg:text-base">Live Data Status</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3 text-xs lg:text-sm">
        <div className="flex items-center space-x-1">
          <Database className="h-3 w-3" />
          <span>{totalStores.toLocaleString()} stores</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>{lastUpdated ? formatLastUpdated(lastUpdated) : 'Unknown'}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <RefreshCw className="h-3 w-3" />
          <span>{activeScrapers.length} scrapers active</span>
        </div>
      </div>
      
      {freshness === 'outdated' && (
        <div className="mt-2 text-xs">
          <p>Data may be outdated. Consider refreshing for the latest information.</p>
        </div>
      )}
    </div>
  );
};