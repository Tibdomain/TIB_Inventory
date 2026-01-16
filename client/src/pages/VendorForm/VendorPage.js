import React, { useState, useEffect } from "react";
import axios from "axios";
import VendorForm from "./VendorForm";
import {
  Store,
  Search,
  Plus,
  List,
  FileEdit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  Download,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const AddVendorPage = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    if (activeTab === "view") {
      fetchVendors();
    }
  }, [activeTab]);

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setActiveTab("add");
  };

  const handleEditSuccess = (updatedVendor) => {
    // Update the vendors list with the edited vendor
    setVendors((prevVendors) =>
      prevVendors.map((v) =>
        v.vendor_id === updatedVendor.vendor_id ||
        v.Vendor_Id === updatedVendor.vendor_id
          ? updatedVendor
          : v
      )
    );

    // Show success message
    setActionSuccess("Vendor updated successfully");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setActionSuccess(null);
    }, 3000);

    // Clear editing state
    setEditingVendor(null);

    // Switch to view tab
    setActiveTab("view");
  };

  const cancelEdit = () => {
    setEditingVendor(null);
  };

  const handleDelete = async (vendorId) => {
    try {
      await axios.delete(`http://localhost:5000/api/vendors/${vendorId}`);
      fetchVendors();
      setActionSuccess("Vendor deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error deleting vendor:", err);
      setError(err.response?.data?.message || "Failed to delete vendor");
    }
  };

  const confirmDelete = (vendor) => {
    setVendorToDelete(vendor);
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setVendorToDelete(null);
    setIsDeleting(false);
  };

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/vendors");
      setVendors(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to load vendors. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredVendors = vendors.filter((vendor) => {
    // First check if vendor exists
    if (!vendor) return false;

    // Use both property naming conventions to ensure compatibility
    const nameMatch =
      vendor.Vendor_Name || vendor.vendor_name
        ? (vendor.Vendor_Name || vendor.vendor_name)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false;

    const codeMatch =
      vendor.Vendor_Code || vendor.vendor_code
        ? (vendor.Vendor_Code || vendor.vendor_code)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false;

    const idMatch =
      vendor.Vendor_Id || vendor.vendor_id
        ? (vendor.Vendor_Id || vendor.vendor_id).toString().includes(searchTerm)
        : false;

    return nameMatch || codeMatch || idMatch;
  });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const currentVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    if (filteredVendors.length === 0) return;

    const csvContent = [
      ["Vendor ID", "Vendor Code", "Vendor Name", "Timestamp"],
      ...filteredVendors.map((vendor) => [
        vendor.vendor_id || vendor.Vendor_Id,
        vendor.vendor_code || vendor.Vendor_Code,
        vendor.vendor_name || vendor.Vendor_Name,
        vendor.Timestamp,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vendors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-20 pb-6 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Add, view and manage vendor information
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab("add");
                if (editingVendor) setEditingVendor(null);
              }}
              className={`flex items-center px-4 py-3 font-medium transition-colors ${
                activeTab === "add"
                  ? "text-emerald-600 border-b-2 border-emerald-500"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
              }`}
            >
              {editingVendor ? (
                <>
                  <FileEdit className="h-4 w-4 mr-2" />
                  <span>Edit Vendor</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Vendor</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`flex items-center px-4 py-3 font-medium transition-colors ${
                activeTab === "view"
                  ? "text-emerald-600 border-b-2 border-emerald-500"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              <span>View Vendors</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "add" ? (
              <div className="grid grid-cols-1 gap-6">
                {/* Back button when editing */}
                {editingVendor && (
                  <div className="flex items-center mb-2">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      <span>Back to Add Vendor</span>
                    </button>
                  </div>
                )}

                {/* Form description */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        {editingVendor
                          ? "Edit vendor information below. All fields marked with an asterisk (*) are required."
                          : "Register a new vendor by filling out the form below. All fields marked with an asterisk (*) are required."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vendor Form Component */}
                <VendorForm
                  vendorToEdit={editingVendor}
                  onEditSuccess={handleEditSuccess}
                />
              </div>
            ) : (
              <div>
                {/* Search and Actions */}
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>

                  <button
                    onClick={exportToCSV}
                    disabled={filteredVendors.length === 0}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-lg shadow-sm ${
                      filteredVendors.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export to CSV</span>
                  </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg my-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && filteredVendors.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Store className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No vendors found
                    </h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      {searchTerm
                        ? `No vendors match your search term "${searchTerm}"`
                        : "You haven't added any vendors yet. Get started by adding your first vendor."}
                    </p>
                    {searchTerm ? (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab("add")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <span className="flex items-center">
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Vendor
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Vendors Table */}
                {!isLoading && !error && filteredVendors.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Code
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Vendor Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Added On
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentVendors.map((vendor) => (
                          <tr
                            key={vendor.Vendor_Id || vendor.vendor_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {vendor.Vendor_Id || vendor.vendor_id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {vendor.Vendor_Code || vendor.vendor_code}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {vendor.Vendor_Name || vendor.vendor_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  vendor.Timestamp
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEdit(vendor)}
                                  className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
                                  title="Edit vendor"
                                >
                                  <FileEdit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(vendor)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Delete vendor"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isDeleting && vendorToDelete && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <div className="flex items-center text-red-600 mb-4">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <h3 className="text-lg font-medium">
                          Confirm Deletion
                        </h3>
                      </div>
                      <p className="mb-4">
                        Are you sure you want to delete vendor "
                        {vendorToDelete.vendor_name ||
                          vendorToDelete.Vendor_Name}
                        "? This action cannot be undone.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(
                              vendorToDelete.vendor_id ||
                                vendorToDelete.Vendor_Id
                            );
                            setIsDeleting(false);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {actionSuccess && (
                  <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{actionSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {!isLoading && !error && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredVendors.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredVendors.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                              currentPage === 1
                                ? "cursor-not-allowed"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(index + 1)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === index + 1
                                  ? "z-10 bg-emerald-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                              currentPage === totalPages
                                ? "cursor-not-allowed"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVendorPage;
