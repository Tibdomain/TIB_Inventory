import React, { useState } from 'react';
import { AlertCircle, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';


// Since shadcn/ui alert isn't available, let's create a simple Alert component
const Alert = ({ children, className, onClose }) => (
  <div className={`relative rounded-lg border p-4 ${className}`}>
    {onClose && (
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>
    )}
    {children}
  </div>
);

const AlertTitle = ({ children, className }) => (
  <h5 className={`font-medium mb-1 ${className}`}>{children}</h5>
);

const AlertDescription = ({ children, className }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);

const InventoryNotifications = ({ criticalComponents, shortageAlerts }) => {
  const [showCriticalDetails, setShowCriticalDetails] = useState(false);
  const [showShortageDetails, setShowShortageDetails] = useState(false);
  const [showCriticalAlert, setShowCriticalAlert] = useState(true);
  const [showShortageAlert, setShowShortageAlert] = useState(true);

  const formatQuantity = (qty) => qty?.toLocaleString() || '0';

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Critical Components Alert */}
        {showCriticalAlert && criticalComponents.length > 0 && (
          <Alert className="bg-red-50 border-red-200" onClose={() => setShowCriticalAlert(false)}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <AlertTitle className="text-red-900">
                    Critical Inventory Alert
                  </AlertTitle>
                  <button
                    onClick={() => setShowCriticalDetails(!showCriticalDetails)}
                    className="text-red-700 hover:text-red-900 flex items-center gap-1"
                  >
                    {showCriticalDetails ? (
                      <>
                        Hide Details
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show Details
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                <AlertDescription>
                  <div className="text-red-800">
                    {criticalComponents.length} component{criticalComponents.length > 1 ? 's' : ''} below critical threshold
                  </div>
                  
                  {showCriticalDetails && (
                    <div className="mt-4 bg-white rounded-lg border border-red-200 divide-y divide-red-100">
                      {criticalComponents.map((component, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-red-900">
                              {component.component_type}: {component.Description}
                            </div>
                            <div className="text-sm text-red-700">
                              Location: {component.Location}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                              Quantity: {formatQuantity(component.Quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Shortage Alerts */}
        {showShortageAlert && shortageAlerts.length > 0 && (
          <Alert className="bg-yellow-50 border-yellow-200" onClose={() => setShowShortageAlert(false)}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <AlertTitle className="text-yellow-900">
                    Inventory Shortage Warning
                  </AlertTitle>
                  <button
                    onClick={() => setShowShortageDetails(!showShortageDetails)}
                    className="text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
                  >
                    {showShortageDetails ? (
                      <>
                        Hide Details
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show Details
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                <AlertDescription>
                  <div className="text-yellow-800">
                    {shortageAlerts.length} component{shortageAlerts.length > 1 ? 's' : ''} with insufficient stock for assembly
                  </div>
                  
                  {showShortageDetails && (
                    <div className="mt-4 bg-white rounded-lg border border-yellow-200 divide-y divide-yellow-100">
                      {shortageAlerts.map((shortage, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-yellow-900">
                              {shortage.component}: {shortage.description}
                            </div>
                            <div className="text-sm text-yellow-700">
                              Required: {formatQuantity(shortage.required)} | Available: {formatQuantity(shortage.available)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium
                              ${shortage.status === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {shortage.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default InventoryNotifications;

