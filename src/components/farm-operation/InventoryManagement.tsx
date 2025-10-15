"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import {
  Plus,
  Search,
  Leaf,
  Heart,
  FileText,
  // HardHat, // Tool icon (commented out)
  Grid,
  X,
  TriangleAlert,
  CheckCircle,
  ListFilter,
  LayoutGrid,
  Download,
  Loader2,
  Trash2,
  SquarePen,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

// Assuming these types are defined in '@/types/inventory'
import {
  UnifiedInventoryItem,
  // ToolData, // COMMENTED OUT: Tool-related type
  EquipmentPartData, // KEEPING ACTIVE: Equipment part-related type
} from "@/types/inventory";
// Assuming these services are defined in '@/lib/services/inventory'
import {
  getInventoryItems,
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
} from "@/lib/services/inventory";
import { renderFormFields } from "./Render";
import { useAuthStore, User } from "@/lib/store/authStore";
import InventorySkeleton from "@/components/layout/skeleton/farm-operation/Inventory";
// --- TYPE DEFINITIONS & USER ID RETRIEVAL ---

// Define placeholder type for ToolData while it is commented out
type ToolData = Record<string, unknown> | null | undefined;

// Retrieve userId from the store immediately. This value is 'string | undefined'.
const userData = useAuthStore.getState().user as User | null;
const requiredUserId = userData?.id;


/**
 * 1. NewInventoryItemData: The final shape required by the create API service (userId must be string).
 */
type NewInventoryItemData = Omit<
  UnifiedInventoryItem,
  "id" | "timestamp" | "_id"
>;

/**
 * 2. OptionalUserIdNewInventoryItemData: The shape for our component state (formData).
 * This type explicitly allows 'string | undefined' for userId, resolving the TS error 2322.
 */
type OptionalUserIdNewInventoryItemData = Omit<
  NewInventoryItemData,
  "userId"
> & {
  userId: string | undefined;
};

type UpdateInventoryItemData = UnifiedInventoryItem;
type BaseFormData =
  | OptionalUserIdNewInventoryItemData
  | UpdateInventoryItemData;
type FormValue = string | number | null | undefined;
// Adjusted FormDataType to be more specific for nested data structures
type FormDataType = Record<
  string,
  FormValue | ToolData | EquipmentPartData | undefined
>;

// Helper type to correctly type the setter from useState<T | null>
type NullableSetter<T> = Dispatch<SetStateAction<T | null>>;

