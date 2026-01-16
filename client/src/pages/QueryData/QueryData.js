import React, { useState, useEffect } from "react";
import axios from "axios";
import "./QueryData.css";

const ComponentDropdown = ({ selectedComponent, onComponentChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [componentTypes, setComponentTypes] = useState([]);

  // const components = [
  //     { value: 'Mosfet', label: 'Mosfet' },
  //     { value: 'Capacitor', label: 'Capacitor' },
  //     { value: 'Diode', label: 'Diode' },
  //     { value: 'Microcontroller', label: 'Microcontroller' },
  //     { value: 'Power_IC', label: 'Power IC' },
  //     { value: 'Resistor', label: 'Resistor' }
  // ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch component types (table names)
        const componentsResponse = await axios.get(
          "http://localhost:5000/api/componentTypes"
        );
        setComponentTypes(componentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (value) => {
    onComponentChange({ target: { value } });
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <div
          className="flex items-center space-x-4 bg-white px-6 py-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="text-right">
            <div className="text-sm font-medium text-gray-500">
              Selected Component
            </div>
            <div className="text-lg font-bold text-blue-600">
              {selectedComponent || "None"}
            </div>
          </div>
          <div
            className={`bg-blue-50 p-2 rounded-full transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
            <div className="py-2">
              {componentTypes.map((component) => (
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
    </>
  );
};

const QueryData = () => {
  const [queryData, setQueryData] = useState([]);
  const [filters, setFilters] = useState({
    ID: "",
    IPN: "",
    MFG_part_no: "",
    Package: "",
    Location: "", // Added Location filter
  });

  const tableHeaders = [
    "Sr No",
    "Internal Part No.",
    "Description",
    "Manufacturer",
    "MFG Part no",
    "Package",
    "Vendor Name",
    "Quantity",
    "Avg Price",
    "Location",
    "Status",
    "Timestamp",
  ];

  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("");

  const handleComponentChange = (e) => {
    setSelectedComponent(e.target.value);
    setFilters({
      ID: "",
      IPN: "",
      MFG_part_no: "",
      Package: "",
      Location: "", // Reset Location with other filters
    });
  };

  const handleClearButtonClick = () => {
    setFilters({
      ID: "",
      IPN: "",
      MFG_part_no: "",
      Package: "",
      Location: "", // Clear Location with other filters
    });
    fetchFilteredData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedComponent) {
        params.append("component", selectedComponent);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      const reqData = await fetch(`http://localhost:5000/api/query?${params}`);
      const resData = await reqData.json();
      setQueryData(resData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedComponent) {
      fetchFilteredData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedComponent]);

  return (
    <>
      <div className="query-main-container">
        <div className="query-content-wrapper">
          <div className="query-card">
            {/* <!-- Header Section --> */}
            <div className="query-header">
              <div className="header-left">
                <div className="icon-container">
                  <svg
                    className="plus-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                </div>
                <div className="header-text">
                  <h1 className="main-title">Component Inventory</h1>
                  <span className="gradient-text">Query System</span>
                  <p className="subtitle">
                    Search and manage electronic components inventory
                  </p>
                </div>
              </div>
              <ComponentDropdown
                selectedComponent={selectedComponent}
                onComponentChange={handleComponentChange}
              />
            </div>

            {/* <!-- Filters Section --> */}
            <div className="filters-grid">
              <input
                type="text"
                name="IPN"
                placeholder="Filter by IPN"
                value={filters.IPN}
                onChange={handleInputChange}
                className="filter-input"
              />
              <input
                type="text"
                name="MFG_part_no"
                placeholder="Filter by Manufacture Part No"
                value={filters.MFG_part_no}
                onChange={handleInputChange}
                className="filter-input"
              />
              <input
                type="text"
                name="Package"
                placeholder="Filter by Package"
                value={filters.Package}
                onChange={handleInputChange}
                className="filter-input"
              />
              <input
                type="text"
                name="Location"
                placeholder="Filter by Location"
                value={filters.Location}
                onChange={handleInputChange}
                className="filter-input"
              />
            </div>

            {/* <!-- Action Buttons --> */}
            <div className="action-buttons">
              <button className="btn-filter" onClick={fetchFilteredData}>
                Filter Results
              </button>
              <button className="btn-clear" onClick={handleClearButtonClick}>
                Clear Filters
              </button>
            </div>

            {/* <!-- Table Section --> */}
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th key={header} className="table-heading">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-body">
                  {loading ? (
                    <tr>
                      <td colSpan="12" className="loading-cell">
                        <div className="loading-spinner"></div>
                      </td>
                    </tr>
                  ) : queryData.length > 0 ? (
                    queryData.map((row, index) => (
                      <tr key={row.ID} className="table-row">
                        <td className="table-cell">{index + 1}</td>
                        <td className="table-cell">{row.IPN}</td>
                        <td className="table-cell">{row.Description}</td>
                        <td className="table-cell">{row.Mfg}</td>
                        <td className="table-cell">{row.MFG_part_no}</td>
                        <td className="table-cell">{row.Package}</td>
                        <td className="table-cell">{row.Vendor_Name}</td>
                        <td className="table-cell">{row.Quantity}</td>
                        <td className="table-cell">{row.Avg_Price}</td>
                        <td className="table-cell">{row.Location}</td>
                        <td className="table-cell">{row.Status}</td>
                        <td className="table-cell">{row.Timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="empty-message">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryData;
