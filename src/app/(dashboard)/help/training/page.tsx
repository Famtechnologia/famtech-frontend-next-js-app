"use client";
import { useEffect, useState } from "react";
import { PlayCircle, X, Clock, BookOpen, Sprout, TrendingUp, BarChart2, Brain, Layers } from "lucide-react";
import apiClient from "@/lib/api/apiClient";

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  embedUrl: string;
  autoThumbnail: string;
  videoId: string;
}

const CATEGORIES = [
  { id: "all",            label: "All",            icon: Layers },
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "crops",          label: "Crops",          icon: Sprout },
  { id: "livestock",      label: "Livestock",      icon: Sprout },
  { id: "market",         label: "Market",         icon: TrendingUp },
  { id: "advisory",       label: "Advisory",       icon: Brain },
  { id: "reports",        label: "Reports",        icon: BarChart2 },
  { id: "general",        label: "General",        icon: Layers },
];

const PLACEHOLDER_VIDEOS: Tutorial[] = [
  {
    _id: "p1",
    title: "Getting Started with Famtech",
    description: "A complete walkthrough of setting up your farm profile, adding crops, and navigating the dashboard.",
    category: "getting-started",
    duration: "8:45",
    embedUrl: "",
    autoThumbnail: "",
    videoId: "",
  },
  {
    _id: "p2",
    title: "Adding and Tracking Crop Records",
    description: "Learn how to add crop records, track growth stages, and log health status for each field.",
    category: "crops",
    duration: "6:20",
    embedUrl: "",
    autoThumbnail: "",
    videoId: "",
  },
  {
    _id: "p3",
    title: "Using the Smart Advisory AI",
    description: "How to ask questions, attach crop data, and get the most out of the AI-powered advisory chat.",
    category: "advisory",
    duration: "5:10",
    embedUrl: "",
    autoThumbnail: "",
    videoId: "",
  },
  {
    _id: "p4",
    title: "Reading Market Live Prices",
    description: "Understanding crop price cards, regional filters, price history charts, and market alerts.",
    category: "market",
    duration: "4:55",
    embedUrl: "",
    autoThumbnail: "",
    videoId: "",
  },
];

function CategoryEmoji({ category }: { category: string }) {
  const map: Record<string, string> = {
    "getting-started": "🚀",
    crops: "🌾",
    livestock: "🐄",
    market: "📊",
    advisory: "🤖",
    reports: "📈",
    general: "📚",
  };
  return <span>{map[category] ?? "📚"}</span>;
}

function VideoCard({
  tutorial,
  onClick,
}: {
  tutorial: Tutorial;
  onClick: () => void;
}) {
  const hasVideo = !!tutorial.videoId;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-[#21262d] overflow-hidden">
        {hasVideo ? (
          <img
            src={tutorial.autoThumbnail}
            alt={tutorial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <PlayCircle className="w-10 h-10 text-gray-300 dark:text-[#484f58]" />
            <span className="text-xs text-gray-400 dark:text-[#484f58] font-medium">Coming Soon</span>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <PlayCircle className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
        {/* Duration badge */}
        {tutorial.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            {tutorial.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <CategoryEmoji category={tutorial.category} />
          <span className="text-xs font-semibold text-emerald-600 dark:text-[#4ade80] capitalize">
            {tutorial.category.replace("-", " ")}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] mb-1 leading-snug">
          {tutorial.title}
        </h3>
        {tutorial.description && (
          <p className="text-xs text-gray-500 dark:text-[#8b949e] leading-relaxed line-clamp-2">
            {tutorial.description}
          </p>
        )}
      </div>
    </button>
  );
}

function VideoModal({
  tutorial,
  onClose,
}: {
  tutorial: Tutorial;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video */}
        <div className="aspect-video w-full">
          {tutorial.embedUrl ? (
            <iframe
              src={`${tutorial.embedUrl}?autoplay=1&rel=0`}
              title={tutorial.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white">
              <PlayCircle className="w-14 h-14 text-white/30" />
              <p className="text-sm text-white/60 font-medium">Video coming soon</p>
            </div>
          )}
        </div>

        {/* Title bar */}
        <div className="p-4 bg-[#0d1117]">
          <div className="flex items-center gap-2 mb-1">
            <CategoryEmoji category={tutorial.category} />
            <span className="text-xs font-semibold text-emerald-400 capitalize">
              {tutorial.category.replace("-", " ")}
            </span>
            {tutorial.duration && (
              <>
                <span className="text-white/20">·</span>
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/40">{tutorial.duration}</span>
              </>
            )}
          </div>
          <h2 className="text-base font-bold text-white">{tutorial.title}</h2>
          {tutorial.description && (
            <p className="text-xs text-white/50 mt-1 leading-relaxed">{tutorial.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Tutorial | null>(null);
  const [featured, setFeatured] = useState<Tutorial | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: Tutorial[] }>("/tutorials");
        if (res.data.success && res.data.data.length > 0) {
          setTutorials(res.data.data);
          setFeatured(res.data.data[0]);
        } else {
          setTutorials(PLACEHOLDER_VIDEOS);
        }
      } catch {
        setTutorials(PLACEHOLDER_VIDEOS);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, []);

  const filtered =
    category === "all"
      ? tutorials
      : tutorials.filter((t) => t.category === category);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-[#4ade80]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">Tutorials</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#8b949e] ml-12">
            Video guides to help you get the most out of Famtech.
          </p>
        </div>

        {/* Featured video player */}
        {featured && featured.videoId ? (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-[#30363d] bg-black">
            <div className="aspect-video w-full">
              <iframe
                src={featured.embedUrl}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-4 bg-[#0d1117]">
              <div className="flex items-center gap-2 mb-1">
                <CategoryEmoji category={featured.category} />
                <span className="text-xs font-semibold text-emerald-400 capitalize">
                  {featured.category.replace("-", " ")}
                </span>
                {featured.duration && (
                  <>
                    <span className="text-white/20">·</span>
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">{featured.duration}</span>
                  </>
                )}
              </div>
              <h2 className="text-base font-bold text-white">{featured.title}</h2>
              {featured.description && (
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{featured.description}</p>
              )}
            </div>
          </div>
        ) : (
          /* Placeholder hero when no videos yet */
          <div className="mb-8 rounded-2xl overflow-hidden border border-dashed border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
            <div className="aspect-video flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-emerald-600 dark:text-[#4ade80]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700 dark:text-[#e6edf3] mb-1">
                  Video tutorials coming soon
                </p>
                <p className="text-xs text-gray-400 dark:text-[#8b949e]">
                  Training videos will appear here once published from the admin panel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  category === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#8b949e] hover:border-emerald-300 dark:hover:border-emerald-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Video grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] animate-pulse">
                <div className="aspect-video bg-gray-100 dark:bg-[#21262d] rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-[#21262d] rounded w-1/3" />
                  <div className="h-4 bg-gray-100 dark:bg-[#21262d] rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-[#21262d] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <PlayCircle className="w-10 h-10 text-gray-300 dark:text-[#484f58] mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-[#8b949e]">No tutorials in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <VideoCard
                key={t._id}
                tutorial={t}
                onClick={() => {
                  if (t.videoId) {
                    setSelected(t);
                  } else if (featured && featured.videoId) {
                    setFeatured(t);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video modal */}
      {selected && (
        <VideoModal tutorial={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
