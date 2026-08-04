"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ScanLine,
  Upload,
  Camera,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  X,
  FlipHorizontal,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import apiClient from "@/lib/api/apiClient";
import { compressImage } from "@/lib/utils/imageCompressor";
import { toast } from "react-hot-toast";

interface ScanResult {
  crop?: string;
  healthy?: boolean;
  disease?: string;
  confidence?: number;
  severity?: string;
  symptoms?: string[];
  treatment?: string;
  prevention?: string;
}

const severityStyle = (s?: string) => {
  switch ((s || "").toLowerCase()) {
    case "low":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "high":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const titleCase = (s?: string) => (s ? s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—");

export default function DiseaseScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Live Camera Viewfinder Modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Clean up camera stream when camera closes or component unmounts
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    stopCameraStream();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera access is not supported on this browser");
        fileInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("[Camera] Error starting camera:", err);
      toast.error("Could not access camera. Please allow camera permissions or upload an image.");
      setIsCameraOpen(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to capture photo frame");
          return;
        }

        const capturedFile = new File([blob], `crop_scan_${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setResult(null);
        setFile(capturedFile);
        setPreview(URL.createObjectURL(blob));
        stopCameraStream();
        setIsCameraOpen(false);
        toast.success("Photo captured!");
      },
      "image/jpeg",
      0.9
    );
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose a valid image file");
      return;
    }
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scan = async () => {
    if (!file) return;
    setIsScanning(true);
    setResult(null);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("image", compressed, compressed.name);

      const res = await apiClient.post("/api/health/scan", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.data?.success) {
        setResult((res?.data?.data ?? {}) as ScanResult);
        toast.success("Crop diagnosis completed");
      } else {
        toast.error(res?.data?.message || "Failed to analyze image");
      }
    } catch (err: any) {
      console.error("[scanner] scan error:", err);
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const healthy = result?.healthy === true;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader title="Disease Scanner" subtitle="Snap a photo with your camera or upload an image to detect crop diseases.">
        <button
          onClick={() => router.push("/health")}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Health
        </button>
      </PageHeader>

      {/* Hidden File Picker & Canvas element */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onPickFile}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-between p-4 md:p-6">
          <div className="w-full flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Camera className="w-4 h-4 text-green-400" /> Live Viewfinder
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleCameraFacing}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                title="Switch Camera">
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  stopCameraStream();
                  setIsCameraOpen(false);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-xl flex-1 my-4 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
            {/* Viewfinder Overlay Frame */}
            <div className="absolute inset-8 border-2 border-dashed border-green-400/70 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Position leaf or crop inside frame
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center pb-4 z-10">
            <button
              onClick={capturePhoto}
              className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white p-1 border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
              <div className="h-12 w-12 rounded-full bg-white text-green-700 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload / preview card */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm p-5 space-y-4">
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt="Crop preview"
                width={800}
                height={480}
                unoptimized
                className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-[#30363d]"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-[#30363d] text-gray-500 dark:text-gray-400 p-4 text-center">
              <div className="flex gap-2">
                <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-700 rounded-full">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Select image source</p>
                <p className="text-xs text-gray-400 mt-0.5">Turn on live camera or upload an image file</p>
              </div>
            </div>
          )}

          {/* Action Buttons: Live Camera & Upload File */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => startCamera("environment")}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold border border-green-200 dark:border-green-800/50 rounded-lg bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100/50 transition-colors shadow-sm">
              <Camera className="w-4 h-4 text-green-700" /> Turn On Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" /> Upload File
            </button>
          </div>

          <button
            onClick={scan}
            disabled={!file || isScanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md">
            {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />}
            {isScanning ? "Analyzing crop image..." : "Analyze Crop"}
          </button>
        </div>

        {/* Results Card */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm p-5">
          {isScanning ? (
            <div className="h-full min-h-[16rem] flex flex-col items-center justify-center gap-2 text-green-700 dark:text-green-500 font-semibold">
              <RefreshCw className="w-6 h-6 animate-spin" /> Running agronomic analysis...
            </div>
          ) : !result ? (
            <div className="h-full min-h-[16rem] flex flex-col items-center justify-center gap-2 text-center text-gray-400">
              <ScanLine className="w-8 h-8 text-green-700" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scan results will appear here</p>
              <p className="text-xs max-w-xs text-gray-400">Snap a photo with camera or upload an image and tap Analyze Crop to get a diagnosis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 rounded-lg p-4 ${healthy ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300" : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300"}`}>
                {healthy ? <ShieldCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                <div>
                  <p className="text-lg font-bold">{healthy ? "Looks Healthy" : titleCase(result.disease) || "Issue Detected"}</p>
                  <p className="text-xs opacity-90">
                    {result.crop && result.crop !== "unknown" ? `${titleCase(result.crop)} · ` : ""}
                    {typeof result.confidence === "number" ? `${result.confidence}% confidence` : ""}
                  </p>
                </div>
                {!healthy && result.severity && (
                  <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${severityStyle(result.severity)}`}>
                    {result.severity}
                  </span>
                )}
              </div>

              {result.symptoms && result.symptoms.length > 0 && (
                <Section title="Symptoms observed">
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Section>
              )}
              {result.treatment && (
                <Section title="Recommended treatment"><p>{result.treatment}</p></Section>
              )}
              {result.prevention && (
                <Section title="Prevention advice"><p>{result.prevention}</p></Section>
              )}

              <p className="flex items-start gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-[#30363d]">
                <Leaf className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-700" />
                AI diagnostic guidance is for early detection — confirm with a qualified agronomist for major field treatment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}
