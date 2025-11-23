import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

const WarehouseForm = ({ isOpen, onClose, onSubmit, warehouse, isLoading }) => {
  // 1. ADDED 'manager' to initial state
  const [formData, setFormData] = useState({
    name: "",
    manager: "", 
    location: "",
    capacity: "",
    products: []
  });

  const [errors, setErrors] = useState({});
  const [productForm, setProductForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    description: ""
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        manager: warehouse.manager || "", // 2. Map existing manager if editing
        location: warehouse.location || "",
        capacity: warehouse.capacity?.toString() || "",
        products: warehouse.products || []
      });
    } else {
      setFormData({
        name: "",
        manager: "",
        location: "",
        capacity: "",
        products: []
      });
    }
    setErrors({});
  }, [warehouse, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Warehouse name is required";
    }

    // 3. ADDED Validation for Manager
    if (!formData.manager.trim()) {
      newErrors.manager = "Manager name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      name: formData.name.trim(),
      manager: formData.manager.trim(), // 4. Include manager in submission
      location: formData.location.trim(),
      capacity: parseInt(formData.capacity),
      products: formData.products
    };

    await onSubmit(dataToSubmit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProduct = () => {
    if (!productForm.name.trim() || !productForm.quantity) {
      return;
    }

    const newProduct = {
      name: productForm.name.trim(),
      quantity: parseInt(productForm.quantity),
      unit: productForm.unit.trim() || "units",
      description: productForm.description.trim()
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    setProductForm({
      name: "",
      quantity: "",
      unit: "",
      description: ""
    });
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const inputClass = (hasError) => `
    w-full px-3 py-2 rounded-md border bg-white text-sm shadow-sm placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    ${hasError ? "border-red-500" : "border-gray-300"}
  `;

  const labelClass = "block text-sm font-medium text-green-800 mb-1";

  if (!isOpen) return null; 

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-green-900">
          {warehouse ? "Edit Warehouse" : "Add New Warehouse"}
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 pr-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warehouse Details */}
          <div className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-1">
              <label htmlFor="name" className={labelClass}>Warehouse Name *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter warehouse name"
                className={inputClass(errors.name)}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* 5. ADDED Manager Input Field */}
            <div className="space-y-1">
              <label htmlFor="manager" className={labelClass}>Manager Name *</label>
              <input
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                placeholder="Enter manager's name"
                className={inputClass(errors.manager)}
              />
              {errors.manager && (
                <p className="text-sm text-red-500 mt-1">{errors.manager}</p>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-1">
              <label htmlFor="location" className={labelClass}>Location *</label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Lagos, Nigeria"
                className={inputClass(errors.location)}
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location}</p>
              )}
            </div>

            {/* Capacity Field */}
            <div className="space-y-1">
              <label htmlFor="capacity" className={labelClass}>Capacity (units) *</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Enter storage capacity"
                className={inputClass(errors.capacity)}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Products</h3>
              
              {formData.products.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{product.name}</p>
                        <p className="text-sm text-green-700">
                          {product.quantity} {product.unit}
                          {product.description && ` - ${product.description}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Add Product</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    placeholder="Product name"
                    className={inputClass(false)}
                  />
                  <input
                    name="quantity"
                    type="number"
                    value={productForm.quantity}
                    onChange={handleProductChange}
                    placeholder="Quantity"
                    className={inputClass(false)}
                  />
                  <input
                    name="unit"
                    value={productForm.unit}
                    onChange={handleProductChange}
                    placeholder="Unit (e.g., kg)"
                    className={inputClass(false)}
                  />
                  <input
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    placeholder="Description (optional)"
                    className={inputClass(false)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addProduct}
                  disabled={!productForm.name || !productForm.quantity}
                  className="w-full flex items-center justify-center py-2 border-2 border-dashed border-green-300 text-green-700 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
            >
              {isLoading ? "Saving..." : warehouse ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseForm;