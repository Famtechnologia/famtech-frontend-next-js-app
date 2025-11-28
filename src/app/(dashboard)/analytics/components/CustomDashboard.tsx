"use client";

import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card"; // Assuming Card is imported correctly
import { useDashboardData } from "@/lib/hooks/useDashboard";
import { updateDashboard, DashboardUpdatePayload } from "@/lib/services/dashboard";

// NOTE: In a real app, this would be a third-party component like <ResponsiveGridLayout> 
// that manages the x, y, w, h state based on user dragging and resizing.
const GridContainerPlaceholder: React.FC<{ children: React.ReactNode, onLayoutChange: (newLayout: any) => void, layout: any[] }> = ({ children, onLayoutChange, layout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 min-h-[500px]">
            {children}
            <div className="md:col-span-3 text-center text-sm text-gray-500 py-10">
                [Drag-and-Drop Area: The final positions (x,y,w,h) would be saved from here.]
            </div>
        </div>
    );
}

// ----------------------------------------------------
// Dashboard Editor Component (Task 4F Logic)
// ----------------------------------------------------
interface DashboardEditorProps {
    farmId: string;
    onClose: () => void;
    initialWidgets: any[];
}

export default function DashboardEditor({ farmId, onClose, initialWidgets }: DashboardEditorProps) {
    // SWR mutator to refresh the view after saving
    const { mutate: mutateDashboard } = useDashboardData(farmId);

    const [isSaving, setIsSaving] = useState(false);
    // Use initialWidgets as the starting point for local editing state
    const [widgets, setWidgets] = useState(JSON.parse(JSON.stringify(initialWidgets))); 
    
    // Placeholder state for layout changes (actual logic handled by RGL library)
    const [currentLayoutState, setCurrentLayoutState] = useState(
        initialWidgets.map(w => ({ i: w.id, ...w.position }))
    );

    const handleLayoutChange = (newLayout: any) => {
        // In a real app, this would update currentLayoutState
        // setCurrentLayoutState(newLayout);
    };

    const handleSave = async () => {
        setIsSaving(true);
        
        // 1. Map the final widget data back to the API payload format
        const finalWidgets = widgets.map((w: any) => {
            // Note: In a full app, you would merge 'w' with position updates from 'currentLayoutState'
            return {
                type: w.type,
                title: w.title,
                position: w.position, 
                config: w.config || {}, 
            }
        });

        const payload: DashboardUpdatePayload = {
            layout: 'grid', 
            widgets: finalWidgets,
        };

        try {
            // Call the API endpoint: PUT /api/analytics/dashboard/:farmId
            await updateDashboard(farmId, payload);
            
            // 🔑 CRITICAL: Force SWR to refetch and update the dashboard view immediately
            mutateDashboard(); 
            
            toast.success("Dashboard layout saved successfully!");
            onClose(); // Close the editor

        } catch (error) {
            toast.error("Failed to save dashboard. Please try again.");
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Edit Dashboard Layout</h1>
            
            <div className="flex justify-between p-4 bg-white rounded-lg shadow-md border-b">
                <button 
                    onClick={() => { /* Logic to add a new widget */ }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm"
                >
                    + Add New Widget
                </button>
                <div className="space-x-4">
                    <button 
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 rounded-md font-semibold text-sm transition ${
                            isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {isSaving ? "Saving..." : "Save Layout"}
                    </button>
                </div>
            </div>

            <Card title="Drag & Drop Area" headerClassName="bg-gray-50/50">
                <GridContainerPlaceholder 
                    onLayoutChange={handleLayoutChange} 
                    layout={currentLayoutState}
                >
                    {widgets.map((widget: any) => (
                        <Card 
                            key={widget.id} 
                            title={`EDIT: ${widget.title}`} 
                            className="opacity-90 cursor-move border-2 border-blue-400"
                        >
                            <p className="text-sm text-gray-500">
                                Type: {widget.type.toUpperCase()} | Position: {widget.position.x},{widget.position.y}
                            </p>
                        </Card>
                    ))}
                </GridContainerPlaceholder>
            </Card>
            
        </div>
    );
}