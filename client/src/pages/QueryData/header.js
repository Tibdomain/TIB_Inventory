import React, { useState } from 'react';

const ComponentDropdown = ({ selectedComponent, onComponentChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const components = [
    { value: 'Mosfet', label: 'Mosfet' },
    { value: 'Capacitor', label: 'Capacitor' },
    { value: 'Diode', label: 'Diode' },
    { value: 'Microcontroller', label: 'Microcontroller' },
    { value: 'Power_IC', label: 'Power IC' },
    { value: 'Resistor', label: 'Resistor' }
  ];


  
  const handleSelect = (value) => {
    onComponentChange({ target: { value } });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-4 bg-white px-6 py-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-right">
          <div className="text-sm font-medium text-gray-500">Selected Component</div>
          <div className="text-lg font-bold text-blue-600">{selectedComponent || 'None'}</div>
        </div>
        <div className={`bg-blue-50 p-2 rounded-full transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="py-2">
            {components.map((component) => (
              <div
                key={component.value}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 text-gray-700 hover:text-blue-600"
                onClick={() => handleSelect(component.value)}
              >
                {component.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentDropdown;

