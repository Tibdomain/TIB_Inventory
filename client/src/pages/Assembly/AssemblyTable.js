import React, { useState } from 'react';

const AssemblyTable = ({ assemblyData, selectedAssemblyQuantity }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Order status priority
  const statusOrder = {
    'PENDING': 0,
    'SHIPPED_TO_EMS': 1,
    'IN_ASSEMBLY': 2,
    'ASSEMBLED': 3,
    'COMPLETED': 4
  };

  // Sort data by status
  const sortedData = [...assemblyData].sort((a, b) => {
    return statusOrder[a.status || 'PENDING'] - statusOrder[b.status || 'PENDING'];
  });

  const getTrackingStatus = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SHIPPED_TO_EMS: 'bg-purple-100 text-purple-800 border-purple-200',
      IN_ASSEMBLY: 'bg-blue-100 text-blue-800 border-blue-200',
      ASSEMBLED: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200'
    };

    const statusLabels = {
      PENDING: 'Pending',
      SHIPPED_TO_EMS: 'Shipped to EMS',
      IN_ASSEMBLY: 'Assembling',
      ASSEMBLED: 'Assembled',
      COMPLETED: 'Completed'
    };

    return (
      <div className="flex items-center space-x-4">
        <div className={`px-3 py-1 rounded-full border ${statusColors[status]} text-xs font-medium`}>
          {statusLabels[status] || status.replace(/_/g, ' ')}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status === 'PENDING' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${status === 'SHIPPED_TO_EMS' ? 'bg-purple-400 animate-pulse' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${status === 'IN_ASSEMBLY' ? 'bg-blue-400 animate-pulse' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${status === 'ASSEMBLED' ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Device</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Required</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fetch Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leftover</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(index)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.component}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantity_per_device}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantity_per_device * selectedAssemblyQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.fetch_stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.leftover_stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {expandedRows.has(index) ? 'Hide Details' : 'Show Details'}
                </td>
              </tr>
              {expandedRows.has(index) && (
                <tr>
                  <td colSpan="8" className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Inventory Details</h4>
                        <div className="space-y-2 text-sm">
                          <p>Initial Stock: {item.available}</p>
                          <p>Current Stock: {item.available - item.fetch_stock}</p>
                          <p>Reserved: {item.fetch_stock}</p>
                          <p>Leftover: {item.leftover_stock}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Assembly Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <p>Components Reserved: {new Date().toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <p>Assembly Started: {new Date().toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <p>Expected Completion: {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssemblyTable;