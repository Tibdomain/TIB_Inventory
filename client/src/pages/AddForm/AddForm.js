import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Check, ArrowLeft, FileText, Clipboard, RefreshCw, Plus } from 'lucide-react';

const manufacturers = ['Manufacturer 1', 'Manufacturer 2', 'Manufacturer 3'];
const vendors = ['Vendor 1', 'Vendor 2', 'Vendor 3'];
const types = ['Type 1', 'Type 2', 'Type 3'];

const AddForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    partNo: Math.floor(Math.random() * 100000),
    manufacturer: '',
    vendor: '',
    packaging: '',
    type: '',
    quantity: '',
    quantityAcknowledgement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const generatePartNo = () => {
    const newPartNo = Math.floor(Math.random() * 1000000);
    setFormData(prev => ({
      ...prev,
      partNo: newPartNo
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form Submitted:', formData);
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: '',
          partNo: Math.floor(Math.random() * 1000000),
          manufacturer: '',
          vendor: '',
          packaging: '',
          type: '',
          quantity: '',
          quantityAcknowledgement: false,
        });
        setShowForm(false);
      }, 2000);
    }, 1000);
  };

  const handleCancel = () => {
    // Add animation before navigating away
    setShowForm(false);
    setTimeout(() => navigate('/'), 300);
  };

  return (
    <div className="min-h-screen bg-fixed bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Purchase Order Form</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
        </div>
        
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!showForm && !success ? (
              <motion.div
                key="button-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Package className="h-12 w-12 text-blue-600" />
                </motion.div>
                
                <h2 className="text-xl font-medium text-gray-800 mb-2">Create New Purchase Order</h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                  Fill out the form to generate a new purchase order for inventory management
                </p>
                
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Order
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : success ? (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Check className="h-10 w-10 text-green-600" />
                </motion.div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Order Submitted Successfully!</h2>
                <p className="text-gray-500 text-center">Your purchase order has been created and saved to the system.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Component Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter component name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part Number
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="partNo"
                          value={formData.partNo}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={generatePartNo}
                          className="px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                        >
                          <RefreshCw className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <select
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Manufacturer</option>
                        {manufacturers.map((manufacturer) => (
                          <option key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor
                      </label>
                      <select
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor} value={vendor}>
                            {vendor}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Packaging
                      </label>
                      <input
                        type="text"
                        name="packaging"
                        value={formData.packaging}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter packaging details"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Component Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Type</option>
                        {types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter quantity"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="quantityAcknowledgement"
                      checked={formData.quantityAcknowledgement}
                      onChange={handleInputChange}
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      I confirm that the quantity and details provided are correct
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-5 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-5 w-5" />
                          Submit Order
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AddForm;