const InventoryManagement = () => {
  // State declarations
  const [activeInventoryTab, setActiveInventoryTab] = useState<string>("seeds");
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<UnifiedInventoryItem[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  // NEW: Dedicated state for form-specific errors (to avoid modal closing on API error)
  const [formError, setFormError] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState<string>("");

  // --- INITIAL STATE DEFINITION ---
  const initialFormData: OptionalUserIdNewInventoryItemData = {
    category: "seeds",
    name: "",
    quantity: 0,
    reorderLevel: 0,
    usageRate: undefined,
    expireDate: undefined,

    type: undefined,
    n: undefined,
    p: undefined,
    k: undefined,

    toolData: undefined, // Set to undefined since ToolData is commented out

    equipmentPartData: { // KEEPING ACTIVE: Equipment part-related fields
      model: undefined,
      partNumber: undefined,
      manufacturer: undefined,
      warrantyExpiry: undefined,
      price: undefined,
      condition: undefined,
    } as EquipmentPartData,

    model: undefined,
    // FIX 1: Use the retrieved user ID.
    userId: requiredUserId,
  };

  const getInitialFormData = (
    category: string
  ): OptionalUserIdNewInventoryItemData => ({
    ...initialFormData,
    category: category as OptionalUserIdNewInventoryItemData["category"],
    // FIX 2: Ensure userId is set here too.
    userId: requiredUserId,
  });

  const [formData, setFormData] =
    useState<OptionalUserIdNewInventoryItemData>(initialFormData);
  const [updateFormData, setUpdateFormData] =
    useState<UpdateInventoryItemData | null>(null);

  // --- DATA FETCHING & HANDLERS ---

  const fetchInventoryItems = async () => {
    // FIX 3: Add runtime check for userId before calling getInventoryItems
    if (!requiredUserId) {
      setIsLoading(false);
      setError("Cannot fetch inventory: User ID is missing. Please log in.");
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous fetch error
    try {
      // FIX 4: Pass the required userId argument to getInventoryItems
      const items = await getInventoryItems(requiredUserId);
      setInventoryItems(items);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError('Failed to load inventory items. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleTabChange = (category: string) => {
    setActiveInventoryTab(category);
    setFormData(getInitialFormData(category));
    setError(null); // Clear main error on tab change
    setFormError(null); // Clear form error on tab change
  };

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item =>
      item.category === activeInventoryTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryItems, activeInventoryTab, searchTerm]);

  const getItemsToDisplay = useMemo(() => filteredItems, [filteredItems]);


  const cleanAndParseNumber = (value: string | number): number | string => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() === "") return "";

    const cleanValue = String(value).replace(/[^0-9.]/g, "");
    const parsedNumber = parseFloat(cleanValue);

    return isNaN(parsedNumber) ? "" : parsedNumber;
  };

  const createUpdateInputHandler = <T extends BaseFormData>(
    targetFormData: NullableSetter<T>
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormError(null); // Clear form error on input change

      targetFormData((prev) => {
        if (!prev) return null;

        const numericKeys = [
          "quantity",
          "reorderLevel",
          "n",
          "p",
          "k",
          "price",
        ];

        // Deep copy to ensure correct state update
        const newFormData: T = JSON.parse(JSON.stringify(prev));

        if (name.includes(".")) {
          const [parentKey, childKey] = name.split(".");

          const parentObject =
            (newFormData[parentKey as keyof T] as FormDataType) || {};

          if (typeof parentObject === "object" && parentObject !== null) {
            const isNumeric = numericKeys.includes(childKey);

            parentObject[childKey] = isNumeric
              ? cleanAndParseNumber(value)
              : value;

            if (parentKey === "equipmentPartData") { // KEEPING ACTIVE
              newFormData[parentKey as keyof T] =
                parentObject as EquipmentPartData as T[keyof T];
            } else {
              newFormData[parentKey as keyof T] = parentObject as T[keyof T];
            }
          }
        } else {
          const isNumeric = numericKeys.includes(name);

          (newFormData[name as keyof T] as FormValue) = isNumeric
            ? cleanAndParseNumber(value)
            : value;
        }

        return newFormData;
      });
    };
  };

  const handleAddInputChange = createUpdateInputHandler(
    setFormData as NullableSetter<OptionalUserIdNewInventoryItemData>
  );

  const handleUpdateInputChange = createUpdateInputHandler(setUpdateFormData);

  const processPayload = <T extends BaseFormData>(
    data: T
  ): Omit<T, "id" | "_id" | "timestamp"> => {
    const numericKeysForAPI = [
      "quantity",
      "reorderLevel",
      "n",
      "p",
      "k",
      "price",
    ];
    const requiredKeys = ["name", "category", "userId"];

    // FIX: Changed 'any' to 'Record<string, unknown>'
    const cleanedData: Record<string, unknown> = JSON.parse(JSON.stringify(data), (key, value) => {
      if (key === "price" && typeof value === "string") {
        const cleanPrice = value.replace(/[^\d.]/g, "");
        if (cleanPrice === "" || cleanPrice === ".") {
          return null;
        }
        return cleanPrice;
      }

      if (value === "") {
        if (numericKeysForAPI.includes(key)) {
          return 0;
        }
        if (requiredKeys.includes(key)) {
          return "";
        }

        return null;
      }

      if (numericKeysForAPI.includes(key) && typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }

      if (key === "userId" && value === undefined) {
        return undefined;
      }

      return value;
    });

    delete cleanedData.id;
    delete cleanedData._id;
    delete cleanedData.timestamp;

    const category = cleanedData.category;

    if (
      category !== "seeds" &&
      category !== "fertilizer" &&
      category !== "feed"
    ) {
      delete cleanedData.usageRate;
      delete cleanedData.expireDate;
    }
    if (category !== "fertilizer") {
      delete cleanedData.n;
      delete cleanedData.p;
      delete cleanedData.k;
    }
    if (category !== "equipment parts") { // KEEPING ACTIVE
      delete cleanedData.equipmentPartData;
    }
    if (category !== "fertilizer" && category !== "feed") {
      delete cleanedData.type;
    }
    if (category !== "equipment parts") {
      delete cleanedData.model;
    }

    return cleanedData as Omit<T, "id" | "_id" | "timestamp">;
  };

 const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous form error
    setIsLoading(true); // 👈 1. START LOADING

    if (!requiredUserId) {
        setError("User ID is missing. Please log in again.");
        setIsLoading(false); // ⚠️ Stop loading on early exit
        return;
    }

    // ⭐ CORE FIX: Validation to prevent sending an empty name ⭐
    if (formData?.name.trim() === "") {
        setFormError(
            "The 'Item Name' field cannot be empty. Please provide a name for the item."
        );
        setIsLoading(false); // ⚠️ Stop loading on early exit
        return;
    }

    try {
        const payload = processPayload(formData) as NewInventoryItemData;

        const newItem = await createInventoryItem(payload);

        console.log("Server response (create):", newItem);

        setInventoryItems((prev) => [...prev, newItem]);
        setShowAddItemModal(false);
        setFormData(getInitialFormData(activeInventoryTab));
        setError(null); // Clear main error if successful

    } catch (err: unknown) { // ✅ FIX: Use 'unknown'
        console.error("Full error object:", err);

        // ✅ FIX: Type guard to safely check if 'err' has the expected structure
        const axiosError = err as { response?: { data?: { error?: string } } } | null | undefined;

        let errorMessage = "Failed to create inventory item. An unknown error occurred. Check the console for more details.";

        if (axiosError?.response) {
            console.error("Error response:", axiosError.response);
            if (axiosError.response.data && axiosError.response.data.error) {
                errorMessage = `Failed to create inventory item: ${axiosError.response.data.error}`;
            } else {
                errorMessage = "Failed to create inventory item. The server rejected the request. Check the console for more details.";
            }
        } else if (err instanceof Error) {
            // Handle standard JavaScript Errors (e.g., network issues before the request is sent)
            errorMessage = `Failed to create inventory item. Error: ${err.message}. Check the console for more details.`;
        }

        setFormError(errorMessage); // Set form-specific error
    } finally {
        setIsLoading(false); // 👈 2. STOP LOADING (Always run)
    }
};

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous form error
    if (!updateFormData || isUpdating) return;

    // ⭐ CORE FIX: Validation for update form name ⭐
    if (updateFormData.name.trim() === "") {
      setFormError(
        "The 'Item Name' field cannot be empty. Please provide a name for the item."
      );
      return;
    }

    setIsUpdating(true);
    try {
      const itemId = updateFormData.id;

      const dataToUpdate = processPayload(updateFormData);

      const updatedItem = await updateInventoryItem(itemId, dataToUpdate);

      console.log("Server response (update):", updatedItem);

      setInventoryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      setShowUpdateModal(false);
      setUpdateFormData(null);
      setError(null); // Clear main error if successful

    } catch (err) {
      console.error("Failed to update item:", err);
      // Simplified error handling for update, similar to create
      const axiosError = err as { response?: { data?: { error?: string } } } | null | undefined;
      let errorMessage = "Failed to update inventory item. Check console for details.";

      if (axiosError?.response?.data?.error) {
         errorMessage = `Failed to update inventory item: ${axiosError.response.data.error}`;
      } else if (err instanceof Error) {
        errorMessage = `Failed to update inventory item: ${err.message}`;
      }
      setFormError(errorMessage); // Set form-specific error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isDeleting[id]) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    setError(null); // Clear main error before new operation
    try {
      await deleteInventoryItem(id);
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete inventory item. Check console for details."); // Set main error for this operation
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateClick = (item: UnifiedInventoryItem) => {
    const copy: UpdateInventoryItemData = JSON.parse(JSON.stringify(item));

    // Helper function to correctly handle keys
    const setNumericFieldForForm = <T extends object, K extends keyof T>(
      obj: T,
      key: K
    ) => {
      const value = obj[key];

      // Check for null, undefined, 0, or '0'
      if (
        value === 0 ||
        value === "0" ||
        value === null ||
        value === undefined
      ) {
        // Safely assign the empty string, relying on FormValue covering this.
        (obj as Record<K, FormValue>)[key] = "";
      }
    };

    setNumericFieldForForm(copy, "quantity"); // FIXED
    setNumericFieldForForm(copy, "reorderLevel"); // FIXED
    setNumericFieldForForm(copy, "usageRate"); // FIXED
    setNumericFieldForForm(copy, "n"); // FIXED
    setNumericFieldForForm(copy, "p"); // FIXED
    setNumericFieldForForm(copy, "k"); // FIXED

    if (
      copy.equipmentPartData === null ||
      copy.equipmentPartData === undefined
    ) {
      copy.equipmentPartData = {} as EquipmentPartData;
    } else {
      setNumericFieldForForm(copy.equipmentPartData, "price"); // KEEPING ACTIVE
    }

    const stringFields: Array<keyof UnifiedInventoryItem> = [
      "type",
      "usageRate",
      "expireDate",
      "model",
    ];
    stringFields.forEach((key) => {
      if (copy[key] === null || copy[key] === undefined) {
        (copy[key] as FormValue) = "";
      }
    });

    setUpdateFormData(copy);
    setFormError(null); // Clear form error when opening the modal
    setShowUpdateModal(true);
  };

  const getItemStatus = (item: UnifiedInventoryItem): string => {
    const quantity = item.quantity ?? 0;
    const reorderLevel = item.reorderLevel ?? 0;

    if (quantity === 0) return "Out of Stock";

    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return "bg-red-50 text-red-600 border border-red-200"; // Added border for clarity
      case "Low Stock":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"; // Added border for clarity
      case "In Stock":
        return "bg-green-50 text-green-700 border border-green-200"; // Added border for clarity
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return <X className="h-4 w-4 mr-1 text-red-600" />;
      case "Low Stock":
        return <TriangleAlert className="h-4 w-4 mr-1 text-yellow-600" />;
      case "In Stock":
        return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Using a more standard format or locale for better readability
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
  };

  type InventoryTab = {
    name: string;
    icon: React.ReactNode;
    value: string;
  };

  const inventoryTabs: InventoryTab[] = [
    { name: "Seeds", icon: <Leaf className="h-4 w-4 mr-2" />, value: "seeds" },
    { name: "Feed", icon: <Heart className="h-4 w-4 mr-2" />, value: "feed" },
    {
      name: "Fertilizer",
      icon: <FileText className="h-4 w-4 mr-2" />,
      value: "fertilizer",
    },
    { // KEEPING ACTIVE: Equipment Parts Tab
      name: "Equipment Parts",
      icon: <Grid className="h-4 w-4 mr-2" />,
      value: "equipment parts",
    },
  ];

 if (isLoading) {
  return <InventorySkeleton />;
}
  // Improved Error Display
  if (error && inventoryItems.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center p-6 border border-red-300 rounded-lg bg-red-50">
          <TriangleAlert className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={fetchInventoryItems}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 lg:pt-8 lg:pb-8 max-w-7xl mx-auto">
      
      {/* Global Error Banner */}
      {error && inventoryItems.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-center">
              <TriangleAlert className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
          </div>
      )}

      {/* --- TABS SECTION --- */}
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-8 -mt-2">
        {inventoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center px-4 py-3 text-base font-semibold transition-colors duration-200 whitespace-nowrap
                        ${
                          activeInventoryTab === tab.value
                            ? "border-b-4 border-green-600 text-green-700"
                            : "text-gray-600 hover:text-gray-800 hover:border-b-4 hover:border-gray-300"
                        }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* --- CONTROL BAR --- */}
      <div className="md:flex justify-between items-center space-y-4 md:space-y-0 mb-8">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeInventoryTab} inventory...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className=" items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors hidden lg:flex">
            <LayoutGrid className="h-4 w-4 mr-2" /> Grid
          </button>
          <button className=" items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors hidden lg:flex">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button
            onClick={() => {
                setShowAddItemModal(true);
                setFormError(null); // Clear form error when opening new modal
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 shadow-md transition-colors w-fit md:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </button>
        </div>
      </div>

      {/* --- INVENTORY ITEMS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
        {getItemsToDisplay.length > 0 ? (
          getItemsToDisplay.map((item: UnifiedInventoryItem) => {
            const status = getItemStatus(item);
            const isItemDeleting = isDeleting[item.id];
            return (
              <Card key={item.id} title={item.name} className="flex flex-col justify-between h-full shadow-lg hover:shadow-xl transition-shadow duration-300 min-w-[250px]  ">
                <div className="space-y-2">
                    
                  
                    {/* Item Details */}
                    <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-semibold text-gray-800">
                        {item.quantity}
                        </span>
                    </p>
                    <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Reorder Level:</span>
                        <span className="font-semibold text-gray-800">
                        {item.reorderLevel ?? 0}
                        </span>
                    </p>

                    {item.usageRate && (
                        <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Usage Rate:</span>
                        <span className="font-semibold text-gray-800">
                            {item.usageRate}
                        </span>
                        </p>
                    )}
                    {item.expireDate && (
                        <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Expiry Date:</span>
                        <span className="font-semibold text-gray-800">
                            {formatDate(item.expireDate)}
                        </span>
                        </p>
                    )}

                    {item.type && (
                        <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-semibold text-gray-800">
                            {item.type}
                        </span>
                        </p>
                    )}

                    {item.category === "equipment parts" &&
                        item.equipmentPartData?.model && (
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">Part Model:</span>
                                <span className="font-semibold text-gray-800">
                                {item.equipmentPartData.model}
                                </span>
                            </p>
                        )}
                    {typeof item.n === "number" &&
                        typeof item.p === "number" &&
                        typeof item.k === "number" && (
                            <p className="flex justify-between text-sm">
                                <span className="text-gray-500">N-P-K:</span>
                                <span className="font-semibold text-gray-800">
                                {item.n}-{item.p}-{item.k}
                                </span>
                            </p>
                        )}
                        {/* Status Badge */}
                    <div
                        className={`mb-2 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center justify-start ${getStatusColor(status)}`}
                    >
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={isItemDeleting}
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isItemDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </button>
                  <button
                    onClick={() => handleUpdateClick(item)}
                    className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                  >
                    <SquarePen className="h-4 w-4 mr-1" />
                    Update
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 col-span-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <p className="text-gray-500 text-lg font-medium">
              No {activeInventoryTab} items found.
            </p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term or click &apos;Add Item &apos; to get started.</p>
          </div>
        )}
      </div>

      {/* --- ADD ITEM MODAL --- */}
      <Modal
    show={showAddItemModal}
    onClose={() => {
        setShowAddItemModal(false);
        setFormError(null); // Clear form error on close
    }}
    title={`Add New ${activeInventoryTab} Item`}
>
    <form onSubmit={handleCreateItem} className="space-y-6">
        {/* ... (other form fields) ... */}
        {renderFormFields(formData as BaseFormData, handleAddInputChange)}
        
        <div className="pt-4 border-t border-gray-200">
            {formError && ( // Display form-specific error
                <p className="mb-3 text-sm text-red-600 flex items-start">
                    {/* Assuming TriangleAlert is imported */}
                    <TriangleAlert className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
                    <span>{formError}</span>
                </p>
            )}
            <button
                type="submit"
                // 1. Disable the button when loading
                disabled={isLoading}
                className={`
                    w-full flex justify-center rounded-lg border border-transparent py-3 px-4 text-sm font-semibold shadow-md transition-colors text-white
                    ${isLoading
                        // 2. Adjust color and cursor when loading
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }
                `}
            >
                {isLoading ? (
                    // 3. Show a spinner when loading (Assuming Loader2 is an imported icon)
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    // 4. Show the standard icon when not loading
                    <Plus className="h-4 w-4 mr-2" />
                )}
                
                {/* 5. Change the button text based on the loading state */}
                {isLoading ? `Saving ${activeInventoryTab}...` : `Save ${activeInventoryTab}`}
            </button>
        </div>
    </form>
</Modal>

      {/* --- UPDATE ITEM MODAL --- */}
      <Modal
        show={showUpdateModal}
        onClose={() => {
            setShowUpdateModal(false);
            setFormError(null); // Clear form error on close
        }}
        title={`Update ${updateFormData?.name || activeInventoryTab} Details`}
      >
        {updateFormData && (
          <form onSubmit={handleUpdateItem} className="space-y-6">
            {renderFormFields(updateFormData, handleUpdateInputChange)}
            <div className="pt-4 border-t border-gray-200">
              {formError && ( // Display form-specific error
                <p className="mb-3 text-sm text-red-600 flex items-start">
                  <TriangleAlert className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
                  <span>{formError}</span>
                </p>
              )}
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex justify-center rounded-lg border border-transparent bg-green-600 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Updating...
                  </>
                ) : (
                  `Update ${updateFormData?.category}`
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManagement;