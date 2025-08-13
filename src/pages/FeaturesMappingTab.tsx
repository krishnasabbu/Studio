// components/tabs/FeaturesMappingTab.tsx
import React from 'react';
import { ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface FeaturesMappingTabProps {
  allFeatures: string[];
  selectedFeatures: string[];
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  isViewing?: boolean;
}

const FeaturesMappingTab: React.FC<FeaturesMappingTabProps> = ({
  allFeatures,
  selectedFeatures,
  setSelectedFeatures,
  isViewing = false,
}) => {
  const availableFeatures = allFeatures.filter(
    (f) => !selectedFeatures.includes(f)
  );

  const moveFeature = (feature: string, direction: 'toSelected' | 'toAvailable') => {
    if (isViewing) return;
    setSelectedFeatures((prev) =>
      direction === 'toSelected'
        ? [...prev, feature]
        : prev.filter((f) => f !== feature)
    );
  };

  const moveAllFeatures = (direction: 'toSelected' | 'toAvailable') => {
    if (isViewing) return;
    setSelectedFeatures(direction === 'toSelected' ? [...allFeatures] : []);
  };

  return (
    <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
        Features Mapping
        {isViewing && (
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
            Read Only
          </span>
        )}
      </h3>

      <div className="grid grid-cols-12 gap-4">
        {/* Available Features */}
        <div className="col-span-5">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Available Features
          </h4>
          <div className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800 ${
            isViewing ? 'opacity-75' : ''
          }`}>
            {availableFeatures.map((feature) => (
              <div
                key={feature}
                className={`p-2 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded ${
                  isViewing ? 'cursor-default opacity-75' : 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => !isViewing && moveFeature(feature, 'toSelected')}
              >
                <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex flex-col justify-center space-y-2">
          <Button variant="outline" size="sm" onClick={() => moveAllFeatures('toSelected')} className="w-full border-primary-300 text-primary-600 hover:bg-primary-50">
            disabled={isViewing}
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = availableFeatures[0];
              if (next) moveFeature(next, 'toSelected');
            }}
            className="w-full border-primary-300 text-primary-600 hover:bg-primary-50"
            disabled={isViewing}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const last = selectedFeatures[selectedFeatures.length - 1];
              if (last) moveFeature(last, 'toAvailable');
            }}
            className="w-full border-primary-300 text-primary-600 hover:bg-primary-50"
            disabled={isViewing}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => moveAllFeatures('toAvailable')} className="w-full border-primary-300 text-primary-600 hover:bg-primary-50">
            disabled={isViewing}
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Features */}
        <div className="col-span-5">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Selected Features
          </h4>
          <div className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800 ${
            isViewing ? 'opacity-75' : ''
          }`}>
            {selectedFeatures.map((feature) => (
              <div
                key={feature}
                className={`p-2 mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded ${
                  isViewing ? 'cursor-default opacity-75' : 'cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                onClick={() => !isViewing && moveFeature(feature, 'toAvailable')}
              >
                <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300">
          Selected: {selectedFeatures.length} feature(s)
        </p>
      </div>
    </Card>
  );
};

export default FeaturesMappingTab;
