"use client";
import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { 
  Tractor, 
  Plane, 
  Activity, 
  Droplets, 
  Bluetooth, 
  QrCode, 
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Signal
} from "lucide-react";
import Link from 'next/link'
type EquipmentType = "Tractor" | "Drone" | "Soil Sensor" | "Irrigation System";
type SyncMethod = "Bluetooth" | "QR Code" | "Manual";

interface Device {
  id: string;
  name: string;
  status: "Available" | "Out of Range";
  distance: string;
}

const EquipmentSyncPage: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType>("Tractor");
  const [syncMethod, setSyncMethod] = useState<SyncMethod>("Bluetooth");
  const [showModal, setShowModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"success" | "error" | null>(null);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  const devices: Device[] = [
    { id: "1", name: "Drone Ply", status: "Available", distance: "5m" },
    { id: "2", name: "Soil Sense Monitor", status: "Available", distance: "5m" },
    { id: "3", name: "Sprinkler System", status: "Out of Range", distance: "5m" },
  ];

  const equipmentOptions = [
    {
      type: "Tractor" as EquipmentType,
      icon: Tractor,
      description: "Use heavy machinery for plowing of the soil"
    },
    {
      type: "Drone" as EquipmentType,
      icon: Plane,
      description: "Use heavy machinery for plowing of the soil"
    },
    {
      type: "Soil Sensor" as EquipmentType,
      icon: Activity,
      description: "Use heavy machinery for plowing of the soil"
    },
    {
      type: "Irrigation System" as EquipmentType,
      icon: Droplets,
      description: "Use heavy machinery for plowing of the soil"
    }
  ];

  const syncMethods = [
    {
      method: "Bluetooth" as SyncMethod,
      icon: Bluetooth,
      description: "Auto-discover nearby devices"
    },
    {
      method: "QR Code" as SyncMethod,
      icon: QrCode,
      description: "Scan the device QR Code"
    },
    {
      method: "Manual" as SyncMethod,
      icon: FileText,
      description: "Enter the information manually"
    }
  ];

  const handleConnect = (device: Device) => {
    setCurrentDevice(device);
    setShowModal(true);
    setSyncStatus(null);
    
    // Simulate connection attempt
    setTimeout(() => {
      if (device.status === "Available") {
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
      }
    }, 1500);
  };

  const closeModal = () => {
    setShowModal(false);
    setSyncStatus(null);
    setCurrentDevice(null);
  };

  const renderConnectionStatus = () => {
    if (!syncStatus) {
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RotateCcw className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-gray-200">Attempting to connect to {currentDevice?.name}…</p>
        </div>
      );
    }

    if (syncStatus === "error") {
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-error" />
          </div>
          <p className="text-gray-200">
            Failed to connect to equipment successfully. Check your device and try again.
          </p>
          <div className="text-sm text-muted-foreground">
            Equipment: <span className="font-semibold">{currentDevice?.name}</span> –{" "}
            <span className="text-error">Not connected</span>
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleConnect(currentDevice!)}
              className="px-4 py-2 bg-primary text-green-600 rounded-md hover:bg-green-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors"
            >
              Sync new equipment
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <p className="text-gray-200">
          {currentDevice?.name} has successfully synced with the system.
        </p>
        <div className="text-sm text-muted-foreground">
          Equipment: <span className="font-semibold">{currentDevice?.name}</span> –{" "}
          <span className="text-success">Connected</span>
        </div>
        <Link href='/'
          onClick={closeModal}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 transition-colors"
        >
          Continue to Dashboard
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-0 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Farm Equipment Sync</h1>
          <p className="text-muted-foreground">Connect and manage farm equipment seamlessly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 md:gap-6">
          {/* Choose Equipment & Sync Method */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Choose Equipment Type">
              <div className="grid grid-cols-2 gap-4">
                {equipmentOptions.map(({ type, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedEquipment(type)}
                    className={`flex flex-col items-start p-4 border-1 rounded-lg text-left hover:bg-green-100 transition-colors ${
                      selectedEquipment === type 
                        ? "border-gray-400 bg-primary-light" 
                        : "border-gray-400 bg-card"
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium text-card-foreground">{type}</span>
                    <span className="text-xs text-muted-foreground mt-1">{description}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Select Sync Method">
              <div className="grid md:grid-cols-3 gap-4">
                {syncMethods.map(({ method, icon: Icon, description }) => (
                  <button
                    key={method}
                    onClick={() => setSyncMethod(method)}
                    className={`flex flex-col items-center p-4 border-1 rounded-lg text-center hover:bg-accent transition-colors ${
                      syncMethod === method 
                        ? "border-gray-400 bg-primary-light" 
                        : "border-gray-400 bg-card"
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium text-card-foreground">{method}</span>
                    <span className="text-xs text-muted-foreground mt-1">{description}</span>
                  </button>
                ))}
              </div>

              <button className="flex items-center m-auto lg:ml-0 mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 transition-colors font-medium">
                Start Syncing
              </button>
            </Card>
          </div>

          {/* Discovered Devices */}
          <Card 
            title="Discovered Devices" 
            headerClassName="flex items-center justify-between"
          >
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{device.name}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Signal className="h-3 w-3" />
                        <span>{device.distance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs font-medium ${
                        device.status === "Available" ? "text-success" : "text-error"
                      }`}
                    >
                      {device.status}
                    </span>
                    <button
                      onClick={() => handleConnect(device)}
                      className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                        device.status === "Available"
                          ? "bg-green-500 text-white hover:bg-green-800"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                      disabled={device.status !== "Available"}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Modal for Sync Status */}
        <Modal
          show={showModal}
          onClose={closeModal}
          title={
            syncStatus === "success"
              ? "Sync Successful"
              : syncStatus === "error"
              ? "Sync Unsuccessful"
              : "Connecting..."
          }
        >
          {renderConnectionStatus()}
        </Modal>
      </div>
    </div>
  );
};

export default EquipmentSyncPage;