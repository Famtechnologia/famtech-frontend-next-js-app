import { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";

const WarehouseForm = ({ isOpen, onClose, onSubmit, warehouse, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    products: [],
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(""); // ✅ backend error state
  const [productForm, setProductForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        location: warehouse.location || "",
        capacity: warehouse.capacity?.toString() || "",
        products: warehouse.products || [],
      });
    } else {
      setFormData({
        name: "",
        location: "",
        capacity: "",
        products: [],
      });
    }
    setErrors({});
    setApiError("");
  }, [warehouse, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Warehouse name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
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
    setApiError("");
    if (!validateForm()) return;

    const dataToSubmit = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      capacity: parseInt(formData.capacity),
      products: formData.products,
    };

    try {
      await onSubmit(dataToSubmit);
    } catch (err) {
      // ✅ handle backend duplicate key / other API errors
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while saving warehouse.";
      setApiError(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    if (!productForm.name.trim() || !productForm.quantity) return;
    const newProduct = {
      name: productForm.name.trim(),
      quantity: parseInt(productForm.quantity),
      unit: productForm.unit.trim() || "units",
      description: productForm.description.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    setProductForm({ name: "", quantity: "", unit: "", description: "" });
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const inputClass = (hasError) => `
    w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-green-100/50 focus:border-green-600
    ${hasError ? "border-red-300 focus:border-red-500 focus:ring-red-100/50" : "border-slate-200"}
  `;

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  if (!isOpen) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200 relative">
      <button
        onClick={onClose}
        type="button"
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
        title="Close form"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {warehouse ? "Edit Warehouse Details" : "Create New Warehouse"}
        </h2>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
          {warehouse ? "Modify location settings and inventory" : "Establish a new storage site location"}
        </p>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label htmlFor="name" className={labelClass}>
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alberta Grain Store"
                className={inputClass(errors.name || apiError)}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>
              )}
              {apiError && (
                <p className="text-xs text-red-600 mt-1 font-bold">
                  {apiError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className={labelClass}>
                Location <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Edmonton, Alberta"
                className={inputClass(errors.location)}
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.location}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="capacity" className={labelClass}>
                Capacity (kg) <span className="text-red-500">*</span>
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="600"
                className={inputClass(errors.capacity)}
              />
              {errors.capacity && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.capacity}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Products Stock List
            </h3>
            
            {formData.products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {product.quantity} {product.unit}
                        {product.description && ` — ${product.description}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add Stock Item</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  placeholder="Maize / Feed Name"
                  className={inputClass(false)}
                />
                <input
                  name="quantity"
                  type="number"
                  value={productForm.quantity}
                  onChange={handleProductChange}
                  placeholder="Quantity (e.g., 4000)"
                  className={inputClass(false)}
                />
                <input
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductChange}
                  placeholder="Unit (e.g., bags, kg)"
                  className={inputClass(false)}
                />
                <input
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  placeholder="Description (optional)"
                  className={inputClass(false)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                type="button"
                onClick={addProduct}
                disabled={!productForm.name || !productForm.quantity}
                className="w-full flex items-center justify-center py-2.5 border-2 border-dashed border-green-300 text-green-700 rounded-xl hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product to Warehouse
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm font-semibold disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : warehouse ? (
                "Update Warehouse"
              ) : (
                "Create Warehouse"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseForm;
