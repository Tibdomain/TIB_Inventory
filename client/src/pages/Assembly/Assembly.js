import React, { useState, useEffect } from "react";
import { Loader2, Plus, Search, Trash2, FileUp } from "lucide-react";
import InventoryNotifications from "./InventoryNotifications";
import * as XLSX from "xlsx";
import axios from "axios";
import QuantityManagementForm from "./Quantity_track";
import AssemblyStatusTracker from "./AssemblyStatusTracker";
import AssemblyTable from "./AssemblyTable";

// Stock Warning Component

// Stock Status Badge Component
const StockStatusBadge = ({ available, required }) => {
  const availableQty = parseInt(available);
  const requiredQty = parseInt(required);

  if (isNaN(availableQty) || isNaN(requiredQty)) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
        <span className="text-xs font-medium text-gray-700">Unknown</span>
      </div>
    );
  }

  if (availableQty >= requiredQty) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-200">
        <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
        <span className="text-xs font-medium text-green-700">
          In Stock ({availableQty}/{requiredQty})
        </span>
      </div>
    );
  }

  if (availableQty > 0) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
        <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
        <span className="text-xs font-medium text-orange-700">
          Low Stock ({availableQty}/{requiredQty})
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-200">
      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse mr-2" />
      <span className="text-xs font-medium text-red-700">
        Out of Stock (0/{requiredQty})
      </span>
    </div>
  );
};

