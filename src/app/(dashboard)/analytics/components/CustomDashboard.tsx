"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { useDashboardData } from "@/lib/hooks/useDashboard";
import { updateDashboard, DashboardUpdatePayload } from "@/lib/services/dashboard";

// Define types
interface Widget {
    id: string;
    type: string;
    title: string;
    position: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    config?: Record<string, unknown>;
}

interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// Placeholder Grid Container
const GridContainerPlaceholder: React.FC<{
    children: React.ReactNode;
    onLayoutChange?: (newLayout: LayoutItem[]) => void;
    layout?: LayoutItem[];
}> = ({ children }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 min-h-[500px]">
            {children}
            <div className="md:col-span-3 text-center text-sm text-gray-500 py-10">
                [Drag-and-Drop Area: The final positions (x,y,w,h) would be saved from here.]
            </div>
        </div>
    );
};

// Dashboard Editor Component
interface DashboardEditorProps {
    farmId: string;
    onClose: () => void;
    initialWidgets: Widget[];
}

export default function DashboardEditor({ farmId, onClose, initialWidgets }: DashboardEditorProps) {
    const { mutate: mutateDashboard } = useDashboardData(farmId);

    const [isSaving, setIsSaving] = useState(false);
    const [widgets] = useState<Widget[]>(JSON.parse(JSON.stringify(initialWidgets)));

    const handleSave = async () => {
        setIsSaving(true);

        // Map internal widget position (w/h) to API format (width/height)
        const finalWidgets = widgets.map((w) => ({
            type: w.type,
            title: w.title,
            position: {
                x: w.position.x,
                y: w.position.y,
                width: w.position.w,
                height: w.position.h,
            },
            config: w.config || {},
        }));

        const payload: DashboardUpdatePayload = {
            layout: "grid",
            widgets: finalWidgets,
        };

        try {
            await updateDashboard(farmId, payload);
            mutateDashboard();
            toast.success("Dashboard layout saved successfully!");
            onClose();
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
                    onClick={() => {
                        /* Logic to add a new widget */
                    }}
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
                <GridContainerPlaceholder>
                    {widgets.map((widget) => (
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
