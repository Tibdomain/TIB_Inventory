import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

const QuantityManagementForm = ({
  csvData,
  assemblyName,
  onSubmit,
  onClose,
  initialQuantity = 1,
}) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deviceQuantity, setDeviceQuantity] = useState(initialQuantity);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const componentsWithInventory = await Promise.all(
          csvData.map(async (item) => {
            const response = await fetch(
              `http://localhost:5000/api/query?component=${
                item.component
              }&Description=${encodeURIComponent(item.description)}`
            );
            const data = await response.json();
            const mainStock = data[0]?.Quantity || 0;
            const requiredTotal = item.quantity * deviceQuantity;

            return {
              ...item,
              mainStock,
              fetchStock: 0, // Initialize fetch stock as 0
              requiredTotal,
              leftover: 0, // Will be calculated when fetch stock is set
              requiredPerDevice: item.quantity,
              status: "NOT_FETCHED",
            };
          })
        );
        setComponents(componentsWithInventory);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch inventory data");
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [csvData, deviceQuantity]);

  const getStockStatus = (fetchStock, required) => {
    if (fetchStock >= required) return "SUFFICIENT";
    if (fetchStock > 0) return "INSUFFICIENT";
    return "NOT_FETCHED";
  };

  const handleDeviceQuantityChange = (value) => {
    const newQuantity = parseInt(value) || 0;
    setDeviceQuantity(newQuantity);

    setComponents((prev) =>
      prev.map((comp) => {
        const requiredTotal = comp.requiredPerDevice * newQuantity;
        const leftover = comp.fetchStock - requiredTotal;

        return {
          ...comp,
          requiredTotal,
          leftover,
          status: getStockStatus(comp.fetchStock, requiredTotal),
        };
      })
    );
  };

  const handleFetchStockChange = (index, value) => {
    const fetchStock = parseInt(value) || 0;

    setComponents((prev) => {
      const newComponents = [...prev];
      const component = newComponents[index];

      // Validate against main stock
      if (fetchStock > component.mainStock) {
        setError(
          `Fetch quantity cannot exceed main stock (${component.mainStock})`
        );
        return prev;
      }

      const leftover = fetchStock - component.requiredTotal;

      newComponents[index] = {
        ...component,
        fetchStock,
        leftover,
        status: getStockStatus(fetchStock, component.requiredTotal),
      };

      setError("");
      return newComponents;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all components have fetch stock set
    if (components.some((comp) => comp.fetchStock === 0)) {
      setError("Please set fetch quantities for all components");
      return;
    }

    const submitData = {
      assemblyName,
      deviceQuantity,
      components: components.map((comp) => ({
        component: comp.component,
        description: comp.description,
        mainStock: comp.mainStock,
        fetchStock: comp.fetchStock,
        requiredTotal: comp.requiredTotal,
        leftover: comp.leftover,
        requiredPerDevice: comp.requiredPerDevice,
      })),
    };

    onSubmit(submitData);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-center text-gray-600">
            Loading inventory data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Stock Management - {assemblyName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Number of Devices
              </label>
              <input
                type="number"
                min="1"
                value={deviceQuantity}
                onChange={(e) => handleDeviceQuantityChange(e.target.value)}
                className="mt-1 w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Component
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Description
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Main Stock
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Fetch Stock
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Required/Device
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Total Required
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Leftover
                    </th>
                    <th className="border p-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((comp, index) => (
                    <tr
                      key={index}
                      className={comp.leftover < 0 ? "bg-red-50" : ""}
                    >
                      <td className="border p-3">{comp.component}</td>
                      <td className="border p-3 text-sm max-w-md truncate">
                        {comp.description}
                      </td>
                      <td className="border p-3">{comp.mainStock}</td>
                      <td className="border p-3">
                        <input
                          type="number"
                          min="0"
                          max={comp.mainStock}
                          value={comp.fetchStock}
                          onChange={(e) =>
                            handleFetchStockChange(index, e.target.value)
                          }
                          className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border p-3">{comp.requiredPerDevice}</td>
                      <td className="border p-3">{comp.requiredTotal}</td>
                      <td
                        className={`border p-3 font-medium ${
                          comp.leftover < 0
                            ? "text-red-600"
                            : comp.leftover < 10
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {comp.leftover}
                      </td>
                      <td className="border p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comp.status === "SUFFICIENT"
                              ? "bg-green-100 text-green-800"
                              : comp.status === "INSUFFICIENT"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {comp.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityManagementForm;