const Assembly = () => {
  const [assemblies, setAssemblies] = useState([]);
  const [selectedAssembly, setSelectedAssembly] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assemblyData, setAssemblyData] = useState([]);
  const [assemblyName, setAssemblyName] = useState("");
  const [shortageAlerts, setShortageAlerts] = useState([]);
  const [criticalComponents, setCriticalComponents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showQuantityForm, setShowQuantityForm] = useState(false);
  const [processedCsvData, setProcessedCsvData] = useState(null);

  const [statusDates, setStatusDates] = useState({});

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/assembly/${selectedAssembly}/status`,
        { status: newStatus }
      );
      setStatusDates(response.data.statusDates);
      await fetchAssemblies(); // Refresh assembly data
      setSuccess("Assembly status updated successfully");
    } catch (error) {
      setError("Failed to update assembly status");
    }
  };

  // New form-specific state
  const [newAssemblyQuantity, setNewAssemblyQuantity] = useState(1);

  // Separate state for selected assembly quantity
  const [selectedAssemblyQuantity, setSelectedAssemblyQuantity] = useState(1);

  useEffect(() => {
    fetchAssemblies();
    fetchCriticalInventory();
  }, []);

  const fetchStockStatus = async (assemblyName) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/assembly/stock-status/${assemblyName}`
      );
    } catch (error) {
      console.error("Failed to fetch stock status:", error);
      setError("Failed to fetch stock status");
    }
  };

  const fetchCriticalInventory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/critical-inventory"
      );
      setCriticalComponents(response.data);
    } catch (err) {
      console.error("Failed to fetch critical inventory:", err);
    }
  };

  // Modified fetch assemblies to include quantity_pcs
  const fetchAssemblies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/assemblies");
      setAssemblies(response.data);

      // If there's a selected assembly, update its quantity
      if (selectedAssembly) {
        const currentAssembly = response.data.find(
          (a) => a.assembly_name === selectedAssembly
        );
        if (currentAssembly) {
          setSelectedAssemblyQuantity(currentAssembly.quantity_pcs || 1);
        }
      }
    } catch (err) {
      setError("Failed to fetch assemblies");
    }
  };

  const handleDeleteAssembly = async (assemblyName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete assembly "${assemblyName}"? This will restock all components.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    try {
      // First get the assembly data to know what to restock
      const assemblyResponse = await axios.get(
        `http://localhost:5000/api/assembly/${assemblyName}`
      );
      const componentsToRestock = assemblyResponse.data;

      // Delete the assembly and restock components
      await axios.post("http://localhost:5000/api/assembly/delete", {
        assemblyName,
        components: componentsToRestock,
      });

      setSuccess(
        `Assembly "${assemblyName}" deleted and components restocked successfully`
      );
      setSelectedAssembly("");
      setAssemblyData([]);
      await fetchAssemblies();
      await fetchCriticalInventory();
    } catch (err) {
      setError(`Failed to delete assembly: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchComponentQuantity = async (componentType, description) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/query`, {
        params: {
          component: componentType,
          Description: description.trim(), // Ensure description is trimmed
        },
      });

      // Check if we got results and return the quantity
      if (response.data && response.data.length > 0) {
        return response.data[0].Quantity || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching component quantity:", error);
      return 0;
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (assemblies.length > 0) {
      const filtered = assemblies.filter((assembly) =>
        assembly.assembly_name.toLowerCase().includes(value.toLowerCase())
      );
      if (filtered.length > 0) {
        handleViewAssembly(filtered[0].assembly_name);
      }
    }
  };

  const checkInventoryLevels = async (components) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/assembly/check-inventory",
        {
          components,
        }
      );
      return response.data;
    } catch (err) {
      throw new Error("Failed to check inventory levels");
    }
  };

  // Modified to properly handle quantity from DB
  const handleViewAssembly = async (assemblyName) => {
    setSelectedAssembly(assemblyName);
    if (!assemblyName) {
      setAssemblyData([]);
      setSelectedAssemblyQuantity(1);
      return;
    }

    try {
      const [assemblyResponse, detailsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/assembly/${assemblyName}`),
        axios.get("http://localhost:5000/api/assemblies"),
      ]);

      const assemblyComponents = assemblyResponse.data;
      const assembliesList = detailsResponse.data;

      const selectedAssemblyDetails = assembliesList.find(
        (a) => a.assembly_name === assemblyName
      );
      if (selectedAssemblyDetails) {
        setSelectedAssemblyQuantity(selectedAssemblyDetails.quantity_pcs || 1);
      }

      const enrichedData = await Promise.all(
        assemblyComponents.map(async (component) => {
          const actualQuantity = await fetchComponentQuantity(
            component.component,
            component.description
          );

          return {
            ...component,
            available: actualQuantity,
            quantity_per_device:
              component.quantity_per_device || component.quantity,
            status: component.status || "PENDING",
            fetch_stock: component.fetch_stock || 0,
            leftover_stock: component.leftover_stock || 0,
          };
        })
      );

      setAssemblyData(enrichedData);
    } catch (err) {
      setError("Failed to fetch assembly details");
      setAssemblyData([]);
    }
  };

  // Modified to update quantity in DB
  const handleQuantityChange = async (newQuantity) => {
    try {
      await axios.put(
        `http://localhost:5000/api/assembly/${selectedAssembly}/quantity`,
        {
          quantity_pcs: newQuantity,
        }
      );

      setSelectedAssemblyQuantity(newQuantity);
      await fetchAssemblies(); // Refresh all assemblies to get updated data

      setSuccess("Assembly quantity updated successfully");
    } catch (err) {
      setError("Failed to update assembly quantity");
    }
  };

  const validateFile = (file) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      throw new Error("Please upload a CSV or Excel file");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size should be less than 5MB");
    }
    return true;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError("");
    try {
      if (file && validateFile(file)) {
        setCsvFile(file);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const processXLSXData = (buffer) => {
    console.log("Processing XLSX data");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(firstSheet);
    console.log("Parsed XLSX data:", data);

    const processedData = data
      .filter((row) => row.Description && row.Quantity)
      .map((row) => {
        const desc = String(row.Description).toLowerCase().trim();
        let componentType = "OTHER";

        if (desc.includes("cap")) componentType = "Capacitor";
        if (desc.includes("diode")) componentType = "Diode";
        if (desc.includes("mosfet")) componentType = "Mosfet";
        if (desc.includes("ic") || desc.includes("mcu"))
          componentType = "Microcontroller";
        if (desc.includes("power")) componentType = "Power_IC";

        const cleanDescription = String(row.Description)
          .replace(/^['"]|['"]$/g, "")
          .replace(/\s+/g, " ")
          .trim();

        return {
          component: componentType,
          description: cleanDescription,
          quantity: parseInt(row.Quantity) || 0,
        };
      })
      .filter((item) => item.quantity > 0);

    console.log("Final processed XLSX data:", processedData);
    return processedData;
  };

  const processCSVData = (csvText) => {
    console.log("Processing CSV data");
    const lines = csvText.split("\n");
    const headers = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim());
    console.log("CSV Headers:", headers);

    const data = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = line.split(",");
        return {
          Comment: values[0]?.trim() || "",
          Description: values[1]?.trim() || "",
          Quantity: values[5]?.trim() || "0",
        };
      });

    const processedData = data
      .filter((row) => row.Description && row.Quantity)
      .map((row) => {
        const desc = String(row.Description).toLowerCase().trim();
        let componentType = "OTHER";

        if (desc.includes("cap")) componentType = "Capacitor";
        if (desc.includes("diode")) componentType = "Diode";
        if (desc.includes("mosfet")) componentType = "Mosfet";
        if (desc.includes("ic") || desc.includes("mcu"))
          componentType = "Microcontroller";
        if (desc.includes("power")) componentType = "Power_IC";

        const cleanDescription = String(row.Description)
          .replace(/^['"]|['"]$/g, "")
          .replace(/\s+/g, " ")
          .trim();

        return {
          component: componentType,
          description: cleanDescription,
          quantity: parseInt(row.Quantity) || 0,
        };
      })
      .filter((item) => item.quantity > 0);

    console.log("Final processed CSV data:", processedData);
    return processedData;
  };

  // Modify your handleUpload function:
  const handleUpload = async () => {
    if (!csvFile || !assemblyName.trim()) {
      setError("Please select a file and enter an assembly name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          let processedData;
          const fileExtension = csvFile.name
            .toLowerCase()
            .substring(csvFile.name.lastIndexOf("."));

          if (fileExtension === ".csv") {
            processedData = processCSVData(event.target.result);
          } else {
            processedData = processXLSXData(event.target.result);
          }

          setProcessedCsvData(processedData);
          setShowQuantityForm(true);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };

      if (csvFile.name.endsWith(".csv")) {
        reader.readAsText(csvFile);
      } else {
        reader.readAsArrayBuffer(csvFile);
      }
    } catch (err) {
      setError("Upload failed: " + err.message);
      setLoading(false);
    }
  };

  const handleQuantitySubmit = async (quantityData) => {
    const formattedData = {
      assemblyName: assemblyName,
      deviceQuantity: quantityData.deviceQuantity,
      components: quantityData.components.map((comp) => ({
        component: comp.component,
        description: comp.description,
        mainStock: comp.mainStock,
        fetchStock: comp.fetchStock,
        requiredTotal: comp.requiredTotal,
        leftover: comp.leftover,
        requiredPerDevice: comp.requiredPerDevice,
      })),
    };

    if (!formattedData.components.length) {
      setError("No valid components found in the data");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/assembly/create-and-manage",
        formattedData
      );
      setSuccess("Assembly created successfully");
      setShowQuantityForm(false);
      setAssemblyName("");
      setCsvFile(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }

      await fetchAssemblies();
    } catch (error) {
      console.error("Error details:", error.response?.data);
      setError(
        `Failed to create assembly: ${
          error.response?.data?.details || error.message
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Header Section */}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assembly Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track component assemblies
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assembly
          </button>
        </div>

        {/* Create Assembly Modal/Popover */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 m-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Assembly
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assembly Name
                  </label>
                  <input
                    type="text"
                    value={assemblyName}
                    onChange={(e) => setAssemblyName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter assembly name"
                  />
                </div>

                {/* Existing file upload section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Components (CSV)
                  </label>
                  <div className="mt-1 flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="text-center">
                      <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">
                            Select BOM file (Excel/CSV)
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      {csvFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          {csvFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Processing..." : "Create Assembly"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {/* Rest of the form content */}
        </div>
        <br></br>
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search assemblies..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={selectedAssembly}
                onChange={(e) => handleViewAssembly(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Select an assembly...</option>
                {assemblies
                  .filter((assembly) =>
                    assembly.assembly_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((assembly) => (
                    <option key={assembly.id} value={assembly.assembly_name}>
                      {assembly.assembly_name}
                    </option>
                  ))}
              </select>

              {selectedAssembly && (
                <button
                  onClick={() => handleDeleteAssembly(selectedAssembly)}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          {selectedAssembly && assemblyData.length > 0 && (
            <div className="mb-6">
              <AssemblyStatusTracker
                currentStatus={
                  assemblies.find((a) => a.assembly_name === selectedAssembly)
                    ?.assembly_status
                }
                statusDates={statusDates}
                onUpdateStatus={handleStatusUpdate}
                disabled={!selectedAssembly}
              />
            </div>
          )}

          {/* Assembly Data Table */}
          <div className="p-4">
            {selectedAssembly && assemblyData.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assembly Details - {selectedAssembly}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Quantity:</label>
                    <span className="text-sm font-medium">
                      {" "}
                      {selectedAssemblyQuantity}{" "}
                    </span>
                  </div>
                </div>
                <AssemblyTable
                  assemblyData={assemblyData}
                  selectedAssemblyQuantity={selectedAssemblyQuantity}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedAssembly ? (
                  <p>No components found for this assembly</p>
                ) : (
                  <p>Select an assembly to view components</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Notifications */}
        <InventoryNotifications
          criticalComponents={criticalComponents}
          shortageAlerts={shortageAlerts}
        />
      </div>

      {showQuantityForm && (
        <QuantityManagementForm
          csvData={processedCsvData}
          assemblyName={assemblyName}
          initialQuantity={newAssemblyQuantity} // Add this line
          onSubmit={handleQuantitySubmit}
          onClose={() => setShowQuantityForm(false)}
        />
      )}
    </div>
  );
};

// Stock Status Badge Component
// Frontend: Modified StockStatusBadge component

export default Assembly;
