import React from 'react';
import { AlertCircle, Box, CheckCircle, Clock, Truck, Factory } from 'lucide-react';

const AssemblyStatusTracker = ({ 
  currentStatus, 
  statusDates, 
  onUpdateStatus,
  disabled 
}) => {
  // Updated order of statuses
  const statuses = [
    { 
      id: 'PENDING',
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Assembly queued for processing'
    },
    { 
      id: 'SHIPPED_TO_EMS',
      label: 'Shipped to EMS',
      icon: Truck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Sent to external manufacturing'
    },
    { 
      id: 'IN_ASSEMBLY',
      label: 'Assembling',
      icon: Factory,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Components being assembled'
    },
    { 
      id: 'ASSEMBLED',
      label: 'Assembled',
      icon: Box,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Assembly completed'
    },
    { 
      id: 'COMPLETED',
      label: 'Completed',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Process completed'
    }
  ];

  const getCurrentStatusIndex = () => {
    return statuses.findIndex(status => status.id === currentStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assembly Status</h3>
            {currentStatus !== 'COMPLETED' && (
              <button
                onClick={() => {
                  const nextIndex = getCurrentStatusIndex() + 1;
                  if (nextIndex < statuses.length) {
                    onUpdateStatus(statuses[nextIndex].id);
                  }
                }}
                disabled={disabled}
                className={`
                  inline-flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${disabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                `}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Update Status
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Progress Bar Background - Full width */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
            
            {/* Progress Bar Fill - Full width calculation */}
            <div 
              className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
              style={{ 
                width: `${(getCurrentStatusIndex() / (statuses.length - 1)) * 100}%` 
              }} 
            />

            {/* Status Points */}
            <div className="relative z-10 flex justify-between px-4">
              {statuses.map((status, index) => {
                const StatusIcon = status.icon;
                const isActive = getCurrentStatusIndex() >= index;
                const isPast = getCurrentStatusIndex() > index;
                const hasDate = statusDates && statusDates[status.id];

                return (
                  <div key={status.id} className="flex flex-col items-center">
                    {/* Status Circle with improved visibility */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2
                        transition-all duration-200 
                        ${isActive 
                          ? `${status.bgColor} border-2 ${status.borderColor}` 
                          : 'bg-white border-gray-300'
                        }
                      `}
                    >
                      <StatusIcon 
                        className={`w-5 h-5 ${isActive ? status.color : 'text-gray-400'}`} 
                      />
                    </div>

                    {/* Label & Date with improved spacing */}
                    <div className="mt-3 text-center min-w-[100px]">
                      <p className={`
                        text-sm font-medium mb-1
                        ${isActive ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {status.label}
                      </p>
                      {hasDate && (
                        <p className="text-xs text-gray-500">
                          {new Date(statusDates[status.id]).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Status Description */}
          {currentStatus && (
            <div className={`
              flex items-center p-4 rounded-lg mt-4
              ${statuses.find(s => s.id === currentStatus)?.bgColor}
              ${statuses.find(s => s.id === currentStatus)?.borderColor}
              border
            `}>
              <AlertCircle className={`
                w-5 h-5 mr-3 
                ${statuses.find(s => s.id === currentStatus)?.color}
              `} />
              <p className="text-sm text-gray-700">
                {statuses.find(s => s.id === currentStatus)?.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssemblyStatusTracker;