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
  HardHat,
  Grid,
  X,
  TriangleAlert,
  CheckCircle,
  ListFilter,
  LayoutGrid,
  LayoutList,
  Download,
  Loader2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

// Assuming these types are defined in '@/types/inventory'
import {
  UnifiedInventoryItem,
  ToolData,
  EquipmentPartData,
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

// --- TYPE DEFINITIONS & USER ID RETRIEVAL ---

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

  const [inventoryItems, setInventoryItems] = useState<UnifiedInventoryItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

    toolData: {
      toolType: undefined,
      brand: undefined,
      model: undefined,
      condition: undefined,
      lastServiced: undefined,
      warrantyExpiry: undefined,
      price: undefined,
    } as ToolData,
    equipmentPartData: {
      model: undefined,
      partNumber: undefined,
      manufacturer: undefined,
      warrantyExpiry: undefined,
      price: undefined,
      condition: undefined,
    } as EquipmentPartData,

    model: undefined,
    // FIX 1: Use the retrieved user ID. This is 'string | undefined', now allowed by the type.
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
      setLoading(false);
      setError("Cannot fetch inventory: User ID is missing. Please log in.");
      return;
    }

    setLoading(true);
    try {
      // FIX 4: Pass the required userId argument to getInventoryItems
      const items = await getInventoryItems(requiredUserId);
      setInventoryItems(items);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleTabChange = (category: string) => {
    setActiveInventoryTab(category);
    setFormData(getInitialFormData(category));
  };

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(
      (item) =>
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

            if (parentKey === "toolData") {
              newFormData[parentKey as keyof T] =
                parentObject as ToolData as T[keyof T];
            } else if (parentKey === "equipmentPartData") {
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

    const cleanedData: any = JSON.parse(JSON.stringify(data), (key, value) => {
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

    if (category === 'tools' && cleanedData.toolData) {
      cleanedData.toolData.name = cleanedData.name;
      delete cleanedData.name;
    }

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
    if (category !== "tools") {
      delete cleanedData.toolData;
    }
    if (category !== "equipment parts") {
      delete cleanedData.equipmentPartData;
    }
    if (category !== "fertilizer" && category !== "feed") {
      delete cleanedData.type;
    }
    if (category !== "tools" && category !== "equipment parts") {
      delete cleanedData.model;
    }

    return cleanedData as Omit<T, "id" | "_id" | "timestamp">;
  };

  // src/components/farm-operation/InventoryManagement.tsx

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requiredUserId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    try {
      // ⭐ CORE FIX: Validation to prevent sending an empty name ⭐
      if (formData?.name.trim() === "") {
        setError(
          "The 'Item Name' field cannot be empty. Please provide a name for the item."
        );
        return;
      }
      const payload = processPayload(formData) as NewInventoryItemData;

      const newItem = await createInventoryItem(payload);

      console.log("Server response (create):", newItem);

      // Workaround: Move name from toolData back to root for UI consistency
      if (newItem.category === 'tools' && newItem.toolData?.name) {
        newItem.name = newItem.toolData.name;
      }

      setInventoryItems((prev) => [...prev, newItem]);
      setShowAddItemModal(false);
      setFormData(getInitialFormData(activeInventoryTab));
      setError(null);
    } catch (err: any) {
      console.error("Full error object:", err);
      if (err.response) {
        console.error("Error response:", err.response);
        if (err.response.data && err.response.data.error) {
          setError(
            `Failed to create inventory item: ${err.response.data.error}`
          );
        } else {
          setError(
            "Failed to create inventory item. The server rejected the request. Check the console for more details."
          );
        }
      } else {
        setError(
          "Failed to create inventory item. An unknown error occurred. Check the console for more details."
        );
      }
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateFormData || isUpdating) return;

    // ⭐ CORE FIX: Validation for update form name ⭐
    if (updateFormData.name.trim() === "") {
      setError(
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

            // Workaround: Move name from toolData back to root for UI consistency
            if (updatedItem.category === 'tools' && updatedItem.toolData?.name) {
                updatedItem.name = updatedItem.toolData.name;
            }
            
            setInventoryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      setShowUpdateModal(false);
      setUpdateFormData(null);
    } catch (err) {
      console.error("Failed to update item:", err);
      setError("Failed to update inventory item. Check console for details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isDeleting[id]) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteInventoryItem(id);
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete inventory item. Check console for details.");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateClick = (item: UnifiedInventoryItem) => {
    const copy: UpdateInventoryItemData = JSON.parse(JSON.stringify(item));

    // FIX 2: Use a generic helper function to correctly handle keys
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

    if (copy.toolData === null || copy.toolData === undefined) {
      copy.toolData = {} as ToolData;
    } else {
      setNumericFieldForForm(copy.toolData, "price"); // FIXED
    }

    if (
      copy.equipmentPartData === null ||
      copy.equipmentPartData === undefined
    ) {
      copy.equipmentPartData = {} as EquipmentPartData;
    } else {
      setNumericFieldForForm(copy.equipmentPartData, "price"); // FIXED
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
        return "bg-red-50 text-red-600";
      case "Low Stock":
        return "bg-yellow-50 text-yellow-600";
      case "In Stock":
        return "bg-green-50 text-green-600";
      default:
        return "bg-gray-50 text-gray-600";
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
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${day}-${month}-${year}`;
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
    {
      name: "Tools",
      icon: <HardHat className="h-4 w-4 mr-2" />,
      value: "tools",
    },
    {
      name: "Equipment Parts",
      icon: <Grid className="h-4 w-4 mr-2" />,
      value: "equipment parts",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInventoryItems}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-6">
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        {inventoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
                            ${
                              activeInventoryTab === tab.value
                                ? "border-b-2 border-green-600 text-green-700"
                                : "text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400"
                            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="md:flex justify-between items-center space-y-4 mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-wrap items-center space-y-2 md:space-y-0 space-x-2 lg:space-x-4">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
            <LayoutGrid className="h-4 w-4 mr-2" /> Grid
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
            <LayoutList className="h-4 w-4 mr-2" /> List
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getItemsToDisplay.length > 0 ? (
          getItemsToDisplay.map((item: UnifiedInventoryItem) => {
            const status = getItemStatus(item);
            const isItemDeleting = isDeleting[item.id];
            return (
              <Card key={item.id} title={item.name}>
                <div className="space-y-2">
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

                  {item.usageRate !== undefined && item.usageRate !== null && (
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

                  {item.category === "tools" && item.toolData?.model && (
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-semibold text-gray-800">
                        {item.toolData.model}
                      </span>
                    </p>
                  )}
                  {item.category === "equipment parts" &&
                    item.equipmentPartData?.model && (
                      <p className="flex justify-between text-sm">
                        <span className="text-gray-500">Model:</span>
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
                </div>
                <div
                  className={`mt-4 px-3 py-2 gap-1 rounded-full text-sm font-medium flex items-center justify-start ${getStatusColor(status)}`}
                >
                  {getStatusIcon(status)}
                  {status}
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={isItemDeleting}
                    className="text-sm font-medium text-red-600 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    {isItemDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateClick(item)}
                    className="text-sm font-medium text-green-600 hover:underline"
                  >
                    Update
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">
              No {activeInventoryTab} items found.
            </p>
          </div>
        )}
      </div>

      <Modal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title={`Add New ${activeInventoryTab} Item`}
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          {renderFormFields(formData as BaseFormData, handleAddInputChange)}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700"
            >
              Save {activeInventoryTab}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Update ${updateFormData?.name || ""}`}
      >
        {updateFormData && (
          <form onSubmit={handleUpdateItem} className="space-y-4">
            {renderFormFields(updateFormData, handleUpdateInputChange)}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
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

export default InventoryManagement
