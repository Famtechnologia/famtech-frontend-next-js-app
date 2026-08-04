"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ScanLine,
  Upload,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  X,
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file");
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
    if (fileRef.current) fileRef.current.value = "";
  };

  const scan = async () => {
    if (!file) return;
    setIsScanning(true);
    setResult(null);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("image", compressed, compressed.name);
      const res = await apiClient.post("/api/health/scan", fd);
      setResult((res?.data?.data ?? {}) as ScanResult);
    } catch (err: unknown) {
      console.error("[scanner] scan failed:", err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      toast.error(status === 503 ? "AI scanner isn't enabled on the server yet" : "Failed to analyze image");
    } finally {
      setIsScanning(false);
    }
  };

  const healthy = result?.healthy === true;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      <PageHeader title="Disease Scanner" subtitle="Snap or upload a photo of a crop to detect likely diseases with AI.">
        <button
          onClick={() => router.push("/health")}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Health
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload / preview */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm p-5 space-y-4">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />

          {preview ? (
            <div className="relative">
              <Image src={preview} alt="Crop preview" width={800} height={480} unoptimized className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-[#30363d]" />
              <button onClick={reset} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-64 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-[#30363d] text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Tap to upload or take a photo</span>
              <span className="text-xs text-gray-400">Leaf, stem, or fruit close-up works best</span>
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> {preview ? "Change photo" : "Choose photo"}
            </button>
            <button
              onClick={scan}
              disabled={!file || isScanning}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm">
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {isScanning ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm p-5">
          {isScanning ? (
            <div className="h-full min-h-[16rem] flex flex-col items-center justify-center gap-2 text-green-700 dark:text-green-500 font-semibold">
              <RefreshCw className="w-6 h-6 animate-spin" /> Analyzing your crop...
            </div>
          ) : !result ? (
            <div className="h-full min-h-[16rem] flex flex-col items-center justify-center gap-2 text-center text-gray-400">
              <ScanLine className="w-8 h-8" />
              <p className="text-sm font-medium">Your scan result will appear here</p>
              <p className="text-xs max-w-xs">Upload a photo and tap Analyze to get an AI diagnosis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 rounded-lg p-4 ${healthy ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300" : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300"}`}>
                {healthy ? <ShieldCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                <div>
                  <p className="text-lg font-bold">{healthy ? "Looks healthy" : titleCase(result.disease) || "Issue detected"}</p>
                  <p className="text-xs opacity-80">
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
                <Section title="Prevention"><p>{result.prevention}</p></Section>
              )}

              <p className="flex items-start gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-[#30363d]">
                <Leaf className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                AI guidance is a starting point — confirm with an agronomist before major treatment.
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
