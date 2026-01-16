import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  AlertCircle,
  Check,
  X,
  Store,
  Plus,
  FileText,
  Truck,
  Save,
} from "lucide-react";

const VendorForm = ({ vendorToEdit, onEditSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    setValue,
  } = useForm({
    mode: "onChange",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const isEditMode = !!vendorToEdit;

  // Populate form when editing
  useEffect(() => {
    if (vendorToEdit) {
      setValue("vendor_id", vendorToEdit.vendor_id || vendorToEdit.Vendor_Id);
      setValue(
        "vendor_code",
        vendorToEdit.vendor_code || vendorToEdit.Vendor_Code
      );
      setValue(
        "vendor_name",
        vendorToEdit.vendor_name || vendorToEdit.Vendor_Name
      );
    }
  }, [vendorToEdit, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Update existing vendor
        const vendorId = vendorToEdit.vendor_id || vendorToEdit.Vendor_Id;
        const response = await axios.put(
          `http://localhost:5000/api/vendors/${vendorId}`,
          data
        );
        setNotification({
          type: "success",
          message: "Vendor updated successfully!",
        });
        if (onEditSuccess) onEditSuccess(response.data);
      } else {
        // Add new vendor
        const response = await axios.post(
          "http://localhost:5000/api/vendors",
          data
        );
        setNotification({
          type: "success",
          message: "Vendor added successfully!",
        });
        reset(); // Reset form after successful submission
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} vendor:`,
        error
      );
      setNotification({
        type: "error",
        message:
          error.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "add"
          } vendor. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden transition-all">
      <div
        className={`bg-gradient-to-r ${
          isEditMode
            ? "from-blue-600 to-indigo-600"
            : "from-emerald-600 to-teal-600"
        } p-5`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? "Edit Vendor" : "New Vendor Registration"}
          </h2>
        </div>
      </div>

      <div className="p-6">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              notification.type === "success"
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-red-50 text-red-700 border-l-4 border-red-500"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <Check className="h-5 w-5 mr-3 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={dismissNotification}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor ID */}
            <div className="col-span-1">
              <label
                htmlFor="vendor_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vendor ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="vendor_id"
                  type="number"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 ${
                    isEditMode
                      ? "focus:ring-blue-500 focus:border-blue-500"
                      : "focus:ring-emerald-500 focus:border-emerald-500"
                  } transition-all ${
                    errors.vendor_id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter vendor ID"
                  disabled={isEditMode}
                  {...register("vendor_id", {
                    required: "Vendor ID is required",
                    valueAsNumber: true,
                    validate: (value) =>
                      value > 0 || "ID must be a positive number",
                  })}
                />
              </div>
              {errors.vendor_id && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.vendor_id.message}
                </p>
              )}
            </div>

            {/* Vendor Code */}
            <div className="col-span-1">
              <label
                htmlFor="vendor_code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vendor Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Truck className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="vendor_code"
                  type="text"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg uppercase focus:ring-2 ${
                    isEditMode
                      ? "focus:ring-blue-500 focus:border-blue-500"
                      : "focus:ring-emerald-500 focus:border-emerald-500"
                  } transition-all ${
                    errors.vendor_code
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="3-digit code (e.g. ABC)"
                  {...register("vendor_code", {
                    required: "Vendor code is required",
                    maxLength: {
                      value: 3,
                      message: "Vendor code must be 3 characters or less",
                    },
                    minLength: {
                      value: 3,
                      message: "Vendor code must be 3 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z0-9]{3}$/,
                      message: "Code should be 3 alphanumeric characters",
                    },
                  })}
                />
              </div>
              {errors.vendor_code && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.vendor_code.message}
                </p>
              )}
            </div>

            {/* Vendor Name */}
            <div className="col-span-full">
              <label
                htmlFor="vendor_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="vendor_name"
                  type="text"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 ${
                    isEditMode
                      ? "focus:ring-blue-500 focus:border-blue-500"
                      : "focus:ring-emerald-500 focus:border-emerald-500"
                  } transition-all ${
                    errors.vendor_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter full vendor name"
                  {...register("vendor_name", {
                    required: "Vendor name is required",
                    minLength: {
                      value: 2,
                      message: "Vendor name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errors.vendor_name && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.vendor_name.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-full pt-4">
              <button
                type="submit"
                disabled={isSubmitting || (!isDirty && !isEditMode) || !isValid}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isEditMode ? "focus:ring-blue-500" : "focus:ring-emerald-500"
                } transition-all shadow-sm ${
                  isSubmitting || (!isDirty && !isEditMode) || !isValid
                    ? "bg-gray-300 cursor-not-allowed"
                    : isEditMode
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Vendor
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Register Vendor
                        </>
                      )}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
